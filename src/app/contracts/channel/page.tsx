"use client";

import { ArrowLeft, ArrowRight, Check, Clipboard, Download, FileCheck2, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { parsePartyInfo, partyInfoTemplate } from "@/lib/party-info";
import styles from "./page.module.css";

type FormState = Record<string, string>;

const today = new Date().toISOString().slice(0, 10);
const nextYear = `${new Date().getFullYear() + 1}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
const steps = ["协议基本信息", "双方主体信息", "项目合作确认", "检查并生成"];
const platform = {
  partyAName: "广州环际云计算有限公司",
  partyACode: "91330110MA7LDJDX4M",
  partyALegal: "方海涛",
  partyAAddress: "杭州市余杭区五常街道阿里巴巴数字生态创新园6幢W7四楼405",
  partyAContact: "方海涛",
  partyAPhone: "19032009190",
  partyAEmail: "",
};

const initial: FormState = {
  productName: "FastGPT", ...platform, partyBName: "", signPlace: "", signDate: today,
  termYears: "1", agreementStart: today, agreementEnd: nextYear, authorizedScope: "", authorizedProduct: "FastGPT 软件及相关技术服务",
  partyBCode: "", partyBAddress: "", partyBLegal: "", partyBContact: "", partyBPhone: "", partyBEmail: "",
  clientName: "", projectName: "", clientDepartment: "", registrationNo: "", confirmDate: today, protectionEnd: "",
  projectProduct: "FastGPT 软件及相关技术服务", projectScope: "", includedBase: "甲方产品及服务不含税实际回款", excludedBase: "第三方软硬件、云资源、模型/API、外采及差旅驻场费用", taxRate: "13%",
  milestones: "需求确认 → 方案评审 → 项目交付 → 验收", deliverables: "需求记录、方案文件、实施配置、培训与验收资料", acceptance: "客户项目负责人；按确认范围完成并稳定运行",
  renewalDetail: "", specialTerms: "",
};

function get(form: FormState, key: string) { return String(form[key] ?? ""); }
function Field({ form, set, name, label, required = false, placeholder = "" }: { form: FormState; set: (name: string, value: string) => void; name: string; label: string; required?: boolean; placeholder?: string }) {
  return <label className={styles.field}><span>{label}{required && <em>*</em>}</span><input value={get(form, name)} placeholder={placeholder} onChange={(event) => set(name, event.target.value)} /></label>;
}
function Area({ form, set, name, label, required = false, placeholder = "" }: { form: FormState; set: (name: string, value: string) => void; name: string; label: string; required?: boolean; placeholder?: string }) {
  return <label className={`${styles.field} ${styles.full}`}><span>{label}{required && <em>*</em>}</span><textarea value={get(form, name)} placeholder={placeholder} onChange={(event) => set(name, event.target.value)} /></label>;
}

export default function ChannelContractPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [partyDraft, setPartyDraft] = useState("");
  const set = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));
  const missing = useMemo(() => {
    const fields = step === 0 ? ["partyBName", "productName", "signPlace", "signDate", "agreementStart", "agreementEnd", "authorizedScope"]
      : step === 1 ? ["partyBCode", "partyBAddress", "partyBLegal", "partyBContact", "partyBPhone", "partyBEmail"]
      : step === 2 ? ["clientName", "projectName", "clientDepartment", "registrationNo", "confirmDate", "protectionEnd", "projectScope", "milestones", "deliverables", "acceptance"] : [];
    return fields.filter((name) => !get(form, name).trim());
  }, [form, step]);
  function next() { if (missing.length) { setMessage("请补齐当前步骤的必填信息"); return; } setMessage(""); setStep((current) => Math.min(3, current + 1)); }
  function back() { setMessage(""); setStep((current) => Math.max(0, current - 1)); }
  function fillPartner() {
    const parsed = parsePartyInfo(partyDraft);
    const mapped = { partyBName: parsed.name, partyBCode: parsed.code, partyBAddress: parsed.address, partyBLegal: parsed.legal, partyBContact: parsed.contact, partyBPhone: parsed.phone, partyBEmail: parsed.email };
    const count = Object.values(mapped).filter(Boolean).length;
    setForm((current) => ({ ...current, ...mapped }));
    setMessage(count ? `已解析并填入 ${count} 项乙方信息，请核对后继续` : "未识别到字段，请按复制文案中的“字段：内容”格式粘贴");
  }
  async function copyTemplate() {
    await navigator.clipboard?.writeText(partyInfoTemplate);
    setMessage("信息收集文案已复制");
  }
  async function generate() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/contracts/channel/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "合同生成失败"); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `渠道服务商合作协议-${get(form, "partyBName") || "未命名渠道商"}.docx`; link.click(); URL.revokeObjectURL(url);
      setMessage("协议已生成并下载，合同台账已同步");
    } catch (error) { setMessage(error instanceof Error ? error.message : "合同生成失败"); } finally { setSaving(false); }
  }
  return <main className={styles.page}>
    <header className={styles.header}><a href="/contracts/new" className={styles.back}><ArrowLeft size={16} /> 合同类型</a><div className={styles.brand}><span>S</span><strong>SalesKit</strong></div></header>
    <div className={styles.layout}><section className={styles.workspace}>
      <div className={styles.heading}><div><div className={styles.eyebrow}>渠道合作协议</div><h1>自动化做合同</h1><p>填写一次，生成可签署的渠道服务商合作协议 Word 文件。</p></div><span className={styles.badge}>真实模板</span></div>
      <div className={styles.stepper}>{steps.map((label, index) => <button type="button" key={label} className={`${styles.step} ${index === step ? styles.active : ""} ${index < step ? styles.done : ""}`} onClick={() => index < step && setStep(index)}><span>{index < step ? <Check size={13} /> : index + 1}</span>{label}</button>)}</div>
      {step === 0 && <div className={styles.panel}><h2>协议基本信息</h2><p className={styles.hint}>甲方信息已按销售合同固定带入，乙方和协议项目内容由你填写。</p><div className={styles.grid}><Field form={form} set={set} name="productName" label="产品 / 平台名称" required /><Field form={form} set={set} name="partyAName" label="甲方名称" required /><Field form={form} set={set} name="partyBName" label="乙方名称" required /><Field form={form} set={set} name="signPlace" label="签约地点" required placeholder="例如：杭州市" /><Field form={form} set={set} name="signDate" label="签署日期" required /><Field form={form} set={set} name="termYears" label="协议有效期（年）" required /><Field form={form} set={set} name="agreementStart" label="协议开始日期" required /><Field form={form} set={set} name="agreementEnd" label="协议结束日期" required /><Field form={form} set={set} name="authorizedScope" label="授权区域 / 客户范围" required placeholder="例如：华东区域制造业客户" /><Field form={form} set={set} name="authorizedProduct" label="授权产品 / 服务" required /></div></div>}
      {step === 1 && <div className={styles.panel}><h2>双方主体信息</h2><p className={styles.hint}>甲方信息已固定；乙方可以直接粘贴对方回复，自动解析后再核对。</p><PartyInfoAssist draft={partyDraft} setDraft={setPartyDraft} onCopy={copyTemplate} onFill={fillPartner} /><div className={styles.fixedParty}><strong>甲方（平台方）</strong><span>{platform.partyAName} · {platform.partyACode} · {platform.partyAAddress}</span></div><h3>乙方（渠道商 / 服务商）</h3><div className={styles.grid}><Field form={form} set={set} name="partyBCode" label="统一社会信用代码" required /><Field form={form} set={set} name="partyBLegal" label="授权代表" required /><Field form={form} set={set} name="partyBAddress" label="公司地址" required /><Field form={form} set={set} name="partyBContact" label="联系人" required /><Field form={form} set={set} name="partyBPhone" label="联系电话" required /><Field form={form} set={set} name="partyBEmail" label="电子邮箱" required /></div></div>}
      {step === 2 && <div className={styles.panel}><h2>项目合作确认</h2><p className={styles.hint}>只收集项目执行和验收信息。交易模式、渠道档位、乙方核心职责沿用协议模板，不重复填写。</p><div className={styles.templateNotice}><FileCheck2 size={16} /><span>附件一、附件二中的交易模式、档位和职责选项将保留模板原样。</span></div><div className={styles.grid}><Field form={form} set={set} name="clientName" label="客户全称" required /><Field form={form} set={set} name="projectName" label="项目名称" required /><Field form={form} set={set} name="clientDepartment" label="客户主体 / 部门" required /><Field form={form} set={set} name="registrationNo" label="报备编号" required /><Field form={form} set={set} name="confirmDate" label="确认日期" required /><Field form={form} set={set} name="protectionEnd" label="保护期至" required /><Field form={form} set={set} name="projectProduct" label="项目产品 / 服务" /><Field form={form} set={set} name="projectScope" label="项目区域 / 客户范围" required /><Field form={form} set={set} name="taxRate" label="增值税率" /><Field form={form} set={set} name="includedBase" label="可分成基数·计入" /><Field form={form} set={set} name="excludedBase" label="可分成基数·扣除" /></div><div className={styles.grid}><Area form={form} set={set} name="milestones" label="里程碑" required /><Area form={form} set={set} name="deliverables" label="成果清单" required /><Area form={form} set={set} name="acceptance" label="验收人及标准" required /><Field form={form} set={set} name="renewalDetail" label="续费 / 扩容约定" /><Area form={form} set={set} name="specialTerms" label="特殊约定" /></div></div>}
      {step === 3 && <div className={styles.panel}><h2>检查并生成</h2><p className={styles.hint}>确认关键信息无误后，点击生成协议。模板固定条款会原样保留。</p><div className={styles.review}><Review label="协议双方" value={`${get(form, "partyAName")} / ${get(form, "partyBName")}`} /><Review label="授权范围" value={`${get(form, "authorizedScope")} · ${get(form, "authorizedProduct")}`} /><Review label="项目" value={`${get(form, "clientName")} · ${get(form, "projectName")}`} /><Review label="交易与档位" value="沿用协议模板原样" /><Review label="协议期限" value={`${get(form, "agreementStart")} 至 ${get(form, "agreementEnd")}`} /><Review label="乙方核心职责" value="沿用附件模板原样" /></div><div className={styles.confirm}><FileCheck2 size={18} /><div><strong>将生成正式 Word 协议</strong><span>包含协议正文、附件一提点政策、附件二项目合作确认单、附件三职责清单和签署页。</span></div></div></div>}
      <div className={styles.actions}><button type="button" className={styles.secondary} onClick={back} disabled={step === 0}><ArrowLeft size={15} /> 上一步</button>{step < 3 ? <button type="button" className={styles.primary} onClick={next}>下一步 <ArrowRight size={15} /></button> : <button type="button" className={styles.primary} onClick={generate} disabled={saving}>{saving ? <LoaderCircle size={15} className={styles.spin} /> : <Download size={15} />} {saving ? "生成中" : "生成并下载协议"}</button>}</div>
      {message && <div className={styles.message}>{message}</div>}
    </section></div>
  </main>;
}

function PartyInfoAssist({ draft, setDraft, onCopy, onFill }: { draft: string; setDraft: (value: string) => void; onCopy: () => void; onFill: () => void }) {
  return <div className={styles.assist}><div className={styles.assistHead}><div><strong>对方信息收集助手</strong><span>复制文案发给渠道商，收到回复后粘贴并自动解析。</span></div><button type="button" className={styles.copy} onClick={onCopy}><Clipboard size={14} /> 一键复制文案</button></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={partyInfoTemplate} /><button type="button" className={styles.parse} onClick={onFill}>解析并填入乙方信息</button></div>;
}
function Review({ label, value }: { label: string; value: string }) { return <div className={styles.reviewItem}><span>{label}</span><strong>{value || "未填写"}</strong></div>; }
