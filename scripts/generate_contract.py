import copy
import json
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "contract-assets" / "FastGPT合同模版-v1.2.docx"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}


def q(tag):
    return f"{{{W_NS}}}{tag}"


def value(data, key, fallback=""):
    return str(data.get(key) or fallback).strip()


def run_text(run):
    return "".join(node.text or "" for node in run.findall(".//w:t", NS))


def set_run_text(run, text):
    node = run.find("w:t", NS)
    if node is None:
        node = ET.SubElement(run, q("t"))
    node.text = text
    for extra in run.findall("w:t", NS)[1:]:
        extra.text = ""


def set_paragraph_text(paragraph, text):
    runs = paragraph_runs(paragraph)
    if not runs:
        append_value(paragraph, text)
        return
    set_run_text(runs[0], text)
    for run in runs[1:]:
        set_run_text(run, "")


def paragraph_runs(paragraph):
    return paragraph.findall(".//w:r", NS)


def append_value(paragraph, text):
    if not text:
        return
    run = ET.Element(q("r"))
    existing = paragraph_runs(paragraph)
    if existing:
        properties = existing[0].find("w:rPr", NS)
        if properties is not None:
            run.append(copy.deepcopy(properties))
    node = ET.SubElement(run, q("t"))
    node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    node.text = text
    paragraph.append(run)


def replace_underlined_runs(paragraph, values):
    slots = [
        run for run in paragraph_runs(paragraph)
        if run.find("w:rPr/w:u", NS) is not None
        and not run_text(run).strip()
    ]
    for index, slot in enumerate(slots):
        set_run_text(slot, values[index] if index < len(values) else "")


def fill_footer_page_number(xml_bytes):
    """Give first-page and regular footers the same live PAGE field."""
    root = ET.fromstring(xml_bytes)
    paragraph = root.find("w:p", NS)
    if paragraph is None:
        paragraph = ET.SubElement(root, q("p"))
    paragraph_properties = paragraph.find("w:pPr", NS)
    for child in list(paragraph):
        if child is not paragraph_properties:
            paragraph.remove(child)
    if paragraph_properties is None:
        paragraph_properties = ET.Element(q("pPr"))
        paragraph.insert(0, paragraph_properties)
    justify = paragraph_properties.find("w:jc", NS)
    if justify is None:
        justify = ET.SubElement(paragraph_properties, q("jc"))
    justify.set(q("val"), "center")

    def add_text(text):
        run = ET.SubElement(paragraph, q("r"))
        node = ET.SubElement(run, q("t"))
        node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        node.text = text

    def add_field(tag, value=None):
        run = ET.SubElement(paragraph, q("r"))
        if tag == "begin":
            node = ET.SubElement(run, q("fldChar"))
            node.set(q("fldCharType"), "begin")
        elif tag == "instruction":
            node = ET.SubElement(run, q("instrText"))
            node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
            node.text = " PAGE "
        elif tag == "separate":
            node = ET.SubElement(run, q("fldChar"))
            node.set(q("fldCharType"), "separate")
        elif tag == "result":
            node = ET.SubElement(run, q("t"))
            node.text = value or "1"
        else:
            node = ET.SubElement(run, q("fldChar"))
            node.set(q("fldCharType"), "end")

    add_text("第 ")
    add_field("begin")
    add_field("instruction")
    add_field("separate")
    add_field("result", "1")
    add_field("end")
    add_text(" 页")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def clean_annotations(document):
    """Remove comments and tracked-change wrappers while retaining accepted text."""
    for tag in ("commentReference", "commentRangeStart", "commentRangeEnd"):
        for node in document.findall(f".//w:{tag}", NS):
            parent = node.getparent() if hasattr(node, "getparent") else None
            if parent is not None:
                parent.remove(node)
            else:
                # ElementTree does not expose parent links; remove from the owning run/paragraph.
                for candidate in document.iter():
                    if node in list(candidate):
                        candidate.remove(node)
                        break
    # Accepted insertions are real contract text; unwrap them instead of dropping content.
    for tag in ("ins", "moveTo"):
        for node in document.findall(f".//w:{tag}", NS):
            for parent in document.iter():
                children = list(parent)
                if node not in children:
                    continue
                index = children.index(node)
                for child in list(node):
                    node.remove(child)
                    parent.insert(index, child)
                    index += 1
                parent.remove(node)
                break
    for tag in ("del", "moveFrom"):
        for node in document.findall(f".//w:{tag}", NS):
            for parent in document.iter():
                if node in list(parent):
                    parent.remove(node)
                    break


