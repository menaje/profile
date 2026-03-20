# coni-multi

`coni-multi`는 **건설사업관리(CM) 기술제안서 작성 업무**를 지원하기 위한 자산 분석 및 멀티 에이전트 오케스트레이션 백엔드입니다. 이 시스템은 입찰공고문, RFP, 과업내용서, 설계도서, 사내 가이드, 회사 실적자료를 구조화된 자산으로 관리하고, 그 정보를 바탕으로 **기술제안서 작성에 필요한 계획과 실행 작업**을 단계적으로 운영하는 데 초점을 둡니다.

즉, 이 저장소는 범용 AI 실험 도구라기보다 다음 문제를 해결하기 위한 시스템으로 이해하는 편이 맞습니다.

- 이번 입찰 건에서 무엇을 제안해야 하는지 빠르게 파악하고 싶다.
- 발주처, 사업명, 과업 범위, 용역 단계, 제안서 목차와 분량을 정리하고 싶다.
- 사내 공통 자료와 프로젝트별 자료를 분리해서 안전하게 재사용하고 싶다.
- 제안서 작성 업무를 `계획 -> 작업 분해 -> 실행 -> 모니터링` 흐름으로 운영하고 싶다.
- 최종적으로는 CM 기술제안서용 보고서/페이지 산출물 체계까지 연결하고 싶다.

## 이 시스템을 CM 기술제안서 관점에서 보면

### 무엇을 넣는가

- 입찰공고문
- 제안요청서(RFP)
- 과업내용서
- 설계도서, 도면, 기준 문서
- 질의응답, 추가 설명자료
- 회사 소개서, 유사실적, 내부 작성 가이드

### 무엇을 해주는가

- 문서별 핵심 요약과 메타데이터 추출
- 프로젝트 기본정보 추출
- 기술제안서 분량, 목차, 작성 유의사항 추출
- 제안 수행용 Run 생성 및 단계별 작업 계획
- 실행 중 상태 추적, 복구, 재시도

### 누가 쓰는가

- 제안 PM
- 분야별 제안서 작성자
- CM 실무 담당자
- 제안 검토자 또는 총괄 리더

## 사용자 기준 핵심 가치

### 1. 자료를 성격별로 분리한다

이 시스템은 자산을 세 가지로 구분합니다.

- `companyinfo`
  - 회사 소개, 유사실적, 수행경험, 조직 강점 등 여러 입찰에서 재사용하는 공통 자료
- `guideline`
  - 사내 작성 기준, 용어 원칙, 금칙사항, 제안서 작성 규칙, 결과물 형식 기준
- `projectdata`
  - 이번 입찰 건에만 해당하는 발주 문서와 프로젝트 자료

이 구분은 실사용에서 중요합니다. 제안팀은 회사 공통 자산과 이번 사업 자료를 섞지 않고 관리할 수 있고, 스냅샷을 통해 특정 시점의 자료 묶음을 Run에 고정할 수 있습니다.

### 2. “프로젝트 이해”를 자동화한다

프로젝트 정보 추출 기능은 완료된 `projectdata` 자산들 중 핵심 문서를 골라 다음 정보를 정리합니다.

- 사업명
- 사업구분
- 공사기간
- 사업위치
- 건물용도
- CM 용역명
- CM 용역기간
- CM 용역 단계
- 발주처
- 기술제안서 슬라이드 수
- 기술제안서 목차
- 기술제안서 작성 유의사항

실무적으로는 “공고문, RFP, 과업내용서, 평가기준표 중 무엇을 먼저 읽어야 하나”를 줄여주는 기능에 가깝습니다.

### 3. Run을 제안서 업무 단위로 다룬다

이 시스템의 Run은 단순 배치 작업이 아니라, **한 입찰 건에 대한 제안 준비 작업 묶음**으로 보는 편이 자연스럽습니다.

- `planning`
  - 제안서 작성 전략, 구조, 단계별 업무 분해를 계획하는 Run
- `implementation`
  - 이미 정리된 구조를 바탕으로 실제 작성/제작 작업을 진행하는 Run

Run은 생성 시점의 스냅샷에 고정되므로, 실행 중 자료가 바뀌어도 기준이 흔들리지 않습니다.

## CM 제안팀 기준 추천 운영 흐름

### 1. 프로젝트를 먼저 준비한다

현재 코드 기준으로는 프로젝트 생성 전용 API가 보이지 않으므로, `projects` 테이블에 대상 프로젝트가 이미 존재한다고 가정해야 합니다.

### 2. 공통 자산을 등록한다

다음 자료를 `companyinfo` 또는 `guideline`으로 업로드합니다.

- 회사 소개서
- 유사 실적집
- 조직 및 인력 소개 자료
- 사내 기술제안서 작성 기준
- CM 용어 정의서
- 금칙사항 또는 제안 원칙 문서

