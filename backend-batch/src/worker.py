import asyncio
import logging
import os

from src.db import get_connection
from src.llm import generate_saju_info
from src.queries import (
    GET_WORKER_TEST_MESSAGES_QUERY,
    MARK_DAILY_SAJU_REPORT_GENERATING_QUERY,
    UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY,
    UPDATE_DAILY_SAJU_REPORT_GENERATED_QUERY,
)
from src.saju import get_ten_god
from src.schema import SQSMessage


logger = logging.getLogger(__name__)


async def work(message: SQSMessage) -> None:
    failed_indexes = await work_batch([message])
    if failed_indexes:
        raise RuntimeError("Failed to generate daily saju report")


async def work_batch(messages: list[SQSMessage]) -> list[int]:
    if not messages:
        return []

    logger.info(
        "Generating daily saju reports",
        extra={"message_count": len(messages)},
    )
    _mark_generating_batch(messages)

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

    _update_reports_batch(generated_reports, failed_reports)
    logger.info(
        "Generated daily saju reports",
        extra={
            "message_count": len(messages),
            "generated_count": len(generated_reports),
            "failed_count": len(failed_reports),
        },
    )
    return failed_indexes


def _mark_generating_batch(messages: list[SQSMessage]) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.executemany(
                MARK_DAILY_SAJU_REPORT_GENERATING_QUERY,
                [
                    (message.player_id, message.game_date)
                    for message in messages
                ],
            )


def _update_reports_batch(generated_reports: list[tuple], failed_reports: list[tuple]) -> None:
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

            if failed_reports:
                cur.executemany(
                    UPDATE_DAILY_SAJU_REPORT_FAILED_QUERY,
                    [
                        (error_message, message.player_id, message.game_date)
                        for message, error_message in failed_reports
                    ],
                )


def main() -> None:
    batch_size = int(os.environ.get("WORKER_TEST_BATCH_SIZE", "10"))
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(GET_WORKER_TEST_MESSAGES_QUERY, (batch_size,))
            rows = cur.fetchall()

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


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    main()
