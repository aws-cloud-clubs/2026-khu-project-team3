import logging
import os
from datetime import date, datetime, time
from typing import Sequence
from zoneinfo import ZoneInfo

from psycopg2.extras import Json

from common.db import get_connection
from common.saju import get_game_saju_info, get_player_saju_info, get_ten_god
from common.schema import GameSaju, GameSchedule, PlayerGameSaju, SQSMessage, TeamRanking, TenGodResult
from game_aggregator.crawler import crawl
from game_aggregator.queries import (
    GET_DAILY_SAJU_REPORT_FAILED_ID_QUERY,
    GET_PLAYERS_FOR_SCHEDULED_TEAMS_QUERY,
    GET_TEAM_ID_BY_NAME_QUERY,
    INSERT_DAILY_SAJU_REPORT_QUERY,
    INSERT_PLAYER_SAJU_QUERY,
    UPDATE_TEAM_RANKING_QUERY,
    UPSERT_GAME_QUERY,
    UPSERT_SERVICE_TODAY_QUERY,
)
from game_aggregator.sqs import send_message_to_sqs


logger = logging.getLogger(__name__)


def aggregate() -> None:
    crawl_result = crawl()
    schedules = crawl_result["schedule_info"]
    ranking_info = crawl_result["ranking_info"]

    with get_connection() as conn:
        with conn.cursor() as cur:
            _update_team_rankings(cur, ranking_info, _resolve_ranking_base_date(schedules))

    if not schedules:
        logger.info("No KBO games scheduled for target date")
        return

    game_saju = get_game_saju_info(schedules[0].game_date)
    print(game_saju)
    prompt_version = os.environ.get("DAILY_SAJU_PROMPT_VERSION", "v1")

    with get_connection() as conn:
        with conn.cursor() as cur:
            team_id_by_name = _get_team_id_by_name(cur, schedules)
            _upsert_games(cur, schedules, team_id_by_name)

            players = _get_players_for_scheduled_teams(cur, team_id_by_name.values())
            if not players:
                logger.info("No players found for scheduled teams", extra={"game_date": schedules[0].game_date})
                return

            ten_god_result_by_player_id = {
                player.player_id: get_ten_god(player.day_master, game_saju.day_stem)
                for player in players
            }
            report_id_by_player_id = _prepare_daily_reports(
                cur,
                players,
                game_saju,
                prompt_version,
                ten_god_result_by_player_id,
            )
            _upsert_service_today(cur, game_saju.game_date)

    failed_reports = []

    for player in players:
        report_id = report_id_by_player_id.get(player.player_id)
        if report_id is None:
            continue

        ten_god_result = ten_god_result_by_player_id.get(player.player_id)
        if ten_god_result is None:
            continue

        payload = SQSMessage(
            player_id=player.player_id,
            game_date=game_saju.game_date,
            ten_god_result=ten_god_result,
        )

        try:
            send_message_to_sqs(payload)
        except Exception as exc:
            logger.exception(
                "Failed to enqueue daily saju report",
                extra={"player_id": player.player_id, "game_date": game_saju.game_date},
            )
            failed_reports.append((report_id, str(exc)))

    with get_connection() as conn:
        with conn.cursor() as cur:
            for report_id, error_message in failed_reports:
                cur.execute(
                    """
                    UPDATE daily_saju_report
                    SET status = 'FAILED',
                        error_message = %s,
                        updated_at = now()
                    WHERE id = %s
                    """,
                    (error_message, report_id),
                )

    logger.info(
        "Aggregated daily saju reports",
        extra={
            "game_date": game_saju.game_date,
            "game_count": len(schedules),
            "player_count": len(players),
            "queued_count": len(report_id_by_player_id) - len(failed_reports),
            "failed_count": len(failed_reports),
        },
    )


def _get_team_id_by_name(cur, schedules: Sequence[GameSchedule]) -> dict[str, int]:
    requested_names = {
        schedule.home_team
        for schedule in schedules
    } | {
        schedule.away_team
        for schedule in schedules
    }

    cur.execute(
        GET_TEAM_ID_BY_NAME_QUERY,
        (list(requested_names),),
    )

    team_id_by_name = {name: team_id for team_id, name in cur.fetchall()}
    missing_names = sorted(requested_names - team_id_by_name.keys())
    if missing_names:
        raise ValueError(f"Unknown team names in schedule: {', '.join(missing_names)}")

    return team_id_by_name


