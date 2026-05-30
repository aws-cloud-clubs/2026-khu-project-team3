import asyncio
import logging
import os
import sys

if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from common.db import get_connection
from common.saju import get_ten_god
from common.schema import SQSMessage
from worker.llm import generate_saju_info
from worker.queries import (
    GET_WORKER_TEST_MESSAGES_QUERY,
    MARK_DAILY_SAJU_REPORT_GENERATING_QUERY,
    UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY,
    UPDATE_DAILY_SAJU_REPORT_GENERATED_QUERY,
)


logger = logging.getLogger(__name__)


async def work(message: SQSMessage) -> None:
    failed_indexes = await work_batch([message])
    if failed_indexes:
        raise RuntimeError("Failed to generate daily saju report")


async def work_batch(messages: list[SQSMessage]) -> list[int]:
    if not messages:
        return []

    logger.info(
        "Generating daily saju reports: message_count=%s",
        len(messages),
    )
    generating_count = _mark_generating_batch(messages)
    logger.info(
        "Marked daily saju reports as generating: updated_count=%s",
        generating_count,
    )

    results = await asyncio.gather(
        *(generate_saju_info(message.ten_god_result) for message in messages),
        return_exceptions=True,
    )

    generated_reports = []
    failed_reports = []
    failed_indexes = []
    for index, (message, result) in enumerate(zip(messages, results)):
        if isinstance(result, Exception):
            logger.error(
                "Failed to generate daily saju report",
                exc_info=(type(result), result, result.__traceback__),
                extra={"player_id": message.player_id, "game_date": message.game_date},
            )
            failed_reports.append((message, str(result)))
            failed_indexes.append(index)
            continue

        generated_reports.append((message, result))

    generated_count, failed_count = _update_reports_batch(generated_reports, failed_reports)
    logger.info(
        "Generated daily saju reports: message_count=%s generated_count=%s failed_count=%s generated_update_count=%s failed_update_count=%s",
        len(messages),
        len(generated_reports),
        len(failed_reports),
        generated_count,
        failed_count,
    )
    return failed_indexes


def _mark_generating_batch(messages: list[SQSMessage]) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.executemany(
                MARK_DAILY_SAJU_REPORT_GENERATING_QUERY,
                [
                    (message.player_id, message.game_date)
                    for message in messages
                ],
            )
            updated_count = cur.rowcount
        conn.commit()
        return updated_count


def _update_reports_batch(generated_reports: list[tuple], failed_reports: list[tuple]) -> tuple[int, int]:
    generated_count = 0
    failed_count = 0
    with get_connection() as conn:
        with conn.cursor() as cur:
            if generated_reports:
                cur.executemany(
                    UPDATE_DAILY_SAJU_REPORT_GENERATED_QUERY,
                    [
                        (
                            output.saju_text,
                            output.lucky_index,
                            message.player_id,
                            message.game_date,
                        )
                        for message, output in generated_reports
                    ],
                )
                generated_count = cur.rowcount

            if failed_reports:
                cur.executemany(
                    UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY,
                    [
                        (error_message, message.player_id, message.game_date)
                        for message, error_message in failed_reports
                    ],
                )
                failed_count = cur.rowcount

        conn.commit()
    return generated_count, failed_count


def _log_current_report_rows(messages: list[SQSMessage]) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            for message in messages:
                cur.execute(
                    """
                    SELECT status, length(report_text), lucky_index, generated_at, updated_at
                    FROM daily_saju_report
                    WHERE player_id = %s
                      AND game_date = %s
                    """,
                    (message.player_id, message.game_date),
                )
                row = cur.fetchone()
                logger.info(
                    "Current daily saju report row: player_id=%s game_date=%s row=%s",
                    message.player_id,
                    message.game_date,
                    row,
                )


def main() -> None:
    batch_size = int(os.environ.get("WORKER_TEST_BATCH_SIZE", "10"))
    logger.info(
        "Worker DB target: host=%s port=%s dbname=%s user=%s",
        os.environ.get("DB_HOST"),
        os.environ.get("DB_PORT"),
        os.environ.get("DB_NAME"),
        os.environ.get("DB_USER"),
    )
    logger.info("Fetching worker test messages: batch_size=%s", batch_size)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(GET_WORKER_TEST_MESSAGES_QUERY, (batch_size,))
            rows = cur.fetchall()

    logger.info("Fetched worker test messages: message_count=%s", len(rows))
    if not rows:
        raise ValueError("No pending or failed daily_saju_report row found for worker test")

    messages = [
        SQSMessage(
            player_id=player_id,
            game_date=game_date.isoformat(),
            ten_god_result=get_ten_god(day_master, game_day_stem),
        )
        for player_id, game_date, day_master, game_day_stem in rows
    ]
    asyncio.run(work_batch(messages))
    _log_current_report_rows(messages)


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv("/Users/jeongdaegyun/2026-khu-project-team3/backend-batch/.env")
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO"),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    main()
