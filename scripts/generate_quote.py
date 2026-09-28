import datetime as dt
import json
import math
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.etree import ElementTree as ET

W_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"x": W_NS}
ET.register_namespace("", W_NS)


def q(tag):
    return f"{{{W_NS}}}{tag}"


def get_cell(sheet, ref):
    node = sheet.find(f".//x:c[@r='{ref}']", NS)
    if node is None:
        raise KeyError(f"模板缺少单元格 {ref}")
    return node


def clear_cell(sheet, ref):
    node = get_cell(sheet, ref)
    for child in list(node):
        node.remove(child)
    node.attrib.pop("t", None)


def set_text(sheet, ref, value):
    node = get_cell(sheet, ref)
    for child in list(node):
        node.remove(child)
    node.set("t", "inlineStr")
    inline = ET.SubElement(node, q("is"))
    text = ET.SubElement(inline, q("t"))
    text.set(f"{{{XML_NS}}}space", "preserve")
    text.text = str(value or "")


def set_number(sheet, ref, value):
    node = get_cell(sheet, ref)
    for child in list(node):
        node.remove(child)
    node.attrib.pop("t", None)
    value_node = ET.SubElement(node, q("v"))
    value_node.text = str(value)


def set_formula(sheet, ref, formula, cached=0):
    node = get_cell(sheet, ref)
    for child in list(node):
        node.remove(child)
    node.attrib.pop("t", None)
    f = ET.SubElement(node, q("f"))
    f.text = formula.lstrip("=")
    v = ET.SubElement(node, q("v"))
    v.text = str(cached)


def number(value, fallback=0.0):
    try:
        value = float(value)
        return value if math.isfinite(value) else fallback
    except (TypeError, ValueError):
        return fallback


def excel_date(value):
    try:
        parsed = dt.date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        parsed = dt.date.today()
    return (parsed - dt.date(1899, 12, 30)).days


def generate(template, payload, output):
    items = payload.get("items") if isinstance(payload.get("items"), list) else []
    items = [item for item in items if str(item.get("name") or "").strip()][:4]
    with ZipFile(template) as source:
        sheet = ET.fromstring(source.read("xl/worksheets/sheet1.xml"))
        seller_name = str(payload.get("sellerName") or "广州环界云计算有限公司").strip()
        seller_address = str(payload.get("sellerAddress") or "").strip()
        seller_phone = str(payload.get("sellerPhone") or "").strip()
        seller_email = str(payload.get("sellerEmail") or "").strip()
        customer_name = str(payload.get("customerName") or "").strip()
        set_text(sheet, "B2", seller_name)
        set_text(sheet, "C3", seller_address)
        set_text(sheet, "C4", seller_phone)
        set_text(sheet, "C5", seller_email)
        set_text(sheet, "C7", customer_name)
        set_text(sheet, "F7", str(payload.get("customerContact") or "").strip())
        set_text(sheet, "J7", str(payload.get("customerPhone") or "").strip())
        set_number(sheet, "C8", excel_date(payload.get("quoteDate")))
        set_number(sheet, "F8", excel_date(payload.get("validUntil")))
        set_text(sheet, "J8", str(payload.get("owner") or "").strip())
        set_text(sheet, "C23", str(payload.get("owner") or "").strip())
        set_text(sheet, "H23", seller_name)

        has_discount = any(abs(number(item.get("discount"), 1) - 1) > 0.000001 for item in items)
        set_text(sheet, "J10", "折后含税金额" if has_discount else "含税金额")
        gross_total = discounted_total = net_total = tax_total = 0.0
        rates = []
        for index in range(4):
            row = 11 + index
            if index >= len(items):
                for col in "BCDEFGHIJK":
                    clear_cell(sheet, f"{col}{row}")
                continue
            item = items[index]
            qty = number(item.get("quantity"))
            unit_price = number(item.get("unitPrice"))
            tax_rate = number(item.get("taxRate"), 0.13)
            discount = min(1, max(0, number(item.get("discount"), 1)))
            gross = qty * unit_price
            discounted = gross * discount
            net = discounted / (1 + tax_rate) if tax_rate > -1 else 0
            gross_total += gross
            discounted_total += discounted
            net_total += net
            tax_total += discounted - net
            if tax_rate not in rates:
                rates.append(tax_rate)
            set_number(sheet, f"B{row}", index + 1)
            set_text(sheet, f"C{row}", item.get("name"))
            set_text(sheet, f"D{row}", item.get("description"))
            set_number(sheet, f"E{row}", qty)
            set_text(sheet, f"F{row}", item.get("unit") or "套")
            set_number(sheet, f"G{row}", unit_price)
            set_formula(sheet, f"H{row}", f"=G{row}/(1+{tax_rate})", unit_price / (1 + tax_rate) if tax_rate > -1 else 0)
            set_number(sheet, f"I{row}", discount)
            set_formula(sheet, f"J{row}", f"=E{row}*G{row}*I{row}", discounted)
            set_text(sheet, f"K{row}", item.get("remark"))

        rates = sorted(rates or [0.13], reverse=True)
        set_text(sheet, "J16", "增值税税率")
        set_number(sheet, "K16", rates[0])
        if len(rates) > 1:
            set_text(sheet, "J17", "增值税税率")
            set_number(sheet, "K17", rates[1])
        else:
            clear_cell(sheet, "J17")
            clear_cell(sheet, "K17")
        set_formula(sheet, "H15", "=SUM(J11:J14)", discounted_total)
        set_formula(sheet, "D15", "=H15", discounted_total)
        set_formula(sheet, "K18", "=H15-K19", net_total)
        set_formula(sheet, "K19", "=SUM(J11:J14)-K18", tax_total)
        set_formula(sheet, "K20", "=H15", discounted_total)
        notes = [str(note).strip() for note in (payload.get("notes") or []) if str(note).strip()][:6]
        for index in range(6):
            set_text(sheet, f"C{16 + index}", f"{index + 1}、{notes[index]}" if index < len(notes) else "")

        updated = ET.tostring(sheet, encoding="utf-8", xml_declaration=True)
        with ZipFile(output, "w", ZIP_DEFLATED) as target:
            for entry in source.infolist():
                target.writestr(entry, updated if entry.filename == "xl/worksheets/sheet1.xml" else source.read(entry.filename))


if __name__ == "__main__":
    template, payload_path, output = sys.argv[1:]
    generate(Path(template), json.loads(Path(payload_path).read_text(encoding="utf-8")), Path(output))
