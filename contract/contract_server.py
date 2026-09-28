"""Local FastGPT contract generator.

Run this file, then open http://127.0.0.1:4175/fastgpt-contract-assistant.html.
The template is read from the original Feishu download location and generated
documents are streamed to the browser without retaining completed contracts.
"""

from __future__ import annotations

import copy
import io
import json
import shutil
import subprocess
import tempfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, urlparse

from docx import Document


ROOT = Path(__file__).resolve().parent.parent
CONTRACT_DIR = ROOT / "contract"
ASSETS = ROOT / "contract-assets"
TEMPLATE = ASSETS / "FastGPT合同模版-v1.2.docx"
QUOTE_TEMPLATE = ASSETS / "20260527_报价单_7.xlsx"
QUOTE_GENERATOR = CONTRACT_DIR / "generate_quote.mjs"
NODE = Path(shutil.which("node") or "node")
DEFAULT_VALUES = {
    "partyBName": "广州环际云计算有限公司",
    "partyBCode": "91330110MA7LDJDX4M",
    "partyBLegal": "方海涛",
    "partyBPhone": "19032009190",
    "partyBAddress": "杭州市余杭区五常街道阿里巴巴数字生态创新园6幢W7四楼405（西7入口）。",
    "bankName": "广州环际云计算有限公司",
    "bankBranch": "招商银行杭州分行杭州高教路支行",
    "bankAccount": "571917643710806",
}
SERVICE_TIERS = {
    "none": {"name": "", "template_service": "", "price": 0, "period": "", "benefits": []},
    "free": {"name": "免费服务（首年赠送）", "template_service": "技术支持服务-基础版本", "price": 0, "period": "首年", "benefits": [("服务定价", "首年赠送"), ("服务周期", "首年"), ("SLA 服务标准", "工单支持，24h 内响应")]},
    "basic": {"name": "基础服务", "template_service": "技术支持服务-基础版本", "price": 30000, "period": "1 年", "benefits": [("服务定价", "人民币 30,000 元 / 年"), ("服务周期", "1 年"), ("配套测试环境", "1 套测试环境 License"), ("SLA 服务标准", "工作日 5×8 服务时段，4 小时内首次响应"), ("远程巡检", "每年 1 次远程环境巡检并出具巡检报告"), ("案例分享", "解决方案中心可获取 5 个工作流模板"), ("自主升级技术支撑", "支持甲方自主升级，提供技术咨询支撑"), ("月度直播培训活动", "可参与"), ("增值服务采购折扣", "服务期内增值服务享 9 折优惠")]},
    "advanced": {"name": "进阶服务", "template_service": "技术支持服务-进阶版本", "price": 60000, "period": "1 年", "benefits": [("服务定价", "人民币 60,000 元 / 年"), ("服务周期", "1 年"), ("配套测试环境", "2 套测试环境的 License"), ("SLA 服务标准", "工作日 5×12 服务时段（周一至周五 9:00-21:00），2 小时内首次响应"), ("远程巡检", "每年 2 次远程环境巡检并出具巡检报告"), ("案例分享", "解决方案中心内可以获取十个工作流模板"), ("线上专属培训", "每年 1 场定制线上专项培训"), ("官方升级远程协助", "每年 2 次人工远程协助版本升级"), ("自主升级技术支撑", "支持甲方自主升级，提供技术咨询支撑"), ("月度直播培训活动", "可参与"), ("增值服务采购折扣", "服务期内采购专项培训、定制开发、搭建人天等增值服务，享受 8 折优惠")]},
    "flagship": {"name": "旗舰服务", "template_service": "技术支持服务-高级版本", "price": 90000, "period": "1 年", "benefits": [("服务定价", "人民币 90,000 元 / 年"), ("服务周期", "1 年"), ("配套测试环境", "3 套测试环境 License"), ("SLA 服务标准", "7×12 服务时段，1 小时内首次响应"), ("远程巡检", "每年 4 次远程环境巡检并出具巡检报告"), ("案例分享", "解决方案中心内全部工作流模板"), ("线上专属培训", "每年 3 场定制线上专项培训"), ("官方升级远程协助", "每年 4 次人工远程协助版本升级"), ("自主升级技术支撑", "支持甲方自主升级，提供技术咨询支撑"), ("月度直播培训活动", "可参与"), ("增值服务采购折扣", "服务期内增值服务享 7 折优惠")]},
}


def value(data: dict, key: str) -> str:
    return str(data.get(key) or DEFAULT_VALUES.get(key) or "").strip()


