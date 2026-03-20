#let palette = (
  ink: rgb("1f2933"),
  primary: rgb("0f4c81"),
  secondary: rgb("1d7874"),
  accent: rgb("c66b3d"),
  muted: rgb("667085"),
  surface: rgb("f4f1ea"),
  line: rgb("d6d0c4"),
)

#let base-fonts = (
  "Pretendard",
  "Noto Sans CJK KR",
)

#let code-fonts = (
  "DejaVu Sans Mono",
  "Noto Sans CJK KR",
)

#let page-margin = (
  top: 18mm,
  bottom: 18mm,
  left: 18mm,
  right: 18mm,
)

#let shared-doc(doc) = {
  set page(
    paper: "a4",
    margin: page-margin,
  )
  set text(
    lang: "ko",
    font: base-fonts,
    fallback: true,
    size: 10.5pt,
    fill: palette.ink,
    cjk-latin-spacing: auto,
    hyphenate: auto,
  )
  set par(
    justify: true,
    spacing: 0.9em,
  )
  set heading(numbering: none)

  show heading.where(level: 1): set text(
    size: 17pt,
    weight: 700,
    fill: palette.primary,
  )
  show heading.where(level: 2): set text(
    size: 12pt,
    weight: 600,
    fill: palette.secondary,
  )
  show strong: set text(fill: palette.primary)
  show raw: set text(
    font: code-fonts,
    size: 9pt,
    fill: palette.secondary,
  )

  doc
}
