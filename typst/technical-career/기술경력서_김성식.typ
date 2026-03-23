#import "../shared/theme.typ": palette, shared-doc

#show: doc => shared-doc(
  doc,
  margin: (
    top: 15mm,
    bottom: 15mm,
    left: 15mm,
    right: 15mm,
  ),
  body-size: 9pt,
)

#set document(
  title: "김성식 기술경력서",
  author: "김성식",
)

#set page(numbering: "1")
#set par(
  justify: false,
  spacing: 0.55em,
)
#set table(
  inset: (x: 6pt, y: 4pt),
  stroke: 0.4pt + palette.line,
)

#let badge(label, fill: palette.surface, text-fill: palette.secondary) = box(
  fill: fill,
  stroke: 0.5pt + palette.line,
  radius: 999pt,
  inset: (x: 8pt, y: 3pt),
)[
  #text(size: 8pt, weight: 600, fill: text-fill)[#label]
]

#let lead(body) = box(
  fill: palette.surface,
  stroke: 0.7pt + palette.line,
  radius: 12pt,
  inset: 12pt,
)[
  #body
]

#let panel(title, body, fill: palette.surface) = box(
  fill: fill,
  stroke: 0.5pt + palette.line,
  radius: 10pt,
  inset: 10pt,
  width: 100%,
)[
  #text(size: 10.2pt, weight: 700, fill: palette.primary)[#title]
  #v(5pt)
  #body
]

#let project-title(index, name, org, kind, period) = [
  #text(size: 8pt, weight: 600, fill: palette.muted)[#index · #kind · #period]
  #v(4pt)
  #text(size: 17pt, weight: 700, fill: palette.primary)[#name]
  #v(2pt)
  #text(size: 10pt, weight: 600, fill: palette.secondary)[#org]
]

#let appendix-title(index, name, org, period) = [
  #text(size: 8pt, weight: 600, fill: palette.muted)[부록 #index · #period]
  #v(4pt)
  #text(size: 16pt, weight: 700, fill: palette.primary)[#name]
  #v(2pt)
  #text(size: 10pt, weight: 600, fill: palette.secondary)[#org]
]

#align(center)[
  #text(size: 23pt, weight: 700, fill: palette.primary)[김성식]
  #v(4pt)
  #text(size: 12.5pt, weight: 600, fill: palette.secondary)[AI 네이티브 시스템 아키텍트 · 기술경력서]
  #v(4pt)
  #text(size: 8.4pt, fill: palette.muted)[dshn21\@naver.com · GitHub menaje · LinkedIn 성식-김-12b58b224]
]

#v(8pt)

#align(center)[
  #badge([업데이트 기준일 2026-03-20])
  #h(6pt)
  #badge([기술 면접용 상세본], fill: palette.primary, text-fill: white)
]

#v(8pt)

#lead[
  이 문서는 이력서의 요약을 반복하기보다, 기술면접관이 프로젝트별
  #strong[Problem · Role · Stack · Outcome]을 빠르게 검증할 수 있도록 정리한 상세 버전이다.
  건설사업관리 8년 10개월의 현장 경험과 AI/SW 설계·개발 2년차 경험을 연결해,
  #strong[현실의 복잡한 문제를 데이터 구조와 상태 추적으로 전환하는 방식]을 보여주는 데 초점을 둔다.
]

= 프로필 요약