def _upsert_games(cur, schedules: Sequence[GameSchedule], team_id_by_name: dict[str, int]) -> None:
    for schedule in schedules:
        cur.execute(
            UPSERT_GAME_QUERY,
            (
                schedule.game_date,
                schedule.game_time,
                schedule.stadium,
                team_id_by_name[schedule.home_team],
                team_id_by_name[schedule.away_team],
            ),
        )


def _upsert_service_today(cur, service_today: str) -> None:
    cur.execute(UPSERT_SERVICE_TODAY_QUERY, (service_today,))


def _get_players_for_scheduled_teams(cur, team_ids) -> list[PlayerGameSaju]:
    cur.execute(
        GET_PLAYERS_FOR_SCHEDULED_TEAMS_QUERY,
        (list(team_ids),),
    )

    players = []
    for player_id, name, birth_date, birth_time, day_master in cur.fetchall():
        if day_master is None:
            player_saju = get_player_saju_info(
                name=name,
                player_id=player_id,
                year=str(birth_date.year),
                month=str(birth_date.month).zfill(2),
                day=str(birth_date.day).zfill(2),
                hour=_format_birth_hour(birth_time),
            )
            cur.execute(
                INSERT_PLAYER_SAJU_QUERY,
                (
                    player_saju.player_id,
                    player_saju.year_pillar,
                    player_saju.month_pillar,
                    player_saju.day_pillar,
                    player_saju.hour_pillar,
                    player_saju.day_master,
                    Json(player_saju.five_elements),
                ),
            )
            day_master = player_saju.day_master

        players.append(PlayerGameSaju(player_id=player_id, name=name, day_master=day_master))

    return players


def _prepare_daily_reports(
    cur,
    players: Sequence[PlayerGameSaju],
    game_saju: GameSaju,
    prompt_version: str,
    ten_god_result_by_player_id: dict[int, TenGodResult],
) -> dict[int, int]:
    report_id_by_player_id = {}

    for player in players:
        ten_god_result = ten_god_result_by_player_id.get(player.player_id)
        if ten_god_result is None:
            continue

        cur.execute(
            INSERT_DAILY_SAJU_REPORT_QUERY,
            (
                player.player_id,
                game_saju.game_date,
                game_saju.day_stem,
                game_saju.day_branch,
                Json(_to_five_element_interaction(ten_god_result)),
                Json(_to_ten_god_interaction(ten_god_result)),
                prompt_version,
            ),
        )
        row = cur.fetchone()
        if row is not None:
            report_id_by_player_id[player.player_id] = row[0]
            continue

        cur.execute(
            GET_DAILY_SAJU_REPORT_FAILED_ID_QUERY,
            (player.player_id, game_saju.game_date),
        )
        failed_row = cur.fetchone()
        if failed_row is not None:
            report_id_by_player_id[player.player_id] = failed_row[0]

    return report_id_by_player_id

def _update_team_rankings(cur, rankings: Sequence[TeamRanking], ranking_base_date: date) -> None:
    for ranking in rankings:
        cur.execute(
            UPDATE_TEAM_RANKING_QUERY,
            (ranking.ranking, ranking_base_date, ranking.team),
        )


def _resolve_ranking_base_date(schedules: Sequence[GameSchedule]) -> date:
    if schedules:
        return date.fromisoformat(schedules[0].game_date)

    return datetime.now(ZoneInfo("Asia/Seoul")).date()


def _format_birth_hour(birth_time: time | None) -> str | None:
    if birth_time is None:
        return None

    return str(birth_time.hour).zfill(2)


def _to_ten_god_interaction(ten_god_result: TenGodResult) -> dict:
    return {
        "relation": ten_god_result.relation,
        "ten_god": ten_god_result.ten_god,
        "keywords": ten_god_result.keywords,
    }


def _get_ten_god_interaction(player: PlayerGameSaju, game_saju: GameSaju) -> dict:
    return _to_ten_god_interaction(get_ten_god(player.day_master, game_saju.day_stem))


def _to_five_element_interaction(ten_god_result: TenGodResult) -> dict:
    return {
        "day_master_element": ten_god_result.day_master_element,
        "target_element": ten_god_result.target_element,
        "relation": ten_god_result.relation,
    }
