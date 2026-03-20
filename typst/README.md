# Typst Source Tree

`project/typst/` stores versioned Typst sources for OBJ-2.

- `shared/`: common theme module and smoke tests
- `resume/`: WP-11 entry files
- `technical-career/`: WP-12 entry files
- `personal-statement/`: WP-13 entry files
- `haean-deck/`: WP-14 entry files

Boundary rules:

- Keep Markdown source material in `project/docs/**` and `project/output/*.md`.
- Write generated PDFs to the workspace-root `output/` directory.
- Import shared settings from `../shared/theme.typ`.

Smoke check:

```bash
typst compile project/typst/shared/smoke-ko.typ output/wp-6-shared-smoke.pdf
```
