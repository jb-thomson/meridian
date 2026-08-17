#!/usr/bin/env python3
"""
Meridian — static site generator.
No backend, no server-side anything: this script reads JSON content files
and renders plain .html files into ../docs, which is what GitHub Pages
serves directly (Settings -> Pages -> Deploy from branch -> /docs).

Usage:  python3 generate.py
Re-run any time content JSON changes (including after Jenny hand-edits a
content JSON file) to regenerate the site.
"""
import html
import json
import os
import re
import shutil
from jinja2 import Environment, FileSystemLoader

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "data")
TEMPLATES_DIR = os.path.join(HERE, "templates")
SITE_DIR = os.path.abspath(os.path.join(HERE, "..", "docs"))

env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=False)


def md_filter(text):
    """Escape raw HTML in authored content, then turn light markdown
    (**bold**, *italic*) into real HTML tags. Keeps content JSON files
    easy to hand-write/hand-edit while still rendering correctly."""
    if text is None:
        return ""
    escaped = html.escape(str(text), quote=False)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", escaped)
    return escaped


env.filters["md"] = md_filter


def slug_num(num):
    return num.replace(".", "-")


def normalize_callouts(items):
    """Fun facts / AP tips can be a plain string (old format, always renders
    at the end of the reading) or a {"text": ..., "afterParagraph": N} dict
    (new format, renders inline right after narrative paragraph N, 0-indexed).
    Normalize everything to the dict shape so templates only deal with one
    representation."""
    norm = []
    for it in items or []:
        if isinstance(it, str):
            norm.append({"text": it, "afterParagraph": None})
        else:
            norm.append({"text": it.get("text", ""), "afterParagraph": it.get("afterParagraph")})
    return norm


def load_course(slug):
    with open(os.path.join(DATA_DIR, "courses", slug + ".json")) as f:
        course = json.load(f)

    flat_topics = []
    for unit in course["units"]:
        for t in unit["topics"]:
            content_path = os.path.join(DATA_DIR, "content", slug, slug_num(t["num"]) + ".json")
            if os.path.exists(content_path):
                with open(content_path) as cf:
                    content = json.load(cf)
                t.update(content)
                t["status"] = content.get("status", "complete")
                t["funFacts"] = normalize_callouts(t.get("funFacts"))
                t["apTips"] = normalize_callouts(t.get("apTips"))
                for img in t.get("images") or []:
                    img.setdefault("afterParagraph", None)
            else:
                t["status"] = "coming-soon"
            t["unitNum"] = unit["num"]
            flat_topics.append((unit, t))

    course["total_topics"] = len(flat_topics)
    course["completed_topics"] = sum(1 for _, t in flat_topics if t["status"] == "complete")
    return course, flat_topics


def write(path, content):
    full = os.path.join(SITE_DIR, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)


def main():
    if os.path.exists(SITE_DIR):
        # wipe generated HTML but leave nothing else stray around
        shutil.rmtree(SITE_DIR)
    os.makedirs(SITE_DIR, exist_ok=True)

    course_slugs = ["ap-world-history", "ap-gov", "ap-comp-gov", "ap-human-geography", "economics"]
    all_courses = []
    all_flat = {}

    for slug in course_slugs:
        course, flat_topics = load_course(slug)
        all_courses.append(course)
        all_flat[slug] = flat_topics

    # ---- landing page ----
    tpl = env.get_template("landing.html")
    write("index.html", tpl.render(
        root="",
        page_title="Home",
        courses=all_courses,
    ))

    # ---- robots.txt: keep the site out of search engines for now (every page
    # also carries a <meta name="robots" content="noindex,nofollow"> tag) ----
    write("robots.txt", "User-agent: *\nDisallow: /\n")

    # ---- course + topic pages ----
    course_tpl = env.get_template("course.html")
    topic_tpl = env.get_template("topic.html")

    for course in all_courses:
        slug = course["slug"]
        flat = all_flat[slug]

        write(f"courses/{slug}/index.html", course_tpl.render(
            root="../../",
            page_title=course["shortName"],
            course_color=course["color"],
            course=course,
        ))

        for i, (unit, topic) in enumerate(flat):
            prev_topic = flat[i - 1][1] if i > 0 else None
            next_topic = flat[i + 1][1] if i < len(flat) - 1 else None
            write(f"courses/{slug}/{slug_num(topic['num'])}.html", topic_tpl.render(
                root="../../",
                page_title=f"{topic['num']} {topic['title']}",
                course_color=course["color"],
                course=course,
                unit=unit,
                topic=topic,
                prev_topic=prev_topic,
                next_topic=next_topic,
            ))

    # ---- copy static assets (source of truth lives in build/assets_src) ----
    shutil.copytree(os.path.join(HERE, "assets_src"), os.path.join(SITE_DIR, "assets"))

    print(f"Built site to {SITE_DIR}")
    for course in all_courses:
        print(f"  {course['shortName']}: {course['completed_topics']}/{course['total_topics']} readings complete")


if __name__ == "__main__":
    main()