def replace_date_runs(paragraph, start_raw, end_raw):
    """Fill the template's split underline runs without concatenating date fields."""
    slots = [run for run in paragraph_runs(paragraph) if run.find("w:rPr/w:u", NS) is not None]
    start = date_parts(start_raw)
    end = date_parts(end_raw)
    values = [start[0], start[1], "", start[2], "", "", end[0], end[1], "", end[2], "", ""]
    for slot, text in zip(slots, values):
        set_run_text(slot, text)


def set_checked(paragraph, selected):
    if not selected:
        return
    for run in paragraph_runs(paragraph):
        current = run_text(run)
        if "□" in current:
            set_run_text(run, current.replace("□", "☑", 1))
            return


def date_parts(raw):
    pieces = raw.split("-")
    if len(pieces) != 3:
        return ["", "", ""]
    return [pieces[0], str(int(pieces[1])), str(int(pieces[2]))]


def date_cn(raw):
    parts = date_parts(raw)
    return f"{parts[0]}年{parts[1]}月{parts[2]}日" if all(parts) else ""


def money(raw):
    try:
        return f"{float(raw):,.2f}"
    except ValueError:
        return "0.00"


def money_cn(amount):
    digits = "零壹贰叁肆伍陆柒捌玖"
    units = ["", "拾", "佰", "仟"]
    groups = ["", "万", "亿", "兆"]
    cents = round(amount * 100)
    integer, decimal = divmod(cents, 100)
    if integer == 0:
        return "零元整"
    result, group_index = "", 0
    while integer:
        group = integer % 10000
        group_text, was_zero = "", False
        for position in range(4):
            digit = group % 10
            if digit:
                group_text = digits[digit] + units[position] + group_text
                was_zero = False
            elif group_text and not was_zero:
                group_text = "零" + group_text
                was_zero = True
            group //= 10
        result = group_text.rstrip("零") + groups[group_index] + result
        integer //= 10000
        group_index += 1
    result = result.replace("零零", "零").replace("零万", "万").lstrip("零").rstrip("零")
    if decimal == 0:
        return result + "元整"
    jiao, fen = divmod(decimal, 10)
    return result + "元" + (digits[jiao] + "角" if jiao else "") + (digits[fen] + "分" if fen else "")


def cells(table, row):
    return table.findall("w:tr", NS)[row].findall("w:tc", NS)


def set_cell(table, row, column, text):
    cell = cells(table, row)[column]
    paragraphs = cell.findall("w:p", NS)
    paragraph = paragraphs[0] if paragraphs else ET.SubElement(cell, q("p"))
    template_run = paragraph.find("w:r", NS)
    properties = template_run.find("w:rPr", NS) if template_run is not None else None
    # Some source cells split one logical value over several paragraphs. Remove
    # those stale fragments before writing generated content, otherwise old
    # template text remains visible after the replacement.
    for extra in paragraphs[1:]:
        cell.remove(extra)
    for child in list(paragraph):
        if child.tag != q("pPr"):
            paragraph.remove(child)
    pieces = str(text or "").split("\n")
    for index, piece in enumerate(pieces):
        run = ET.SubElement(paragraph, q("r"))
        if properties is not None:
            run.append(copy.deepcopy(properties))
        node = ET.SubElement(run, q("t"))
        node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        node.text = piece
        if index < len(pieces) - 1:
            ET.SubElement(run, q("br"))


def center_cell(table, row, column):
    """Center the generated appendix cell while preserving its existing run styling."""
    cell = cells(table, row)[column]
    paragraph = cell.find("w:p", NS)
    if paragraph is None:
        paragraph = ET.SubElement(cell, q("p"))
    paragraph_properties = paragraph.find("w:pPr", NS)
    if paragraph_properties is None:
        paragraph_properties = ET.Element(q("pPr"))
        paragraph.insert(0, paragraph_properties)
    alignment = paragraph_properties.find("w:jc", NS)
    if alignment is None:
        alignment = ET.SubElement(paragraph_properties, q("jc"))
    alignment.set(q("val"), "center")


