#import "@preview/touying:0.6.1": *
#import themes.metropolis: *
#import "../shared/theme.typ": palette, base-fonts, page-margin

#show: metropolis-theme.with(
  aspect-ratio: "16-9",
  header-right: [파일럿 검토안],
  footer: [해안건축사사무소 건축사업 데이터 연결],
  config-common(
    slide-level: 1,
    new-section-slide-fn: none,
  ),
  config-colors(
    primary: palette.primary,
    primary-light: palette.surface,
    secondary: palette.secondary,
    neutral-lightest: rgb("fcfbf8"),
    neutral-dark: palette.ink,
    neutral-darkest: palette.ink,
  ),
  config-page(
    margin: (
      top: page-margin.top,
      bottom: page-margin.bottom,
      x: page-margin.left,
    ),
  ),
)

#set text(
  lang: "ko",
  font: base-fonts,
  fallback: true,
  fill: palette.ink,
  size: 16pt,
  cjk-latin-spacing: auto,
)
#set par(justify: false, spacing: 0.65em)
#set heading(numbering: none)
#show strong: set text(fill: palette.primary)
#show emph: set text(fill: palette.accent)
#show raw: set text(font: base-fonts, fill: palette.accent, weight: "semibold")

#let card(title, body) = box(
  width: 100%,
  fill: rgb("ffffff"),
  stroke: 0.7pt + palette.line,
  radius: 10pt,
  inset: 12pt,
)[
  #text(size: 0.84em, weight: "semibold", fill: palette.primary)[#title]
  #v(5pt)
  #body
]

#let strip(body) = box(
  fill: palette.surface,
  stroke: 0.7pt + palette.line,
  radius: 999pt,
  inset: (x: 10pt, y: 5pt),
)[
  #text(size: 0.72em, weight: "medium", fill: palette.secondary)[#body]
]

#let subnote(body) = text(size: 0.82em, fill: palette.muted, body)

= 같은 프로젝트는 같은 흐름으로 이어져야 합니다

#card([제안의 초점], [
  부서별 업무 방식은 유지하되,
  #linebreak()
  같은 프로젝트의 정보와 판단 배경은 하나의 흐름으로 이어지게 합니다.
])

#v(10pt)

- 새 제도를 하나 더 얹자는 제안이 아닙니다.
- 넘길 때마다 다시 설명하던 운영을 이어받을 수 있는 운영으로 바꾸자는 제안입니다.
- 오늘의 논의는 전사 확대가 아니라 파일럿 검토입니다.

= 프로젝트는 하나인데 설명은 여러 번 반복됩니다

#card([지금 반복되는 일], [
  단계가 바뀔 때마다 같은 프로젝트를 다시 설명하고, 다시 정리하고, 다시 확인하게 됩니다.
])

#v(10pt)

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  card([현장 부담], [
    - 회의가 다시 시작됩니다.
    - 이미 본 쟁점을 다시 풀어 말합니다.
    - 확인과 메모가 반복됩니다.
  ]),
  card([조직 부담], [
    - 일정이 같은 지점에서 흔들립니다.
    - 협업의 리듬이 자주 끊깁니다.
    - 판단 속도가 불필요하게 늦어집니다.
  ]),
)

= 문서는 남아도 판단의 배경은 함께 넘어가지 않습니다

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  card([자료는 남습니다], [
    - 문서는 전달됩니다.
    - 변경 흔적도 일부 남습니다.
    - 결론만 보면 정리된 듯 보입니다.
  ]),
  card([그러나 흐름은 끊깁니다], [
    - 왜 이렇게 정리됐는지
    - 무엇이 아직 열려 있는지
    - 다음 단계가 어디서부터 봐야 하는지
  ]),
)

#v(8pt)

#subnote[문제의 핵심은 자료 부족이 아니라, 맥락이 함께 넘어가지 않는 구조입니다.]

= 현장에서는 같은 쟁점을 다시 설명하게 됩니다

#card([한 장면], [
  설계 검토가 끝난 뒤 다음 단계 담당자가 들어오면,
  #linebreak()
  자료는 있어도 왜 이 방향으로 정리됐는지부터 다시 묻게 됩니다.
])

#v(10pt)

- 같은 쟁점을 다시 설명합니다.
- 다시 확인하고 다시 메모합니다.
- 문제는 자료 부족이 아니라 맥락이 같이 넘어가지 않는다는 점입니다.

= 제안의 본질은 세 문장으로 정리됩니다

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  card([1. 그대로 두는 것], [
    각 부서는 기존 방식대로 일합니다.
  ]),
  card([2. 이어지게 하는 것], [
    프로젝트 데이터의 맥락은 끊기지 않게 이어집니다.
  ]),
  card([3. 시작하는 방식], [
    처음부터 크게가 아니라 파일럿으로 작게 시작합니다.
  ]),
)

