import copy
import json
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "contract-assets" / "渠道服务商合作协议.docx"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"w": W_NS}


def q(name):
    return f"{{{W_NS}}}{name}"


def value(data, key, fallback=""):
    raw = data.get(key, fallback)
    return str(raw if raw is not None else fallback).strip()


def date_parts(raw):
    parts = value({"x": raw}, "x").replace("/", "-").split("-")
    if len(parts) != 3:
        return ["", "", ""]
    try:
        return [parts[0], str(int(parts[1])), str(int(parts[2]))]
    except ValueError:
        return ["", "", ""]


def date_cn(raw):
    parts = date_parts(raw)
    return f"{parts[0]}年{parts[1]}月{parts[2]}日" if all(parts) else value({"x": raw}, "x")


def paragraph_runs(paragraph):
    return paragraph.findall(".//w:r", NS)


def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.findall(".//w:t", NS))


def set_paragraph_text(paragraph, text):
    runs = paragraph_runs(paragraph)
    if not runs:
        run = ET.SubElement(paragraph, q("r"))
        ET.SubElement(run, q("t"))
        runs = [run]
    first = runs[0]
    first_t = first.find("w:t", NS)
    if first_t is None:
        first_t = ET.SubElement(first, q("t"))
    first_t.set(f"{{{XML_NS}}}space", "preserve")
    first_t.text = text
    for run in runs[1:]:
        for node in run.findall(".//w:t", NS):
            node.text = ""


def set_cell_text(cell, text):
    paragraphs = cell.findall("w:p", NS)
    if not paragraphs:
        paragraphs = [ET.SubElement(cell, q("p"))]
    first_paragraph = paragraphs[0]
    runs = paragraph_runs(first_paragraph)
    if runs:
        first_run = runs[0]
        props = first_run.find("w:rPr", NS)
    else:
        first_run = ET.SubElement(first_paragraph, q("r"))
        props = None
    for paragraph in paragraphs:
        for run in paragraph_runs(paragraph):
            for node in run.findall(".//w:t", NS):
                node.text = ""
    for run in list(first_paragraph.findall("w:r", NS)):
        first_paragraph.remove(run)
    pieces = str(text or "").split("\n")
    for index, piece in enumerate(pieces):
        run = ET.SubElement(first_paragraph, q("r"))
        if props is not None:
            run.append(copy.deepcopy(props))
        node = ET.SubElement(run, q("t"))
        node.set(f"{{{XML_NS}}}space", "preserve")
        node.text = piece
        if index < len(pieces) - 1:
            ET.SubElement(run, q("br"))
    for paragraph in paragraphs[1:]:
        # Preserve the original extra paragraphs for cell height, but keep them empty.
        set_paragraph_text(paragraph, "")


def table_cells(table, row):
    return table.findall("w:tr", NS)[row].findall("w:tc", NS)


def set_table_cell(table, row, col, text):
    set_cell_text(table_cells(table, row)[col], text)


def replace_everywhere(root, replacements):
    for paragraph in root.findall(".//w:p", NS):
        original = paragraph_text(paragraph)
        updated = original
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if updated != original:
            set_paragraph_text(paragraph, updated)


def checked(label, selected):
    return ("☑ " if selected else "□ ") + label


def tier_label(tier):
    return {
        "A1": "A1 线索提供型（10%）",
        "A2": "A2 商务推进型（18%–20%）",
        "A3": "A3 深度客户经营型（25%–30%）",
        "B1": "B1 售前支持型（40%–45%）",
        "B2": "B2 售前实施型（50%–58%）",
        "B3": "B3 全栈技术型（60%–65%）",
    }.get(tier, "")


