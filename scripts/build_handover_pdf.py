import re
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
    ListFlowable, ListItem, Preformatted, KeepTogether
)

SRC = r"C:\Users\IAN VERGARA\Downloads\luvlots\HANDOVER.md"
OUT = r"C:\Users\IAN VERGARA\Downloads\luvlots\LUVLOTS-Handover-Guide.pdf"

ACCENT = colors.HexColor("#4289AB")
DARK = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#4B5563")
CODE_BG = colors.HexColor("#F3F4F6")
WARN_BG = colors.HexColor("#FEF3C7")
WARN_BORDER = colors.HexColor("#D97706")

styles = getSampleStyleSheet()

def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.5, leading=15, textColor=DARK, spaceAfter=8)
    base.update(kw)
    return ParagraphStyle(name, **base)

S_TITLE = style("Title2", fontName="Helvetica-Bold", fontSize=24, leading=28, textColor=ACCENT, spaceAfter=4)
S_SUBTITLE = style("Subtitle2", fontName="Helvetica", fontSize=12, leading=16, textColor=MUTED, spaceAfter=20)
S_H1 = style("H1", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=ACCENT, spaceBefore=18, spaceAfter=10)
S_H2 = style("H2", fontName="Helvetica-Bold", fontSize=13.5, leading=17, textColor=DARK, spaceBefore=14, spaceAfter=8)
S_H3 = style("H3", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=DARK, spaceBefore=10, spaceAfter=6)
S_BODY = style("Body2", spaceAfter=8)
S_BULLET = style("Bullet2", spaceAfter=4, leftIndent=0)
S_CODE = ParagraphStyle("Code2", fontName="Courier", fontSize=8.7, leading=11.5, textColor=DARK, backColor=CODE_BG, borderPadding=8, spaceAfter=10, spaceBefore=2)
S_WARN = style("Warn2", backColor=WARN_BG, borderPadding=10, spaceAfter=12, spaceBefore=6)
S_TABLE_HEAD = style("TH", fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.white, spaceAfter=0)
S_TABLE_CELL = style("TC", fontSize=9.3, leading=12.5, spaceAfter=0)

def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # restore intentional tags we might reintroduce below (none yet)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+?)`", r'<font face="Courier" size="9.2" backColor="#F3F4F6">\1</font>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<link href="\2" color="#4289AB"><u>\1</u></link>', text)
    return text

def parse_table(lines, i):
    rows = []
    while i < len(lines) and lines[i].strip().startswith("|"):
        row = lines[i]
        if re.match(r"^\|[\s:\-|]+\|$", row.strip()):
            i += 1
            continue
        cells = [c.strip() for c in row.strip().strip("|").split("|")]
        rows.append(cells)
        i += 1
    return rows, i

