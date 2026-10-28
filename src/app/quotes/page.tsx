"use client";

import { ArrowLeft, Calculator, Download, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./page.module.css";

type QuoteItem = { name: string; description: string; quantity: string; unit: string; unitPrice: string; taxRate: string; discount: string; remark: string };

const softwarePackages = [
  ["开源版 · 单机订阅 / 年", "开源版单机订阅授权", 0], ["开源版 · 单机买断", "开源版单机永久授权", 0],
  ["标准版 · 单机订阅 / 年", "标准版单机订阅授权", 40000], ["标准版 · 单机买断", "标准版单机永久授权", 86000],
  ["专业版 · 单机订阅 / 年", "专业版单机订阅授权", 70000], ["专业版 · 单机买断", "专业版单机永久授权", 170000],
  ["专业版 · 集群订阅 / 年", "专业版集群订阅授权", 160000], ["专业版 · 集群买断", "专业版集群永久授权", 360000],
  ["旗舰版 · 单机订阅 / 年", "旗舰版单机订阅授权", 100000], ["旗舰版 · 单机买断", "旗舰版单机永久授权", 300000],
  ["旗舰版 · 集群订阅 / 年", "旗舰版集群订阅授权", 240000], ["旗舰版 · 集群买断", "旗舰版集群永久授权", 560000],
] as const;
const servicePackages = [["免费服务", "首年赠送 / 自主升级支持", 0], ["基础服务", "基础技术支持服务", 30000], ["进阶服务", "进阶技术支持服务", 60000], ["旗舰服务", "高级技术支持服务", 90000]] as const;
const blankItem = (): QuoteItem => ({ name: "", description: "", quantity: "1", unit: "套", unitPrice: "", taxRate: "0.13", discount: "1", remark: "" });
const today = new Date().toISOString().slice(0, 10);
const inThirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

function money(value: number) { return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function dateText(value: string) { if (!value) return "待填写"; const [y, m, d] = value.split("-"); return `${y}/${m}/${d}`; }

export default function QuotesPage() {
  const [seller, setSeller] = useState({ name: "广州环际云计算有限公司", address: "杭州市余杭区五常街道阿里巴巴数字生态创新园6幢W7四楼405（西7入口）", phone: "19032009190", phoneVisible: true, email: "", emailVisible: false, creditCode: "91330110MA7LDJDX4M", creditCodeVisible: false, bankName: "招商银行杭州分行杭州高教路支行", bankNameVisible: false, bankAccount: "571917643710806", bankAccountVisible: false });
  const [customer, setCustomer] = useState({ name: "", contact: "", phone: "", owner: "", quoteDate: today, validUntil: inThirtyDays });
  const [software, setSoftware] = useState("");
  const [service, setService] = useState("");
  const [packageDiscount, setPackageDiscount] = useState("1");
  const [items, setItems] = useState<QuoteItem[]>([blankItem()]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const totals = useMemo(() => items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0; const price = Number(item.unitPrice) || 0; const discount = Math.min(1, Math.max(0, Number(item.discount) || 0));
    const gross = qty * price; const net = gross / (1 + (Number(item.taxRate) || 0)); const total = gross * discount;
    acc.gross += gross; acc.net += net * discount; acc.total += total; acc.saved += gross - total; return acc;
  }, { gross: 0, net: 0, total: 0, saved: 0 }), [items]);

  function updateItem(index: number, key: keyof QuoteItem, value: string) { setItems((current) => current.map((item, i) => i === index ? { ...item, [key]: value } : item)); }
  function applyPackages() {
    const selected: QuoteItem[] = [];
    if (software) { const p = softwarePackages.find(([name]) => name === software); if (p) { const users = software.includes("旗舰") ? "不限用户" : software.includes("专业") ? "1000用户" : "100用户"; const license = software.includes("买断") ? "单个生产节点永久商用授权" : "单个生产节点按年订阅授权"; selected.push({ ...blankItem(), name: `FastGPT ${p[0]}`, description: `${p[1]}；${users}；${license}`, unit: software.includes("订阅") ? "年" : "套", unitPrice: String(p[2]), taxRate: "0.13", discount: packageDiscount }); } }
    if (service) { const p = servicePackages.find(([name]) => name === service); if (p) selected.push({ ...blankItem(), name: `技术支持服务-${p[0]}`, description: p[1], unit: "年", unitPrice: String(p[2]), taxRate: "0.06", discount: packageDiscount, remark: "服务周期内有效" }); }
    if (selected.length) setItems(selected); else setStatus("请先选择软件或技术服务套餐");
  }
  async function generate() {
    const missing = !seller.name || !seller.address || (seller.phoneVisible && !seller.phone) || !customer.name || !customer.contact || !customer.phone || !customer.owner || !customer.quoteDate || !customer.validUntil;
    const validItems = items.filter((item) => item.name.trim() && Number(item.quantity) > 0 && item.unitPrice !== "");
    if (missing || !validItems.length) { setStatus(missing ? "请补齐报价方、客户和负责人信息" : "请至少填写一项有效报价明细"); return; }
    setSaving(true); setStatus("正在生成 Excel…");
    try {
      const response = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerName: seller.name, sellerAddress: seller.address, sellerPhone: seller.phone, sellerPhoneVisible: seller.phoneVisible, sellerEmail: seller.email, sellerEmailVisible: seller.emailVisible, sellerCreditCode: seller.creditCode, sellerCreditCodeVisible: seller.creditCodeVisible, sellerBankName: seller.bankName, sellerBankNameVisible: seller.bankNameVisible, sellerBankAccount: seller.bankAccount, sellerBankAccountVisible: seller.bankAccountVisible, customerName: customer.name, customerContact: customer.contact, customerPhone: customer.phone, quoteDate: customer.quoteDate, validUntil: customer.validUntil, owner: customer.owner, items: validItems, notes: ["以上报价软件产品按明细税率开具增值税发票。", ...notes.split("\n").map((line) => line.trim()).filter(Boolean)] }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "生成失败"); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `产品报价单-${customer.name}.xlsx`; link.click(); URL.revokeObjectURL(url); setStatus("报价单已生成并下载");
    } catch (error) { setStatus(error instanceof Error ? error.message : "生成失败，请稍后重试"); } finally { setSaving(false); }
  }

  return <main className={styles.page}>
    <header className={styles.header}><a href="/" className={styles.back}><ArrowLeft size={16} /> 返回工作台</a><div className={styles.brand}><span className={styles.mark}>S</span><div><strong>SalesKit</strong><small>报价工作区</small></div></div><span className={styles.template}><FileSpreadsheet size={14} /> 产品报价单 · Excel 模板</span></header>
    <div className={styles.layout}><section className={styles.workspace}><div className={styles.intro}><div><p className={styles.eyebrow}>QUOTE BUILDER / 2026</p><h1>制作一份可直接发送的报价单</h1><p>报价信息、税率、折扣和套餐明细会写入标准 Excel 模板，生成后可继续在 Excel 中编辑。</p></div><Calculator size={30} strokeWidth={1.5} /></div>
      <Section title="报价方信息" hint="以下公司信息已按合同资料预填，可修改；每项仍可单独选择是否展示在报价单中。"><div className={styles.grid}><Field label="公司名称" required value={seller.name} onChange={(v) => setSeller({ ...seller, name: v })} full /><Field label="公司地址" required value={seller.address} onChange={(v) => setSeller({ ...seller, address: v })} full /><Field label="公司电话" value={seller.phone} onChange={(v) => setSeller({ ...seller, phone: v })} displayable={{ checked: seller.phoneVisible, onChange: (v) => setSeller({ ...seller, phoneVisible: v }) }} /><Field label="公司邮箱" value={seller.email} onChange={(v) => setSeller({ ...seller, email: v })} displayable={{ checked: seller.emailVisible, onChange: (v) => setSeller({ ...seller, emailVisible: v }) }} /><Field label="统一社会信用代码" value={seller.creditCode} onChange={(v) => setSeller({ ...seller, creditCode: v })} displayable={{ checked: seller.creditCodeVisible, onChange: (v) => setSeller({ ...seller, creditCodeVisible: v }) }} /><Field label="开户银行" value={seller.bankName} onChange={(v) => setSeller({ ...seller, bankName: v })} displayable={{ checked: seller.bankNameVisible, onChange: (v) => setSeller({ ...seller, bankNameVisible: v }) }} /><Field label="银行账号" value={seller.bankAccount} onChange={(v) => setSeller({ ...seller, bankAccount: v })} displayable={{ checked: seller.bankAccountVisible, onChange: (v) => setSeller({ ...seller, bankAccountVisible: v }) }} /></div></Section>
      <Section title="客户与报价信息"><div className={styles.grid}><Field label="客户名称" required placeholder="例如：北京某某科技有限公司" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} full /><Field label="联系人" required value={customer.contact} onChange={(v) => setCustomer({ ...customer, contact: v })} /><Field label="联系方式" required value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} /><Field label="报价日期" required type="date" value={customer.quoteDate} onChange={(v) => setCustomer({ ...customer, quoteDate: v })} /><Field label="有效日期" required type="date" value={customer.validUntil} onChange={(v) => setCustomer({ ...customer, validUntil: v })} /><Field label="负责人" required value={customer.owner} onChange={(v) => setCustomer({ ...customer, owner: v })} /></div></Section>
      <Section title="标准价格套餐" hint="选择套餐后点击带入明细；价格尾数已统一取整。"><div className={styles.grid}><Select label="FastGPT 软件授权" value={software} onChange={setSoftware} options={[["", "不添加软件授权"], ...softwarePackages.map(([name, , price]) => [name, `${name} · ¥${money(price)}`])]} full /><Select label="技术支持服务" value={service} onChange={setService} options={[["", "不添加技术支持服务"], ...servicePackages.map(([name, , price]) => [name, `${name} · ¥${money(price)} / 年`])]} full /><Field label="套餐统一折扣率" value={packageDiscount} onChange={setPackageDiscount} type="number" min="0" max="1" step="0.01" /><button className={styles.outlineButton} type="button" onClick={applyPackages}><Plus size={14} /> 带入已选套餐</button></div></Section>
      <Section title="产品 / 服务报价" action={items.length < 4 ? <button className={styles.linkButton} type="button" onClick={() => setItems([...items, blankItem()])}><Plus size={14} /> 添加明细</button> : <span className={styles.limit}>模板最多支持 4 项</span>} hint="软件通常按 13% 税率，技术服务按 6% 税率；折扣率 0.80 表示 8 折，生成单据中展示为优惠/折扣后含税金额。"><div className={styles.items}>{items.map((item, index) => <div className={styles.item} key={index}><div className={styles.itemHead}><strong>明细 {index + 1}</strong>{items.length > 1 && <button className={styles.remove} type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} aria-label="删除明细"><Trash2 size={14} /></button>}</div><div className={styles.grid}><Field label="产品 / 服务名称" required value={item.name} onChange={(v) => updateItem(index, "name", v)} /><Field label="规格型号描述" value={item.description} onChange={(v) => updateItem(index, "description", v)} /><Field label="数量" required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(v) => updateItem(index, "quantity", v)} /><Field label="单位" value={item.unit} onChange={(v) => updateItem(index, "unit", v)} /><Field label="含税单价" required type="number" min="0" step="0.01" value={item.unitPrice} onChange={(v) => updateItem(index, "unitPrice", v)} /><Select label="税率" value={item.taxRate} onChange={(v) => updateItem(index, "taxRate", v)} options={[["0.13", "13%"], ["0.06", "6%"]]} /><Field label="折扣率" type="number" min="0" max="1" step="0.01" value={item.discount} onChange={(v) => updateItem(index, "discount", v)} /><Field label="备注" value={item.remark} onChange={(v) => updateItem(index, "remark", v)} /></div></div>)}</div></Section>
      <Section title="补充说明"><textarea className={styles.notes} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="每行一条，例如：交付周期、付款条件或其他约定" /></Section>
      <div className={styles.actions}><span className={status ? styles.status : styles.muted}>{status || "填写完成后即可生成标准报价单"}</span><button className={styles.primary} type="button" onClick={generate} disabled={saving}><Download size={15} /> {saving ? "生成中…" : "生成 Excel 报价单"}</button></div>
    </section><aside className={styles.preview}><div className={styles.previewHead}><span>报价预览</span><small>实时计算</small></div><div className={styles.previewCustomer}>{customer.name || "待填写客户名称"}<small>{customer.contact || "联系人待填写"} · {dateText(customer.quoteDate)}</small></div><div className={styles.summary}><div><span>价税合计</span><strong>¥ {money(totals.total)}</strong></div><div><span>不含税金额</span><b>¥ {money(totals.net)}</b></div><div><span>优惠金额</span><b className={totals.saved > 0 ? styles.discount : ""}>¥ {money(totals.saved)}</b></div></div><div className={styles.previewList}>{items.filter((item) => item.name).map((item, index) => <div key={index}><span>{item.name}</span><b>¥ {money((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (Number(item.discount) || 0))}</b></div>)}</div><div className={styles.previewNotes}><strong>报价说明</strong><p>软件产品按 13% 税率、技术服务按 6% 税率计算，最终以明细为准。</p><p>有效期至 {dateText(customer.validUntil)}。</p></div></aside></div>
  </main>;
}

