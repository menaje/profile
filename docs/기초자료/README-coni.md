# CONI - CLI Agents Orchestration System

**CONI**(CLI-agent Orchestration)는 Claude와 Gemini AI 에이전트를 조율하여 체계적인 소프트웨어 개발 워크플로우를 구현하는 CLI 기반 협업 시스템입니다.

## 개요

### 해결하려는 문제

전통적인 단일 AI 에이전트 접근 방식은 다음과 같은 한계를 가지고 있습니다:

- **전략과 실행의 혼재**: 하나의 AI가 전략 수립과 코드 작성을 동시에 수행하면서 깊이 있는 사고와 정확한 실행 사이의 균형을 잃음
- **컨텍스트 유실**: 대화 세션이 종료되면 작업 상태와 진행 내역이 사라져 프로젝트 연속성이 깨짐
- **상태 관리 부재**: 여러 작업을 병렬로 진행하거나 중단했다가 재개하는 것이 어려움
- **투명성 부족**: 작업 진행 과정과 의사결정 근거를 추적하기 어려움

### CONI의 해결책

CONI는 **역할 기반 분리**와 **영속적 상태 추적**을 통해 이러한 문제를 해결합니다:

- **Claude (메인 실행자)**: 실제 코드 작성 및 파일 시스템 작업에 집중
- **Gemini (전략 자문)**: 독립적인 관점에서 전략 검토 및 대안 제시
- **Work Plan Manager (상태 관리)**: Supabase DB를 통해 모든 작업의 상태와 이력을 영속적으로 추적

이를 통해 각 에이전트는 자신의 강점을 최대한 발휘하며, 대화 세션이 변경되어도 작업 컨텍스트가 유지됩니다.

## 핵심 특징

- **역할 기반 에이전트 협업**: 각 AI 에이전트가 명확한 역할(실행, 전략, 상태 관리)을 가지고 협력하여 더 나은 결과 도출

- **영속적 작업 상태 관리**: 모든 작업은 Supabase DB에 기록되어 '대기', '진행중', '완료' 상태로 명확하게 관리됩니다. 대화 세션이 끊겨도 작업 연속성이 보장됩니다.

- **Git Hook 자동 추적**: `coni wpm init`로 Git Hook을 설치하면 모든 커밋이 자동으로 work_commits 테이블에 기록됩니다. 커밋 메시지의 #번호를 파싱하여 작업과 자동 연결합니다.

- **세션 기반 작업 시간 측정**: 로비 세션(탐색), 작업 세션(구현), 후속 세션(마무리)으로 구분하여 작업 시간을 정확히 추적합니다. Just-in-Time 세션 생성으로 사용자 개입 없이 자동 관리됩니다.

- **Guardian 기능**: `coni wpm start`, `complete` 명령어가 워크플로우 검증을 수행하고 `next_steps`로 다음 행동을 안내합니다. 문제 발생 시 경고하되 `--force`로 우회 가능합니다.

- **다국어 지원 (i18n)**: 영어와 한국어를 지원하며, OS 언어 설정에 따라 자동으로 선택됩니다. `WPM_LANG` 환경 변수로 수동 설정 가능합니다.

- **지능적 컨텍스트 복원**: 새로운 대화 세션이 시작될 때 자동으로 작업 목록을 조회하고, "작업 계속해줘"와 같은 모호한 지시도 최근 커밋 기반으로 정확히 해석하여 올바른 작업을 재개합니다.

- **문서 메타데이터 시스템**: Frontmatter를 통해 문서 타입, 태그, 관련 문서를 관리하고, `requires_update` 필드로 작업 완료 시 업데이트 필요 문서를 자동 검증합니다.

- **버전 관리 및 릴리스 자동화**: Semantic Versioning 기반 버전 제안, CHANGELOG 자동 생성, Git 태그/GitHub Release 발행까지 원스톱 릴리스 자동화 (`coni wpm auto-release`)

- **MCP(Model Context Protocol) 통합**: Supabase, Context7 등 외부 도구와의 원활한 연동

