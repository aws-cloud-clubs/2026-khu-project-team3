import asyncio
import logging

from src.schema import SQSMessage
from src.worker import work_batch


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
