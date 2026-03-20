# CONI

AI 에이전트를 조율하고, 작업 맥락을 기억하는 CLI 도구.

Objective → Workplan → Commit 계층으로 소프트웨어 개발을 추적하면서, 여러 AI 에이전트를 병렬로 실행하고, 임베딩 기반 메모리로 프로젝트의 과거와 현재를 연결합니다.

## 왜 CONI인가

**대화가 끊겨도 맥락이 남는다.**
AI 에이전트와의 대화 세션은 휘발성입니다. CONI는 모든 작업을 Objective → Workplan → Commit 구조로 DB에 기록합니다. 새 세션을 열어도 "작업 계속해줘" 한마디면 마지막 커밋 기반으로 정확히 이어갑니다.

**어떤 AI든 붙여서 함께 돌린다.**
Claude, Gemini, Codex — 또는 앞으로 나올 어떤 CLI 에이전트든. tmux 위에서 여러 에이전트를 동시에 띄우고, 프롬프트를 라우팅하고, 응답을 수집합니다. 특정 AI에 종속되지 않습니다.

**프로젝트가 스스로를 기억한다.**
임베딩과 리랭커를 통해 코드, 문서, 커밋을 시맨틱하게 연결합니다. "이 파일 수정하면 뭐가 깨질까?", "6개월 전 왜 이렇게 짰지?" 같은 질문에 즉시 답합니다.

**어떤 프로젝트에든 적용된다.**
하네스 엔지니어링이 프로젝트의 기술 스택, 코딩 컨벤션, 도구 환경을 자동 분석하여 CONI의 스킬을 프로젝트에 맞게 조정합니다. React 프론트엔드든, Go 백엔드든, 데이터 파이프라인이든.

## Quick Start

```bash
# 설치
cd coni-project
npm install && npm run build && npm link

# 프로젝트 초기화 (대상 프로젝트 디렉토리에서)
coni init

# 프로젝트에 맞게 CONI 세팅 (하네스 엔지니어링)
coni orch start --preset harness

# 첫 Objective 시작
coni obj start "사용자 인증 시스템 구현"

# 작업 상태 확인
coni status
```

## 핵심 기능

### 1. 멀티 에이전트 오케스트레이션

tmux 세션에서 여러 AI 에이전트를 동시에 실행하고 관리합니다.

```bash
# Objective를 Workplan으로 분해 (architect + critic 협업)
coni orch start --preset breakdown -id OBJ-1

# 여러 에이전트가 Workplan을 병렬 실행
coni orch start --preset execute -id OBJ-1

# 특정 에이전트에 프롬프트 전송
coni orch send --to worker-1 "API 엔드포인트 구현해줘"

# 전체 에이전트에 브로드캐스트
coni orch send --all "테스트 먼저 작성하고 구현해"

# 완료된 작업 검증 (멀티 critic)
coni orch start --preset verify -id OBJ-1
```

에이전트별 역할(architect, critic, worker 등)을 지정하고, 각 에이전트는 자신에게 할당된 Workplan만 수행합니다. 의존성 기반으로 순차/병렬 실행 순서를 자동 계산합니다.

빠른 일회성 질의는 오케스트레이션 없이도 가능합니다:
```bash
coni sub-agent "이 코드 분석해줘" -a gemini
coni claude "리팩토링 제안해줘"
```

### 2. 작업 추적 파이프라인

모든 개발 작업은 5단계 파이프라인으로 관리됩니다:

```
idle → breakdown → execute → verify → complete
```

```bash
# 새 목표 시작 (브랜치 + GitHub Issue 자동 생성)
coni obj start "검색 기능 개선"

# Workplan 등록 및 실행
coni wpm register --title "검색 인덱스 최적화"
coni wpm start -id <uuid>

# 커밋하면 자동으로 DB에 기록 + Workplan과 연결
coni commit -m "#12 feat: 검색 인덱스 재구성" -id WP-12

# 작업 완료
coni wpm complete -id <uuid>

# Objective 완료 (Lessons Learned + PR 자동 생성)
coni obj complete OBJ-1
```

`coni status --json`이 현재 phase를 감지하고 `next_steps`로 다음 행동을 안내합니다. 새 대화 세션에서도 진행 중인 작업을 즉시 파악할 수 있습니다.

### 3. 프로젝트 메모리