#table(
  columns: (22%, 78%),
  table.header(
    [#strong[항목]],
    [#strong[내용]],
  ),
  [현재 역할],
  [AI 서비스 기획/개발, (주)희림종합건축사사무소],
  [경력 요약],
  [2015년 7월 ~ 2026년 3월 20일 기준 11년차. 건설사업관리 8년 10개월, AI/SW 설계·개발 2년차],
  [핵심 포지셔닝],
  [도메인 문제를 데이터 구조, 컨텍스트 전달, 상태 추적으로 전환해 실제 업무 흐름을 바꾸는 AI 네이티브 시스템 아키텍트],
  [검증 포인트],
  [Multi-Agent Orchestration, Context Engineering, Git 연동 상태 추적, 문서 자동화, 현장형 시스템 정착],
)

== 핵심 전문성

#table(
  columns: (21%, 46%, 33%),
  table.header(
    [#strong[전문성]],
    [#strong[설명]],
    [#strong[대표 프로젝트]],
  ),
  [문제 재정의 능력],
  [현장의 비효율을 기능 요구사항이 아니라 데이터 구조와 협업 흐름의 문제로 다시 정의한다.],
  [CM 업무관리 시스템, VE 자동화],
  [AI 협업 설계],
  [여러 에이전트가 역할을 나눠 일하면서도 전체 맥락을 유지하도록 오케스트레이션과 상태관리 계층을 설계한다.],
  [CONI, 제안서 에이전트, WPM],
  [실사용 안착],
  [프로토타입에서 끝내지 않고 비IT 사용자와 실무 조직이 실제로 쓰는 형태까지 연결한다.],
  [CM 업무관리 시스템, 제안서 에이전트],
  [도구화 역량],
  [반복 가능한 문제를 CLI, 서버, 마이그레이션 도구처럼 재사용 가능한 형태로 제품화한다.],
  [WPM, mlx-serve, supamigrate],
)

#pagebreak()

#project-title(
  [01],
  [CONI],
  [개인 프로젝트],
  [개인 프로젝트],
  [2025년 11월 시작 · 2026년 3월 20일 기준 진행 중],
)

#v(8pt)

#lead[
  #strong[한 줄 요약] Objective → Workplan → Commit 구조로 AI 협업을 추적하고,
  대화 세션이 바뀌어도 작업이 이어지도록 설계한 CLI 기반 협업 시스템
]

#v(6pt)

#table(
  columns: (18%, 82%),
  table.header(
    [#strong[항목]],
    [#strong[내용]],
  ),
  [역할],
  [기획, 아키텍처 설계, 전체 개발],
  [핵심 축],
  [Objective/Workplan/Commit 계층, tmux 기반 멀티 에이전트 오케스트레이션, 프로젝트 메모리 방향 설계],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - 단일 AI 에이전트 중심 작업은 전략 수립, 실행, 검증이 한 대화창에 뒤섞여 깊이와 정확도를 동시에 확보하기 어려웠다.
    - 대화 세션이 종료되면 작업 상태와 의사결정 맥락이 사라져 다음 세션에서 같은 설명을 반복해야 했다.
    - 여러 AI CLI를 병렬로 활용하고 싶어도 역할 분리, 프롬프트 라우팅, 결과 회수가 체계화돼 있지 않았다.
    - 코드, 문서, 커밋을 연결하는 메모리 계층이 없으면 프로젝트가 스스로를 기억하기 어려웠다.
  ]

  #v(6pt)

  #panel([Role])[
    - Objective, Workplan, Commit을 하나의 작업 계층으로 묶는 협업 구조를 설계했다.
    - tmux 기반 멀티 에이전트 오케스트레이션 흐름과 역할별 프롬프트 전달 방식을 정의했다.
    - 새 세션에서도 최근 커밋과 진행 중 Workplan을 기준으로 작업을 이어갈 수 있는 상태 추적 구조를 만들었다.
    - 하네스 엔지니어링을 통해 프로젝트별 스택, 컨벤션, 도구 상태를 분석하고 에이전트 스킬에 주입하는 흐름을 설계했다.
    - 코드, 문서, 커밋을 시맨틱하게 연결하는 프로젝트 메모리 방향을 정리했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (34%, 66%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [언어/런타임],
      [TypeScript, Node.js],
      [오케스트레이션],
      [tmux, 역할 기반 CLI 에이전트 협업],
      [상태 저장],
      [Supabase (PostgreSQL), SQLite],
      [작업 추적],
      [Git 연동, Commit 기반 상태 연결],
      [확장 축],
      [임베딩 기반 메모리, 리랭커, 하네스 엔지니어링],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - #strong[대화가 끊겨도 작업이 이어지는 협업 구조]를 구현했다.
    - #strong[여러 AI CLI를 병렬로 운영하는 오케스트레이션 체계]를 정리해 전략, 실행, 검증 역할을 분리할 수 있게 했다.
    - #strong[프로젝트 메모리 방향성]을 명확히 정의해 코드, 문서, 커밋을 연결하는 장기 맥락 관리 기반을 만들었다.
    - 새 저장소에도 빠르게 협업 프로토콜을 적용할 수 있는 #strong[프로젝트 맞춤 하네스 워크플로우]를 정리했다.
  ]
]

#pagebreak()

#project-title(
  [02],
  [제안서 에이전트],
  [(주)희림종합건축사사무소],
  [회사 프로젝트 · 2인],
  [2024년 5월 시작 · 2026년 3월 20일 기준 진행 중],
)

#v(8pt)

#lead[
  #strong[한 줄 요약] 20여 종의 보고서와 슬라이드가 한 흐름 안에서 생성되도록
  다중 에이전트 오케스트레이션과 컨텍스트 전달 체계를 설계한 문서 자동화 시스템
]

#v(6pt)

