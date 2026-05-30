from pprint import pprint
import re
from datetime import datetime, date
from typing import List, TypedDict
from zoneinfo import ZoneInfo

from playwright.sync_api import Page, sync_playwright
from common.schema import GameSchedule, TeamRanking


URL = "https://www.koreabaseball.com/Schedule/Schedule.aspx"
DAUM_KBO_RANKING_URL = "https://sports.daum.net/record/KBO"


class CrawlResult(TypedDict):
    schedule_info: list[GameSchedule]
    ranking_info: list[TeamRanking]


def crawl(date: date | None = None) -> CrawlResult:
    """KBO 일정과 팀 순위를 한 번의 브라우저 세션에서 조회한다."""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--single-process",
                "--no-zygote",
            ],
        )

        try:
            page = browser.new_page(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            )

            page.route(
                "**/*",
                lambda route: route.abort()
                if route.request.resource_type in ["image", "font", "media"]
                else route.continue_()
            )

            return {
                "schedule_info": scrape_kbo_schedule(page, date),
                "ranking_info": scrape_kbo_ranking(page),
            }
        finally:
            browser.close()


def scrape_kbo_schedule(page: Page, date: date | None = None) -> List[GameSchedule]:
    """경기 일정 조회 함수

    Args:
        page (Page): Playwright 페이지 객체.
        date (date|None, optional): 조회 기준 날짜. None이면 오늘 날짜 기준. Defaults to None.

    Returns:
        List[GameSchedule]: 경기 일정 리스트
    """
    target_date = date or datetime.now(ZoneInfo("Asia/Seoul")).date()
    target_date_str = target_date.isoformat()

    page.goto(URL, wait_until="domcontentloaded", timeout=10000)
    page.wait_for_timeout(1000)

    rows = page.locator("#tblScheduleList tbody tr")
    count = rows.count()

    games: List[GameSchedule] = []
    current_date = None

    for i in range(count):
        row = rows.nth(i)
        values = row.locator("td").all_inner_texts()
        values = [v.strip() for v in values]

        if not values:
            continue

        # KBO 테이블은 날짜 rowSpan 때문에 날짜 칸이 생략될 수 있음
        # 따라서 날짜가 있는 row면 갱신하고, 없으면 이전 날짜 사용
        parsed = _normalize_schedule_row(values, current_date, target_date.year)

        if parsed is None:
            continue

        current_date = parsed["game_date"]
        if current_date != target_date_str:
            continue

        games.append(GameSchedule(**parsed))

    return games


def scrape_kbo_ranking(page: Page) -> list[TeamRanking]:
    """KBO 팀 순위를 브라우저 렌더링 결과에서 조회한다."""
    page.goto(DAUM_KBO_RANKING_URL, wait_until="domcontentloaded", timeout=10000)
    page.wait_for_selector("#recordList .wrap_table[data-index='0'] table.tbl_record tbody tr", timeout=10000)

    rows = page.locator("#recordList .wrap_table[data-index='0'] table.tbl_record tbody tr")
    rankings = []

    for i in range(rows.count()):
        row = rows.nth(i)
        values = row.locator("td").all_inner_texts()
        values = [value.strip() for value in values]

        if len(values) < 2:
            continue

        rankings.append(
            TeamRanking(
                team=_normalize_team_name(values[1]),
                ranking=int(values[0]),
            )
        )

    return rankings


def _normalize_schedule_row(values, current_date, year: int):
    """
    실제 values 형태는 렌더링 결과를 한 번 찍어보고 맞춰야 한다.
    예상 컬럼:
    날짜, 시간, 경기, 게임센터, 하이라이트, TV, 라디오, 구장, 비고
    """

    # 예: ['05.27(수)', '18:30', '두산 vs LG', ...]
    # 또는 날짜 rowspan 때문에 ['18:30', '두산 vs LG', ...] 형태일 수 있음

    if len(values) >= 9:
        date_text = values[0]
        time_text = values[1]
        game_text = values[2]
        stadium = values[7]
    elif len(values) >= 8 and current_date is not None:
        date_text = None
        time_text = values[0]
        game_text = values[1]
        stadium = values[6]
    else:
        return None

    # date_text 파싱은 실제 텍스트 포맷 보고 구현
    game_date = _parse_kbo_date(date_text, current_date, year)

    away_team, home_team = _parse_matchup(game_text)

    return {
        "game_date": game_date,
        "game_time": time_text,
        "away_team": away_team,
        "home_team": home_team,
        "stadium": stadium,
    }


def _parse_kbo_date(date_text, current_date, year: int):
    if date_text is None:
        return current_date

    # 예: "05.27(수)"
    month_day = date_text.split("(")[0]
    month, day = month_day.split(".")

    return f"{year}-{month.zfill(2)}-{day.zfill(2)}"


def _parse_matchup(game_text):
    # 실제 텍스트가 "두산 3vs4 LG"처럼 결과 포함일 수 있으므로 보정 필요
    text = game_text.replace("\n", " ").strip()

    if "vs" in text:
        left, right = text.split("vs", 1)
        return re.sub('\\d+', '',left).strip(), re.sub('\\d+', '',right).strip()

    return None, None


def _normalize_team_name(team_text: str) -> str:
    names = [line.strip() for line in team_text.splitlines() if line.strip()]
    return names[-1] if names else team_text.strip()


def main():
    result = crawl()
    print(f"schedule_count={len(result['schedule_info'])}")
    print(f"ranking_count={len(result['ranking_info'])}")
    pprint([schedule.model_dump() for schedule in result["schedule_info"][:5]])
    pprint([ranking.model_dump() for ranking in result["ranking_info"][:5]])


if __name__ == "__main__":
    main()
