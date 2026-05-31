import os

import boto3

from common.schema import SQSMessage


def send_message_to_sqs(message: SQSMessage) -> None:
    sqs_client = boto3.client("sqs", region_name=os.environ["AWS_REGION"])
    sqs_client.send_message(
        QueueUrl=os.environ["SQS_QUEUE_URL"],
        MessageBody=message.model_dump_json(),
    )