임베딩(OpenAI, Ollama, Azure)으로 코드/문서/커밋을 벡터화하고, 리랭커(Ollama, MLX)로 검색 품질을 높입니다. 키워드 검색과 벡터 검색을 결합한 하이브리드 검색으로 정확도와 의미적 유사성을 동시에 잡습니다.

**시맨틱 검색** — 코드, 문서, 커밋을 한번에 검색:
```bash
coni memory search "인증 토큰 갱신 로직" --type code
coni memory search "성능 개선" --type commit
```

**영향 분석** — 파일을 수정하기 전에 맥락 파악:
```bash
# 이 파일이 왜 이렇게 짜여졌는지 (관련 Workplan/커밋 이력)
coni memory impact src/auth/jwt.ts

# 이 파일을 고치면 뭐가 영향받는지 (역방향 의존성 + co-change 패턴)
coni memory affected src/auth/jwt.ts
```

**코드 그래프** — 엔티티 간 관계 탐색:
```bash
# 이 파일의 의존성 트리
coni memory graph --entity file:src/auth/jwt.ts --deps

# 이 파일을 임포트하는 코드들
coni memory graph --entity file:src/auth/jwt.ts --dependents

# 유사한 코드 패턴 찾기
coni memory graph --entity file:src/auth/jwt.ts --similar
```

**데이터 구축** — 기존 프로젝트의 이력을 한번에 처리:
```bash
coni memory backfill --all --with-deps    # 전체 코드/커밋/문서 임베딩
coni memory backfill --codebase --dry-run # 비용 미리 확인
```

### 4. 하네스 엔지니어링

CONI를 처음 접하는 프로젝트에 `coni orch start --preset harness`를 실행하면, AI 에이전트 팀이 7단계에 걸쳐 프로젝트를 분석합니다:

1. **스택 분석** — 프레임워크, 언어, 빌드 도구 식별
2. **도메인 리서치** — 기술 스택의 베스트 프랙티스, 알려진 이슈, 버전별 주의사항 조사
3. **컨벤션 분석** — 프로젝트의 실제 코딩 스타일, 네이밍, 테스트 패턴 파악
4. **도구 인벤토리** — 사용 가능한 도구 목록화 및 누락 도구 식별
5. **작업 가이드** — 이 프로젝트에 맞는 작업 유형별 검증 규칙 정의
6. **도구 설치 제안** — 누락 도구 설치를 사용자 승인 하에 제안
7. **스킬 적용** — 분석 결과를 CONI의 architect, plan, workplan-execute 스킬에 주입

결과물은 `.coni/harness/refs/`에 저장되며, 이후 모든 Workplan 실행 시 프로젝트 맞춤 컨텍스트로 활용됩니다. 프로젝트가 변하면 다시 실행하여 갱신할 수 있습니다.

### 5. 데이터베이스 이중화

SQLite(로컬)와 Supabase(원격) 두 백엔드를 지원합니다. 설정 없이 바로 시작하면 SQLite, 팀 공유가 필요하면 Supabase로 전환합니다.

```bash
coni db:init                      # DB 초기화 (마이그레이션 적용)
coni db:status                    # 마이그레이션 상태 확인
coni db:export --backend sqlite   # 데이터 내보내기
coni db:import --backend supabase # 다른 백엔드로 가져오기
```

### 6. Web UI 대시보드

```bash
coni ui
```

React 기반 웹 인터페이스에서 Objective/Workplan 상태, 오케스트레이션 현황, 설정을 시각적으로 관리합니다.

## 설치 및 설정

### 필수 요구사항

- Node.js 20+
- Git
- tmux (오케스트레이션 사용 시)
- 하나 이상의 AI CLI (Claude Code, Gemini CLI, Codex CLI 등)

### 설정 파일

| 파일 | 용도 | Git 추적 |
|------|------|----------|
| `.coni/config.json` | 오케스트레이션, 에이전트, 프리셋 설정 | O |
| `.conirc.json` | 로컬/민감 설정 (API 키, DB 연결) | X |
| `.mcp.json` | MCP 서버 연동 | X |

```bash
coni config list                # 모든 설정을 출처와 함께 조회
coni config set <key> <value>   # 설정 변경
coni config edit                # $EDITOR로 편집
```

### 언어 설정

영어/한국어를 지원하며 OS 설정에 따라 자동 선택됩니다.
```bash
WPM_LANG=en coni status   # 영어로 실행
WPM_LANG=ko coni status   # 한국어로 실행
```