def build_story():
    with open(SRC, "r", encoding="utf-8") as f:
        raw = f.read()
    # Helvetica (WinAnsiEncoding) has no glyph for U+2192; swap for an ASCII arrow.
    raw = raw.replace("→", "->")
    lines = raw.split("\n")

    story = []
    story.append(Paragraph("LUVLOTS", S_TITLE))
    story.append(Paragraph("Ownership Handover Guide", S_SUBTITLE))
    story.append(HRFlowable(width="100%", thickness=1.2, color=ACCENT, spaceAfter=16))

    i = 0
    in_code = False
    code_buf = []
    para_buf = []
    in_blockquote = False
    bq_buf = []

    def flush_para():
        if para_buf:
            text = " ".join(p.strip() for p in para_buf if p.strip())
            if text:
                story.append(Paragraph(inline(text), S_BODY))
            para_buf.clear()

    def flush_code():
        if code_buf:
            story.append(Preformatted("\n".join(code_buf), S_CODE))
            code_buf.clear()

    def flush_bq():
        if bq_buf:
            text = " ".join(p.strip() for p in bq_buf if p.strip())
            story.append(Table(
                [[Paragraph(inline(text), S_WARN)]],
                colWidths=[6.3 * inch],
                style=TableStyle([
                    ("BOX", (0, 0), (-1, -1), 1.2, WARN_BORDER),
                    ("BACKGROUND", (0, 0), (-1, -1), WARN_BG),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]),
            ))
            story.append(Spacer(1, 10))
            bq_buf.clear()

    bullet_items = []
    # Holds the list item currently being accumulated across wrapped source
    # lines, e.g. {"type": "bullet", "text": "..."} or {"type": "number", "text": "1. ..."}.
    pending = None

    def finalize_pending():
        nonlocal pending
        if pending is None:
            return
        if pending["type"] == "bullet":
            bullet_items.append(pending["text"])
        else:
            story.append(Paragraph(inline(pending["text"]), style("Num", spaceAfter=6, leftIndent=6)))
        pending = None

    def flush_bullets():
        finalize_pending()
        if bullet_items:
            story.append(ListFlowable(
                [ListItem(Paragraph(inline(b), S_BULLET), leftIndent=14) for b in bullet_items],
                bulletType="bullet", start="circle", leftIndent=14, spaceBefore=2, spaceAfter=10,
            ))
            bullet_items.clear()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            if not in_code:
                flush_para(); flush_bq(); flush_bullets()
                in_code = True
                code_buf.clear()
            else:
                in_code = False
                flush_code()
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        if stripped.startswith(">"):
            flush_para(); flush_bullets()
            in_blockquote = True
            bq_buf.append(stripped.lstrip(">").strip())
            i += 1
            continue
        elif in_blockquote and stripped == "":
            flush_bq()
            in_blockquote = False
            i += 1
            continue
        elif in_blockquote:
            bq_buf.append(stripped.lstrip(">").strip())
            i += 1
            continue

        if stripped.startswith("|"):
            flush_para(); flush_bullets()
            rows, i = parse_table(lines, i)
            if rows:
                header, body = rows[0], rows[1:]
                col_count = len(header)
                avail_width = 6.3 * inch
                col_w = avail_width / col_count
                data = [[Paragraph(f"<b>{inline(c)}</b>", S_TABLE_HEAD) for c in header]]
                for r in body:
                    r = r + [""] * (col_count - len(r))
                    data.append([Paragraph(inline(c), S_TABLE_CELL) for c in r])
                t = Table(data, colWidths=[col_w] * col_count, repeatRows=1)
                t.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
                    ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#D1D5DB")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]))
                story.append(t)
                story.append(Spacer(1, 12))
            continue

        if stripped.startswith("#### "):
            flush_para(); flush_bullets()
            story.append(Paragraph(inline(stripped[5:]), S_H3))
            i += 1
            continue
        if stripped.startswith("### "):
            flush_para(); flush_bullets()
            story.append(Paragraph(inline(stripped[4:]), S_H3))
            i += 1
            continue
        if stripped.startswith("## "):
            flush_para(); flush_bullets()
            story.append(Paragraph(inline(stripped[3:]), S_H2))
            i += 1
            continue
        if stripped.startswith("# "):
            flush_para(); flush_bullets()
            story.append(Paragraph(inline(stripped[2:]), S_H1))
            i += 1
            continue

        if stripped == "---":
            flush_para(); flush_bullets()
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=0.7, color=colors.HexColor("#D1D5DB")))
            story.append(Spacer(1, 10))
            i += 1
            continue

        m = re.match(r"^[-*]\s+(.*)", stripped)
        mnum = re.match(r"^\d+\.\s+(.*)", stripped)
        if m:
            flush_para()
            finalize_pending()
            pending = {"type": "bullet", "text": m.group(1)}
            i += 1
            continue
        if mnum:
            flush_para()
            finalize_pending()
            # numbered items rendered as plain bold-number paragraphs to keep ordering across wraps
            pending = {"type": "number", "text": stripped}
            i += 1
            continue

        if stripped == "":
            flush_para()
            flush_bullets()
            i += 1
            continue

        # Continuation of a wrapped list item (bullet or numbered step) --
        # markdown line-wraps these without a new "-"/"1." marker, so merge
        # into the item in progress instead of treating it as a new paragraph
        # (which would visually read as a cut-off sentence).
        if pending is not None:
            pending["text"] = pending["text"].rstrip() + " " + stripped
            i += 1
            continue

        para_buf.append(line)
        i += 1

    flush_para(); flush_code(); flush_bq(); flush_bullets()
    return story

def build():
    doc = SimpleDocTemplate(
        OUT, pagesize=LETTER,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        title="LUVLOTS Ownership Handover Guide",
        author="LUVLOTS",
    )
    story = build_story()
    doc.build(story)
    print("wrote", OUT)

if __name__ == "__main__":
    build()