#table(
  columns: (18%, 82%),
  table.header(
    [#strong[항목]],
    [#strong[내용]],
  ),
  [역할],
  [기획 및 에이전트 개발],
  [팀 구성],
  [2인],
  [핵심 축],
  [Phase → Stage → Task 계층형 작업 분할, 컨텍스트 누적 전달, 운영 안정성 설계],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - 제안서 작성은 산출물 수가 많아질수록 앞뒤 내용 불일치와 톤 분산이 자주 발생했다.
    - 여러 보고서와 슬라이드가 동시에 만들어지다 보니, 전체 스토리라인을 유지하면서 병렬 생성하는 구조가 필요했다.
    - 외부 LLM API 호출 실패, 네트워크 오류, 중간 단계 중단 같은 운영 리스크가 누적됐다.
    - 단계별 결과를 축적해 다음 단계 품질을 높이는 설계가 필요했다.
  ]

  #v(6pt)

  #panel([Role])[
    - Phase → Stage → Task로 이어지는 계층형 작업 분할 구조를 설계했다.
    - 앞 단계 결과를 다음 단계로 누적 전달하는 컨텍스트 엔지니어링 방식을 정리했다.
    - 다중 에이전트 오케스트레이션 구조를 적용해 역할별 생성과 검증을 분리했다.
    - 재시도, 복구, 헬스체크를 포함한 안정성 설계를 구현했다.
    - 26개 API 엔드포인트, 16개 서비스로 구성된 실행 체계를 운영 가능한 수준으로 고도화했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [언어],
      [Python],
      [프레임워크],
      [FastAPI],
      [LLM],
      [Google Gemini API],
      [상태 관리],
      [Supabase (PostgreSQL)],
      [아키텍처],
      [계층형 + 이벤트 기반 하이브리드],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - #strong[한 번의 실행으로 20여 종의 보고서와 슬라이드 자동 생성] 체계를 구축했다.
    - #strong[컨텍스트 누적 전달 방식]으로 문서 간 용어와 스토리 흐름의 일관성을 높였다.
    - #strong[재시도, RecoveryService, Health Check]를 포함한 운영 안정성을 확보했다.
    - 문제 해결 과정에서 정리한 방식이 이후 #strong[Context Engineering]과 #strong[Multi-Agent Orchestration]의 핵심 원리와 맞닿아 있음을 확인했다.
  ]
]

#pagebreak()

#project-title(
  [03],
  [WPM],
  [개인 프로젝트],
  [개인 프로젝트],
  [2025년 11월 시작 · 2026년 3월 20일 기준 진행 중],
)

#v(8pt)

#lead[
  #strong[한 줄 요약] Git 커밋과 작업 추적을 하나의 흐름으로 묶고,
  AI 에이전트 협업 프로토콜을 운영 가능한 CLI로 만든 프로젝트 관리 도구
]

#v(6pt)

#table(
  columns: (18%, 82%),
  table.header(
    [#strong[항목]],
    [#strong[내용]],
  ),
  [역할],
  [기획 및 개발],
  [핵심 축],
  [Objective, Workplan, Commit 연결, 세션 기반 시간 추적, Guardian 성격의 검증 로직],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - AI 에이전트는 코드를 작성해도 작업 단위, 진행 상태, 커밋 이력이 분리돼 있으면 협업의 연속성이 약했다.
    - 커밋이 실제 Workplan과 연결되지 않으면 무엇을 왜 바꿨는지 추적하기 어려웠다.
    - 작업관리 도구 오류가 Git 커밋 자체를 막아버리면 실무 흐름이 멈추는 위험이 있었다.
    - 사람과 여러 AI 에이전트가 함께 쓰는 인터페이스에는 명확한 프로토콜과 fail-safe 설계가 필요했다.
  ]

  #v(6pt)

  #panel([Role])[
    - Objective, Workplan, Commit을 연결하는 CLI 기반 작업관리 모델을 설계했다.
    - 커밋 메시지, Git Hook, DB 기록을 연결해 작업 이력을 자동 추적하는 흐름을 구현했다.
    - 로비 세션, 작업 세션, 후속 세션을 구분해 세션 기반 작업 시간 측정 구조를 만들었다.
    - 비정상 상태를 감지하고 다음 행동을 제안하는 Guardian 성격의 검증 로직을 설계했다.
    - 도구가 실패해도 Git 커밋이 완전히 막히지 않도록 exit 0 기반 fail-safe 정책을 적용했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [언어/런타임],
      [TypeScript, Node.js 18+],
      [CLI],
      [CAC],
      [상태 저장],
      [Supabase (PostgreSQL)],
      [Git 연동],
      [simple-git, Git Hook],
      [확장 계획],
      [Vector DB 기반 시스템 맥락 관리],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - #strong[Git 커밋 기반 작업 자동 추적] 체계를 구현했다.
    - #strong[AI 에이전트 협업 프로토콜]을 설계해 역할과 상태 연결 방식을 명확히 했다.
    - #strong[세션 기반 정확한 작업 시간 추적]과 #strong[워크플로우 가이던스]를 구현했다.
    - #strong[6가지 비정상 상태 자동 감지]를 포함한 검증 체계를 마련했다.
    - YAML frontmatter 기반 문서 메타데이터 검색 구조를 도입해 문서와 작업의 연결성을 높였다.
  ]
]

