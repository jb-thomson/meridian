# Editing Meridian yourself (no AI, no backend)

This site is a set of plain HTML files. There's no database and no login system — every reading is just a `.html` file sitting in a folder, which is exactly what lets it run for free on GitHub Pages with nothing to break.

There are two ways to edit a reading, from easiest to most powerful.

## Option 1 — Quick text edits, right in your browser (no tools needed)

1. Go to your repo on github.com and navigate to the reading you want to change, e.g. `docs/courses/ap-world-history/1-1.html`.
2. Click the pencil ("Edit this file") icon.
3. Every reading page has a clearly marked box near the bottom called **"My Notes"**, wrapped in these two lines:
   ```html
   <!-- MY-NOTES-START -->
   <p>...</p>
   <!-- MY-NOTES-END -->
   ```
   Type whatever you want between those markers — corrections, extra context for your students, a note about this year's schedule. Nothing else on the page will change.
4. You can also edit any of the *narrative* paragraphs, vocabulary terms, or questions directly in that same file — they're plain text between `<p>` tags. Just don't delete the surrounding HTML tags (the `<p>...</p>` or `<li>...</li>` wrappers) or the page's layout will break.
5. Click "Commit changes." GitHub Pages republishes automatically within a minute or two — no build step required for this kind of edit.

## Option 2 — Editing the source content and regenerating the whole page

If you want your edit to be permanent and survive a future full rebuild (e.g. if a future Claude session regenerates the whole site), edit the underlying content file instead of the generated HTML:

1. Find the topic's JSON file in `build/data/content/{course-slug}/{topic-number}.json` — e.g. `build/data/content/ap-world-history/1-1.json`.
2. Edit any field: `narrative` (an array of paragraph strings), `vocabulary`, `multipleChoice`, images, etc. `**text**` becomes **bold**, `*text*` becomes *italic*.
3. From the `build/` folder, run:
   ```
   python3 generate.py
   ```
   This regenerates every HTML file in `docs/` from the JSON. Commit and push both the JSON change and the regenerated `docs/` files.

## Adding your own image

1. Drop the image file into `docs/assets/images/`.
2. In the topic's HTML file, find the `<img src="...">` tag you want to change (or add a new `<figure class="reading-figure">...</figure>` block, copying an existing one as a template) and point `src` at `../../assets/images/your-file.jpg`.
3. Update the `alt` text (a plain description of the image, for accessibility and screen readers) and the caption/attribution text in the `<figcaption>` right below it. If it's a real photograph or historical image (not AI-generated), say so and credit the source; if you generate a new AI image, keep the "AI-Generated Illustration" badge so students can tell the difference.

## Adding a Google NotebookLM link, video, or infographic to a topic

Each reading has a **"NotebookLM Extras"** box. To fill it in, either:
- paste a link or an `<iframe>` embed code directly into that box in the topic's HTML file, or
- add an entry to `notebookLmResources` in that topic's JSON file (a list of `{"title": "...", "url": "..."}` objects) and regenerate.

## Adding a whole new reading

Fastest path: open a topic in the same course that's already finished (e.g. `1-1.json` for AP World History), copy it as a template, fill in your own content for the new topic number, save it as `{course}/{topic-number}.json` in `build/data/content/` (for AP Human Geography that's `build/data/content/ap-human-geography/1-1.json`), then run `python3 generate.py` from `build/`. The site will pick it up automatically — the "Coming soon" tag on that topic in the course index disappears once its JSON file exists.
