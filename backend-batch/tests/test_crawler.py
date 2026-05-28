import asyncio

import pytest

from src import crawler


class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class FakeDateTime:
    @classmethod
    def now(cls, tz=None):
        class _Now:
            def strftime(self, fmt):
                return "20260528"

        return _Now()


def test_get_ohaasa_info(monkeypatch):
    payload = [
        {
            "onair_date": "20260528",
            "detail": [
                {
                    "ranking_no": "2",
                    "horoscope_st": "07",
                    "horoscope_text": "둘째\t메시지",
                },
                {
                    "ranking_no": "1",
                    "horoscope_st": "11",
                    "horoscope_text": "첫째\t메시지\t",
                },
            ],
        },
        {
            "onair_date": "20260527",
            "detail": [
                {
                    "ranking_no": "1",
                    "horoscope_st": "01",
                    "horoscope_text": "무시됨",
                }
            ],
        },
    ]

    monkeypatch.setattr(crawler.requests, "get", lambda *args, **kwargs: FakeResponse(payload))
    monkeypatch.setattr(crawler, "datetime", FakeDateTime)

    async def run():
        future = await crawler.get_ohaasa_info()
        return await future

    result = asyncio.run(run())

    assert result == [
        {
            "rank": 1,
            "constellation": "물병자리",
            "message": "첫째 메시지",
        },
        {
            "rank": 2,
            "constellation": "천칭자리",
            "message": "둘째 메시지",
        },
    ]


def test_get_ohaasa_info_returns_empty_when_today_data_missing(monkeypatch):
    monkeypatch.setattr(
        crawler.requests,
        "get",
        lambda *args, **kwargs: FakeResponse([{"onair_date": "20260527", "detail": []}]),
    )
    monkeypatch.setattr(crawler, "datetime", FakeDateTime)

    async def run():
        future = await crawler.get_ohaasa_info()
        return await future

    result = asyncio.run(run())

    assert result == []


@pytest.mark.live
def test_get_ohaasa_info_live():
    async def run():
        future = await crawler.get_ohaasa_info()
        return await future

    result = asyncio.run(run())

    assert isinstance(result, list)
    assert result
    assert all(isinstance(item["rank"], int) for item in result)
    assert all(isinstance(item["constellation"], str) and item["constellation"] for item in result)
    assert all(isinstance(item["message"], str) and item["message"] for item in result)