def service_tier(data: dict) -> dict:
    return SERVICE_TIERS.get(value(data, "serviceTier"), SERVICE_TIERS["none"])


def copy_run_style(source, target) -> None:
    if source._r.rPr is not None:
        target._r.get_or_add_rPr().append(copy.deepcopy(source._r.rPr))


def append_value(paragraph, text: str) -> None:
    if not text:
        return
    run = paragraph.add_run(text)
    if paragraph.runs:
        copy_run_style(paragraph.runs[0], run)


def replace_underlined_runs(paragraph, values: list[str]) -> None:
    slots = [run for run in paragraph.runs if run.underline]
    for slot, text in zip(slots, values):
        slot.text = text


def set_checked(paragraph, selected: bool) -> None:
    if not selected:
        return
    for run in paragraph.runs:
        if "□" in run.text:
            run.text = run.text.replace("□", "☑", 1)
            return


def date_parts(raw: str) -> list[str]:
    if not raw or len(raw.split("-")) != 3:
        return ["", "", ""]
    year, month, day = raw.split("-")
    return [year, str(int(month)), str(int(day))]


def date_cn(raw: str) -> str:
    parts = date_parts(raw)
    return f"{parts[0]}年{parts[1]}月{parts[2]}日" if all(parts) else ""


def money(value_string: str) -> str:
    try:
        return f"{float(value_string):,.2f}"
    except ValueError:
        return ""


def money_cn(amount: float) -> str:
    digits = "零壹贰叁肆伍陆柒捌玖"
    units = ["", "拾", "佰", "仟"]
    groups = ["", "万", "亿", "兆"]
    cents = round(amount * 100)
    integer, decimal = divmod(cents, 100)
    if integer == 0:
        return "零元整"
    result = ""
    group_index = 0
    while integer:
        group = integer % 10000
        group_text = ""
        was_zero = False
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
    suffix = (digits[jiao] + "角" if jiao else "") + (digits[fen] + "分" if fen else "")
    return result + "元" + suffix


def set_cell(cell, text: str) -> None:
    paragraph = cell.paragraphs[0]
    if paragraph.runs:
        paragraph.runs[0].text = text
        for run in paragraph.runs[1:]:
            run.text = ""
    else:
        paragraph.add_run(text)


def term_text(data: dict) -> str:
    term_type = value(data, "termType") or "fixed"
    start, end = date_cn(value(data, "serviceStart")), date_cn(value(data, "serviceEnd"))
    if term_type == "fixed":
        return f"自{start}至{end}" if start and end else ""
    if term_type == "warranty":
        return f"自本合同签署之日起至项目质保期届满（最迟不超过{end}）" if end else "自本合同签署之日起至项目质保期届满"
    if term_type == "acceptance":
        return f"自本合同签署之日起至项目验收合格之日止（最迟不超过{end}）" if end else "自本合同签署之日起至项目验收合格之日止"
    return value(data, "otherTerm")


def edition_template_text(edition: str) -> str:
    return edition.replace(" ", "")


