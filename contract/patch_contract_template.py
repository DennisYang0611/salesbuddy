"""Apply the annotated template-only fixes to the FastGPT contract DOCX."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"w": W_NS}


def q(name: str) -> str:
    return f"{{{W_NS}}}{name}"


def text(node: etree._Element) -> str:
    return "".join(node.xpath(".//w:t/text()", namespaces=NS))


def ensure_page_break_before(paragraph: etree._Element) -> None:
    ppr = paragraph.find("w:pPr", NS)
    if ppr is None:
        ppr = etree.Element(q("pPr"))
        paragraph.insert(0, ppr)
    page_break = ppr.find("w:pageBreakBefore", NS)
    if page_break is None:
        page_break = etree.Element(q("pageBreakBefore"))
        # w:pageBreakBefore follows keep properties and precedes run properties.
        run_properties = ppr.find("w:rPr", NS)
        if run_properties is not None:
            ppr.insert(ppr.index(run_properties), page_break)
        else:
            ppr.append(page_break)
    page_break.set(q("val"), "1")


def center_paragraph(paragraph: etree._Element) -> None:
    ppr = paragraph.find("w:pPr", NS)
    if ppr is None:
        ppr = etree.Element(q("pPr"))
        paragraph.insert(0, ppr)
    jc = ppr.find("w:jc", NS)
    if jc is None:
        jc = etree.SubElement(ppr, q("jc"))
    jc.set(q("val"), "center")


def strip_cell_leading_spaces(cell: etree._Element) -> None:
    """Strip only whitespace before the first visible text in a cell."""
    started = False
    for node in cell.xpath(".//w:t", namespaces=NS):
        value = node.text or ""
        if not started:
            stripped = value.lstrip()
            node.text = stripped
            if stripped:
                started = True


def patch_document(xml: bytes) -> bytes:
    root = etree.fromstring(xml)

    # The annotations identify review highlights, not intended contract styling.
    for highlight in root.xpath(".//w:highlight", namespaces=NS):
        highlight.getparent().remove(highlight)

    # Start each attachment on a fresh page while retaining the original heading
    # paragraphs and all surrounding table/layout structure.
    for paragraph in root.xpath(".//w:body/w:p", namespaces=NS):
        value = text(paragraph).strip()
        if value.startswith(("附件一：", "附件二：", "附件三：")):
            ensure_page_break_before(paragraph)

    tables = root.xpath(".//w:body/w:tbl", namespaces=NS)
    if len(tables) >= 2:
        # Attachment 1's numbered rows 5 and 6 are the two rows called out in
        # the review comment. Their narrative cells should not start indented.
        for row in tables[1].xpath("./w:tr", namespaces=NS):
            cells = row.xpath("./w:tc", namespaces=NS)
            if not cells:
                continue
            number = text(cells[0]).strip()
            if number in {"5", "6"} and len(cells) > 2:
                strip_cell_leading_spaces(cells[2])

    if len(tables) >= 3:
        # In Attachment 2, center every cell in the technical-support row so
        # its label and corresponding content share one consistent alignment.
        # The template's fourth data row is intentionally blank; generation
        # scripts populate it with the selected support service at runtime.
        rows = tables[2].xpath("./w:tr", namespaces=NS)
        if len(rows) > 4:
            for cell in rows[4].xpath("./w:tc", namespaces=NS):
                for paragraph in cell.xpath("./w:p", namespaces=NS):
                    center_paragraph(paragraph)

    return etree.tostring(root, encoding="UTF-8", xml_declaration=True, standalone=True)


def patch_docx(source: Path, target: Path) -> None:
    with ZipFile(source, "r") as zin:
        entries = [(info, zin.read(info.filename)) for info in zin.infolist()]
    if not any(info.filename == "word/document.xml" for info, _ in entries):
        raise ValueError("DOCX 缺少 word/document.xml")
    entries = [
        (info, patch_document(data) if info.filename == "word/document.xml" else data)
        for info, data in entries
    ]
    target.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(target, "w", compression=ZIP_DEFLATED) as zout:
        for info, data in entries:
            zout.writestr(info, data)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: patch_contract_template.py INPUT.docx OUTPUT.docx")
    patch_docx(Path(sys.argv[1]), Path(sys.argv[2]))
