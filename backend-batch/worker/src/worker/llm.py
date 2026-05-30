import json
import os
import asyncio
from openai import AsyncOpenAI
from pydantic import BaseModel, ValidationError as PydanticValidationError
from common.schema import TenGodResult, LLMOutput
from worker.prompts import PROMPT
import re
from enum import Enum


def create_llm_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=os.environ["UPSTAGE_API_KEY"],
        base_url="https://api.upstage.ai/v1",
    )


def _build_prompt(input_data: TenGodResult) -> dict:
    return {
        "role": "user",
        "content": PROMPT.replace(
            "[입력 데이터]\n{}",
            f"[입력 데이터]\n{input_data.model_dump_json()}",
        ),
    }




class ErrorCode(str, Enum):
    INVALID_SCHEMA = "INVALID_SCHEMA"
    INVALID_INDEX = "INVALID_INDEX"
    CONTAIN_STOP_WORDS = "CONTAIN_STOP_WORDS"


class ValidationError(BaseModel):
    code: ErrorCode
    message: str
    metadata: dict


class ValidationResult(BaseModel):
    success: bool
    errors: list[ValidationError] = []




def _validate_text(text: str) -> dict:
    stop_words = [
        "사주",
        "명리",
        "오행",
        "십성",
        "이 선수는",
        "해당 선수는",
        "제공된 데이터",
        "입력된 데이터",
        "분석 결과",
    ]

    patterns = [
        r".*해야\s?합니다",
        r".*조심해야\s?합니다",
        r".*주의해야\s?합니다",
        r".*필요가\s?있습니다",
        r".*관리해야\s?합니다",
        r".*집중해야\s?합니다",
    ]

    found_words = [
        word
        for word in stop_words
        if word in text
    ]

    found_patterns = [
        pattern
        for pattern in patterns
        if re.search(pattern, text)
    ]

    return {
        "valid": not found_words and not found_patterns,
        "words": found_words,
        "patterns": found_patterns,
    }


def _validate_result(output: dict) -> ValidationResult:
    """llm이 뱉어낸 output을 검증하는 함수

    Args:
        output (dict): 결과로 나온 문자열을 dict로 변환

    Returns:
        ValidationResult: 검증 결과 출력
    """

    errors: list[ValidationError] = []

    try:
        parsed = LLMOutput.model_validate(output, strict=True)
    except PydanticValidationError as e:
        return ValidationResult(
            success=False,
            errors=[
                ValidationError(
                    code=ErrorCode.INVALID_SCHEMA,
                    message="invalid schema!",
                    metadata={"errors": e.errors()},
                )
            ],
        )

    if not isinstance(parsed.lucky_index, int) or not 0 <= parsed.lucky_index <= 100:
        errors.append(
            ValidationError(
                code=ErrorCode.INVALID_INDEX,
                message="lucky_index는 0~100 범위의 정수여야 합니다.",
                metadata={"actual": parsed.lucky_index},
            )
        )

    text_validation = _validate_text(parsed.saju_text)
    if not text_validation["valid"]:
        errors.append(
            ValidationError(
                code=ErrorCode.CONTAIN_STOP_WORDS,
                message="forbidden word detected",
                metadata=text_validation,
            )
        )

    return ValidationResult(success=not errors, errors=errors)




async def generate_saju_info(ten_god_result: TenGodResult, client: AsyncOpenAI) -> LLMOutput:
    model = os.environ["UPSTAGE_MODEL"]
    messages = [_build_prompt(ten_god_result)]
    schema = LLMOutput.model_json_schema()
    schema["additionalProperties"] = False
    schema["properties"]["lucky_index"].update({"minimum": 0, "maximum": 100})

    for _ in range(3):
        completion = await client.chat.completions.create(
            model=model,
            messages=messages, # type: ignore
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "LLMOutput",
                    "schema": schema,
                    "strict": True,
                },
            },
        )

        content = completion.choices[0].message.content or ""
        try:
            output = json.loads(content)
        except json.JSONDecodeError:
            output = {"raw": content}
        validation = _validate_result(output)

        if validation.success:
            return LLMOutput.model_validate(output, strict=True)

        messages.extend(
            [
                {"role": "assistant", "content": content},
                {
                    "role": "user",
                    "content": (
                        "이전 출력은 검증에 실패했습니다. 아래 오류를 모두 수정하여 "
                        "동일한 JSON 스키마로만 다시 출력하세요.\n"
                        f"{validation.model_dump_json()}"
                    ),
                },
            ]
        )

    raise ValueError("LLM output validation failed after retries")


async def main() -> None:
    good_input = TenGodResult(
        day_master="갑",
        target_stem="병",
        day_master_element="목",
        target_element="화",
        relation="생",
        ten_god="식신",
        keywords=["표현력", "활동성", "공격적인 흐름"],
    )
    async with create_llm_client() as client:
        result = await generate_saju_info(good_input, client)
    print("[good_input]")
    print(result.model_dump_json(indent=2, ensure_ascii=False))

    bad_input = TenGodResult(
        day_master="갑",
        target_stem="경",
        day_master_element="목",
        target_element="금",
        relation="극",
        ten_god="편관",
        keywords=["압박감", "변수", "기복", "불안정한 흐름"],
    )
    async with create_llm_client() as client:
        bad_result = await generate_saju_info(bad_input, client)
    print("[bad_input]")
    print(bad_result.model_dump_json(indent=2, ensure_ascii=False))


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(main())
