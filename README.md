# Meridian

A static, no-backend course reading site for AP World History: Modern, AP U.S. Government and Politics, AP Comparative Government and Politics, and a semester Economics course.

## What's in here

- **`docs/`** — the actual live website. GitHub Pages is configured to serve straight from this folder, so anything in here is what visitors see. Every reading is a plain, self-contained `.html` file.
- **`build/`** — the source content (JSON, one file per topic) and the generator script that turns it into `docs/`. You only need this folder if you're adding/editing readings.
- **`guides/`** — `EDITING-GUIDE.md` (how to edit a reading yourself, no AI needed) and `course-structures.md` (where every unit/topic name came from — College Board CEDs and the CEE/NCEE + DoDEA economics standards).

## Publishing to GitHub Pages

This repo is already set up for the standard "serve from /docs" pattern:

1. In the repo's Settings → Pages, set "Build and deployment" → Source to "Deploy from a branch," branch `main`, folder `/docs`. Save.
2. Your site goes live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.
3. Any time you push a change to the `docs/` folder (whether by hand-editing a file or by re-running the generator), GitHub Pages automatically republishes — nothing else to configure.

## Current status

71 AP World History topics, 60 AP Government topics, 43 AP Comparative Government topics, and 32 Economics topics are all present in the navigation — but only a handful are fully written so far (see `guides/course-structures.md` for exactly which ones). The rest show an honest "Coming soon" page rather than fake placeholder content. Content gets filled in incrementally; re-run `python3 build/generate.py` any time new topic JSON files are added — it regenerates everything in `docs/` from scratch.

No login, no password, no backend, no database — everything (including "mark as read" progress) lives in each visitor's own browser via localStorage. You can add a password later if you want to turn this into a subscription product; that was intentionally left out of this build. The site also carries a `noindex` tag and `robots.txt` so it stays out of Google/Bing search results for now.