## CLI 명령어 레퍼런스

<details>
<summary>전체 명령어 목록 (클릭하여 펼치기)</summary>

### Top-Level

| 명령어 | 설명 |
|--------|------|
| `coni status [--json]` | 현재 Objective/Workplan 상태 조회 |
| `coni init` | 워크스페이스 초기화 |
| `coni check` | 설정 상태 확인 |
| `coni add .` | Git add (작업영역 기준 경로 변환) |
| `coni commit -m "msg" [-id WP-xxx]` | Git commit + DB 기록 |
| `coni merge` | PR 병합 |
| `coni reconcile` | DB-Git 드리프트 감지 |
| `coni ui` | Web UI 실행 |

### Objective (`coni obj`)

| 명령어 | 설명 |
|--------|------|
| `obj start "제목"` | 새 Objective 생성 + 시작 |
| `obj start OBJ-123` | 기존 Objective 시작 |
| `obj list` | 목록 조회 |
| `obj show OBJ-123` | 상세 정보 |
| `obj complete OBJ-123` | 완료 (Lessons Learned + PR) |
| `obj drop OBJ-123` | 중단 |
| `obj recover OBJ-123` | 복구 |
| `obj pr-ensure` | PR 생성/갱신 |
| `obj verify-resolve` | 검증 결과 반영 |
| `obj verify-followup` | 실패 항목 기반 micro Workplan 생성 |

### Workplan (`coni wpm`)

| 명령어 | 설명 |
|--------|------|
| `wpm status` | 작업 상태 조회 |
| `wpm register --title "..."` | 작업 등록 |
| `wpm register-batch --file plans.json` | 일괄 등록 |
| `wpm start -id <uuid>` | 작업 시작 |
| `wpm complete -id <uuid>` | 작업 완료 |
| `wpm pause / resume / cancel` | 상태 변경 |
| `wpm move -id <uuid> --to OBJ-xxx` | Objective 간 이동 |
| `wpm context -id <uuid>` | LLM용 컨텍스트 출력 |
| `wpm show-commit <hash>` | 커밋 상세 조회 |
| `wpm export` | 데이터 내보내기 |

### 오케스트레이션 (`coni orch`)

| 명령어 | 설명 |
|--------|------|
| `orch start --preset <name>` | 프리셋으로 세션 시작 |
| `orch start --agent claude:role` | 에이전트 직접 지정 |
| `orch send --to <role> "prompt"` | 특정 에이전트에 전송 |
| `orch send --all "prompt"` | 전체 브로드캐스트 |
| `orch reply "response"` | 오케스트레이터에 응답 |
| `orch status` | 에이전트 상태 조회 |
| `orch stop` | 세션 종료 |

### 실행 계획 (`coni execute`)

| 명령어 | 설명 |
|--------|------|
| `execute plan` | 의존성 기반 실행 순서 생성 |
| `execute next` | 다음 실행 가능한 라운드 조회 |

### Memory (`coni memory`)

| 명령어 | 설명 |
|--------|------|
| `memory search <query>` | 시맨틱 검색 (코드/문서/커밋) |
| `memory impact <path>` | 파일 관련 작업 이력 |
| `memory affected <path>` | 파일 변경 시 영향 범위 |
| `memory graph` | 엔티티 관계 탐색 |
| `memory history <path>` | 파일 버전 이력 |
| `memory diff <path>` | 버전 비교 |
| `memory stats` | 시스템 통계 |
| `memory backfill` | 대규모 데이터 처리 |
| `memory ingest` | 증분 데이터 처리 |
| `memory relations` | Workplan 간 관계 조회 |
| `memory check` | 인프라 검증 |

### Sub-Agent

| 명령어 | 설명 |
|--------|------|
| `coni claude [args]` | Claude CLI 래퍼 |
| `coni gemini [args]` | Gemini CLI 래퍼 |
| `coni codex [args]` | Codex CLI 래퍼 |
| `coni sub-agent [prompt] -a <agent>` | 범용 에이전트 호출 |

### 데이터베이스

| 명령어 | 설명 |
|--------|------|
| `db:init` | 마이그레이션 전체 적용 |
| `db:status` | 상태 확인 |
| `db:migrate` | 미적용 마이그레이션 실행 |
| `db:export / db:import` | 백엔드 간 데이터 이동 |

</details>

## 라이선스

MIT License
