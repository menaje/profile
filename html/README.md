# HTML Source Tree

`project/html/` stores the HTML/CSS layout layer for `OBJ-3`.

- `shared/`: shared tokens, base styles, print styles, font assets, and the smoke test
- `data/`: reserved for canonical JSON owned by WP-17
- `resume/`, `technical-career/`, `personal-statement/`, `haean-deck/`: document entry points owned by later workplans

Boundary rules:

- Keep source content in `project/output/*.md` and `project/docs/**`.
- Keep final PDFs in the workspace-root `output/`.
- Print documents import shared styles in the order `tokens-base.css`, `tokens-print.css`, `base.css`, `print.css`.
- The slide deck imports `tokens-base.css`, `tokens-slide.css`, `base.css`, and then `theme.css`.
- Use `shared/smoke.html` only for structure, font, and print verification.

Quick preview:

```bash
python3 -m http.server -d project/html 8080
```

Open `http://127.0.0.1:8080/shared/smoke.html`.

Batch PDF builds now live in WP-19:

```bash
cd project && npm run build:all
```

Target-specific commands are `npm run build:resume`, `npm run build:technical`, `npm run build:statement`, and `npm run build:slides`. If an upstream HTML entrypoint is still missing, the build script exits with a clear preflight error instead of silently skipping it.
