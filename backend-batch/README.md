# Backend Batch 

aws lambda에서 처리할 경기 정보 수집 및 사주 생성 함수입니다. 

```text
.
├── Dockerfile <- aggregator lambda용 Dockerfile
├── README.md
├── hello.py
├── pyproject.toml
├── src
│   ├── __init__.py
│   ├── aggregator.py <- 경기일 정보 조회 및 메시지 발행 담당 함수
│   ├── crawler.py <- playwright 크롤링 함수
│   ├── db.py <- db 연결
│   ├── handlers
│   │   ├── __init__.py
│   │   ├── aggregator_handler.py <- 경기일 정보 크롤링 및 메시지 발행 담당 함수 lambda 진입점
│   │   └── worker_handler.py  <- worker 함수 lambda 진입점
│   ├── saju.py   <- 선수, 경기일 만세력 조회
│   ├── schema.py <- pydantic schema
│   ├── sqs.py <- aws sqs 메시지 전송 함수
│   └── worker.py <- 해당 경기일에 각 선수에 대해 사주 생성하는 함수
├── tests
│   ├── conftest.py
│   └── test_saju.py <- 만세력 함수 테스트
└── uv.lock
```
![alt text](../assets/image.png)