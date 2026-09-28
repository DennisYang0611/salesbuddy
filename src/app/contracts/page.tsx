"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Clipboard,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { parsePartyInfo, partyInfoTemplate } from "@/lib/party-info";
import styles from "./page.module.css";

type ContractForm = Record<string, string | string[] | ScopeRow[]>;
type ScopeRow = {
  module: string;
  description: string;
  deliverable: string;
  acceptance: string;
};
type SavedContract = {
  id: number;
  contract_no: string;
  project_name: string;
  party_a_name: string;
  party_b_name: string;
  amount: string;
  status: string;
  created_at: string;
};

const steps = ["双方信息", "版本与价格", "服务与验收", "确认生成"];
const tiers = {
  none: { label: "暂不购买技术支持", price: 0, hint: "仅购买软件产品" },
  free: { label: "免费服务", price: 0, hint: "首年赠送 · 工单支持 24h" },
  basic: {
    label: "基础服务",
    price: 30000,
    hint: "1 套测试环境 · 5×8 / 4h 响应",
  },
  advanced: {
    label: "进阶服务",
    price: 60000,
    hint: "2 套测试环境 · 5×12 / 2h 响应",
  },
  flagship: {
    label: "旗舰服务",
    price: 90000,
    hint: "3 套测试环境 · 7×12 / 1h 响应",
  },
} as const;