- **CONI Memory (Phase 0 - Quick Win)**: SQL 기반 파일 영향 분석으로 즉시 쓸모 있는 기능 제공
  - `coni memory check`: 인프라 환경 검증 (Supabase, pgvector, Embedding API)
  - `coni memory impact <file_path>`: 파일 수정 이력 및 관련 작업 조회
  - Vector DB 없이도 work_commit_files 테이블만으로 가치 제공

## 시스템 아키텍처

### 참여자 및 역할

#### 1. Claude (메인 실행자)
- 사용자 요구사항 접수 및 분석
- 실제 코드 작성 및 파일 시스템 작업 수행
- 다른 에이전트/도구 호출 및 조율
- 최종 결과물 생성 및 사용자 전달

#### 2. Gemini (전략 자문)
- Claude의 초기 의견 검토 및 대안 제시
- 복잡한 문제에 대한 전략적 판단 지원
- 아키텍처 및 기술 결정에 대한 협의
- 더 나은 접근 방법 제안

#### 3. Work Plan Manager (상태 관리 도구)
- TypeScript 기반 CLI 도구 (`tools/core-cli/`)
- 작업 등록, 시작, 완료 등 라이프사이클 관리
- Git Hook을 통한 자동 커밋 추적
- 세션 기반 작업 시간 측정
- 영어/한국어 i18n 지원
- Guardian 기능: 워크플로우 검증 및 안내

## 워크플로우

CONI는 로비 세션 모델을 기반으로 Git 커밋 중심의 자연스러운 워크플로우를 제공합니다:

### 1단계: 탐색 및 작업 계획 (로비 세션)