#v(10pt)

#subnote[뒤의 장면들은 이 세 문장을 각각 풀어 설명하는 구조입니다.]

= 각 부서는 기존 방식대로 일합니다

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  card([바꾸지 않는 것], [
    - 설계와 CM, 입찰과 실행의 관점 차이
    - 부서별 역할과 책임
    - 현장의 기존 판단 기준
  ]),
  card([맞추는 것은 하나입니다], [
    - 넘겨받을 때 필요한 기준
    - 이전 판단의 배경
    - 미결 사항의 위치
  ]),
)

#v(8pt)

#subnote[
  모든 부서를 한 방식으로 묶으려는 접근이 아니라,
  서로 다른 업무를 같은 프로젝트 흐름 안에서 이어받게 하려는 검토안입니다.
]

= 다음 단계는 이미 쌓인 흐름 위에서 시작합니다

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  card([이전 방식], [
    - 문서를 다시 읽고
    - 빠진 배경을 다시 묻고
    - 핵심 쟁점을 다시 찾습니다
  ]),
  card([이어받는 방식], [
    - 이미 쌓인 판단 위에서 시작하고
    - 미결 사항을 바로 확인하고
    - 핵심 쟁점을 더 빨리 봅니다
  ]),
)

#v(8pt)

#subnote[전달이 아니라 이어받음이 핵심입니다.]

= 역할이 많이 이어질수록 연결의 차이가 커집니다

#card([조직 맥락], [
  #strip[`@@주요사업영역@@`] #h(6pt) #strip[`@@조직특성@@`]
  #v(8pt)
  이런 특성을 가진 조직일수록 설명 부담이 줄고,
  판단의 흐름이 이어지는 차이가 더 크게 드러납니다.
])

#v(10pt)

- 부서장이 핵심 쟁점을 더 빨리 봅니다.
- 실무자가 배경을 다시 복원하는 시간이 줄어듭니다.
- 프로젝트를 부서별 관리가 아니라 하나의 흐름으로 보게 됩니다.

#v(4pt)

#subnote[세부 확인 전 항목은 `@@슬롯@@` 형식으로 그대로 남겨 둡니다.]

= 시작은 크게가 아니라 작게입니다

#card([파일럿의 기준], [
  반복 설명이 가장 많이 생기는 전환 구간 하나를 정해,
  실제로 이어받기가 나아지는지 먼저 확인합니다.
])

#v(10pt)

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  card([범위], [
    한 구간만 먼저 봅니다.
  ]),
  card([목표], [
    실제로 나아졌는지 확인합니다.
  ]),
  card([판단], [
    효과가 보이면 그다음 확장을 논의합니다.
  ]),
)

= 첫 파일럿은 전환 구간 하나면 충분합니다

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  card([기본안], [
    #text(weight: "semibold", fill: palette.primary)[설계 → CM]
    #linebreak()
    가장 먼저 검토할 기본 축입니다.
  ]),
  card([조정 가능 구간], [
    실제로 더 시급한 지점이 있다면
    #linebreak()
    #strip[`@@인수인계구간@@`]
    #linebreak()
    으로 바꿔 한 구간만 먼저 검토합니다.
  ]),
)

#v(10pt)

- 참여 부서 몇 곳과 확인 기준 몇 가지면 시작할 수 있습니다.
- 많이 만드는 것이 목표가 아니라, 이어받기가 실제로 나아지는지 보는 것이 목표입니다.

= 효과는 체감되는 변화로 판단합니다

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  card([반복 설명], [
    같은 내용을 다시 풀어 말하는 일이 줄어드는가
  ]),
  card([쟁점 파악], [
    핵심 쟁점이 더 빨리 보이는가
  ]),
  card([미결 사항], [
    남아 있는 판단거리가 더 또렷해지는가
  ]),
  card([배경 복원], [
    다음 단계 담당자가 배경을 다시 복원하는 시간이 줄어드는가
  ]),
)

#v(8pt)

#subnote[수치를 과하게 약속하기보다, 현장에서 이어받기가 실제로 나아졌는지를 확인합니다.]

= 오늘 회의에서 정하면 되는 것은 세 가지입니다

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  card([우선 대상 구간], [
    어느 전환 구간을 먼저 볼지
  ]),
  card([참여 부서], [
    누가 함께 검토할지
  ]),
  card([확인할 기준], [
    무엇이 나아지면 의미가 있다고 볼지
  ]),
)

#v(10pt)

#card([마무리], [
  부서별 업무 방식은 유지하고,
  #linebreak()
  같은 프로젝트는 같은 흐름으로 이어지게 하자는 제안입니다.
])

#v(6pt)

#subnote[이 세 가지가 정해지면 파일럿 착수 여부를 바로 논의할 수 있습니다.]
