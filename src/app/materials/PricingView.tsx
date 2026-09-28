"use client";

import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Download, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PricingPage } from "./data";
import styles from "./pricing.module.css";

export default function PricingView({ page, slug }: { page: PricingPage; slug: string }) {
  const [provider, setProvider] = useState("全部");
  const [query, setQuery] = useState("");
  if (slug === "support-paid") return <SupportPaidView />;
  const models = page.kind === "models" ? page.models.filter((item) => (provider === "全部" || item[4] === provider) && (!query || item[0].toLowerCase().includes(query.toLowerCase()))) : [];
  const providerNames = page.kind === "models" ? ["全部", ...Array.from(new Set(page.models.map((item) => item[4])))] : [];
  return <main className={`${styles.page} ${styles[page.accent]}`}>
    <header className={styles.header}><a href="/materials" className={styles.back}><ArrowLeft size={16} /> 材料中心</a><div className={styles.headerBrand}><div className={styles.mark}>S</div><div><strong>SalesKit</strong><span>报价材料</span></div></div><div className={styles.headerRight}>可直接转发给客户 <ArrowUpRight size={14} /></div></header>
    <div className={styles.inner}><section className={styles.hero}><div><p className={styles.eyebrow}>{page.eyebrow}</p><h1>{page.title}</h1><p>{page.subtitle}</p></div><div className={styles.heroNote}><FileText size={18} /><span>{page.note}</span></div></section>
      {page.kind === "plans" && <PlanGrid page={page} />}
      {page.kind === "versions" && <VersionGrid page={page} />}
      {page.kind === "bundles" && <BundleGrid page={page} />}
      {page.kind === "models" && <><section className={styles.modelToolbar}><label><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索模型名称" /></label><div className={styles.providerList}>{providerNames.map((item) => <button key={item} className={provider === item ? styles.selected : ""} onClick={() => setProvider(item)}>{item}</button>)}</div></section><div className={styles.tableWrap}><table><thead><tr><th>模型</th><th>输入 / 1M</th><th>输出 / 1M</th><th>上下文长度</th><th>提供方</th></tr></thead><tbody>{models.map((item) => <tr key={item[0]}><td><strong>{item[0]}</strong></td><td className={styles.price}>${item[1]}</td><td className={styles.price}>${item[2]}</td><td>{item[3]}</td><td><span className={styles.provider}>{item[4]}</span></td></tr>)}</tbody></table></div><p className={styles.footnote}>价格单位为美元 / 1M Tokens，数据以模型官方最新价格为准。</p></>}
      <footer className={styles.footer}><a href="/materials"><ArrowLeft size={14} /> 返回材料中心</a><span>SalesKit · FastGPT 商务材料</span></footer>
    </div>
  </main>;
}

const supportMatrix = [
  { name: "免费服务", price: "首年赠送", env: "-", sla: "工单支持，24h", inspection: "-", cases: "-", training: "-", official: "-", self: "-", live: "-", discount: "-" },
  { name: "基础服务", price: "3万", env: "1", sla: "5*8，4h内响应", inspection: "1次/年", cases: "5", training: "0", official: "0", self: "支持", live: "支持", discount: "9折" },
  { name: "进阶服务", price: "6万", env: "2", sla: "5*12，2h内响应", inspection: "2次/年", cases: "10", training: "1", official: "2", self: "支持", live: "支持", discount: "8折" },
  { name: "旗舰服务", price: "9万", env: "3", sla: "7*12，1h内响应", inspection: "4次/年", cases: "全部", training: "3", official: "4", self: "支持", live: "支持", discount: "7折" },
] as const;

function SupportPaidView() {
  const [selected, setSelected] = useState(2);
  const plan = supportMatrix[selected];
  const detail = [
    ["服务定价", `人民币 ${plan.price === "首年赠送" ? "0" : plan.price.replace("万", ",0000")} 元 / 年`],
    ["服务周期", "1 年"],
    ["配套测试环境", plan.env === "-" ? "-" : `${plan.env} 套测试环境的 License`],
    ["SLA 服务标准", plan.name === "免费服务" ? plan.sla : `${plan.sla}，工作日服务时段`],
    ["远程巡检", plan.inspection === "-" ? "-" : `每年 ${plan.inspection.replace("次/年", "")} 次远程环境巡检并出具巡检报告`],
    ["案例分享", plan.cases === "-" ? "-" : plan.cases === "全部" ? "解决方案中心全部工作流模板" : `解决方案中心内可获取 ${plan.cases} 个工作流模板`],
    ["在线专属培训", plan.training === "-" ? "-" : `每年 ${plan.training} 场定制线上专项培训`],
    ["官方升级远程协助", plan.official === "-" ? "-" : `每年 ${plan.official} 次人工远程协助版本升级`],
    ["自主升级技术支持", plan.self === "-" ? "-" : "支持甲方自主升级，提供技术咨询支持"],
    ["月度直播培训活动", plan.live === "-" ? "-" : "可参与"],
    ["增值服务采购折扣", plan.discount === "-" ? "-" : `服务期内采购专项培训、定制开发、搭建人天等增值服务，享受 ${plan.discount} 优惠`],
  ];
  return <main className={`${styles.page} ${styles.teal}`}>
    <header className={styles.header}><a href="/materials" className={styles.back}><ArrowLeft size={16} /> 材料中心</a><div className={styles.headerBrand}><div className={styles.mark}>S</div><div><strong>SalesKit</strong><span>服务套餐材料</span></div></div><a href="/" className={styles.headerRight}>返回销售工作台 <ArrowUpRight size={14} /></a></header>
    <div className={styles.inner}><section className={styles.hero}><div><p className={styles.eyebrow}>SERVICE SUPPORT</p><h1>付费技术支持套餐</h1><p>按服务等级对比响应标准、交付权益和增值服务，点击套餐查看完整说明。</p></div><div className={styles.heroNote}><FileText size={18} /><span>标准价 · 1 年服务周期</span></div></section>
      <section className={styles.matrixWrap}><div className={styles.matrixScroll}><table className={styles.matrix}><thead><tr><th>类目</th><th>定价</th><th>测试环境</th><th>SLA</th><th>远程巡检</th><th>案例分享</th><th>在线培训</th><th>官方升级<br />服务</th><th>自主升级</th><th>月度直播<br />培训活动</th><th>服务折扣</th></tr></thead><tbody>{supportMatrix.map((item, index) => <tr key={item.name} className={selected === index ? styles.matrixSelected : ""} onClick={() => setSelected(index)}><th>{item.name}{index === 2 && <span className={styles.recommend}>推荐</span>}</th><td className={styles.matrixPrice}>{item.price}</td><td>{item.env}</td><td>{item.sla}</td><td>{item.inspection}</td><td>{item.cases}</td><td>{item.training}</td><td>{item.official}</td><td>{item.self}</td><td>{item.live}</td><td className={styles.matrixDiscount}>{item.discount}</td></tr>)}</tbody></table></div><p className={styles.matrixHint}>点击任一套餐查看详细服务内容 · 金额均为人民币含税报价</p></section>
      <section className={styles.detail}><div className={styles.detailHead}><div><p className={styles.eyebrow}>SELECTED PLAN</p><h2>{plan.name}</h2><p>{plan.name === "免费服务" ? "首年赠送，适合先完成产品验证。" : "覆盖日常运维、巡检和持续使用支持。"}</p></div><a href="/quotes" className={styles.quoteLink}>带入报价单 <ArrowUpRight size={14} /></a></div><div className={styles.detailTable}><div className={`${styles.detailRow} ${styles.headerRow}`}><strong>服务项目</strong><strong>服务内容</strong></div>{detail.map(([label, value]) => <div className={styles.detailRow} key={label}><span>{label}</span><p>{value}</p></div>)}</div></section>
      <footer className={styles.footer}><a href="/materials"><ArrowLeft size={14} /> 返回材料中心</a><span>SalesKit · FastGPT 商务材料</span></footer>
    </div>
  </main>;
}

function PlanGrid({ page }: { page: Extract<PricingPage, { kind: "plans" }> }) { return <div className={styles.planGrid}>{page.plans.map((plan, index) => <article className={`${styles.plan} ${index === 2 || (page.plans.length === 3 && index === 1) ? styles.featured : ""}`} key={plan.name}><div className={styles.planTop}><span>{plan.tag}</span>{(index === 2 || (page.plans.length === 3 && index === 1)) && <b>推荐</b>}</div><h2>{plan.name}</h2><p>{plan.description}</p><div className={styles.price}><small>¥</small>{plan.price.toLocaleString()}<em>{plan.unit}</em></div><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><a className={styles.planButton} href="/quotes">加入报价单 <ArrowUpRight size={14} /></a></article>)}</div>; }
function VersionGrid({ page }: { page: Extract<PricingPage, { kind: "versions" }> }) { return <div className={styles.versionGrid}>{page.versions.map((version) => { const featured = "featured" in version && version.featured === true; return <article className={`${styles.version} ${featured ? styles.featured : ""}`} key={version.name}><div className={styles.versionTop}><h2>{version.name}</h2>{featured && <span>推荐</span>}</div><p>{version.description}</p><div className={styles.versionRows}>{version.rows.map(([label, price]) => <div key={label}><span>{label}</span><strong>¥ {price.toLocaleString()}</strong></div>)}</div><a className={styles.planButton} href="/quotes">使用此版本 <ArrowUpRight size={14} /></a></article>; })}</div>; }
function BundleGrid({ page }: { page: Extract<PricingPage, { kind: "bundles" }> }) { return <div className={styles.bundleGrid}>{page.bundles.map((bundle) => <article className={styles.bundle} key={bundle.name}><div className={styles.bundleTop}><span>三年总价</span><b>{bundle.saving}</b></div><h2>{bundle.name}</h2><div className={styles.bundlePrice}><small>¥</small>{bundle.price.toLocaleString()}</div><div className={styles.breakdown}><div><span>软件授权</span><strong>¥ {bundle.software.toLocaleString()}</strong></div><div><span>技术支持</span><strong>{bundle.service}</strong></div></div><a className={styles.planButton} href="/quotes">使用此方案 <ArrowUpRight size={14} /></a></article>)}</div>; }