def fill_template(data: dict) -> bytes:
    document = Document(TEMPLATE)
    paragraphs = document.paragraphs
    p = lambda number: paragraphs[number - 1]

    # Cover page and party information.
    append_value(p(1), value(data, "contractNo"))
    append_value(p(15), value(data, "partyAName"))
    append_value(p(16), value(data, "partyBName"))
    append_value(p(18), value(data, "signPlace"))
    append_value(p(19), date_cn(value(data, "signDate")))
    for number, fields in {
        21: [value(data, "partyAName")], 22: [value(data, "partyACode")], 23: [value(data, "partyALegal")],
        24: [value(data, "partyAAddress")], 25: [value(data, "partyAPhone")], 27: [value(data, "partyBName")],
        28: [value(data, "partyBCode")], 29: [value(data, "partyBLegal")], 30: [value(data, "partyBAddress")],
        31: [value(data, "partyBPhone")], 33: [value(data, "projectName")],
    }.items():
        replace_underlined_runs(p(number), fields)

    # Product and service choices.
    edition = edition_template_text(value(data, "edition"))
    for number in range(44, 50):
        set_checked(p(number), edition in p(number).text.replace(" ", ""))
    tier = service_tier(data)
    services = set(data.get("services") or [])
    if tier["template_service"]:
        services.add(tier["template_service"])
    service_names = {
        52: "技术支持服务-基础版本", 53: "技术支持服务-进阶版本", 54: "技术支持服务-高级版本",
        55: "软件定制开发", 56: "业务场景实现", 57: "AI技术培训",
    }
    for number, name in service_names.items():
        set_checked(p(number), name in services)

    # Term, delivery and acceptance fields.
    term_type = value(data, "termType") or "fixed"
    if term_type == "fixed":
        set_checked(p(63), True)
        replace_underlined_runs(p(63), date_parts(value(data, "serviceStart")) + date_parts(value(data, "serviceEnd")))
    elif term_type == "warranty":
        set_checked(p(64), True)
        replace_underlined_runs(p(64), date_parts(value(data, "serviceEnd")))
    elif term_type == "acceptance":
        set_checked(p(65), True)
        replace_underlined_runs(p(65), date_parts(value(data, "serviceEnd")))
    else:
        set_checked(p(66), True)
        replace_underlined_runs(p(66), [term_text(data)])
    delivery = value(data, "deliveryMode")
    set_checked(p(68), delivery == "甲方指定地点")
    if delivery == "甲方指定地点":
        replace_underlined_runs(p(68), [value(data, "servicePlace")])
    set_checked(p(69), delivery == "远程交付服务")
    set_checked(p(70), delivery == "混合方式")
    replace_underlined_runs(p(72), ["以合同第二条第3款约定的软件功能描述及技术服务内容为依据"])
    replace_underlined_runs(p(74), [value(data, "acceptancePlace") or value(data, "servicePlace")])
    for channel, text in (("工单", "工单"), ("邮件", "邮件"), ("电话", "电话"), ("远程会议", "远程会议")):
        if channel in value(data, "supportChannels"):
            set_checked(p(80), text in p(80).text)
    replace_underlined_runs(p(85), [value(data, "supportOwner"), value(data, "supportPhone")])

    # Commercial information and bank data.
    software_price = float(value(data, "softwarePrice") or 0)
    service_price = float(value(data, "servicePrice") or tier["price"])
    total = software_price + service_price
    replace_underlined_runs(p(87), [money_cn(total).removesuffix("元整").removesuffix("元"), money(str(total))])
    replace_underlined_runs(p(89), [value(data, "paymentTerms")])
    invoice_type = value(data, "invoiceType")
    set_checked(p(93), invoice_type == "增值税专用发票")
    set_checked(p(94), invoice_type == "增值税普通发票")
    replace_underlined_runs(p(96), [value(data, "bankName")])
    replace_underlined_runs(p(97), [value(data, "bankBranch")])
    replace_underlined_runs(p(98), [value(data, "bankAccount")])
    replace_underlined_runs(p(99), [value(data, "partyBCode")])
    for number, field in {101: "invoiceCompany", 102: "invoiceAddress", 103: "invoicePhone", 104: "invoiceTaxCode", 105: "invoiceBank", 106: "invoiceAccount"}.items():
        replace_underlined_runs(p(number), [value(data, field)])

    # Contacts.
    replace_underlined_runs(p(113), [value(data, "partyAContact"), value(data, "partyAContactPhone"), value(data, "partyAEmail")])
    replace_underlined_runs(p(119), [value(data, "partyBContact"), value(data, "partyBContactPhone"), value(data, "partyBEmail")])

    # Appendix one pricing table.
    quote = document.tables[1]
    set_cell(quote.cell(1, 1), edition or "FastGPT")
    set_cell(quote.cell(1, 4), value(data, "quantity") or "1")
    set_cell(quote.cell(1, 5), "13%" if "买断" in edition else "6%")
    set_cell(quote.cell(1, 6), money(str(software_price)))
    if tier["name"]:
        set_cell(quote.cell(4, 1), tier["name"])
        set_cell(quote.cell(4, 2), f"{tier['period']}；{tier['benefits'][3][1] if len(tier['benefits']) > 3 else ''}")
        set_cell(quote.cell(4, 4), "1")
        set_cell(quote.cell(4, 6), money(str(service_price)))
    else:
        for cell in quote.rows[4].cells:
            set_cell(cell, "")
    for column in range(7):
        set_cell(quote.cell(7, column), f"合同总价：人民币 {money_cn(total)}，小写 ¥ {money(str(total))}。")

    # Appendix two functional scope table.
    scope_rows = [
        {"module": label, "description": description, "deliverable": tier["name"], "acceptance": "服务期内有效"}
        for label, description in tier["benefits"]
    ] + (data.get("scopeRows") or [])
    scope_table = document.tables[2]
    for row in scope_table.rows[1:]:
        for cell in row.cells:
            set_cell(cell, "")
    for index, row_data in enumerate(scope_rows, start=1):
        if index >= len(scope_table.rows):
            scope_table.add_row()
        for column, key in enumerate(("module", "description", "deliverable", "acceptance")):
            set_cell(scope_table.cell(index, column), value(row_data, key))

    # Appendix three acceptance form.
    acceptance = document.tables[3]
    set_cell(acceptance.cell(0, 4), value(data, "contractNo"))
    set_cell(acceptance.cell(1, 1), value(data, "partyAName"))
    set_cell(acceptance.cell(1, 4), value(data, "partyAContact"))
    set_cell(acceptance.cell(2, 1), value(data, "quantity") or "1")
    set_cell(acceptance.cell(2, 4), date_cn(value(data, "signDate")))
    set_cell(acceptance.cell(3, 1), date_cn(value(data, "serviceStart")))
    set_cell(acceptance.cell(3, 4), date_cn(value(data, "serviceEnd")))
    set_cell(acceptance.cell(4, 1), value(data, "partyBName"))
    set_cell(acceptance.cell(4, 4), f"{value(data, 'partyBContact')} {value(data, 'partyBContactPhone')}")
    set_cell(acceptance.cell(5, 1), money(str(total)))
    set_cell(acceptance.cell(5, 4), value(data, "servicePlace"))
    for row in acceptance.rows[8:15]:
        seen = set()
        for cell in row.cells:
            if id(cell._tc) not in seen:
                set_cell(cell, "")
                seen.add(id(cell._tc))
    accepted_items = [(edition or "FastGPT", value(data, "scope"), value(data, "quantity") or "1", "软件产品")]
    if tier["name"]:
        accepted_items.append((tier["name"], "；".join(description for _, description in tier["benefits"][:3]), "1", "技术支持服务"))
    for row_index, (name, content, quantity, note) in enumerate(accepted_items, start=8):
        set_cell(acceptance.cell(row_index, 0), str(row_index - 7))
        set_cell(acceptance.cell(row_index, 1), name)
        set_cell(acceptance.cell(row_index, 2), content)
        set_cell(acceptance.cell(row_index, 5), quantity)
        set_cell(acceptance.cell(row_index, 6), note)

    output = io.BytesIO()
    document.save(output)
    return output.getvalue()


