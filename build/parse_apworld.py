#!/usr/bin/env python3
"""
One-time conversion tool: parses Jenny's Replit "AP World Reading" HTML export
(one self-contained HTML file per topic, with images embedded as base64 data
URIs) into Meridian's content JSON schema, and extracts the images to files.

This is NOT part of the regular build pipeline (generate.py) -- it's run once
to populate build/data/content/ap-world-history/*.json from the source
export, preserving Jenny's exact wording. Re-run it any time she pushes an
updated export from Replit.

Usage: python3 parse_apworld.py <path to "AP World readings" folder>
"""
import base64
import hashlib
import json
import os
import re
import sys

from bs4 import BeautifulSoup, NavigableString, Tag

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(HERE, "data", "content", "ap-world-history")
IMAGES_DIR = os.path.join(HERE, "assets_src", "images", "ap-world-history")

LO_VERBS = [
    "Explain", "Describe", "Compare", "Analyze", "Evaluate", "Identify",
    "Discuss", "Assess", "Contextualize", "Define", "Summarize", "Interpret",
]
LO_SPLIT_RE = re.compile(r"(?<=[a-z0-9\)\"’])\s+(?=(?:%s)\b)" % "|".join(LO_VERBS))

ATTRIBUTION_KEYWORDS = re.compile(
    r"(AI-generated|Google Gemini|Public domain|Wikimedia Commons|CC BY|"
    r"commercially licensed|Photo:)",
    re.IGNORECASE,
)


def split_caption_attribution(text):
    """Captions end with 1-2 trailing sentences that are really an image
    credit/license line (e.g. '... AI-generated illustration (Google Gemini,
    2025), commercially licensed.' or '... Photo: Frank Hurley. Public
    domain, Wikimedia Commons.'). Peel those off into a separate attribution
    string so the caption itself is just the descriptive text."""
    sentences = re.split(r"(?<=\.)\s+", text.strip())
    attribution_sentences = []
    while sentences and ATTRIBUTION_KEYWORDS.search(sentences[-1]):
        attribution_sentences.insert(0, sentences.pop())
    caption = " ".join(sentences).strip()
    attribution = " ".join(attribution_sentences).strip()
    is_ai = bool(re.search(r"AI-generated|Google Gemini", attribution, re.IGNORECASE))
    return caption, attribution, is_ai


def inline_to_md(node):
    """Convert a BeautifulSoup node's inline content (b/strong/em/i/br) to our
    light markdown (**bold**, *italic*), collapsing whitespace."""
    out = []
    for child in node.children:
        if isinstance(child, NavigableString):
            out.append(str(child))
        elif isinstance(child, Tag):
            if child.name in ("b", "strong"):
                out.append("**" + inline_to_md(child) + "**")
            elif child.name in ("em", "i"):
                out.append("*" + inline_to_md(child) + "*")
            elif child.name == "br":
                out.append(" ")
            else:
                out.append(inline_to_md(child))
    text = "".join(out)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*", " ", text)
    return text.strip()


def block_to_md(tag):
    """Convert a block element (may contain multiple <p>) to markdown,
    joining paragraphs with a blank line."""
    if tag is None:
        return ""
    paras = tag.find_all("p", recursive=False)
    if paras:
        return "\n\n".join(inline_to_md(p) for p in paras)
    return inline_to_md(tag)


def parse_themes(soup):
    themes = []
    bar = soup.select_one(".theme-bar")
    if not bar:
        return themes
    for chip in bar.select(".theme-chip"):
        text = chip.get_text(" ", strip=True)
        parts = text.split(" ", 1)
        icon = parts[0] if parts else ""
        label = parts[1] if len(parts) > 1 else text
        tooltip = chip.get("title", "").strip()
        themes.append({"icon": icon, "label": label, "tooltip": tooltip})
    return themes


def parse_learning_objectives(soup):
    box = soup.select_one(".lo-box")
    if not box:
        return []
    text = box.get_text(" ", strip=True)
    text = re.sub(r"^Learning Objective\s*", "", text)
    parts = [p.strip() for p in LO_SPLIT_RE.split(text) if p.strip()]
    return parts


