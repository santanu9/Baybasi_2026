#!/usr/bin/env python3
import textwrap
from pathlib import Path


OUT = Path(__file__).with_name("media-inventory-by-page.pdf")

PAGE_W = 792
PAGE_H = 612
MARGIN = 24
FONT_SIZE = 7.2
LINE_H = 9.0
TITLE_SIZE = 18

COLS = [
    ("Page", 88),
    ("Image Directories Used", 126),
    ("Images", 426),
    ("Videos", 104),
]

ROWS = [
    (
        "index.html",
        "images/sponsors/\nimages/home/",
        "indian_grocery_image001.png, future_right_v2-768x644.png, zaman-1024x571.jpeg, "
        "I-693_New-1024x683.jpeg, ravi_jagtiani_new-1024x512.jpg, ramez_tabri_updated.jpg, "
        "first_bank.png, WhatsApp-Image-2023-10-20-at-2.22.33-PM-1024x1018.jpeg, "
        "BMO_Updated-768x440.png, rosalind_chin.png, ebiw-768x122.png, "
        "kw_PHOTO-2022-09-12-21-14-21.jpg, Jaspreet-768x621.png, "
        "Mamta_logo_new-scaled-1-768x512.jpg, Andrew_Klink_2-scaled-1-768x432.jpeg, "
        "gama_ride_working-1.png",
        "images/home/hero-video.mp4\nExternal CloudFront .mp4",
    ),
    ("join-us.html", "images/heroes/", "join-us-photo.png", "None"),
    ("membership.html", "images/heroes/", "membership-photo.png", "None"),
    ("volunteer.html", "images/heroes/", "volunteer-photo.png", "None"),
    ("event-pass.html", "images/heroes/", "event-pass-photo.png", "None"),
    ("events.html", "images/heroes/", "events-photo.png", "None"),
    ("sponsorship.html", "images/heroes/", "sponsorship-photo.png", "None"),
    (
        "sponsors.html",
        "images/sponsors/",
        "indian_grocery_image001.png, future_right_v2-768x644.png, zaman-1024x571.jpeg, "
        "I-693_New-1024x683.jpeg, ravi_jagtiani_new-1024x512.jpg, ramez_tabri_updated.jpg, "
        "first_bank.png, WhatsApp-Image-2023-10-20-at-2.22.33-PM-1024x1018.jpeg, "
        "BMO_Updated-768x440.png, rosalind_chin.png, ebiw-768x122.png, "
        "kw_PHOTO-2022-09-12-21-14-21.jpg, Jaspreet-768x621.png, "
        "Mamta_logo_new-scaled-1-768x512.jpg, Andrew_Klink_2-scaled-1-768x432.jpeg, "
        "gama_ride_working-1.png",
        "None",
    ),
    (
        "about.html",
        "images/about/",
        "director-suman-debnath.jpg, director-nilanjan-debroy.jpg, "
        "director-prithwiraj-mitra.jpg, director-raj-tiwari.jpg, "
        "director-sukalyan-chakraborty.jpg, director-swati-chakraborty.jpg, "
        "director-manjira-datta.png",
        "None",
    ),
    ("impacts.html", "None directly in page", "None directly referenced", "None"),
    ("404.html", "images/common/", "baybasi-logo.png", "None"),
    (
        "admin.html",
        "images/common/\nimages/home/\nimages/about/\nimages/impacts/\nimages/events/\nimages/sponsors/",
        "Admin config lists upload/default paths for site logo, home images, about directors, "
        "impact photos, event covers, and sponsor logos.",
        "None",
    ),
]

SHARED_ROWS = [
    ("Sitewide shared image", "images/common/", "baybasi-logo.png via js/components.js"),
    ("js/main.js", "assets/images/", "hero-culture.svg, hero-festival.svg, hero-impact.svg"),
]


