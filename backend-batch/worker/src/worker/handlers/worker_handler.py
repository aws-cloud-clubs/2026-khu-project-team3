import asyncio
import json
import logging
import os

from common.db import get_connection
from common.saju import get_ten_god
from common.schema import SQSMessage
from worker.queries import GET_WORKER_TEST_MESSAGES_QUERY
from worker.worker import work_batch


logger = logging.getLogger(__name__)


def handler(event, context):
    records = event.get("Records", [])
    messages = []
    failed_item_ids = []

    for index, record in enumerate(records):
        try:
            message = SQSMessage.model_validate_json(record["body"])
        except Exception:
            logger.exception(
                "Failed to parse worker SQS message",
                extra={"message_id": record.get("messageId")},
            )
            failed_item_ids.append(record.get("messageId"))
            continue

        logger.info(
            "Received worker SQS message",
            extra={
                "message_id": record.get("messageId"),
                "player_id": message.player_id,
                "game_date": message.game_date,
            },
        )
        messages.append((index, message))

    failed_indexes = asyncio.run(work_batch([message for _, message in messages]))
    failed_item_ids.extend(
        records[messages[index][0]].get("messageId")
        for index in failed_indexes
    )

    return {
        "batchItemFailures": [
            {"itemIdentifier": message_id}
            for message_id in failed_item_ids
            if message_id is not None
        ]
    }


def main() -> None:
    batch_size = int(os.environ.get("WORKER_TEST_BATCH_SIZE", "10"))
    logger.info("Fetching worker handler test messages: batch_size=%s", batch_size)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(GET_WORKER_TEST_MESSAGES_QUERY, (batch_size,))
            rows = cur.fetchall()

    if not rows:
        raise ValueError("No pending or failed daily_saju_report row found for worker handler test")

    records = []
    for index, (player_id, game_date, day_master, game_day_stem) in enumerate(rows):
        message = SQSMessage(
            player_id=player_id,
            game_date=game_date.isoformat(),
            ten_god_result=get_ten_god(day_master, game_day_stem),
        )
        records.append(
            {
                "messageId": f"local-worker-test-{index}",
                "body": message.model_dump_json(),
            }
        )

    result = handler({"Records": records}, None)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv("/Users/jeongdaegyun/2026-khu-project-team3/backend-batch/.env")
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO"),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    main()