1. 요구사항 분석 및 Gemini와 협의
2. 탐색 커밋 (선택, #번호 없음) - 로비 세션에 자동 기록
3. 작업 계획서 작성 (`docs/work_plan/`)
4. `coni wpm register --title "[제목]" --file <경로>`로 작업 등록

### 2단계: 작업 시작 및 첫 커밋 (세션 전환)

1. `coni wpm start --id <uuid>`로 작업 시작
2. 브랜치 생성 (권장): `git checkout -b feature/N-name`
3. 첫 커밋: `git commit -m "#N feat: ..."`
4. **로비 세션 → 작업 세션 자동 전환** (Git Hook)

### 3단계: 구현 및 검증

1. 기능 개발 + 테스트 작성/실행
2. `git commit -m "#N feat/test/fix: ..."`로 진행사항 기록
3. 모든 테스트 통과 및 기능 확정

### 4단계: 코드 정리 및 리팩토링

1. 함수/변수명 확정, 포맷팅, 주석 정리
2. `git commit -m "#N refactor/style/chore: ..."`
3. **코드 최종 확정** (문서는 이 코드 기반으로 작성)

### 5단계: 관련 문서 업데이트

1. `requires_update` 문서 확인 및 업데이트
2. PRD, Work Plan, Future 등 문서 동기화
3. CLAUDE.md 등 프로젝트 파일 업데이트 및 커밋

### 6단계: 작업 완료

1. `coni wpm complete --id <uuid>`로 작업 완료 처리
2. 문서 검증, 세션 종료, 상태 변경

### 7단계: 후속 정리 (선택적)

1. 프로젝트 파일 정리, 버그 수정
2. `git commit -m "#N docs/fix: ..."`
3. **후속 세션 자동 생성** (Git Hook)

**핵심 원칙:**
- 모든 Git 명령어는 `git -C {Git 경로}` 형식 사용
- #번호 커밋 → Git Hook이 자동으로 추적
- 로비 → 작업 → 후속 세션 자동 전환
- 코드 확정 후 문서 작성

> 📖 **상세 가이드**: `docs/guides/workflow_detailed.md` 참조

## 설치 및 설정

### 필수 요구사항

- Claude Code CLI
- Gemini CLI (`gemini` 명령어)
- Supabase 프로젝트 및 MCP 연동
- Node.js (MCP 서버 실행용)

### 환경 변수 설정 (선택 사항)

#### 프로젝트 경로 자동 탐색

Core CLI는 자동으로 프로젝트 경로를 찾지만, 명시적으로 설정할 수도 있습니다:

```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
export PROJECT_PATH="/path/to/your/project"
# 또는
export CONI_PROJECT_PATH="/path/to/your/project"
```

**자동 탐색 우선순위**:
1. `PROJECT_PATH` 환경 변수
2. `CONI_PROJECT_PATH` 환경 변수
3. Git 저장소 루트 (`git rev-parse --show-toplevel`)
4. 현재 디렉토리

환경 변수를 설정하지 않으면 Git 저장소 루트가 자동으로 사용됩니다.

### 설정 파일 구성

#### 1. MCP 서버 설정 (`.mcp.json`)

`.mcp.json.example`을 참조하여 `.mcp.json` 파일을 생성하고 Supabase 연동 설정:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

#### 2. Gemini 설정 (`.gemini/settings.json`)

`.gemini/settings.json.example`을 참조하여 Gemini CLI 설정을 구성합니다.

#### 3. WPM 설정 (`.conirc.json`)

`.conirc.json.example`을 참조하여 `.conirc.json` 파일을 생성합니다:

```json
{
  "scan": {
    "exclude": ["node_modules", ".git", "dist", "build", "coverage"]
  },
  "github": {
    "enabled": true,
    "repository": "owner/repo",
    "release": {
      "enabled": true,
      "defaultBranch": "main"
    }
  },
  "memory": {
    "documentEmbedding": {
      "provider": "openai",
      "baseURL": "https://api.openai.com/v1",
      "model": "text-embedding-3-small",
      "dimension": 1536
    },
    "codeEmbedding": {
      "provider": "openai",
      "baseURL": "https://api.openai.com/v1",
      "model": "text-embedding-3-small",
      "dimension": 1536
    }
  }
}
```

**주의**: `.conirc.json`은 Git에 추가하지 마세요 (이미 `.gitignore`에 포함됨). 로컬 설정 파일이며 API 키 등 민감한 정보를 포함할 수 있습니다.

**마이그레이션**: 기존 `.wpmrc.json` 사용자는 `coni wpm migrate-config`로 자동 마이그레이션할 수 있습니다.

#### 4. Git Hook 설치 (필수)

WPM CLI를 설치한 후 Git Hook을 설정하여 커밋 자동 추적을 활성화합니다:

```bash
# Git 저장소 루트에서 실행
cd tools/core-cli
npm install
npm run build
npm link  # coni wpm 명령어를 전역으로 사용 가능하게 설정

# Git Hook 설치
coni wpm init
```

이제 모든 Git 커밋이 자동으로 work_commits 테이블에 기록됩니다.

### 데이터베이스 스키마

Supabase에 다음 테이블을 생성해야 합니다:

- `projects`: 프로젝트 마스터 정보
- `work_plans`: 작업 계획 및 상태 관리
- `git_identities`: Git 사용자 식별 정보
- `work_sessions`: 작업 세션 (로비/작업/후속)
- `work_commits`: Git 커밋 추적

<details>
<summary>📋 SQL 스키마 보기 (클릭하여 펼치기)</summary>

```sql
-- ENUM 타입 정의
CREATE TYPE work_plan_status AS ENUM ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled');

-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  git_path TEXT,  -- Git 루트 경로 (기본: 프로젝트 경로)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 작업 계획 테이블
CREATE TABLE work_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  sequence_number INT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT,  -- 작업 계획서 파일 경로
  status work_plan_status NOT NULL DEFAULT 'pending',
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),  -- 컨텍스트 추적용
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, sequence_number)
);

-- Git 사용자 식별 정보
CREATE TABLE git_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  canonical_email TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, author_email)
);

-- 작업 세션 (로비/작업/후속)
CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_plan_id UUID REFERENCES work_plans(id) ON DELETE CASCADE,  -- NULL for lobby sessions
  git_identity_id UUID NOT NULL REFERENCES git_identities(id) ON DELETE CASCADE,
  branch_name TEXT,  -- Git 브랜치명
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'lobby',  -- 'lobby' | 'active' | 'completed' | 'follow-up'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Git 커밋 추적
CREATE TABLE work_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_session_id UUID REFERENCES work_sessions(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  commit_hash TEXT NOT NULL UNIQUE,
  commit_message TEXT,
  commit_author TEXT,
  committed_at TIMESTAMPTZ,
  branch_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_work_plans_project_status ON work_plans(project_id, status);
CREATE INDEX idx_work_plans_last_accessed ON work_plans(last_accessed_at DESC);
CREATE INDEX idx_work_sessions_work_plan ON work_sessions(work_plan_id);
CREATE INDEX idx_work_sessions_identity ON work_sessions(git_identity_id);
CREATE INDEX idx_work_commits_session ON work_commits(work_session_id);
```

</details>

**세션 모델:**
- **로비 세션**: 탐색/토론 단계 (work_plan_id = NULL)
- **작업 세션**: 특정 작업 진행 (첫 #번호 커밋 시 전환)
- **후속 세션**: 완료 후 마무리 작업 (coni wpm complete 후 커밋 시)

상세 명세 및 명령어 사용법은 `.gemini/agents/WORK_PLAN_MANAGER.md` 참조.

## 주요 구성 요소

### 디렉토리 구조

```
/                              # 작업 영역 (Workspace) 루트
├── .claude/                   # Claude Code 설정
├── .gemini/                   # Gemini 에이전트 설정
│   ├── agents/
│   │   ├── GEMINI.md         # Gemini 에이전트 역할 정의
│   │   └── WORK_PLAN_MANAGER.md  # AI Lite 오케스트레이터 가이드
│   └── settings.json         # Gemini CLI 설정
├── .mcp.json                 # MCP 서버 연동 설정
├── CLAUDE.md                 # 전체 협업 프로세스 가이드
├── docs/                     # 문서 디렉토리
│   ├── prd/                  # 제품 요구사항 문서
│   └── work_plan/            # 작업 계획서
├── tools/
│   └── core-cli/             # Work Plan Manager Core CLI
│       ├── src/              # TypeScript 소스 코드
│       ├── dist/             # 빌드된 JavaScript
│       └── package.json
└── project/                  # (향후 사용자 프로젝트용)
```

### 에이전트 호출 방법

#### Gemini 협의

```bash
gemini '@.gemini/agents/GEMINI.md {현재 상황, 클로드의 초기 의견, 협의 요청 사항}'
```

#### Work Plan Manager (CLI 명령어)

WPM CLI를 사용하여 작업을 관리합니다:

```bash
# 현재 상태 조회
coni wpm status

# 작업 등록
coni wpm register --title "사용자 인증 구현" --file docs/work_plan/013_auth.md

# 작업 시작 (status에서 조회한 UUID 사용)
coni wpm start --id <uuid>

# 작업 완료
coni wpm complete --id <uuid>

# Git Hook 설치
coni wpm init

# 특정 커밋 조회
coni wpm show-commit <commit-hash>

# 세션 수동 정리 (예외 상황 시)
coni wpm cleanup-session --id <session-id>
```

**주요 옵션:**
- `--json`: JSON 형식으로 출력
- `--filter <status>`: 특정 상태만 조회 (pending, in_progress, completed)
- `--all`: 완료 작업 전체 표시
- `--force`: 경고 무시하고 강제 실행

**언어 설정:**
```bash
# 영어로 실행
WPM_LANG=en coni wpm status

# 한국어로 실행 (기본값, OS 설정에 따름)
WPM_LANG=ko coni wpm status
```

상세 가이드는 `.gemini/agents/WORK_PLAN_MANAGER.md` 및 `tools/core-cli/README.md` 참조.

#### CONI Memory (Phase 0)

Memory 시스템을 사용하여 파일 영향 분석 수행:

```bash
# 인프라 환경 검증
coni memory check

# 특정 파일의 수정 이력 및 관련 작업 조회
coni memory impact src/auth/jwt.ts

# 예상 출력:
# 🔍 파일 영향 분석: src/auth/jwt.ts
#
# 📊 수정 이력:
#   총 3회 수정됨
#   마지막 수정: 2주 전
#
# 📌 관련 작업:
#   #12: JWT 토큰 갱신 로직 개선 (2회 수정)
#   #08: 인증 시스템 개선 (1회 수정)
#
# 💡 Tip: 이 파일을 수정하기 전에 위 작업들을 참고하세요.
```

**사용 시나리오:**
- 기존 파일 수정 전 이력 확인으로 컨텍스트 파악
- 특정 파일이 어떤 작업들과 연관되어 있는지 추적
- 팀 협업 시 파일 변경 이력 공유

## 사용 예시

### 새 작업 시작하기

1. **대화 시작 시 컨텍스트 로딩** (자동)
   ```
   사용자: "API 서버 구현해줘"
   → Claude가 자동으로 coni wpm status 실행하여 기존 작업 확인
   ```

2. **작업 계획 수립 및 등록**
   - 사용자 요구사항 분석
   - Gemini와 협의
   - 작업 계획서 작성 (docs/work_plan/)
   - `coni wpm register --title "..." --file <경로>`로 등록

3. **작업 시작 및 구현**
   ```bash
   coni wpm start --id <uuid>
   git checkout -b feature/N-name
   # 코드 작성
   git commit -m "#N feat: ..."  # 자동으로 추적됨
   ```

4. **완료 처리**
   ```bash
   coni wpm complete --id <uuid>
   ```

### 기존 작업 계속하기

```
사용자: "작업 계속해줘"
→ Claude가 최근 커밋 기반으로 '진행중' 작업 식별
→ 해당 작업 자동 재개
```

## Automated Releases

CONI는 WPM (Work Plan Manager)을 통해 **완전 자동화된 릴리스 프로세스**를 제공합니다. Semantic Versioning 기반 버전 제안부터 Git 태그, GitHub Release 발행, CHANGELOG 생성까지 원스톱 자동화를 지원합니다.

### How it works

1. **작업 완료**: `coni wpm complete --id <uuid>`
2. **PR 생성 및 main 브랜치 병합**
3. **GitHub Actions 자동 실행**:
   - 테스트 실행 (실패 시 중단)
   - 빌드
   - 버전 영향도 분석 (WPM)
   - CHANGELOG 생성 (WPM)
   - Git 태그 생성
   - GitHub Release 발행
   - WPM DB에 릴리스 기록

### Manual release (if needed)

```bash
# 원스톱 릴리스
coni wpm auto-release

# 미리보기 (실제 실행 안 함)
coni wpm auto-release --dry-run

# CI/CD 모드 (확인 생략)
coni wpm auto-release --yes --push

# 개별 명령어
coni wpm suggest-version              # 버전 제안
coni wpm generate-changelog --unreleased  # CHANGELOG 생성
coni wpm release --version 1.6.0      # 릴리스 기록

# 릴리스 취소 (실수 시)
coni wpm undo-release --version 1.6.0
```

### Configuration

GitHub Actions 워크플로우는 `.github/workflows/release.yml`에 정의되어 있습니다. 설정 방법은 `docs/guides/ci_cd_setup.md`를 참조하세요.

**필요한 GitHub Secrets**:
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `GITHUB_TOKEN`: 자동 제공 (설정 불필요)

**워크플로우 파일**: `.github/workflows/release.yml`

상세 내용은 다음 문서를 참조하세요:
- [버전 관리 표준](docs/standards/VERSION_MANAGEMENT.md)
- [CI/CD 설정 가이드](docs/guides/ci_cd_setup.md)
- [작업 계획서 #70](docs/work_plan/069_github_actions_integration.md)

## 대화 시작 프로토콜

새로운 대화 세션 시작 시 자동으로 다음이 수행됩니다:

1. `coni wpm status` 실행하여 현재 작업 목록 조회
2. 조회된 작업 목록을 대화 컨텍스트에 캐싱
3. 세션 상태 확인 (활성 세션, 커밋 수, 브랜치)
4. 사용자 지시 분석 및 작업 매칭
   - 명시적 ID 참조 (#21, UUID) → 해당 작업 즉시 실행
   - "계속해줘" → 최근 커밋 기반으로 진행중 작업 제안
   - 키워드 매칭 → 제목 검색 후 제안
   - 신규 작업 → 중복 확인 후 계획 수립

## 작업 상태 관리

### 작업 상태 (Status)

| 영문 (DB) | 한글 (출력) | 설명 |
|-----------|------------|------|
| `pending` | 대기 | 작업 계획 수립 완료, 구현 대기 |
| `in_progress` | 진행중 | 현재 구현/테스트/문서화 진행 중 |
| `completed` | 완료 | 모든 단계 완료 |
| `on_hold` | 보류 | 일시 중단 |
| `cancelled` | 취소 | 작업 취소 |

### 세션 상태 (Session Status)

| 상태 | 설명 | work_plan_id |
|------|------|--------------|
| `lobby` | 탐색/토론 단계 | NULL |
| `active` | 작업 진행 중 | UUID |
| `completed` | 세션 종료 | UUID |
| `follow-up` | 완료 후 마무리 | UUID |

**세션 전환:**
- 로비 세션 → 작업 세션: 첫 #번호 커밋 시 자동 전환
- 작업 세션 → 후속 세션: `coni wpm complete` 후 커밋 시 자동 생성

## 설계 철학

### 역할 분리의 원칙

- **Claude**: 실행 및 파일 시스템 조작
- **Gemini**: 전략 수립 및 검토 (파일 시스템 접근 없음)
- **Work Plan Manager**: 데이터베이스 관리 전담

### 컨텍스트 추적

모든 작업은 `last_accessed_at` 타임스탬프로 추적되어, 대화 세션이 변경되어도 작업 맥락을 유지할 수 있습니다.

### Git 커밋 = 완료

Git 커밋이 작업의 공식적인 완료 시점입니다. 커밋 후에만 `/complete_work`를 호출합니다.

## 문서 참조

각 문서는 명확한 목적과 대상 독자를 가지고 있습니다:

- **`README.md` (이 문서)**: CONI 시스템의 전체 개요, 설계 철학, 설치 및 사용법을 다루는 **최상위 가이드**
  - 대상: CONI를 처음 접하는 개발자, 시스템 도입을 검토하는 사람

- **`CLAUDE.md`**: CONI 시스템을 사용하는 **인간 사용자 및 Claude 에이전트를 위한** 상세 협업 프로세스 및 작업 규칙 가이드
  - 대상: 실제 작업을 수행하는 사용자 및 Claude 에이전트
  - 내용: 4단계 워크플로우 상세 절차, 에이전트 호출 방법, Work Plan Manager 명령어 등

- **`.gemini/agents/GEMINI.md`**: Claude가 Gemini 에이전트를 호출할 때 사용하는 **프롬프트 템플릿**
  - 대상: Gemini AI 에이전트
  - 내용: Gemini의 역할 정의, 사고 가이드라인, 협업 원칙

- **`.gemini/agents/WORK_PLAN_MANAGER.md`**: Work Plan Manager AI Lite 에이전트의 **CLI 오케스트레이션 가이드**
  - 대상: Work Plan Manager AI 에이전트
  - 내용: 자연어 명령 처리, Core CLI 조합 실행, JSON 파싱, 워크플로우 구현

- **`tools/core-cli/README.md`**: Core CLI 도구의 **저수준 API 문서**
  - 대상: CLI를 직접 사용하는 개발자 및 AI 에이전트
  - 내용: 명령어 레퍼런스, JSON 출력 포맷, 환경변수, 사용 예시

## 라이선스

MIT License

## 기여

이 프로젝트는 AI 에이전트 협업 패턴을 실험하는 프로젝트입니다. 이슈 및 개선 제안을 환영합니다.