#pagebreak()

#project-title(
  [04],
  [CM 업무관리 시스템],
  [(주)정림CM],
  [회사 프로젝트],
  [2023년 1월 ~ 2024년 5월],
)

#v(8pt)

#lead[
  #strong[한 줄 요약] 5개 현장의 문서, 계약, 사업비 데이터를 한 흐름으로 연결하고
  문서 등록·요약·보고를 자동화한 현장형 협업 시스템
]

#v(6pt)

#table(
  columns: (18%, 82%),
  table.header(
    [#strong[항목]],
    [#strong[내용]],
  ),
  [역할],
  [기획 및 개발],
  [적용 범위],
  [대전 5개 현장 통합건설사업관리],
  [핵심 축],
  [Obsidian 기반 문서관리, OCR + LLM 파이프라인, 월간보고서 자동화, 현장 안착],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - 문서 중심의 CM 업무는 정보가 분산돼 있어 필요한 자료를 찾고 맥락을 설명하는 데 시간이 많이 들었다.
    - 5개 현장을 동시에 관리하는 상황에서 데이터 구조가 다르면 협업과 의사결정이 느려졌다.
    - 비IT 사용자가 많아 복잡한 시스템은 도입 자체가 실패할 가능성이 컸다.
    - 월간보고서 작성과 문서 등록 같은 반복 업무를 줄이지 않으면 시스템이 현장에 남기 어려웠다.
  ]

  #v(6pt)

  #panel([Role])[
    - Obsidian 기반 맞춤형 문서관리 구조를 설계하고 현장 흐름에 맞게 적용했다.
    - OCR, LLM, 문서 등록 자동화를 결합해 비정형 문서를 구조화하는 파이프라인을 만들었다.
    - 사업비, 계약, 문서 메타데이터를 연결해 현장별 상황을 빠르게 파악할 수 있게 했다.
    - 월간보고서 자동 생성 흐름을 구성해 실무자의 반복 작업을 줄였다.
    - 도구를 배포하는 데서 끝내지 않고 현장 전체 협업 방식에 실제로 안착시키는 역할까지 담당했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [플랫폼],
      [Obsidian],
      [언어],
      [Python],
      [AI],
      [OpenAI GPT API, Gemini API],
      [Vision/OCR],
      [Apple Vision, Gemini 멀티모달],
      [자동화],
      [Python 스크립트, Markdown 기반 지식 관리],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - #strong[5개 현장 통합 문서 중앙 관리] 체계를 구축했다.
    - #strong[OCR + LLM 기반 문서 자동 등록 및 요약] 흐름을 구현했다.
    - #strong[월간보고서 자동 생성 파이프라인]을 도입해 반복 업무를 줄였다.
    - 결과적으로 #strong[현장 전체의 핵심 협업 시스템으로 정착]시켜 기술 도입과 현장 안착을 동시에 검증했다.
  ]
]

#pagebreak()

= 부록 | 지원 프로젝트

#lead[
  본편의 4개 핵심 프로젝트를 보완하는 실험과 도구화 사례다.
  RAG, VE 자동화, 로컬 추론 인프라, 데이터베이스 마이그레이션이라는 네 축을 통해
  검색, 반복업무 자동화, 서빙, 데이터 이전까지 문제 해결 범위를 넓혀 왔다.
]

#v(8pt)

