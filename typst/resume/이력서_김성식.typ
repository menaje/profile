#import "../shared/theme.typ": palette, shared-doc

#show: doc => shared-doc(
  doc,
  body-size: 9.6pt,
  margin: (
    top: 14mm,
    bottom: 14mm,
    left: 16mm,
    right: 16mm,
  ),
)

#set par(
  justify: false,
  spacing: 0.72em,
)

#show heading.where(level: 1): it => block(above: 0pt, below: 4pt)[
  #text(size: 23pt, weight: 800, fill: palette.primary)[#it.body]
]

#show heading.where(level: 2): it => block(above: 12pt, below: 5pt)[
  #text(size: 11pt, weight: 700, fill: palette.secondary)[#it.body]
]

#show heading.where(level: 3): it => block(above: 7pt, below: 2pt)[
  #text(size: 9.8pt, weight: 700, fill: palette.ink)[#it.body]
]

#let stat-card(title, value, detail) = box(
  width: 100%,
  fill: palette.surface,
  stroke: 0.7pt + palette.line,
  radius: 8pt,
  inset: 9pt,
)[
  #text(size: 7.8pt, weight: 700, fill: palette.muted)[#title]
  #v(2pt)
  #text(size: 10.4pt, weight: 700, fill: palette.primary)[#value]
  #v(3pt)
  #text(size: 8.2pt)[#detail]
]

#text(size: 8.2pt, weight: 700, fill: palette.accent)[포지셔닝]
= 김성식
#text(size: 13pt, weight: 700, fill: palette.secondary)[AI 네이티브 시스템 아키텍트]

#box(
  width: 100%,
  fill: palette.surface,
  stroke: 0.8pt + palette.line,
  radius: 10pt,
  inset: 12pt,
)[
  #text(size: 10.4pt, weight: 600)[복잡한 현실의 문제를 데이터와 AI 시스템으로 재구성해 실제 업무 흐름을 바꾸는 개발자]
  #v(4pt)
  #text(size: 8.4pt, fill: palette.muted)[연락처: dshn21\@naver.com · GitHub menaje · LinkedIn 성식-김-12b58b224 · 업데이트 기준일 2026년 3월 20일]
]

#v(8pt)

#table(
  columns: (1fr, 1fr, 1fr),
  stroke: none,
  inset: 0pt,
  gutter: 8pt,
  stat-card("현재 역할", "AI 서비스 기획/개발", "(주)희림종합건축사사무소"),
  stat-card("총 경력", "11년차", "건설 CM 8년 10개월 + AI/개발 전환 이후 2년차"),
  stat-card("핵심 가치", "문제가 기술을 이끈다", "도메인 전문성과 AI 시스템 설계를 연결"),
)

== 한 줄 소개

- *이름*: 김성식
- *Email*: dshn21\@naver.com
- *GitHub*: github.com/menaje
- *LinkedIn*: linkedin.com/in/성식-김-12b58b224

== 핵심 정체성

- *현재 역할*: AI 서비스 기획/개발, (주)희림종합건축사사무소
- *총 경력*: 11년차 (2015년 7월 ~ 2026년 3월 20일 기준, 건설 CM 8년 10개월 + AI/개발 전환 이후 2년차)
- *핵심 가치*: 문제가 기술을 이끈다
- *차별화 포인트*: 건설 CM 도메인 전문성과 AI 시스템 설계를 연결해 현장에서 검증되는 솔루션으로 구현

== 핵심 역량

=== 1. 도메인 기반 문제 정의

건설사업관리 현장에서 9년간 축적한 경험을 바탕으로, 파편화된 데이터와 암묵지 문제를 기술 과제로 다시 정의합니다. 문제를 먼저 구조화하고 나서야 기술을 선택하는 접근이 강점입니다.

=== 2. AI 에이전트 시스템 설계

AI가 성능을 내는 조건을 데이터 구조, 컨텍스트 전달, 상태 추적, 역할 분담까지 포함해 설계합니다. 영속적 메모리, 워크플로우 관리, CLI 기반 협업 환경까지 직접 구현해 본 경험이 있습니다.

