from src.crawler import scrape_kbo_schedule
from src.schema import GameSchedule


def main():
    from src.saju import get_player_saju_info
    from pprint import pprint
    pprint(get_player_saju_info("홍길동", 1, '2003', '10', '11', '02'))


if __name__ == "__main__":
    main()