#appendix-title(
  [A],
  [RAG 시스템],
  [회사 사이드 프로젝트],
  [2024년 5월 ~ 2024년 12월],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - 개정이 잦은 법령·기준 문서를 키워드 검색만으로는 정확히 찾기 어려웠다.
    - 건설 관련 법령과 기준 데이터를 지속적으로 갱신하는 체계가 필요했다.
  ]

  #v(6pt)

  #panel([Role])[
    - 법령 자동 수집, 기준 문서 구조화, 벡터 검색, 질의응답 흐름을 설계·개발했다.
    - 법령 자동 수집과 의미 기반 검색을 묶어 RAG 파이프라인을 실무 도메인에 맞게 정리했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [언어],
      [Python],
      [검색],
      [Supabase Vector (pgvector)],
      [LLM],
      [OpenAI API, Gemini API],
      [데이터 수집],
      [공공데이터 API],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - 법령·기준 데이터 자동 수집과 의미 기반 검색 체계를 구축해 RAG 파이프라인 경험을 쌓았다.
    - 도메인 문서를 지속적으로 갱신하며 검색 정확도를 높이는 구조를 정리했다.
  ]
]

#pagebreak()

#appendix-title(
  [B],
  [VE 업무 자동화 시스템],
  [건설 실무 자동화],
  [2017년 ~ 2019년],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - VE 프로젝트에서 반복적으로 작성하는 평가표와 보고서에 많은 시간이 들었다.
    - 과거 아이디어의 재사용이 어려워 프로젝트마다 같은 작업이 반복됐다.
  ]

  #v(6pt)

  #panel([Role])[
    - VE 프로세스 표준화, 보고서 자동 생성, 아이디어 DB 구축 방식을 직접 설계했다.
    - 데이터 축적과 재사용 가능한 문서화 구조의 필요성을 초기부터 체감했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [도구],
      [Excel 수식, Excel 기반 데이터베이스],
      [자동화 대상],
      [평가표, 보고서, 아이디어 재사용],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - 13개 VE 프로젝트에 적용 가능한 자동화 기반을 만들며 이후 데이터 중심 설계 철학의 출발점을 만들었다.
    - 반복 업무를 표준화 가능한 구조로 바꾸는 방식이 이후 시스템 설계의 기초가 됐다.
  ]
]

#pagebreak()

#appendix-title(
  [C],
  [mlx-serve],
  [오픈소스 프로젝트],
  [Apple Silicon 로컬 추론 인프라],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - Apple Silicon 환경에서 임베딩과 리랭킹을 안정적으로 제공하는 로컬 서빙 도구가 필요했다.
    - OpenAI 호환과 Jina 호환 인터페이스를 동시에 맞추면서 운영 편의성까지 확보해야 했다.
  ]

  #v(6pt)

  #panel([Role])[
    - MLX 기반 임베딩/리랭킹 서버를 OpenAI·Jina 호환 API 형태로 제공하는 도구를 정리했다.
    - CLI, 서비스 관리, 모델 캐시, Homebrew 배포까지 포함한 사용성을 설계했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [언어],
      [Python],
      [추론],
      [MLX],
      [서버],
      [FastAPI],
      [배포],
      [Homebrew, system service integration],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - 임베딩, 리랭킹, 토큰 카운트, 서비스 관리 기능을 갖춘 로컬 추론 인프라 도구를 만들었다.
    - Apple Silicon 환경에서 운영 가능한 추론 인프라를 제품 형태로 다루는 경험을 쌓았다.
  ]
]

#pagebreak()

#appendix-title(
  [D],
  [supamigrate],
  [오픈소스 프로젝트],
  [Supabase 마이그레이션 도구],
)

#v(8pt)

#columns(2, gutter: 10pt)[
  #panel([Problem])[
    - Supabase Cloud에서 Self-hosted Supabase로 옮길 때 스키마, 데이터, 권한, Storage를 한 번에 옮기기 어려웠다.
    - FK 의존성, RLS, Grants, Functions/Triggers를 포함한 순서 제어가 필요했다.
  ]

  #v(6pt)

  #panel([Role])[
    - 마이그레이션 순서, FK 의존성 처리, 검증 로직을 포함한 이전 도구를 설계했다.
    - 스키마부터 Storage까지 포함하는 end-to-end 마이그레이션 흐름을 CLI로 정리했다.
  ]

  #colbreak()

  #panel([Stack], fill: white)[
    #table(
      columns: (32%, 68%),
      table.header(
        [#strong[구분]],
        [#strong[기술]],
      ),
      [언어],
      [TypeScript, Node.js],
      [데이터베이스],
      [PostgreSQL, Supabase],
      [대상 범위],
      [Schema, Functions/Triggers, RLS, Grants, Storage],
    )
  ]

  #v(6pt)

  #panel([Outcome])[
    - 스키마, Functions/Triggers, RLS, Grants, Storage까지 다루는 데이터 이전 도구로 DB 운영 이해도를 확장했다.
    - 마이그레이션의 순서성과 검증 로직을 함께 설계하는 경험을 축적했다.
  ]
]
