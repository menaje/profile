# HTML Source Tree

`project/html/` stores the HTML/CSS layout layer for `OBJ-3`.

- `shared/`: shared tokens, base styles, print styles, font assets, and the smoke test
- `data/`: reserved for canonical JSON owned by WP-17
- `resume/`, `technical-career/`, `personal-statement/`, `haean-deck/`: document entry points owned by later workplans

Boundary rules:

- Keep source content in `project/output/*.md` and `project/docs/**`.
- Keep final PDFs in the workspace-root `output/`.
- Import shared styles in the order `tokens.css`, `base.css`, `print.css`.
- Use `shared/smoke.html` only for structure, font, and print verification.

Quick preview:

```bash
python3 -m http.server -d project/html 8080
```

Open `http://127.0.0.1:8080/shared/smoke.html`.

One-off PDF smoke export can be done with Puppeteer against the same URL. Full build automation is intentionally deferred beyond WP-16.
