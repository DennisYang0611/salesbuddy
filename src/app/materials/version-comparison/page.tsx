"use client";

import { ArrowLeft, ArrowUpRight, CheckCircle2, ExternalLink, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { deliveryRows, detailHeaders, detailSections, expertRows, referenceFeatureHeaders, referenceFeatureSections, sourceUpdatedAt, sourceUrl, supportPlans, versionPlans } from "./data";
import styles from "./page.module.css";

type Tab = "summary" | "detail" | "service";
type DetailItem = { name: string; doc: string; values: readonly string[]; note: string };
type DetailSection = { name: string; items: readonly DetailItem[] };

export default function VersionComparisonPage() {
  const [tab, setTab] = useState<Tab>("summary");
  const [query, setQuery] = useState("");
  const filteredSections = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return detailSections;
    return detailSections.map((section) => ({
      ...section,
      items: section.items.filter((item) => `${item.name} ${item.doc} ${item.note}`.toLowerCase().includes(keyword)),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  return <main className={styles.page}>
    <header className={styles.header}>
      <a href="/materials" className={styles.back}><ArrowLeft size={16} /> 材料中心</a>
      <div className={styles.headerBrand}><div className={styles.mark}>S</div><div><strong>SalesKit</strong><span>版本对比与报价</span></div></div>
      <a href="/home" className={styles.headerRight}>返回销售工作台 <ArrowUpRight size={14} /></a>
    </header>
    <div className={styles.inner}>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>PRODUCT COMPARISON · FASTGPT</p><h1>版本对比与报价</h1><p>基于最新版本对比表整理，快速看清授权方式、功能差异与服务费用，再进入报价单。</p></div>
        <div className={styles.heroMeta}><FileText size={17} /><span>资料同步于 {sourceUpdatedAt}</span></div>
      </section>
      <nav className={styles.tabs} aria-label="版本对比视图">
        {([["summary", "销售速览"], ["detail", "详细功能矩阵"], ["service", "服务说明"]] as const).map(([key, label]) => <button key={key} className={tab === key ? styles.activeTab : ""} onClick={() => setTab(key)}>{label}</button>)}
      </nav>
      {tab === "summary" && <SummaryView />}
      {tab === "detail" && <DetailView query={query} setQuery={setQuery} sections={filteredSections} />}
      {tab === "service" && <ServiceView />}
      <footer className={styles.footer}><a href="/materials"><ArrowLeft size={14} /> 返回材料中心</a><span><a href={sourceUrl} target="_blank" rel="noreferrer">查看源资料</a> · SalesKit · FastGPT 商务材料</span></footer>
    </div>
  </main>;
}

function SummaryView() {
  return <>
    <section className={styles.summaryCards}>
      <article className={styles.summaryCard}><span>版本系列</span><h2>开源版 F3</h2><p>适合自建与产品验证</p><strong>社区支持</strong></article>
      <article className={`${styles.summaryCard} ${styles.featuredCard}`}><span>商业版 F4</span><h2>标准 / 专业 / 旗舰</h2><p>无前置流程，可直接签合同</p><strong>单机与集群授权</strong></article>
      <article className={styles.summaryCard}><span>企业版 F5</span><h2>专业 / 旗舰 / 定制</h2><p>涉及招投标、比价、供应商入库</p><strong>面向企业项目</strong></article>
    </section>
    <section className={styles.panel}>
      <div className={styles.panelHead}><div><p className={styles.kicker}>QUICK QUOTE</p><h2>软件版本价格速览</h2></div><span>人民币 · 销售报价</span></div>
      <div className={styles.tableWrap}><table className={styles.summaryTable}>
        <thead><tr><th>版本系列</th><th>细分版本</th><th>单机买断</th><th>单机订阅 / 年</th><th>集群买断</th><th>集群订阅 / 年</th><th>多租户 / 用户</th><th>技术支持</th><th>能力覆盖</th></tr></thead>
        <tbody>{versionPlans.map((plan) => <tr key={`${plan.family}-${plan.name}`}>
          <th>{familyLabel(plan.family)}</th><td><strong>{plan.name}</strong></td><td className={styles.money}>{formatPrice(plan.singleBuy)}</td><td className={styles.money}>{formatPrice(plan.singleYear)}</td><td className={styles.money}>{formatPrice(plan.clusterBuy)}</td><td className={styles.money}>{formatPrice(plan.clusterYear)}</td><td>{plan.users}</td><td><span className={styles.level}>{plan.support}</span></td><td><span className={plan.coverage === 0 ? styles.mutedPill : styles.goodPill}>{plan.coverage} / 16</span></td>
        </tr>)}</tbody>
      </table></div>
      <p className={styles.note}>专业版单机订阅按年 ¥80,000，旗舰版单机订阅按年 ¥140,000；报价按本次销售口径更新。 “—”表示未提供该项价格或能力。</p>
    </section>
    <ReferenceFeatureComparison />
    <section className={styles.recommend}><div><p className={styles.kicker}>SALES TIP</p><h2>推荐路径</h2><p>先按部署形态和用户规模筛选版本，再打开“详细功能矩阵”核对权限、知识库、工作流和系统能力。</p></div><a href="/quotes">打开报价单 <ArrowUpRight size={14} /></a></section>
  </>;
}

function ReferenceFeatureComparison() {
  const total = referenceFeatureSections.reduce((sum, section) => sum + section.items.length, 0);
  return <section className={styles.panel}>
    <div className={styles.panelHead}><div><p className={styles.kicker}>KEY DIFFERENCES</p><h2>重点功能差异</h2></div><span>{total} 项能力 · 参考版本说明</span></div>
    <div className={styles.tableWrap}><table className={styles.referenceTable}>
      <thead><tr><th>功能 / 版本</th>{referenceFeatureHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead>
      <tbody>{referenceFeatureSections.map((section) => <FragmentSection key={section.name} name={section.name} items={section.items} />)}</tbody>
    </table></div>
    <p className={styles.note}>用于销售沟通的重点能力速览；更完整的版本功能请查看“详细功能矩阵”。</p>
  </section>;
}

function FragmentSection({ name, items }: { name: string; items: readonly { name: string; values: readonly string[] }[] }) {
  return <>
    <tr className={styles.referenceSectionRow}><th colSpan={referenceFeatureHeaders.length + 1}>{name}</th></tr>
    {items.map((item) => <tr key={item.name}><th>{item.name}</th>{item.values.map((value, index) => <td key={`${item.name}-${index}`} className={value === "✅" ? styles.check : value === "❌" ? styles.cross : ""}>{value}</td>)}</tr>)}
  </>;
}

function DetailView({ query, setQuery, sections }: { query: string; setQuery: (value: string) => void; sections: readonly DetailSection[] }) {
  const itemCount = detailSections.reduce((sum, section) => sum + section.items.length, 0);
  return <section className={styles.panel}>
    <div className={styles.panelHead}><div><p className={styles.kicker}>FEATURE MATRIX</p><h2>详细功能矩阵</h2></div><span>{itemCount} 项能力</span></div>
    <div className={styles.matrixToolbar}><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索功能、模块或说明" /></label><span>✅ 支持　❌ 不支持</span></div>
    <div className={styles.tableWrap}><table className={styles.detailTable}>
      <thead><tr><th>项目</th><th>功能说明文档 / 备注</th>{detailHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead>
      <tbody>{sections.map((section) => <FeatureSection key={section.name} section={section} />)}</tbody>
    </table></div>
    <p className={styles.note}>矩阵保留来源中的“开发中 / 在写文档 / 马上上线”等信息；销售沟通和合同范围请以当前正式版本及双方确认内容为准。</p>
  </section>;
}

function FeatureSection({ section }: { section: DetailSection }) {
  return <>
    <tr className={styles.sectionRow}><th colSpan={10}>{section.name}</th></tr>
    {section.items.map((item) => <tr key={item.name}>
      <th>{item.name}</th>
      <td>{item.doc.startsWith("http") ? <a href={item.doc} target="_blank" rel="noreferrer"><ExternalLink size={11} /> 打开说明</a> : item.doc || "-"}{item.note && <small className={styles.rowNote}>{item.note}</small>}</td>
      {item.values.map((value, index) => <td key={`${item.name}-${index}`} className={value === "✅" ? styles.check : value === "❌" ? styles.cross : ""}>{value || "-"}</td>)}
    </tr>)}
  </>;
}

function ServiceView() {
  return <>
    <section className={styles.serviceGrid}>{supportPlans.map((plan, index) => <article key={plan.level} className={`${styles.serviceCard} ${index === 3 ? styles.serviceFeatured : ""}`}><div className={styles.serviceTop}><span>技术支持</span><b>{plan.level}</b></div><h2>¥{formatPrice(plan.price).replace(/^¥/, "")}</h2><p>{plan.content}</p><div className={styles.serviceMark}><CheckCircle2 size={13} /> 独立购买 / 年</div></article>)}</section>
    <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.kicker}>DELIVERY MODE</p><h2>交付模式</h2></div><span>原厂顾问 / 授权三方</span></div><div className={styles.tableWrap}><table className={styles.serviceTable}><thead><tr><th>交付方式</th><th>原厂顾问</th><th>授权三方</th></tr></thead><tbody>{deliveryRows.map((row) => <tr key={row.mode}><td>{row.mode}</td><td>{row.official}</td><td>{row.partner}</td></tr>)}</tbody></table></div></section>
    <section className={styles.panel}><div className={styles.panelHead}><div><p className={styles.kicker}>EXPERT SERVICES</p><h2>专家服务</h2></div><span>培训与售前支持</span></div><div className={styles.tableWrap}><table className={styles.serviceTable}><thead><tr><th>专家类型</th><th>培训费用</th><th>备注</th></tr></thead><tbody>{expertRows.map((row) => <tr key={row.type}><td>{row.type}</td><td>{row.price}</td><td>{row.note || "-"}</td></tr>)}</tbody></table></div></section>
  </>;
}

function formatPrice(value: string) {
  if (!value || value === "-") return "-";
  const numeric = Number(value.replace(/,/g, "").replace(/^¥\s*/, ""));
  return Number.isFinite(numeric) && numeric > 0 ? `¥${numeric.toLocaleString("en-US")}` : value;
}

function familyLabel(value: string) {
  if (value.includes("F3")) return "开源版（F3）";
  if (value.includes("F4")) return "商业版（F4）";
  return "企业版（F5）";
}