def fill_template(data):
    product = value(data, "productName", "FastGPT")
    party_a = value(data, "partyAName")
    party_b = value(data, "partyBName")
    sign_date = value(data, "signDate")
    with ZipFile(TEMPLATE) as source:
        document = ET.fromstring(source.read("word/document.xml"))
        body = document.find("w:body", NS)
        tables = body.findall("w:tbl", NS)

        replacements = {
            "【产品/平台提供方名称】": party_a,
            "【渠道商/服务商名称】": party_b,
            "【产品/平台名称】": product,
            "【授权区域/客户范围】": value(data, "authorizedScope"),
            "【授权产品/服务】": value(data, "authorizedProduct", product),
            "【待填写】": "",
            "【】年【】月【】日": date_cn(sign_date),
        }
        replace_everywhere(document, replacements)

        # Replace the agreement term sentence separately so its four date slots stay readable.
        for paragraph in body.findall("w:p", NS):
            text = paragraph_text(paragraph)
            if text.startswith("13.1 本协议自"):
                start = value(data, "agreementStart", sign_date)
                end = value(data, "agreementEnd")
                years = value(data, "termYears", "1")
                set_paragraph_text(
                    paragraph,
                    f"13.1 本协议自双方法定代表人或授权代表签字并加盖公章之日起生效，有效期为{years}年，自{date_cn(start)}至{date_cn(end)}。",
                )

        # Appendix II is the operational part of the agreement.
        project = tables[2]
        renewal = value(data, "renewalPolicy", "另行报备确认")
        set_table_cell(project, 0, 1, f"客户全称：{value(data, 'clientName')}\n项目名称：{value(data, 'projectName')}\n客户主体/部门：{value(data, 'clientDepartment')}")
        set_table_cell(project, 1, 1, f"报备编号：{value(data, 'registrationNo')}\n确认日期：{date_cn(value(data, 'confirmDate', sign_date))}\n保护期至：{date_cn(value(data, 'protectionEnd'))}")
        set_table_cell(project, 2, 1, f"产品/服务：{value(data, 'projectProduct', product)}\n区域/客户范围：{value(data, 'projectScope', value(data, 'authorizedScope'))}")
        # Keep the template's transaction mode, tier, rate, and responsibility rows unchanged.
        # They are policy-controlled fields and are intentionally not collected in the UI.
        set_table_cell(project, 6, 1, f"计入：{value(data, 'includedBase')}\n扣除：{value(data, 'excludedBase')}\n增值税率：{value(data, 'taxRate')}")
        set_table_cell(project, 9, 1, f"里程碑：{value(data, 'milestones')}\n成果清单：{value(data, 'deliverables')}\n验收人及标准：{value(data, 'acceptance')}")
        set_table_cell(project, 10, 1, f"{checked('另行报备确认', renewal == '另行报备确认')}  {checked('本项目预先约定：' + value(data, 'renewalDetail'), renewal == '本项目预先约定')}")
        set_table_cell(project, 11, 1, value(data, "specialTerms"))

        signature = tables[5]
        set_table_cell(signature, 0, 0, f"甲方：{party_a}")
        set_table_cell(signature, 0, 1, f"乙方：{party_b}")
        party_rows = [
            (1, "统一社会信用代码", "partyACode", "partyBCode"),
            (2, "地址", "partyAAddress", "partyBAddress"),
            (3, "授权代表", "partyALegal", "partyBLegal"),
            (4, "联系人", "partyAContact", "partyBContact"),
            (5, "联系电话", "partyAPhone", "partyBPhone"),
            (6, "电子邮箱", "partyAEmail", "partyBEmail"),
        ]
        for row, label, left, right in party_rows:
            set_table_cell(signature, row, 0, f"{label}：{value(data, left)}")
            set_table_cell(signature, row, 1, f"{label}：{value(data, right)}")
        set_table_cell(signature, 7, 0, f"盖章及日期：\n\n签署日期：{date_cn(sign_date)}")
        set_table_cell(signature, 7, 1, f"盖章及日期：\n\n签署日期：{date_cn(sign_date)}")

        return ET.tostring(document, encoding="utf-8", xml_declaration=True)


def main():
    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    destination = Path(sys.argv[2])
    document_xml = fill_template(payload)
    with ZipFile(TEMPLATE) as source, ZipFile(destination, "w", ZIP_DEFLATED) as output:
        for item in source.infolist():
            output.writestr(item, document_xml if item.filename == "word/document.xml" else source.read(item.filename))


if __name__ == "__main__":
    main()