### 3. 이번 입찰 자료를 `projectdata`로 등록한다

대표적으로 아래 문서를 넣는 흐름이 적합합니다.

- 입찰공고문
- RFP / 제안요청서
- 과업내용서
- 평가기준표
- 설계도서
- 현장 설명자료
- 질의회신서
- 참고 도면 및 현황자료

### 4. 자산 분석 완료를 확인한다

업로드 직후에는 각 자산이 분석 중 상태를 거칩니다. 분석이 끝나면 문서별 `summary`, `purpose`, `key_insights`, `limitations`가 저장되어 이후 계획 수립의 입력이 됩니다.

### 5. 프로젝트 정보 추출을 실행한다

이 단계에서 제안팀이 가장 먼저 확인하고 싶은 정보가 정리됩니다.

- 이 사업이 무엇인지
- 발주처가 누구인지
- CM 용역 단계가 어디인지
- 기술제안서를 몇 페이지 수준으로 봐야 하는지
- 목차를 어떤 구조로 잡아야 하는지

### 6. 스냅샷을 발행한다

- 글로벌 스냅샷: 회사 공통자료와 가이드라인 확정
- 프로젝트 스냅샷: 이번 사업 자료 확정

실무적으로는 “이번 버전의 자료셋을 기준본으로 묶는다”는 의미입니다.

### 7. Run을 생성하고 실행한다

- 보수적으로 진행하려면 `POST /runs` 후 `POST /runs/{run_id}/start`
- 빠르게 진행하려면 `POST /runs/quick-start`

### 8. 진행률과 헬스를 보면서 운영한다

실행 중에는 다음 정보를 계속 확인할 수 있습니다.

- 전체 진행률
- 완료/실패/실행 중 Task 수
- 헬스 상태
- 자동 복구 가능 여부

## 도메인 원칙

저장소 내 리소스 문서를 기준으로, 이 시스템은 **건설사업관리 기술제안서**를 다음 원칙으로 다룹니다.

### 전통적 건설기술 및 건설관리 중심

제안서에서 다루는 기술은 공법, 자재, 장비, 품질, 안전, 공정, 원가, 문서관리 등 **전통적 건설기술과 CM 관리 요소**를 중심으로 해석합니다.

### 디지털/스마트/AI 솔루션은 기본 제안 대상이 아니다

용어 정의 문서 기준으로 BIM, 디지털 트윈, IoT, AI, 스마트건설 솔루션은 분류상 설명할 수는 있지만, **제안서상 채택·권고 대상으로 삼지 않는 것이 기본 원칙**입니다.

### 현황 분석과 제안 아이템은 분리한다

제공 자료에 들어 있는 현재 조건, 설계 정보, 과업 조건과 시스템이 후속 작업에서 정리할 개선안·제안안을 혼동하지 않는 것이 중요합니다.

### 결과물은 보고서와 페이지 단위로 나뉜다

리소스 문서 기준으로 결과물은 아래 관점으로 설계되어 있습니다.

- Markdown 기반 보고서
  - 장/절 단위 원고
- HTML 기반 슬라이드
  - 페이지 단위 결과물
  - 기본 원칙: `1 Task = 1 Page = 1 HTML File`
- HTML 기반 단일 보고서
  - 단일 페이지형 인터랙티브 결과물

## 시스템이 다루는 주요 산출물

이 시스템은 기술제안서 자체만 바로 뽑아내는 도구라기보다, 기술제안서 제작에 필요한 중간 산출물과 최종 산출물 체계를 운영하기 위한 기반입니다.

### 중간 산출물 예시

- 공종별 건설기술 리스트 보고서
- 공종별 건설기술 분석보고서
- 공종간 인터페이스 분석보고서
- 사업부지 주변 환경 분석보고서
- 건설기술 제안 정의서
- 개선제안 보고서
- 회사 유사사례 보고서

### 최종 산출물 예시

- CM 기술제안서용 Markdown 원고
- 페이지 단위 HTML 결과물
- 제안서 목차 구조에 맞춘 슬라이드형 파일 묶음

## 자산 타입을 제안팀 언어로 번역하면

| 시스템 자산 타입 | 제안팀 관점 의미 | 대표 예시 |
| --- | --- | --- |
| `companyinfo` | 회사 공통 경쟁력 자료 | 회사소개서, 유사실적, 조직도, 핵심인력 소개 |
| `guideline` | 제안서 작성 기준 | CM 용어 정의, 작성 톤, 금칙사항, 결과물 규칙 |
| `projectdata` | 사업별 입찰 자료 | 공고문, RFP, 과업내용서, 평가기준, 설계도서 |

## 주요 API를 사용성 관점으로 보면

