import argparse
import asyncio
import json
import os
import re
from enum import Enum

from openai import AsyncOpenAI
from pydantic import BaseModel, Field, ValidationError as PydanticValidationError


PROMPT = """
당신은 일본어 별자리 운세 문장을 한국 프로야구 팬이 읽는 오늘의 야구 운세 멘트로 바꾸는 스포츠 카피라이터입니다.

입력으로는 아래 형태의 JSON 데이터가 제공됩니다.

```python
class OhaasaFortuneInput(BaseModel):
    zodiac_sign: str
    rank: int
    original_text: str
```

반드시 아래 형태의 JSON만 출력하세요.

```python
class OhaasaFortuneOutput(BaseModel):
    fortune_text: str
```

[입력 데이터]
{}

[출력 목표]

* fortune_text: 팬이 읽는 별자리별 오늘의 야구 운세 멘트

[fortune_text 규칙]

* 반드시 한국어만 사용합니다.
* 2~3문장으로 작성합니다.
* 팬이 읽는 야구 관련 일상 운세처럼 작성합니다.
* 원문 운세의 긍정/부정 분위기와 강도를 유지하되, 직역하지 않습니다.
* rank가 높을수록 좋은 경기 흐름, 낮을수록 변수와 아쉬운 흐름을 자연스럽게 반영합니다.
* 타격감, 수비 집중력, 마운드 흐름, 타선 분위기, 승부처, 응원 흐름 같은 야구 표현을 자연스럽게 사용합니다.
* 선수 한 명에게 직접 말하지 않습니다.
* 조언형 명령문을 쓰지 않습니다.
* "주의해야 합니다", "조심해야 합니다", "노력이 필요합니다" 같은 표현을 사용하지 않습니다.
* 일본어, 별자리명, 원문 사이트명, "오하아사"라는 단어를 사용하지 않습니다.
* "사주", "명리", "오행", "십성"이라는 단어를 사용하지 않습니다.

[출력 예시]

{
  "fortune_text": "오늘은 타선의 연결감이 살아나며 경기 분위기가 부드럽게 이어질 가능성이 있습니다. 승부처에서도 응원 흐름이 힘을 보태 전체적으로 기분 좋은 야구 운세가 기대됩니다."
}
"""


class OhaasaFortuneInput(BaseModel):
    zodiac_sign: str
    rank: int
    original_text: str


class OhaasaFortuneOutput(BaseModel):
    fortune_text: str


def create_llm_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=os.environ["UPSTAGE_API_KEY"],
        base_url="https://api.upstage.ai/v1",
    )


def _build_prompt(input_data: OhaasaFortuneInput) -> dict:
    return {
        "role": "user",
        "content": PROMPT.replace(
            "[입력 데이터]\n{}",
            f"[입력 데이터]\n{input_data.model_dump_json(ensure_ascii=False)}",
        ),
    }


class ErrorCode(str, Enum):
    INVALID_SCHEMA = "INVALID_SCHEMA"
    INVALID_TEXT = "INVALID_TEXT"
    MISSING_BASEBALL_CONTEXT = "MISSING_BASEBALL_CONTEXT"


class ValidationError(BaseModel):
    code: ErrorCode
    message: str
    metadata: dict


class ValidationResult(BaseModel):
    success: bool
    errors: list[ValidationError] = Field(default_factory=list)


def _validate_text(text: str) -> dict:
    stop_words = [
        "오하아사",
        "사주",
        "명리",
        "오행",
        "십성",
        "주의해야 합니다",
        "조심해야 합니다",
        "노력이 필요합니다",
    ]
    baseball_words = [
        "야구",
        "경기",
        "타격",
        "타선",
        "수비",
        "마운드",
        "승부처",
        "응원",
        "흐름",
    ]

    found_words = [word for word in stop_words if word in text]
    japanese_chars = re.findall(r"[\u3040-\u30ff]", text)
    has_korean = bool(re.search(r"[가-힣]", text))
    has_baseball_context = any(word in text for word in baseball_words)

    return {
        "valid": not found_words and not japanese_chars and has_korean,
        "has_baseball_context": has_baseball_context,
        "words": found_words,
        "japanese_chars": japanese_chars,
        "has_korean": has_korean,
    }


def _validate_result(output: dict) -> ValidationResult:
    errors: list[ValidationError] = []

    try:
        parsed = OhaasaFortuneOutput.model_validate(output, strict=True)
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

    text_validation = _validate_text(parsed.fortune_text)
    if not text_validation["valid"]:
        errors.append(
            ValidationError(
                code=ErrorCode.INVALID_TEXT,
                message="invalid fortune_text",
                metadata=text_validation,
            )
        )

    if not text_validation["has_baseball_context"]:
        errors.append(
            ValidationError(
                code=ErrorCode.MISSING_BASEBALL_CONTEXT,
                message="fortune_text must contain baseball context",
                metadata=text_validation,
            )
        )

    return ValidationResult(success=not errors, errors=errors)


async def convert_ohaasa_fortune(
    fortune_input: OhaasaFortuneInput,
    client: AsyncOpenAI,
) -> OhaasaFortuneOutput:
    model = os.environ["UPSTAGE_MODEL"]
    messages = [_build_prompt(fortune_input)]
    schema = OhaasaFortuneOutput.model_json_schema()
    schema["additionalProperties"] = False

    for _ in range(3):
        completion = await client.chat.completions.create(
            model=model,
            messages=messages,  # type: ignore
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "OhaasaFortuneOutput",
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
            return OhaasaFortuneOutput.model_validate(output, strict=True)

        messages.extend(
            [
                {"role": "assistant", "content": content},
                {
                    "role": "user",
                    "content": (
                        "이전 출력은 검증에 실패했습니다. 아래 오류를 모두 수정하여 "
                        "동일한 JSON 스키마로만 다시 출력하세요.\n"
                        f"{validation.model_dump_json(ensure_ascii=False)}"
                    ),
                },
            ]
        )

    raise ValueError("Ohaasa fortune LLM output validation failed after retries")


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("text", nargs="*", help="변환할 오하아사 원문")
    parser.add_argument("--zodiac-sign", default="ARIES")
    parser.add_argument("--rank", type=int, default=1)
    args = parser.parse_args()

    original_text = " ".join(args.text) or "何事にも前向きに取り組める日。周りからの応援も集まりそう。"
    fortune_input = OhaasaFortuneInput(
        zodiac_sign=args.zodiac_sign,
        rank=args.rank,
        original_text=original_text,
    )

    async with create_llm_client() as client:
        result = await convert_ohaasa_fortune(fortune_input, client)

    print(result.model_dump_json(indent=2, ensure_ascii=False))


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv()
    asyncio.run(main())
