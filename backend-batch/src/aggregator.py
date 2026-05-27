import logging
import os
from typing import Sequence

from src.crawler import scrape_kbo_schedule
from src.db import get_connection
from src.saju import get_game_saju_info
from src.sqs import send_message_to_sqs
from src.schema import GameSaju, GameSchedule, PlayerGameSaju, SQSMessage


logger = logging.getLogger(__name__)


def aggregate():

    schedules = scrape_kbo_schedule()
    if not schedules:
        logger.info("No KBO games scheduled for target date")
        return

    game_saju = get_game_saju_info(schedules[0].game_date)
    print(game_saju)
    # prompt_version = os.environ["DAILY_SAJU_PROMPT_VERSION"]

    # with get_connection() as conn:
    #     with conn.cursor() as cur:
    #         team_id_by_name = _get_team_id_by_name(cur, schedules)
    #         _upsert_games(cur, schedules, team_id_by_name)

    #         players = _get_players_for_scheduled_teams(cur, team_id_by_name.values())
    #         if not players:
    #             logger.info("No players with saju data found for scheduled teams", extra={"game_date": schedules[0].game_date})
    #             return

    #         report_id_by_player_id = _prepare_daily_reports(cur, players, game_saju, prompt_version)

    # failed_reports = []

    # for player in players:
    #     report_id = report_id_by_player_id.get(player.player_id)
    #     if report_id is None:
    #         continue

    #     payload = SQSMessage(game_saju=game_saju, player_saju=player)

    #     try:
    #         send_message_to_sqs(payload)
    #     except Exception as exc:
    #         logger.exception(
    #             "Failed to enqueue daily saju report",
    #             extra={"player_id": player.player_id, "game_date": game_saju.game_date},
    #         )
    #         failed_reports.append((report_id, str(exc)))

    # with get_connection() as conn:
    #     with conn.cursor() as cur:
    #         for report_id, error_message in failed_reports:
    #             cur.execute(
    #                 """
    #                 UPDATE daily_saju_report
    #                 SET status = 'failed',
    #                     error_message = %s,
    #                     updated_at = now()
    #                 WHERE id = %s
    #                 """,
    #                 (error_message, report_id),
    #             )

    # logger.info(
    #     "Aggregated daily saju reports",
    #     extra={
    #         "game_date": game_saju.game_date,
    #         "game_count": len(schedules),
    #         "player_count": len(players),
    #         "queued_count": len(report_id_by_player_id) - len(failed_reports),
    #         "failed_count": len(failed_reports),
    #     },
    # )


def _get_team_id_by_name(cur, schedules: Sequence[GameSchedule]) -> dict[str, int]:
    requested_names = {
        schedule.home_team
        for schedule in schedules
    } | {
        schedule.away_team
        for schedule in schedules
    }

    cur.execute(
        "SELECT id, name FROM teams WHERE name = ANY(%s)",
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
            """
            INSERT INTO games (game_date, game_time, home_team_id, away_team_id)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (game_date, home_team_id, away_team_id)
            DO UPDATE SET game_time = EXCLUDED.game_time
            """,
            (
                schedule.game_date,
                schedule.game_time,
                team_id_by_name[schedule.home_team],
                team_id_by_name[schedule.away_team],
            ),
        )


def _get_players_for_scheduled_teams(cur, team_ids) -> list[PlayerGameSaju]:
    cur.execute(
        """
        SELECT DISTINCT p.id, p.name, ps.day_master
        FROM players p
        JOIN player_saju ps ON ps.player_id = p.id
        WHERE p.team_id = ANY(%s)
        ORDER BY p.id
        """,
        (list(team_ids),),
    )

    return [
        PlayerGameSaju(player_id=player_id, name=name, day_master=day_master)
        for player_id, name, day_master in cur.fetchall()
    ]


def _prepare_daily_reports(
    cur,
    players: Sequence[PlayerGameSaju],
    game_saju: GameSaju,
    prompt_version: str,
) -> dict[int, int]:
    report_id_by_player_id = {}

    for player in players:
        cur.execute(
            """
            INSERT INTO daily_saju_report (
                player_id,
                game_date,
                game_day_stem,
                game_day_branch,
                prompt_version,
                status,
                error_message
            )
            VALUES (%s, %s, %s, %s, %s, 'pending', NULL)
            ON CONFLICT (player_id, game_date)
            DO UPDATE SET
                game_day_stem = EXCLUDED.game_day_stem,
                game_day_branch = EXCLUDED.game_day_branch,
                prompt_version = EXCLUDED.prompt_version,
                status = EXCLUDED.status,
                error_message = EXCLUDED.error_message,
                updated_at = now()
            WHERE daily_saju_report.status = 'failed'
            RETURNING id
            """,
            (
                player.player_id,
                game_saju.game_date,
                game_saju.day_stem,
                game_saju.day_branch,
                prompt_version,
            ),
        )
        row = cur.fetchone()
        if row is not None:
            report_id_by_player_id[player.player_id] = row[0]
            continue

        cur.execute(
            """
            SELECT id
            FROM daily_saju_report
            WHERE player_id = %s
              AND game_date = %s
              AND status = 'failed'
            """,
            (player.player_id, game_saju.game_date),
        )
        failed_row = cur.fetchone()
        if failed_row is not None:
            report_id_by_player_id[player.player_id] = failed_row[0]

    return report_id_by_player_id