| 사용 목적 | 메서드 | 경로 |
| --- | --- | --- |
| 공통/사업 자료 업로드 | `POST` | `/api/v1/assets/{asset_type}` |
| 기존 자료를 새 버전으로 교체 | `PUT` | `/api/v1/assets/{asset_type}/{asset_id}` |
| 자료 분석 완료 여부 확인 | `GET` | `/api/v1/assets/{asset_type}/{asset_id}/status` |
| 글로벌 기준본 확정 | `POST` | `/api/v1/assets/global/publish-snapshot` |
| 프로젝트 기준본 확정 | `POST` | `/api/v1/projects/{project_id}/assets/publish-snapshot` |
| 프로젝트 정보와 제안 요구사항 추출 | `POST` | `/api/v1/projects/{project_id}/extract-info` |
| 추출 상태 확인 | `GET` | `/api/v1/projects/{project_id}/extraction-status` |
| 추출 결과 확인 | `GET` | `/api/v1/projects/{project_id}/extracted-info` |
| Run 생성만 수행 | `POST` | `/api/v1/runs` |
| 기존 Run 실행 시작 | `POST` | `/api/v1/runs/{run_id}/start` |
| 생성과 실행을 한 번에 처리 | `POST` | `/api/v1/runs/quick-start` |
| 진행률 확인 | `GET` | `/api/v1/runs/{run_id}/progress` |
| 장애 진단 | `GET` | `/api/v1/runs/{run_id}/health` |
| 자동 복구 | `POST` | `/api/v1/runs/{run_id}/recover` |
| 강제 복구 | `POST` | `/api/v1/runs/{run_id}/recover/force` |
| 프롬프트 전체 동기화 | `POST` | `/api/v1/prompts/sync` |

## 빠른 사용 예시

### 1. 프롬프트 동기화

```bash
curl -X POST "http://localhost:8000/api/v1/prompts/sync"
```

### 2. 회사 공통 자료 업로드

```bash
curl -X POST "http://localhost:8000/api/v1/assets/companyinfo" \
  -F "files=@./sample/company-profile.pdf"
```

### 3. 프로젝트 입찰 자료 업로드

```bash
curl -X POST "http://localhost:8000/api/v1/assets/projectdata" \
  -F "project_id=1" \
  -F "files=@./sample/rfp.pdf" \
  -F "files=@./sample/scope-of-work.pdf"
```

### 4. 프로젝트 정보 추출

```bash
curl -X POST "http://localhost:8000/api/v1/projects/1/extract-info" \
  -H "Content-Type: application/json" \
  -d '{"async_mode": true}'
```

### 5. 스냅샷 확정

```bash
curl -X POST "http://localhost:8000/api/v1/assets/global/publish-snapshot"
```

```bash
curl -X POST "http://localhost:8000/api/v1/projects/1/assets/publish-snapshot"
```

### 6. 제안 준비 Run 시작

```bash
curl -X POST "http://localhost:8000/api/v1/runs/quick-start?project_id=1&run_type=planning"
```

## 프롬프트와 모델 선택

`prompts_md/` 아래 마크다운 파일은 이 시스템의 도메인 지식을 구성하는 핵심 자산입니다. 예를 들어 현재 저장소에는 다음 성격의 프롬프트가 포함되어 있습니다.

- 프로젝트 기본정보 추출
- 기술제안서 요구사항 추출
- 관련 자산 식별
- 단계/작업 계획 수립
- 자산 분석

각 프롬프트는 YAML front matter를 통해 다음 정보를 가집니다.

- `name`
- `description`
- `complexity`
- `pydantic_model`

동작 방식은 아래와 같습니다.

1. `prompts_md/` 파일을 `prompts` 테이블에 동기화
2. `complexity`에 따라 `llm_model` 테이블에서 모델 선택
3. 응답을 `pydantic_model`에 맞춰 검증

기본 fallback 모델 매핑은 코드 기준으로 다음과 같습니다.

- `low` -> `gemini-2.5-flash-lite`
- `medium` -> `gemini-2.5-flash`
- `high` -> `gemini-2.5-pro`

## 기술 구조

```text
coni-multi/
├── app/
│   ├── api/              # FastAPI 엔드포인트, Gemini API 클라이언트
│   ├── core/             # 설정, 이벤트, enum, 스키마
│   ├── db/               # Supabase 접근 계층
│   ├── services/         # 자산 분석, 오케스트레이션, 추출, 복구
│   └── utils/            # 파일/프롬프트/재시도/모니터링 유틸리티
├── prompts_md/           # 프롬프트 원본
├── resources/            # CM 용어와 결과물 규칙
├── requirements.txt
├── Dockerfile
└── README.md
```

런타임 중에는 저장소 루트 아래에 `data/`가 생성되고, 다음 구조를 사용합니다.