const initial: ContractForm = {
  partyAName: "",
  partyACode: "",
  partyALegal: "",
  partyAPhone: "",
  partyAAddress: "",
  partyAContact: "",
  partyAContactPhone: "",
  partyAEmail: "",
  invoiceCompany: "",
  invoiceAddress: "",
  invoicePhone: "",
  invoiceTaxCode: "",
  invoiceBank: "",
  invoiceAccount: "",
  partyBName: "广州环际云计算有限公司",
  partyBCode: "91330110MA7LDJDX4M",
  partyBLegal: "方海涛",
  partyBPhone: "19032009190",
  partyBAddress: "杭州市余杭区五常街道阿里巴巴数字生态创新园6幢W7四楼405",
  partyBContact: "",
  partyBContactPhone: "",
  partyBEmail: "",
  contractNo: `FG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  signPlace: "",
  signDate: new Date().toISOString().slice(0, 10),
  projectName: "",
  edition: "标准版 FastGPT - 买断",
  quantity: "1",
  softwarePrice: "",
  serviceTier: "none",
  servicePrice: "0",
  paymentTerms:
    "合同签订后 5 个工作日内支付合同总价的 50%；项目验收合格后 5 个工作日内支付剩余 50%。",
  termType: "fixed",
  serviceStart: "",
  serviceEnd: "",
  servicePlace: "",
  deliveryMode: "远程交付服务",
  acceptancePlace: "",
  training: "",
  scope: "",
  warranty: "验收合格之日起一年",
  supportChannels: "工单、邮件、电话、远程会议",
  supportOwner: "",
  supportPhone: "",
  invoiceType: "增值税专用发票",
  bankName: "广州环际云计算有限公司",
  bankBranch: "招商银行杭州分行杭州高教路支行",
  bankAccount: "571917643710806",
  acceptanceRows: [],
};

const requiredByStep = [
  [
    "partyAName",
    "partyACode",
    "partyALegal",
    "partyAPhone",
    "partyAAddress",
    "partyAContact",
    "partyAContactPhone",
    "partyAEmail",
    "invoiceCompany",
    "invoiceAddress",
    "invoicePhone",
    "invoiceTaxCode",
    "invoiceBank",
    "invoiceAccount",
    "partyBContact",
    "partyBContactPhone",
    "partyBEmail",
  ],
  [
    "contractNo",
    "signPlace",
    "signDate",
    "projectName",
    "softwarePrice",
    "paymentTerms",
  ],
  ["servicePlace", "scope"],
];

function text(value: ContractForm, key: string) {
  return String(value[key] ?? "").trim();
}
function money(value: string) {
  return Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ContractsPage() {
  const [form, setForm] = useState<ContractForm>(initial);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [partyDraft, setPartyDraft] = useState("");
  const [records, setRecords] = useState<SavedContract[]>([]);
  const total = useMemo(
    () =>
      Number(text(form, "softwarePrice") || 0) +
      Number(text(form, "servicePrice") || 0),
    [form],
  );

  useEffect(() => {
    fetch("/api/contracts/list")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setRecords(data.contracts || []))
      .catch(() => undefined);
  }, []);

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function fillCustomerInfo() {
    const parsed = parsePartyInfo(partyDraft);
    const mapped: Record<string, string> = {
      partyAName: parsed.name,
      partyACode: parsed.code,
      partyALegal: parsed.legal,
      partyAAddress: parsed.address,
      partyAContact: parsed.contact,
      partyAContactPhone: parsed.phone,
      partyAPhone: parsed.phone,
      partyAEmail: parsed.email,
      invoiceCompany: parsed.invoiceCompany || parsed.name,
      invoiceAddress: parsed.invoiceAddress || parsed.address,
      invoicePhone: parsed.invoicePhone || parsed.phone,
      invoiceTaxCode: parsed.invoiceTaxCode || parsed.code,
      invoiceBank: parsed.invoiceBank,
      invoiceAccount: parsed.invoiceAccount,
    };
    const count = Object.values(mapped).filter(Boolean).length;
    setForm((current) => ({ ...current, ...mapped }));
    setToast(count ? `已解析并填入 ${count} 项甲方信息，请核对后继续` : "未识别到字段，请按复制文案中的“字段：内容”格式粘贴");
  }
  async function copyPartyTemplate() {
    await navigator.clipboard?.writeText(partyInfoTemplate);
    setToast("信息收集文案已复制");
  }
  function canAdvance() {
    return requiredByStep[step]?.every((key) => text(form, key)) ?? true;
  }
  function next() {
    if (!canAdvance()) {
      setToast("请先补齐当前步骤的必填字段");
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  }
  function applyTier(value: string) {
    const tier = tiers[value as keyof typeof tiers] || tiers.none;
    setForm((current) => ({
      ...current,
      serviceTier: value,
      servicePrice: String(tier.price),
    }));
  }
  function addScope() {
    const rows = (form.acceptanceRows as ScopeRow[]) || [];
    setForm((current) => ({
      ...current,
      acceptanceRows: [
        ...rows,
        { module: "", description: "", deliverable: "", acceptance: "" },
      ],
    }));
  }
  function updateScope(index: number, key: keyof ScopeRow, value: string) {
    const rows = [...((form.acceptanceRows as ScopeRow[]) || [])];
    rows[index] = { ...rows[index], [key]: value };
    setForm((current) => ({ ...current, acceptanceRows: rows }));
  }

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    if (!requiredByStep.flat().every((key) => text(form, key))) {
      setToast("请完成所有必填字段后再生成");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        services:
          text(form, "serviceTier") === "none"
            ? []
            : [`技术支持服务-${text(form, "serviceTier")}版本`],
        scopeRows: (form.acceptanceRows as ScopeRow[]).filter(
          (row) => row.module || row.description,
        ),
      };
      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "合同生成失败");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FastGPT合同-${text(form, "contractNo")}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      setToast("合同已生成并下载，记录已保存到合同台账");
      const list = await fetch("/api/contracts/list").then((r) => r.json());
      setRecords(list.contracts || []);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "合同生成失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <div className={styles.brandMark}>S</div>
          <div>
            <strong>SalesKit</strong>
            <span>合同生成工作区</span>
          </div>
        </div>
        <a href="/" className={styles.backLink}>
          <ArrowLeft size={15} /> 返回销售工作台
        </a>
      </header>
      <div className={styles.layout}>
        <section className={styles.workspace}>
          <div className={styles.workspaceTop}>
            <div>
              <p className={styles.eyebrow}>CONTRACT WORKFLOW</p>
              <h1>生成一份可签署的合同</h1>
              <p className={styles.subtitle}>
                基于 FastGPT v1.2
                模板，填写一次，自动写入合同正文、价格附件和项目验收单。
              </p>
            </div>
            <div className={styles.templateBadge}>
              <FileCheck2 size={16} /> v1.2 模板
            </div>
          </div>
          <div className={styles.stepper}>
            {steps.map((label, index) => (
              <button
                key={label}
                className={`${styles.step} ${index === step ? styles.stepActive : ""} ${index < step ? styles.stepDone : ""}`}
                onClick={() => index <= step && setStep(index)}
              >
                <span>{index < step ? <Check size={14} /> : index + 1}</span>
                {label}
              </button>
            ))}
          </div>
          <form onSubmit={generate}>
            {step === 0 && (
              <Step
                title="双方主体与联系人"
                hint="合同中的甲乙方信息、送达地址和项目负责人会同步写入正文。"
              >
                <PartyInfoAssist draft={partyDraft} setDraft={setPartyDraft} onCopy={copyPartyTemplate} onFill={fillCustomerInfo} />
                <div className={styles.sectionLabel}>甲方（客户）</div>
                <div className={styles.grid}>
                  <Field
                    label="公司全称"
                    required
                    value={text(form, "partyAName")}
                    placeholder="北京某某科技有限公司"
                    onChange={(v) => update("partyAName", v)}
                    full
                  />
                  <Field
                    label="统一社会信用代码"
                    required
                    value={text(form, "partyACode")}
                    placeholder="18 位统一社会信用代码"
                    onChange={(v) => update("partyACode", v)}
                    full
                  />
                  <Field
                    label="法定代表人"
                    required
                    value={text(form, "partyALegal")}
                    onChange={(v) => update("partyALegal", v)}
                  />
                  <Field
                    label="联系电话"
                    required
                    value={text(form, "partyAPhone")}
                    onChange={(v) => update("partyAPhone", v)}
                  />
                  <Field
                    label="合同送达/邮寄地址"
                    required
                    value={text(form, "partyAAddress")}
                    onChange={(v) => update("partyAAddress", v)}
                    full
                  />
                  <Field
                    label="项目负责人"
                    required
                    value={text(form, "partyAContact")}
                    onChange={(v) => update("partyAContact", v)}
                  />
                  <Field
                    label="负责人电话"
                    required
                    value={text(form, "partyAContactPhone")}
                    onChange={(v) => update("partyAContactPhone", v)}
                  />
                  <Field
                    label="负责人邮箱"
                    required
                    type="email"
                    value={text(form, "partyAEmail")}
                    onChange={(v) => update("partyAEmail", v)}
                  />
                </div>
                <div className={styles.sectionLabel}>甲方开票信息</div>
                <p className={styles.stepHint}>用于合同第 6.2.5 条，生成前请核对发票抬头、地址、税号和银行信息。</p>
                <div className={styles.grid}>
                  <Field label="甲方公司名称" required value={text(form, "invoiceCompany")} placeholder="与甲方主体一致" onChange={(v) => update("invoiceCompany", v)} full />
                  <Field label="开票地址" required value={text(form, "invoiceAddress")} placeholder="发票抬头对应注册地址" onChange={(v) => update("invoiceAddress", v)} full />
                  <Field label="开票电话" required value={text(form, "invoicePhone")} onChange={(v) => update("invoicePhone", v)} />
                  <Field label="纳税人识别号" required value={text(form, "invoiceTaxCode")} onChange={(v) => update("invoiceTaxCode", v)} />
                  <Field label="开户银行" required value={text(form, "invoiceBank")} onChange={(v) => update("invoiceBank", v)} />
                  <Field label="银行账号" required value={text(form, "invoiceAccount")} onChange={(v) => update("invoiceAccount", v)} />
                </div>
                <div className={styles.sectionLabel}>乙方（服务方）</div>
                <div className={styles.grid}>
                  <Field
                    label="公司全称"
                    required
                    value={text(form, "partyBName")}
                    onChange={(v) => update("partyBName", v)}
                    full
                  />
                  <Field
                    label="统一社会信用代码"
                    required
                    value={text(form, "partyBCode")}
                    onChange={(v) => update("partyBCode", v)}
                    full
                  />
                  <Field
                    label="法定代表人"
                    required
                    value={text(form, "partyBLegal")}
                    onChange={(v) => update("partyBLegal", v)}
                  />
                  <Field
                    label="联系电话"
                    required
                    value={text(form, "partyBPhone")}
                    onChange={(v) => update("partyBPhone", v)}
                  />
                  <Field
                    label="合同送达/邮寄地址"
                    required
                    value={text(form, "partyBAddress")}
                    onChange={(v) => update("partyBAddress", v)}
                    full
                  />
                  <Field
                    label="项目负责人"
                    required
                    value={text(form, "partyBContact")}
                    onChange={(v) => update("partyBContact", v)}
                  />
                  <Field
                    label="负责人电话"
                    required
                    value={text(form, "partyBContactPhone")}
                    onChange={(v) => update("partyBContactPhone", v)}
                  />
                  <Field
                    label="负责人邮箱"
                    required
                    type="email"
                    value={text(form, "partyBEmail")}
                    onChange={(v) => update("partyBEmail", v)}
                  />
                </div>
              </Step>
            )}
            {step === 1 && (
              <Step
                title="版本与合同价格"
                hint="软件金额、技术支持套餐和付款条件会同步到价格附件。"
              >
                <div className={styles.grid}>
                  <Field
                    label="合同编号"
                    required
                    value={text(form, "contractNo")}
                    onChange={(v) => update("contractNo", v)}
                  />
                  <Field
                    label="签约地点"
                    required
                    value={text(form, "signPlace")}
                    placeholder="北京市"
                    onChange={(v) => update("signPlace", v)}
                  />
                  <Field
                    label="签约日期"
                    required
                    type="date"
                    value={text(form, "signDate")}
                    onChange={(v) => update("signDate", v)}
                  />
                  <Field
                    label="项目名称"
                    required
                    value={text(form, "projectName")}
                    placeholder="FastGPT 私有化部署项目"
                    onChange={(v) => update("projectName", v)}
                  />
                  <Field
                    label="软件数量"
                    value={text(form, "quantity")}
                    type="number"
                    onChange={(v) => update("quantity", v)}
                  />
                  <Field
                    label="软件含税金额（元）"
                    required
                    value={text(form, "softwarePrice")}
                    type="number"
                    placeholder="0"
                    onChange={(v) => update("softwarePrice", v)}
                  />
                </div>
                <div className={styles.sectionLabel}>软件版本</div>
                <div className={styles.choiceGrid}>
                  {[
                    "标准版 FastGPT - 买断",
                    "标准版 FastGPT - 订阅",
                    "专业版 FastGPT - 买断",
                    "专业版 FastGPT - 订阅",
                    "旗舰版 FastGPT - 买断",
                    "旗舰版 FastGPT - 订阅",
                  ].map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`${styles.choice} ${text(form, "edition") === option ? styles.choiceActive : ""}`}
                      onClick={() => update("edition", option)}
                    >
                      {text(form, "edition") === option && <Check size={14} />}
                      {option}
                    </button>
                  ))}
                </div>
                <p className={styles.stepHint}>
                  授权规则会自动写入附件：标准版 100 用户、专业版 1000 用户、旗舰版不限用户；单个生产节点永久商用授权，测试环境 License 数量按服务套餐赠送。
                </p>
                <div className={styles.sectionLabel}>技术支持服务套餐</div>
                <div className={styles.tierGrid}>
                  {Object.entries(tiers).map(([key, tier]) => (
                    <button
                      type="button"
                      key={key}
                      className={`${styles.tier} ${text(form, "serviceTier") === key ? styles.tierActive : ""}`}
                      onClick={() => applyTier(key)}
                    >
                      <span>
                        <strong>{tier.label}</strong>
                        <small>{tier.hint}</small>
                      </span>
                      <b>
                        {tier.price
                          ? `¥${tier.price.toLocaleString()}`
                          : "免费"}
                      </b>
                    </button>
                  ))}
                </div>
                <div className={styles.totalBar}>
                  <span>预计合同总价</span>
                  <strong>¥ {money(String(total))}</strong>
                </div>
                <label className={styles.textareaField}>
                  <span>
                    付款条件 <em>*</em>
                  </span>
                  <textarea
                    required
                    value={text(form, "paymentTerms")}
                    onChange={(e) => update("paymentTerms", e.target.value)}
                  />
                </label>
              </Step>
            )}
            {step === 2 && (
              <Step
                title="交付、期限与验收"
                hint="这些内容将写入合同第三至第五条，以及附件二、附件三。"
              >
                <div className={styles.grid}>
                  <SelectField
                    label="服务期限"
                    value={text(form, "termType")}
                    options={["fixed", "warranty", "acceptance", "other"]}
                    displayOptions={[
                      "固定起止日期",
                      "签署日起至质保期届满",
                      "签署日起至验收合格",
                      "其他约定",
                    ]}
                    onChange={(v) => update("termType", v)}
                  />
                  <SelectField
                    label="服务方式"
                    value={text(form, "deliveryMode")}
                    options={["远程交付服务", "甲方指定地点", "混合方式"]}
                    onChange={(v) => update("deliveryMode", v)}
                  />
                  <Field
                    label="开始日期"
                    type="date"
                    value={text(form, "serviceStart")}
                    onChange={(v) => update("serviceStart", v)}
                  />
                  <Field
                    label="结束日期"
                    value={text(form, "serviceEnd")}
                    type="date"
                    onChange={(v) => update("serviceEnd", v)}
                  />
                  <Field
                    label="服务地点"
                    required
                    value={text(form, "servicePlace")}
                    placeholder="甲方指定地点或远程"
                    onChange={(v) => update("servicePlace", v)}
                    full
                  />
                  <Field
                    label="验收地点"
                    value={text(form, "acceptancePlace")}
                    placeholder="与服务地点一致可复用"
                    onChange={(v) => update("acceptancePlace", v)}
                    full
                  />
                  <Field
                    label="系统培训安排（可选）"
                    value={text(form, "training")}
                    placeholder="例如：管理员培训 1 次；没有培训可留空"
                    onChange={(v) => update("training", v)}
                    full
                  />
                </div>
                <label className={styles.textareaField}>
                  <span>
                    产品功能及技术服务描述 <em>*</em>
                  </span>
                  <textarea
                    required
                    value={text(form, "scope")}
                    placeholder="完成 FastGPT 私有化部署、知识库接入、业务工作流配置和管理员培训。"
                    onChange={(e) => update("scope", e.target.value)}
                  />
                </label>
                <div className={styles.grid}>
                  <Field
                    label="免费维保期"
                    value={text(form, "warranty")}
                    onChange={(v) => update("warranty", v)}
                  />
                  <Field
                    label="支持渠道"
                    value={text(form, "supportChannels")}
                    onChange={(v) => update("supportChannels", v)}
                  />
                  <Field
                    label="技术支持负责人"
                    value={text(form, "supportOwner")}
                    onChange={(v) => update("supportOwner", v)}
                  />
                  <Field
                    label="支持负责人联系方式"
                    value={text(form, "supportPhone")}
                    onChange={(v) => update("supportPhone", v)}
                  />
                </div>
                <div className={styles.listHeader}>
                  <div>
                    <div className={styles.sectionLabel}>
                      附件二：服务与验收清单
                    </div>
                    <small>补充到表格的模块会同步写入 Word 附件。</small>
                  </div>
                  <button
                    type="button"
                    className={styles.subtleButton}
                    onClick={addScope}
                  >
                    <Plus size={14} /> 添加清单项
                  </button>
                </div>
                <div className={styles.scopeList}>
                  {((form.acceptanceRows as ScopeRow[]) || []).map(
                    (row, index) => (
                      <div className={styles.scopeRow} key={index}>
                        <input
                          placeholder="模块"
                          value={row.module}
                          onChange={(e) =>
                            updateScope(index, "module", e.target.value)
                          }
                        />
                        <input
                          placeholder="功能点 / 描述"
                          value={row.description}
                          onChange={(e) =>
                            updateScope(index, "description", e.target.value)
                          }
                        />
                        <input
                          placeholder="交付物"
                          value={row.deliverable}
                          onChange={(e) =>
                            updateScope(index, "deliverable", e.target.value)
                          }
                        />
                        <input
                          placeholder="验收标准 / 备注"
                          value={row.acceptance}
                          onChange={(e) =>
                            updateScope(index, "acceptance", e.target.value)
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              </Step>
            )}
            {step === 3 && (
              <Step
                title="确认并生成合同"
                hint="生成前最后检查，确认无误后会下载 Word 文件，并保存一条合同台账记录。"
              >
                <div className={styles.reviewGrid}>
                  {[
                    ["甲方", "partyAName"],
                    ["乙方", "partyBName"],
                    ["合同编号", "contractNo"],
                    ["项目名称", "projectName"],
                    ["软件版本", "edition"],
                    ["合同总价", "total"],
                  ].map(([label, key]) => (
                    <div className={styles.reviewItem} key={label}>
                      <span>{label}</span>
                      <strong>
                        {key === "total"
                          ? `¥ ${money(String(total))}`
                          : text(form, key)}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className={styles.checkPanel}>
                  <div>
                    <ShieldCheck size={18} />
                    <strong>生成前检查</strong>
                  </div>
                  {requiredByStep.flat().map((key) => (
                    <p key={key}>
                      <Check size={14} /> {key} 已填写
                    </p>
                  ))}
                </div>
                <div className={styles.disclaimer}>
                  <Sparkles size={16} />
                  <span>
                    系统会使用你提供的真实模板生成
                    `.docx`，不生成空白占位合同。下载后请交由法务、财务和有权签字人审核。
                  </span>
                </div>
              </Step>
            )}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  step === 0
                    ? window.location.assign("/")
                    : setStep((current) => current - 1)
                }
              >
                {step === 0 ? (
                  <>
                    <ChevronLeft size={15} /> 返回工作台
                  </>
                ) : (
                  <>
                    <ChevronLeft size={15} /> 上一步
                  </>
                )}
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={next}
                >
                  下一步 <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={15} className={styles.spin} />{" "}
                      正在生成
                    </>
                  ) : (
                    <>
                      <Download size={15} /> 生成并下载 Word
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </section>
        <aside className={styles.ledger}>
          <div className={styles.ledgerHead}>
            <div>
              <p className={styles.eyebrow}>CONTRACT LEDGER</p>
              <h2>合同台账</h2>
            </div>
            <FileText size={20} />
          </div>
          <p className={styles.ledgerHint}>
            生成过的合同会自动留痕，方便复用编号、客户信息和项目上下文。
          </p>
          {records.length ? (
            <div className={styles.records}>
              {records.map((record) => (
                <div className={styles.record} key={record.id}>
                  <div className={styles.recordIcon}>
                    <FileCheck2 size={15} />
                  </div>
                  <div>
                    <strong>{record.project_name || "未命名项目"}</strong>
                    <span>
                      {record.contract_no || "未编号"} ·{" "}
                      {record.party_a_name || "未填写客户"}
                    </span>
                    <small>
                      {new Date(record.created_at).toLocaleDateString("zh-CN")}{" "}
                      · {record.status === "generated" ? "已生成" : "草稿"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyLedger}>
              <Save size={19} />
              <p>还没有生成过合同</p>
              <span>完成左侧流程后，合同会出现在这里。</span>
            </div>
          )}
          <div className={styles.ledgerTip}>
            <Sparkles size={15} />
            <span>合同、报价和客户案例共用同一个 PostgreSQL 数据库。</span>
          </div>
        </aside>
      </div>
      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </main>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.stepPanel}>
      <h2>{title}</h2>
      <p className={styles.stepHint}>{hint}</p>
      {children}
    </section>
  );
}
function Field({
  label,
  value,
  placeholder,
  onChange,
  required = false,
  type = "text",
  full = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  full?: boolean;
}) {
  return (
    <label className={`${styles.field} ${full ? styles.full : ""}`}>
      <span>
        {label}
        {required && <em>*</em>}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  options,
  displayOptions,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  displayOptions?: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option, index) => (
          <option key={option} value={option}>
            {displayOptions?.[index] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PartyInfoAssist({ draft, setDraft, onCopy, onFill }: { draft: string; setDraft: (value: string) => void; onCopy: () => void; onFill: () => void }) {
  return (
    <div className={styles.assist}>
      <div className={styles.assistHead}>
        <div><strong>对方信息收集助手</strong><span>复制文案发给客户，收到回复后粘贴并自动解析。</span></div>
        <button type="button" className={styles.assistCopy} onClick={onCopy}><Clipboard size={14} /> 一键复制文案</button>
      </div>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={partyInfoTemplate} />
      <button type="button" className={styles.assistParse} onClick={onFill}>解析并填入甲方信息</button>
    </div>
  );
}