def parse_vocabulary(soup):
    vocab = []
    section = soup.select_one(".vocab-section")
    if not section:
        return vocab
    for item in section.select(".vocab-item"):
        term = item.find("summary")
        term_text = term.get_text(" ", strip=True) if term else ""
        body = item.select_one(".vocab-body")
        definition, importance = "", ""
        if body:
            html_str = str(body)
            m = re.search(r"<b>Significance:</b>", html_str)
            if m:
                def_html = html_str[:m.start()]
                sig_html = html_str[m.end():]
                definition = BeautifulSoup(def_html, "html.parser").get_text(" ", strip=True)
                definition = re.sub(r"^.*?Definition:\s*", "", definition)
                importance = BeautifulSoup(sig_html, "html.parser").get_text(" ", strip=True)
                importance = re.sub(r"</?div>", "", importance).strip()
            else:
                definition = body.get_text(" ", strip=True)
                definition = re.sub(r"^.*?Definition:\s*", "", definition)
        vocab.append({"term": term_text, "definition": definition, "importance": importance})
    return vocab


def parse_tldr(soup):
    tldr = []
    panel = soup.select_one("#tub-panel-tldr")
    if not panel:
        return tldr
    for li in panel.select(".tldr-list > li"):
        text = inline_to_md(li)
        text = re.sub(r"\s*This topic connects to the [^.]*\.\s*$", "", text)
        tldr.append(text.strip())
    return tldr


def parse_pretest(soup):
    out = []
    panel = soup.select_one("#tub-panel-pretest")
    if not panel:
        return out
    for q in panel.select(".pretest-q"):
        summary = q.find("summary")
        question = inline_to_md(summary) if summary else ""
        question = re.sub(r"^\d+\.\s*", "", question)
        answer_div = q.select_one(".pretest-answer")
        answer = inline_to_md(answer_div) if answer_div else ""
        out.append({"question": question, "answer": answer})
    return out


def save_image(img_tag, topic_num, index, images_dir):
    src = img_tag.get("src", "")
    m = re.match(r"data:image/([a-zA-Z]+);base64,(.+)", src, re.DOTALL)
    if not m:
        return None
    ext = m.group(1).lower()
    if ext == "jpeg":
        ext = "jpg"
    data = base64.b64decode(m.group(2))
    fname = f"{topic_num.replace('.', '-')}-{index}.{ext}"
    os.makedirs(images_dir, exist_ok=True)
    with open(os.path.join(images_dir, fname), "wb") as f:
        f.write(data)
    return fname


def caption_own_text(tag):
    """Like inline_to_md, but stops at any nested .img-caption element
    instead of recursing into it. A couple of the source files have an
    unclosed <div class="img-caption"> that swallows the *next* image's
    caption div as a child -- without this guard that text would bleed
    into the wrong image's caption."""
    out = []
    for child in tag.children:
        if isinstance(child, NavigableString):
            out.append(str(child))
        elif isinstance(child, Tag):
            if child.name == "div" and "img-caption" in (child.get("class") or []):
                continue
            if child.name in ("b", "strong"):
                out.append("**" + caption_own_text(child) + "**")
            elif child.name in ("em", "i"):
                out.append("*" + caption_own_text(child) + "*")
            elif child.name == "br":
                out.append(" ")
            else:
                out.append(caption_own_text(child))
    text = "".join(out)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*", " ", text)
    return text.strip()


def make_image_block(img_tag, cap_tag, topic_num, img_index):
    caption_full = caption_own_text(cap_tag) if cap_tag else ""
    caption, attribution, is_ai = split_caption_attribution(caption_full)
    fname = save_image(img_tag, topic_num, img_index, IMAGES_DIR)
    return {
        "type": "image",
        "imageType": "ai_generated" if is_ai else "public_domain_historical",
        "src": f"assets/images/ap-world-history/{fname}" if fname else None,
        "alt": img_tag.get("alt", ""),
        "caption": caption or caption_full,
        "attribution": attribution or "Image credit not specified.",
    }


