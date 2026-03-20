#import "theme.typ": palette, shared-doc

#show: shared-doc

= 공통 Shared 설정 Smoke Test

이 문서는 WP-6에서 만든 공통 Typst 설정을 검증한다.
한글과 English가 섞인 문장, 숫자 2026-03-20, 기호 42%, 이메일 `dshn21@naver.com`, 경로 `project/typst/shared/theme.typ`가 자연스럽게 보여야 한다.

== Typography

복잡한 현실의 문제를 AI system으로 연결하는 문장을 통해 CJK Latin spacing을 점검한다.
강조는 #strong[primary color token]으로 렌더링되고, fallback font는 한글 글리프가 빠지지 않아야 한다.

== Palette

#text(fill: palette.primary)[Primary] / #text(fill: palette.secondary)[Secondary] / #text(fill: palette.accent)[Accent] / #text(fill: palette.muted)[Muted]

#box(
  fill: palette.surface,
  stroke: 0.6pt + palette.line,
  radius: 8pt,
  inset: 10pt,
)[
  공통 배경 토큰과 경계선 토큰이 동시에 보이는 샘플 박스다.
]

== Mixed Content

- AI Native System Architect
- CONI shared theme v1
- 9년의 질문에 AI로 답을 찾아가는 아키텍트
- Markdown source: `project/output/*.md`
- PDF output: `output/wp-6-shared-smoke.pdf`