def esc(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap_cell(text, width, size=FONT_SIZE):
    chars = max(8, int((width - 8) / (size * 0.47)))
    lines = []
    for part in str(text).splitlines() or [""]:
        lines.extend(textwrap.wrap(part, width=chars, break_long_words=True) or [""])
    return lines


def text_cmd(x, y, text, size=FONT_SIZE, bold=False):
    font = "/F2" if bold else "/F1"
    return f"0 0 0 rg BT {font} {size:.2f} Tf {x:.2f} {y:.2f} Td ({esc(text)}) Tj ET"


class Page:
    def __init__(self):
        self.ops = []
        self.y = PAGE_H - MARGIN

    def add(self, op):
        self.ops.append(op)

    def rect(self, x, y, w, h, fill=None):
        if fill:
            r, g, b = fill
            self.add(f"{r:.3f} {g:.3f} {b:.3f} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re f")
        self.add(f"0.820 0.835 0.859 RG {x:.2f} {y:.2f} {w:.2f} {h:.2f} re S")


pages = []


def new_page():
    p = Page()
    pages.append(p)
    return p


def draw_header(p):
    p.add(text_cmd(MARGIN, p.y - 4, "Baybasi Media Inventory by Page", TITLE_SIZE, True))
    p.y -= 22
    p.add(text_cmd(MARGIN, p.y, "Source: root HTML pages and shared JS files. The docs/ mirror is excluded to avoid duplicate counting.", 8.5))
    p.y -= 18


def draw_table_header(p, columns):
    x = MARGIN
    h = 20
    y = p.y - h
    for title, width in columns:
        p.rect(x, y, width, h, fill=(1.0, 0.969, 0.929))
        p.add(text_cmd(x + 4, y + h - 13, title, 8.0, True))
        x += width
    p.y = y


def draw_row(p, columns, row):
    wrapped = [wrap_cell(cell, columns[i][1]) for i, cell in enumerate(row)]
    row_h = max(22, max(len(lines) for lines in wrapped) * LINE_H + 10)
    if p.y - row_h < MARGIN:
        p = new_page()
        draw_header(p)
        draw_table_header(p, columns)
    y = p.y - row_h
    x = MARGIN
    for i, (_, width) in enumerate(columns):
        p.rect(x, y, width, row_h)
        line_y = y + row_h - 13
        for line in wrapped[i]:
            p.add(text_cmd(x + 4, line_y, line, FONT_SIZE, bold=(i == 0)))
            line_y -= LINE_H
        x += width
    p.y = y
    return p


page = new_page()
draw_header(page)
draw_table_header(page, COLS)
for item in ROWS:
    page = draw_row(page, COLS, item)

page.y -= 18
if page.y < 95:
    page = new_page()
    draw_header(page)
page.add(text_cmd(MARGIN, page.y, "Shared and Legacy JavaScript Media", 13, True))
page.y -= 10
shared_cols = [("File", 160), ("Directory", 170), ("Media", 414)]
draw_table_header(page, shared_cols)
for item in SHARED_ROWS:
    page = draw_row(page, shared_cols, item)


objects = []


def add_obj(data):
    objects.append(data)
    return len(objects)


font1 = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
font2 = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
page_objs = []
for p in pages:
    stream = "\n".join(p.ops).encode("latin-1")
    content_obj = add_obj(f"<< /Length {len(stream)} >>\nstream\n" + stream.decode("latin-1") + "\nendstream")
    page_obj = add_obj(
        f"<< /Type /Page /Parent 0 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
        f"/Resources << /Font << /F1 {font1} 0 R /F2 {font2} 0 R >> >> "
        f"/Contents {content_obj} 0 R >>"
    )
    page_objs.append(page_obj)

kids = " ".join(f"{n} 0 R" for n in page_objs)
pages_obj = add_obj(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_objs)} >>")
catalog_obj = add_obj(f"<< /Type /Catalog /Pages {pages_obj} 0 R >>")

for obj_num in page_objs:
    objects[obj_num - 1] = objects[obj_num - 1].replace("/Parent 0 0 R", f"/Parent {pages_obj} 0 R")

pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
offsets = [0]
for i, data in enumerate(objects, start=1):
    offsets.append(len(pdf))
    pdf.extend(f"{i} 0 obj\n".encode("latin-1"))
    pdf.extend(data.encode("latin-1"))
    pdf.extend(b"\nendobj\n")

xref = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
pdf.extend(b"0000000000 65535 f \n")
for offset in offsets[1:]:
    pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
pdf.extend(
    f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_obj} 0 R >>\n"
    f"startxref\n{xref}\n%%EOF\n".encode("latin-1")
)

OUT.write_bytes(pdf)
print(OUT)