def set_scope_alignment(table):
    """Center all content in the appendix-II table."""
    pattern = {
        0: ["center", "center", "center", "center"],
        1: ["center", "center", "center", "center"],
        2: ["center", "center", "center", "center"],
        3: ["center", "center", "center", "center"],
        4: ["center", "center", "center", "center"],
    }
    for row_index, alignments in pattern.items():
        for column, alignment_value in enumerate(alignments):
            cell = cells(table, row_index)[column]
            paragraph = cell.find("w:p", NS)
            if paragraph is None:
                paragraph = ET.SubElement(cell, q("p"))
            paragraph_properties = paragraph.find("w:pPr", NS)
            if paragraph_properties is None:
                paragraph_properties = ET.Element(q("pPr"))
                paragraph.insert(0, paragraph_properties)
            alignment = paragraph_properties.find("w:jc", NS)
            if alignment is None:
                alignment = ET.SubElement(paragraph_properties, q("jc"))
            alignment.set(q("val"), alignment_value)


def service_tier(data):
    return {
        "none": ("", 0, ""),
        "free": ("免费服务（首年赠送）", 0, "技术支持服务-基础版本"),
        "basic": ("基础服务", 30000, "技术支持服务-基础版本"),
        "advanced": ("进阶服务", 60000, "技术支持服务-进阶版本"),
        "flagship": ("旗舰服务", 90000, "技术支持服务-高级版本"),
    }.get(value(data, "serviceTier"), ("", 0, ""))


def edition_rule(edition, service_key):
    normalized = edition.replace(" ", "")
    if "旗舰" in normalized:
        users = "不限用户"
    elif "专业" in normalized:
        users = "1000用户"
    else:
        users = "100用户"
    gifts = {"free": 1, "basic": 1, "advanced": 2, "flagship": 3}.get(service_key, 0)
    license_text = f"{users}；单个生产节点永久商用授权"
    if gifts:
        license_text += f"；赠送{gifts}个测试环境License"
    return license_text


def scope_rows(data, tier_name):
    """Build a compact, usable Appendix II even when the user leaves row inputs blank."""
    custom = [row for row in (data.get("scopeRows") or []) if any(value(row, key) for key in ("module", "description", "deliverable", "acceptance"))]
    if custom:
        rows = custom
    else:
        rows = [
            {"module": "软件产品", "description": value(data, "scope") or value(data, "edition") or "FastGPT 软件产品部署与授权", "deliverable": "软件授权文件、部署配置", "acceptance": "完成部署并通过验收"},
            {"module": "知识库模块", "description": "知识库创建、文档导入与检索问答配置", "deliverable": "知识库及检索配置", "acceptance": "可完成文档上传并返回有效答案"},
            {"module": "工作流模块", "description": "业务工作流编排、节点配置与发布", "deliverable": "工作流配置及发布版本", "acceptance": "核心流程可正常运行"},
            {"module": "技术支持服务", "description": tier_name or "按合同约定提供技术支持", "deliverable": tier_name or "技术支持服务", "acceptance": "按服务等级提供支持"},
        ]
    return rows[:4]