def fill_quote_template(data: dict) -> bytes:
    if not QUOTE_TEMPLATE.exists():
        raise FileNotFoundError(f"未找到报价单模板：{QUOTE_TEMPLATE}")
    if not QUOTE_GENERATOR.exists() or not NODE.exists():
        raise FileNotFoundError("报价单生成组件未就绪")
    with tempfile.TemporaryDirectory(prefix="fastgpt-quote-") as temp_dir:
        folder = Path(temp_dir)
        payload_path = folder / "payload.json"
        output_path = folder / "产品报价单.xlsx"
        payload_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run(
            [str(NODE), str(QUOTE_GENERATOR), str(QUOTE_TEMPLATE), str(payload_path), str(output_path)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=45,
        )
        if result.returncode != 0 or not output_path.exists():
            detail = (result.stderr or result.stdout or "未知错误").strip()
            raise RuntimeError(f"报价单生成失败：{detail}")
        return output_path.read_bytes()


class ContractHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        endpoint = urlparse(self.path).path
        if endpoint not in {"/api/generate", "/api/generate-quote"}:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if endpoint == "/api/generate-quote":
                file_content = fill_quote_template(payload)
                filename = f"产品报价单-{value(payload, 'customerName') or '未命名客户'}.xlsx"
                content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            else:
                file_content = fill_template(payload)
                filename = f"FastGPT合同-{value(payload, 'contractNo') or '未编号'}.docx"
                content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Disposition", f"attachment; filename*=UTF-8''{quote(filename)}")
            self.send_header("Content-Length", str(len(file_content)))
            self.end_headers()
            self.wfile.write(file_content)
        except Exception as error:
            self.send_response(HTTPStatus.BAD_REQUEST)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(error)}, ensure_ascii=False).encode("utf-8"))


if __name__ == "__main__":
    if not TEMPLATE.exists():
        raise SystemExit(f"未找到合同模板：{TEMPLATE}")
    if not QUOTE_TEMPLATE.exists():
        raise SystemExit(f"未找到报价单模板：{QUOTE_TEMPLATE}")
    print("合同助手已启动：http://127.0.0.1:4175/fastgpt-contract-assistant.html")
    ThreadingHTTPServer(("127.0.0.1", 4175), ContractHandler).serve_forever()