=== 3. 현장 검증형 자동화 실행

보고서 자동 생성, 문서 등록 및 요약, 협업 시스템 정착까지 연결해 실제 업무 흐름을 바꿉니다. 비IT 사용자도 사용할 수 있는 형태로 시스템을 안착시키는 실행력이 강점입니다.

== 기술 스택

#table(
  columns: (0.9fr, 2.4fr),
  stroke: 0.5pt + palette.line,
  align: (left, left),
  table.header[*분류*][*기술*],
  [AI/LLM], [Multi-Agent Orchestration, Context Engineering, RAG, Vector DB],
  [Backend/Data], [Python, TypeScript, Node.js, FastAPI, Supabase (PostgreSQL)],
  [LLM API], [Google Gemini, OpenAI GPT, Anthropic Claude],
  [Workflow/Tools], [Git, CLI 개발, Obsidian, Vision/OCR],
)

== 대표 프로젝트 요약

=== 1. CONI | 개인 프로젝트

- *기간*: 2025년 11월 ~ 진행 중 (2026년 3월 20일 기준)
- *요약*: Objective → Workplan → Commit 구조로 작업 상태를 추적하고, 여러 CLI AI 에이전트가 병렬 협업할 수 있는 환경을 설계·구현
- *성과*: 대화 세션이 끊겨도 작업이 이어지는 영속적 협업 흐름 구축
- *기술*: TypeScript, Node.js, Supabase, Git Hook, CAC

=== 2. 제안서 에이전트 | (주)희림종합건축사사무소

- *기간*: 2024년 5월 ~ 진행 중 (2026년 3월 20일 기준)
- *요약*: 20여 종의 보고서와 슬라이드를 자동 생성하는 다중 에이전트 워크플로우를 설계·개발
- *성과*: 26개 API 엔드포인트, 16개 서비스로 구성된 문서 생성 운영 체계 구현
- *기술*: Python, FastAPI, Google Gemini API, Supabase

=== 3. CM 업무관리 시스템 | (주)정림CM

- *기간*: 2023년 1월 ~ 2024년 5월
- *요약*: 대전 5개 현장의 문서와 프로젝트 데이터를 통합 관리하는 맞춤형 업무관리 체계를 기획·구축
- *성과*: OCR/LLM 기반 문서 등록·요약 자동화와 월간보고 파이프라인을 도입해 현장 핵심 협업 시스템으로 정착
- *기술*: Obsidian, Python, GPT API, Gemini 멀티모달

#pagebreak()

== 경력표

#table(
  columns: (1.35fr, 1.25fr, 1.05fr, 2.35fr),
  stroke: 0.5pt + palette.line,
  align: left,
  table.header[*기간*][*회사*][*역할*][*핵심 성과*],
  [2024년 5월 ~ 재직 중 (2026년 3월 20일 기준)], [(주)희림종합건축사사무소], [AI 서비스 기획/개발], [다중 에이전트 기반 문서 생성 체계 구축, RAG 시스템 설계 및 개발],
  [2015년 7월 ~ 2024년 5월], [(주)정림CM], [건설사업관리(CM) 전문가], [5개 현장 통합 업무관리 체계 구축, VE 자동화, 협업 시스템 도입],
)

== 학력 및 자격

=== 학력

#table(
  columns: (0.8fr, 1.7fr, 2.2fr),
  stroke: 0.5pt + palette.line,
  align: left,
  table.header[*구분*][*기간*][*내용*],
  [석사], [2011년 3월 ~ 2013년 2월], [충북대학교 건축공학과 건축구조해석],
  [학사], [2005년 3월 ~ 2011년 2월], [충북대학교 건축공학과],
)

=== 자격

#table(
  columns: (1fr, 2.7fr),
  stroke: 0.5pt + palette.line,
  align: left,
  table.header[*구분*][*내용*],
  [자격], [건축기사, VE 고급과정 이수],
)