def fill_template(data):
    with ZipFile(TEMPLATE) as source:
        document = ET.fromstring(source.read("word/document.xml"))
        clean_annotations(document)
        body = document.find("w:body", NS)
        paragraphs = [node for node in body if node.tag == q("p")]
        tables = [node for node in body if node.tag == q("tbl")]

        def p(number):
            return paragraphs[number - 1]

        replace_underlined_runs(p(1), [value(data, "contractNo")])
        append_value(p(15), value(data, "partyAName"))
        append_value(p(16), value(data, "partyBName"))
        append_value(p(18), value(data, "signPlace"))
        set_paragraph_text(p(19), date_cn(value(data, "signDate")))
        for number, keys in {
            21: ["partyAName"], 22: ["partyACode"], 23: ["partyALegal"], 24: ["partyAAddress"], 25: ["partyAPhone"],
            27: ["partyBName"], 28: ["partyBCode"], 29: ["partyBLegal"], 30: ["partyBAddress"], 31: ["partyBPhone"],
        }.items():
            replace_underlined_runs(p(number), [value(data, key) for key in keys])
        replace_underlined_runs(p(33), [value(data, "projectName").removesuffix("项目").rstrip()])

        edition = value(data, "edition").replace(" ", "")
        for number in range(44, 50):
            set_checked(p(number), edition in "".join(run_text(run) for run in paragraph_runs(p(number))).replace(" ", ""))
        tier_name, tier_price, tier_service = service_tier(data)
        services = set(data.get("services") or [])
        if tier_service:
            services.add(tier_service)
        service_names = {52: "技术支持服务-基础版本", 53: "技术支持服务-进阶版本", 54: "技术支持服务-高级版本", 55: "软件定制开发", 56: "业务场景实现", 57: "AI技术培训"}
        for number, name in service_names.items():
            set_checked(p(number), name in services)

        term_type = value(data, "termType", "fixed")
        if term_type == "fixed":
            set_checked(p(63), True)
            replace_date_runs(p(63), value(data, "serviceStart"), value(data, "serviceEnd"))
        elif term_type == "warranty":
            set_checked(p(64), True)
            replace_underlined_runs(p(64), date_parts(value(data, "serviceEnd")))
        elif term_type == "acceptance":
            set_checked(p(65), True)
            replace_underlined_runs(p(65), date_parts(value(data, "serviceEnd")))
        else:
            set_checked(p(66), True)
        delivery = value(data, "deliveryMode")
        set_checked(p(68), delivery == "甲方指定地点")
        replace_underlined_runs(p(68), [value(data, "servicePlace")])
        set_checked(p(69), delivery == "远程交付服务")
        set_checked(p(70), delivery == "混合方式")
        replace_underlined_runs(p(74), [value(data, "acceptancePlace") or value(data, "servicePlace")])
        replace_underlined_runs(p(85), [value(data, "supportOwner") or value(data, "partyBContact"), value(data, "supportPhone") or value(data, "partyBContactPhone")])

        software_price = float(value(data, "softwarePrice") or 0)
        service_price = float(value(data, "servicePrice") or tier_price)
        total = software_price + service_price
        replace_underlined_runs(p(87), [money_cn(total).replace("元整", "").replace("元", ""), money(str(total))])
        replace_underlined_runs(p(89), [value(data, "paymentTerms")])
        set_checked(p(93), value(data, "invoiceType") == "增值税专用发票")
        set_checked(p(94), value(data, "invoiceType") == "增值税普通发票")
        replace_underlined_runs(p(96), [value(data, "bankName", "广州环际云计算有限公司")])
        replace_underlined_runs(p(97), [value(data, "bankBranch", "招商银行杭州分行杭州高教路支行")])
        replace_underlined_runs(p(98), [value(data, "bankAccount", "571917643710806")])
        replace_underlined_runs(p(99), [value(data, "partyBCode")])
        for number, key in {101: "invoiceCompany", 102: "invoiceAddress", 103: "invoicePhone", 104: "invoiceTaxCode", 105: "invoiceBank", 106: "invoiceAccount"}.items():
            replace_underlined_runs(p(number), [value(data, key)])
        replace_underlined_runs(p(113), [value(data, "partyAContact"), value(data, "partyAContactPhone"), value(data, "partyAEmail")])
        replace_underlined_runs(p(119), [value(data, "partyBContact"), value(data, "partyBContactPhone"), value(data, "partyBEmail")])

        quote, scope, acceptance = tables[1], tables[2], tables[3]
        # The source template has six fixed rows. Keep the commercial rules visible
        # while leaving optional services without invented prices.
        set_cell(quote, 1, 1, edition or "FastGPT")
        set_cell(quote, 1, 2, "私有化部署：一次性买断，税率13%" if "买断" in edition else "私有化部署：按年订阅，税率6%")
        set_cell(quote, 1, 3, "套")
        set_cell(quote, 1, 4, value(data, "quantity", "1"))
        set_cell(quote, 1, 5, "13%" if "买断" in edition else "6%")
        set_cell(quote, 1, 6, money(str(software_price)))
        set_cell(quote, 2, 1, "软件授权规则")
        set_cell(quote, 2, 2, edition_rule(edition, value(data, "serviceTier")))
        set_cell(quote, 2, 3, "套")
        set_cell(quote, 2, 4, "1")
        set_cell(quote, 2, 5, "-")
        set_cell(quote, 2, 6, "")
        training = value(data, "training")
        deployment_text = "1、系统部署：平台部署至客户现有生产环境并完成验证"
        if training:
            deployment_text += f"；2、系统培训：{training}培训"
        set_cell(quote, 3, 1, "产品部署与培训服务")
        set_cell(quote, 3, 2, deployment_text)
        set_cell(quote, 3, 3, "项")
        set_cell(quote, 3, 4, "1")
        set_cell(quote, 3, 5, "6%")
        set_cell(quote, 3, 6, "")
        set_cell(quote, 4, 1, tier_name or "技术支持服务")
        set_cell(quote, 4, 2, f"{tier_name}套餐" if tier_name else "未选购（本次未购买技术支持）")
        set_cell(quote, 4, 3, "项")
        set_cell(quote, 4, 4, "1")
        set_cell(quote, 4, 5, "6%")
        set_cell(quote, 4, 6, money(str(service_price)) if tier_name else "")
        set_cell(quote, 5, 1, "产品定制开发")
        set_cell(quote, 5, 2, "如需定制开发，双方另行书面确认范围与报价")
        set_cell(quote, 5, 3, "/")
        set_cell(quote, 5, 4, "1")
        set_cell(quote, 5, 5, "6%")
        set_cell(quote, 5, 6, "")
        set_cell(quote, 6, 1, "AI场景技术服务")
        set_cell(quote, 6, 2, "如需AI场景技术服务，双方另行书面确认范围与报价")
        set_cell(quote, 6, 3, "人天")
        set_cell(quote, 6, 4, "1")
        set_cell(quote, 6, 5, "6%")
        set_cell(quote, 6, 6, "")
        for column in range(len(cells(quote, 7))):
            set_cell(quote, 7, column, f"合同总价：人民币 {money_cn(total)}，小写 ¥ {money(str(total))}。")

        rows = scope_rows(data, tier_name)
        for index in range(1, 5):
            row = rows[index - 1] if index <= len(rows) else {}
            for column, key in enumerate(("module", "description", "deliverable", "acceptance")):
                set_cell(scope, index, column, value(row, key))
        set_scope_alignment(scope)

        # Appendix III is a fixed four-module acceptance checklist for every project.
        set_cell(acceptance, 0, 3, value(data, "contractNo"))
        set_cell(acceptance, 1, 1, value(data, "partyAName"))
        set_cell(acceptance, 1, 3, value(data, "partyAContact"))
        set_cell(acceptance, 2, 1, value(data, "quantity", "1"))
        set_cell(acceptance, 2, 3, date_cn(value(data, "signDate")))
        set_cell(acceptance, 3, 1, date_cn(value(data, "serviceStart")))
        set_cell(acceptance, 3, 3, date_cn(value(data, "serviceEnd")))
        set_cell(acceptance, 4, 1, value(data, "partyBName"))
        set_cell(acceptance, 4, 3, f"{value(data, 'partyBContact')} {value(data, 'partyBContactPhone')}")
        set_cell(acceptance, 5, 1, money(str(total)))
        set_cell(acceptance, 5, 3, value(data, "servicePlace"))
        for row_index, (module, description) in enumerate([
            ("知识库模块", "知识库创建、文档导入、分段与检索问答配置"),
            ("工作流模块", "工作流编排、节点配置、调试与发布"),
            ("权限模块", "用户、角色、团队及访问权限配置"),
            ("后台模块", "系统设置、运行监控、日志与基础运维配置"),
        ], start=8):
            set_cell(acceptance, row_index, 0, str(row_index - 7))
            set_cell(acceptance, row_index, 1, module)
            set_cell(acceptance, row_index, 2, description)
            set_cell(acceptance, row_index, 3, "1")
            set_cell(acceptance, row_index, 4, "功能可用并经甲方确认")

        updated_xml = ET.tostring(document, encoding="utf-8", xml_declaration=True)
        return updated_xml