def parse_blocks(soup, topic_num):
    """Walk the direct children of div.page in document order and turn them
    into an ordered list of typed content blocks: heading, paragraph, list,
    funFact, apTip, image. Stops when it reaches the video-resources / MCQ /
    SAQ / LEQ / discussion sections (handled separately by dedicated
    parsers). Images show up in the source either as a standalone
    <img class="reading-img"> immediately followed by a sibling
    <div class="img-caption">, or wrapped together in a
    <div class="img-float-right|left">."""
    page = soup.select_one("div.page")
    blocks = []
    img_index = 0
    stop_classes = {
        "top-utility-bar", "unit-label", "theme-bar", "lo-box",
        "vocab-section",
    }
    children = [c for c in page.children if isinstance(c, Tag)]
    i = 0
    while i < len(children):
        child = children[i]
        classes = set(child.get("class") or [])
        i += 1
        if child.name == "div" and "tub-panel" in classes:
            continue
        if child.name == "h1":
            continue
        if classes & stop_classes:
            continue
        if child.name in ("details", "script"):
            # yt-callout / mcq-section / saq-section / leq-section /
            # discussion-section -- these are handled by dedicated parsers.
            break
        if child.name == "p" and "font-family: Arial" in (child.get("style") or ""):
            # trailing footer copyright line
            break

        if child.name == "h2":
            blocks.append({"type": "heading", "text": inline_to_md(child)})
        elif child.name == "p":
            txt = inline_to_md(child)
            if txt:
                blocks.append({"type": "paragraph", "text": txt})
        elif child.name == "ul":
            items = [inline_to_md(li) for li in child.find_all("li", recursive=False)]
            items = [it for it in items if it]
            if items:
                blocks.append({"type": "list", "items": items})
        elif child.name == "div" and "callout" in classes:
            kind = "apTip" if "ap-tip" in classes else "funFact" if "fun-fact" in classes else None
            if kind:
                header = child.select_one(".callout-header")
                body_text = inline_to_md(child)
                if header:
                    header_text = inline_to_md(header)
                    body_text = body_text[len(header_text):].strip()
                blocks.append({"type": kind, "text": body_text})
        elif child.name == "div" and ("img-float-right" in classes or "img-float-left" in classes):
            # usually one image + one caption, but occasionally a small
            # second image (e.g. a real photo inset next to an AI
            # illustration) is nested inside the same wrapper -- pair up
            # every image found in this subtree with the caption at the
            # same position, in document order.
            imgs = child.find_all("img", class_="reading-img")
            caps = child.find_all("div", class_="img-caption")
            for j, img_tag in enumerate(imgs):
                cap_tag = caps[j] if j < len(caps) else None
                blocks.append(make_image_block(img_tag, cap_tag, topic_num, img_index))
                img_index += 1
        elif child.name == "img" and "reading-img" in classes:
            # bare top-level image; caption is usually the next sibling div
            cap_tag = None
            if i < len(children) and children[i].name == "div" and "img-caption" in (children[i].get("class") or []):
                cap_tag = children[i]
                i += 1
            blocks.append(make_image_block(child, cap_tag, topic_num, img_index))
            img_index += 1
        elif child.name == "div" and "img-caption" in classes:
            # a caption div not consumed by the img-handling branch above
            # (shouldn't normally happen, but skip rather than treat as text)
            continue
        # anything else at the top level (blank text nodes, stray divs) is skipped
    return blocks


def parse_video_resources(soup):
    out = []
    for card in soup.select(".yt-card"):
        title = card.select_one(".yt-card-title")
        meta = card.select_one(".yt-card-meta")
        out.append({
            "title": title.get_text(strip=True) if title else "",
            "url": card.get("href", ""),
            "creator": meta.get_text(strip=True) if meta else "",
        })
    return out