```text
data/
├── companyinfo/
│   ├── original/
│   └── transformed/
├── guideline/
│   ├── original/
│   └── transformed/
└── projectdata/{project_id}/
    ├── original/
    └── transformed/
```

## 사전 요구사항

이 프로젝트는 코드만으로 바로 실행되지 않습니다. 최소한 아래 외부 구성이 준비되어 있어야 합니다.

- Supabase 프로젝트
- Google Gemini API 사용 환경
- `.env` 파일
- 오케스트레이션용 데이터베이스 스키마

코드상에서 직접 참조하는 주요 테이블은 다음과 같습니다.

- `projects`
- `projectdata`
- `companyinfo`
- `guideline`
- `processruns`
- `phases`
- `stages`
- `tasks`
- `tool_tasks`
- `outputs`
- `prompts`
- `llm_model`
- `set_phase`
- `global_asset_snapshots`
- `global_asset_snapshot_members`
- `project_asset_snapshots`
- `project_asset_snapshot_members`

이 저장소에는 migration이나 schema SQL이 포함되어 있지 않으므로, 실제 운영 스키마는 외부에서 관리 중이라고 봐야 합니다.

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `SUPABASE_URL` | 예 | 없음 | Supabase 프로젝트 URL |
| `SUPABASE_KEY` | 예 | 없음 | Supabase API Key |
| `GOOGLE_API_KEY` | 예 | 없음 | Gemini 호출용 API Key |
| `LOG_LEVEL` | 아니오 | `INFO` | 로깅 레벨 |
| `EVENT_DRIVEN_MODE` | 아니오 | `True` | 이벤트 기반 오케스트레이션 활성화 |
| `POLLING_FALLBACK_ENABLED` | 아니오 | `True` | 이벤트 유실 시 폴링 백업 활성화 |
| `EVENT_QUEUE_MAX_SIZE` | 아니오 | `1000` | 이벤트 큐 최대 크기 |
| `MAX_RETRIES` | 아니오 | `3` | 공통 재시도 횟수 |
| `MAX_ANALYSIS_RETRIES` | 아니오 | `3` | 분석 재시도 횟수 |
| `LLM_API_TIMEOUT` | 아니오 | `300` | LLM 호출 타임아웃(초) |
| `PDF_CONVERSION_PPI` | 아니오 | `120` | PDF 이미지 변환 해상도 |
| `PDF_SPLIT_THRESHOLD_MB` | 아니오 | `45` | PDF 분할 기준 크기(MB) |
| `SUPABASE_CONCURRENT_LIMIT` | 아니오 | `10` | DB 동시 요청 제한 |
| `MAX_RUN_ITERATIONS` | 아니오 | `7200` | Run 최대 반복 횟수 |
| `RUN_ITERATION_DELAY_SECONDS` | 아니오 | `1` | Run 루프 지연 시간 |

예시:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
GOOGLE_API_KEY=your-google-api-key

LOG_LEVEL=INFO
EVENT_DRIVEN_MODE=True
POLLING_FALLBACK_ENABLED=True
EVENT_QUEUE_MAX_SIZE=1000

MAX_RETRIES=3
MAX_ANALYSIS_RETRIES=3
LLM_API_TIMEOUT=300

PDF_CONVERSION_PPI=120
PDF_SPLIT_THRESHOLD_MB=45
SUPABASE_CONCURRENT_LIMIT=10
MAX_RUN_ITERATIONS=7200
RUN_ITERATION_DELAY_SECONDS=1
```

## 로컬 실행

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

기본 주소:

- API 루트: `http://localhost:8000/`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

로그는 표준 출력과 `server.log` 파일에 함께 남습니다.

## 현재 코드 기준 운영 메모

- 테스트 코드가 포함되어 있지 않습니다.
- 프로젝트 생성 API는 현재 보이지 않으므로 프로젝트 레코드는 외부에서 준비해야 합니다.
- 프로젝트 정보 추출 시 `note`까지 DB에는 저장하지만, 현재 `GET /projects/{project_id}/extracted-info` 응답 모델에는 `note` 필드가 노출되지 않습니다.
- `Dockerfile`은 현재 저장소 구조와 바로 맞지 않습니다.
  - `./app`만 복사하도록 되어 있고 `prompts_md/`, `resources/` 경로를 함께 다루지 않습니다.
  - 실제 사용은 `uvicorn app.main:app --reload` 기준이 더 안전합니다.

## 앞으로 보완하면 좋은 항목

- `.env.example` 추가
- DB schema 또는 migration 추가
- 프로젝트 생성/조회 API 보강
- 추출 결과 API에 `note` 노출
- 테스트 코드와 샘플 데이터 추가
- Dockerfile 정리