def main():
    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    destination = Path(sys.argv[2])
    document_xml = fill_template(payload)
    with ZipFile(TEMPLATE) as source, ZipFile(destination, "w", ZIP_DEFLATED) as output:
        for item in source.infolist():
            if item.filename in {"word/comments.xml", "word/commentsExtended.xml", "word/people.xml"}:
                continue
            item_data = source.read(item.filename)
            if item.filename == "word/document.xml":
                item_data = document_xml
            elif item.filename in {"word/footer1.xml", "word/footer2.xml"}:
                item_data = fill_footer_page_number(item_data)
            elif item.filename == "word/_rels/document.xml.rels":
                ET.register_namespace("", "http://schemas.openxmlformats.org/package/2006/relationships")
                relationships = ET.fromstring(item_data)
                for relationship in list(relationships):
                    relation_type = relationship.attrib.get("Type", "")
                    target = relationship.attrib.get("Target", "")
                    if "comments" in relation_type.lower() or "people" in relation_type.lower() or target in {"comments.xml", "commentsExtended.xml", "people.xml"}:
                        relationships.remove(relationship)
                item_data = ET.tostring(relationships, encoding="utf-8", xml_declaration=True)
            elif item.filename == "[Content_Types].xml":
                ET.register_namespace("", "http://schemas.openxmlformats.org/package/2006/content-types")
                content_types = ET.fromstring(item_data)
                for override in list(content_types):
                    part_name = override.attrib.get("PartName", "")
                    if any(name in part_name.lower() for name in ("comments", "people")):
                        content_types.remove(override)
                item_data = ET.tostring(content_types, encoding="utf-8", xml_declaration=True)
            output.writestr(item, item_data)


if __name__ == "__main__":
    main()