def parse_mcq(soup):
    out = []
    section = soup.select_one(".mcq-section")
    if not section:
        return out
    for q in section.select(".mcq-q"):
        stim = q.select_one(".mcq-stimulus")
        stem = q.select_one(".mcq-stem")
        choices_ul = q.select_one(".mcq-choices")
        options = []
        if choices_ul:
            for li in choices_ul.find_all("li", recursive=False):
                text = inline_to_md(li)
                text = re.sub(r"^\([A-D]\)\s*", "", text)
                options.append(text)
        answer_div = q.select_one(".mcq-answer")
        correct_index = None
        explanation = ""
        if answer_div:
            explanation = inline_to_md(answer_div)
            # two source formats: "**Answer: A.** explanation..." or the
            # shorter "**A** — explanation..."
            m = re.match(r"\*{0,2}(?:Answer:\s*)?([A-D])\.?\*{0,2}\s*[—-]?\s*", explanation)
            if m:
                correct_index = "ABCD".index(m.group(1))
                explanation = explanation[m.end():].strip()
        stem_text = inline_to_md(stem) if stem else ""
        stem_text = re.sub(r"^\d+\.\s*", "", stem_text)
        out.append({
            "stimulus": inline_to_md(stim) if stim else None,
            "question": stem_text,
            "options": options,
            "correctIndex": correct_index,
            "explanation": explanation,
        })
    return out


def strip_leading_label(tag):
    """Return a tag's text with a leading <strong>Some Label:</strong> (and
    any following <br>) stripped off, e.g. '<strong>Sample Answer:</strong><br>
    text...' -> 'text...'. Used for the simpler SAQ/LEQ variant (units 7-9)
    where the whole reveal is one <div class="sample-answer"> instead of a
    structured breakdown."""
    if tag is None:
        return ""
    copy = BeautifulSoup(str(tag), "lxml")
    strong = copy.find("strong")
    if strong:
        strong.decompose()
    return inline_to_md(copy.body or copy).strip()


def parse_saq(soup):
    section = soup.select_one(".saq-section")
    if not section:
        return None
    parts = []
    for part in section.select(".saq-part"):
        label = part.select_one(".saq-part-label")
        task = part.select_one(".saq-task")
        answer = part.select_one(".saq-answer")
        parts.append({
            "label": label.get_text(strip=True) if label else "",
            "task": inline_to_md(task) if task else "",
            "sampleAnswer": block_to_md(answer) if answer else "",
        })
    if parts:
        context = section.select_one(".saq-context")
        directions = section.select_one(".saq-directions")
        return {
            "context": inline_to_md(context) if context else "",
            "directions": inline_to_md(directions) if directions else "",
            "parts": parts,
        }
    # Simpler variant: a single top-level <p> prompt (no wrapping class)
    # followed by <div class="sample-answer"> with a leading <strong>label:</strong>.
    prompt_p = section.find("p", recursive=False)
    sample = section.select_one(".sample-answer")
    return {
        "parts": [],
        "prompt": inline_to_md(prompt_p) if prompt_p else "",
        "sampleAnswer": strip_leading_label(sample) if sample else "",
    }


def parse_leq(soup):
    section = soup.select_one(".leq-section")
    if not section:
        return None
    thesis = section.select_one(".leq-thesis")
    outline = []
    answer = section.select_one(".leq-answer")
    if answer:
        # Walk children in order: a <p><strong>Label:</strong> text</p> is
        # one outline entry on its own; a <p><strong>Label:</strong></p>
        # (empty trailing text) followed by a <ul> instead pulls its text
        # from that list's items (source uses both shapes across topics).
        pending_label = None
        for child in answer.find_all(["p", "ul"], recursive=False):
            if child is thesis:
                continue
            if child.name == "p":
                strong = child.find("strong")
                if not strong:
                    continue
                label = inline_to_md(strong).rstrip(":").strip()
                rest = BeautifulSoup(str(child), "lxml")
                s = rest.find("strong")
                if s:
                    s.decompose()
                text = inline_to_md(rest.body or rest)
                if label and text:
                    outline.append({"label": label, "text": text})
                    pending_label = None
                elif label:
                    pending_label = label
            elif child.name == "ul" and pending_label:
                items = [inline_to_md(li) for li in child.find_all("li", recursive=False)]
                items = [it for it in items if it]
                if items:
                    outline.append({"label": pending_label, "text": "; ".join(items)})
                pending_label = None
    if outline:
        prompt = section.select_one(".leq-prompt")
        note = section.select_one(".leq-note")
        return {
            "outline": outline,
            "prompt": inline_to_md(prompt) if prompt else "",
            "note": inline_to_md(note) if note else "",
            "thesisExample": inline_to_md(thesis) if thesis else "",
        }
    # Simpler variant: a single top-level <p> prompt (no wrapping class)
    # followed by <div class="sample-answer"> with a leading <strong>label:</strong>.
    prompt_p = section.find("p", recursive=False)
    sample = section.select_one(".sample-answer")
    return {
        "outline": [],
        "prompt": inline_to_md(prompt_p) if prompt_p else "",
        "modelThesis": strip_leading_label(sample) if sample else "",
    }


