import logging

from src.db import get_connection
from src.llm import generate_saju_info
from src.queries import (
    GET_WORKER_TEST_MESSAGE_QUERY,
    MARK_DAILY_SAJU_REPORT_GENERATING_QUERY,
    UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY,
    UPDATE_DAILY_SAJU_REPORT_GENERATED_QUERY,
)
from src.saju import get_ten_god
from src.schema import SQSMessage


logger = logging.getLogger(__name__)


def work(message: SQSMessage) -> None:
    logger.info(
        "Generating daily saju report",
        extra={"player_id": message.player_id, "game_date": message.game_date},
    )
    _mark_generating(message)

    try:
        output = generate_saju_info(message.ten_god_result)
        _mark_generated(message, output.saju_text, output.lucky_index)
    except Exception as exc:
        logger.exception(
            "Failed to generate daily saju report",
            extra={"player_id": message.player_id, "game_date": message.game_date},
        )
        _mark_failed(message, str(exc))
        raise

    logger.info(
        "Generated daily saju report",
        extra={
            "player_id": message.player_id,
            "game_date": message.game_date,
            "lucky_index": output.lucky_index,
        },
    )


def _mark_generating(message: SQSMessage) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                MARK_DAILY_SAJU_REPORT_GENERATING_QUERY,
                (message.player_id, message.game_date),
            )


def _mark_generated(message: SQSMessage, report_text: str, lucky_index: int) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                UPDATE_DAILY_SAJU_REPORT_GENERATED_QUERY,
                (report_text, lucky_index, message.player_id, message.game_date),
            )


def _mark_failed(message: SQSMessage, error_message: str) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY,
                (error_message, message.player_id, message.game_date),
            )


def main() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(GET_WORKER_TEST_MESSAGE_QUERY)
            row = cur.fetchone()

    if row is None:
        raise ValueError("No pending or failed daily_saju_report row found for worker test")

    player_id, game_date, day_master, game_day_stem = row
    message = SQSMessage(
        player_id=player_id,
        game_date=game_date.isoformat(),
        ten_god_result=get_ten_god(day_master, game_day_stem),
    )
    work(message)


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    main()