function Section({ title, hint, action, children }: { title: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) { return <section className={styles.section}><div className={styles.sectionHead}><h2>{title}</h2>{action}</div>{hint && <p className={styles.hint}>{hint}</p>}{children}</section>; }
function Field({ label, value, onChange, placeholder = "", type = "text", required = false, full = false, min, max, step, displayable }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; full?: boolean; min?: string; max?: string; step?: string; displayable?: { checked: boolean; onChange: (checked: boolean) => void } }) { return <div className={`${styles.field} ${full ? styles.full : ""}`}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><label style={{ color: "#52635d", fontSize: 10, fontWeight: 700 }}>{label}{required && <em>*</em>}</label>{displayable && <label style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#76847d", fontSize: 9, fontWeight: 500, cursor: "pointer" }}><input style={{ width: 13, height: 13, minHeight: 13, margin: 0, padding: 0, accentColor: "#1c7b62" }} type="checkbox" checked={displayable.checked} onChange={(e) => displayable.onChange(e.target.checked)} />报价单展示</label>}</div><input aria-label={label} required={required} type={type} min={min} max={max} step={step} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>; }
function Select({ label, value, onChange, options, full = false }: { label: string; value: string; onChange: (value: string) => void; options: string[][]; full?: boolean }) { return <label className={`${styles.field} ${full ? styles.full : ""}`}><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}</select></label>; }