def parse_discussion(soup):
    out = []
    section = soup.select_one(".discussion-section")
    if not section:
        return out
    disc = section.select_one(".discussion")
    if not disc:
        return out
    for details in disc.find_all("details", recursive=False):
        summary = details.find("summary")
        answer = details.select_one(".answer")
        out.append({
            "question": inline_to_md(summary) if summary else "",
            "modelAnswer": block_to_md(answer) if answer else "",
        })
    return out


def parse_topic(path, topic_num):
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    soup = BeautifulSoup(html, "lxml")

    h1 = soup.find("h1")
    title = h1.get_text(strip=True) if h1 else ""
    title = re.sub(r"^Topic\s+[\d.]+\s*", "", title)

    data = {
        "course": "ap-world-history",
        "num": topic_num,
        "title": title,
        "status": "complete",
        "themes": parse_themes(soup),
        "tldr": parse_tldr(soup),
        "learningObjectives": parse_learning_objectives(soup),
        "vocabulary": parse_vocabulary(soup),
        "preTest": parse_pretest(soup),
        "blocks": parse_blocks(soup, topic_num),
        "videoResources": parse_video_resources(soup),
        "multipleChoice": parse_mcq(soup),
        "saq": parse_saq(soup),
        "leq": parse_leq(soup),
        "discussionQuestions": parse_discussion(soup),
        "images": [],
        "illustrativeExamples": [],
        "notebookLmResources": [],
        "teacherNotes": "",
    }
    return data


def main():
    src_dir = sys.argv[1] if len(sys.argv) > 1 else None
    if not src_dir or not os.path.isdir(src_dir):
        print("Usage: python3 parse_apworld.py <path to 'AP World readings' folder>")
        sys.exit(1)

    os.makedirs(CONTENT_DIR, exist_ok=True)
    files = sorted(f for f in os.listdir(src_dir) if f.startswith("topic-") and f.endswith(".html"))
    print(f"Found {len(files)} topic files")

    done = 0
    for fname in files:
        m = re.match(r"topic-(\d+)-(\d+)-", fname)
        if not m:
            print(f"  SKIP (no num match): {fname}")
            continue
        topic_num = f"{int(m.group(1))}.{int(m.group(2))}"
        path = os.path.join(src_dir, fname)
        try:
            data = parse_topic(path, topic_num)
        except Exception as e:
            print(f"  ERROR parsing {fname}: {e}")
            continue
        out_path = os.path.join(CONTENT_DIR, f"{topic_num.replace('.', '-')}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        done += 1
        print(f"  {topic_num}: {data['title']} -> {len(data['blocks'])} blocks, "
              f"{len(data['vocabulary'])} vocab, {len(data['multipleChoice'])} mcq, "
              f"saq={'yes' if data['saq'] else 'no'}, leq={'yes' if data['leq'] else 'no'}, "
              f"{len(data['discussionQuestions'])} discussion")

    print(f"\nConverted {done}/{len(files)} topics.")


if __name__ == "__main__":
    main()
