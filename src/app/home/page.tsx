"use client";

import { ArrowRight, BriefcaseBusiness, Clock3, ExternalLink, FilePenLine, FileText, FolderOpen, ReceiptText, Server, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const demoGroups = [
  {
    code: "01",
    title: "知识库检索问答",
    type: "RAG",
    tone: "green",
    cases: [
      { title: "民法典问答助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=rykLhfAqtZwaXPiarXvklpdk" },
      { title: "产品资料匹配助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=iYstCozU3wh5jLT1PTDxghSY" },
      { title: "浙江工业大学招生咨询助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=kD2GcHN282F6aGi7Uw7vVe7I", related: { title: "招生咨询系统", href: "https://glalrciboxob.sealoshzh.site/" } },
      { title: "银行政策问答助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=gDgLX6fDPDW6xjlHpsNA78RW" },
    ],
  },
  {
    code: "02",
    title: "多步骤流程编排",
    type: "WORKFLOW",
    tone: "blue",
    cases: [
      { title: "飞书 AI 合同审批流", venue: "飞书工作台演示" },
      { title: "文档翻译助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=mt2YajlZBLsogcuxhfp8BSq8" },
      { title: "简历筛选助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=lTE1RLrHJtOiHnlscSUKgD9h" },
      { title: "文档对比助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=bBJTpau6mDpqEJ6lijBLd0fb" },
    ],
  },
  {
    code: "03",
    title: "智能体任务执行",
    type: "AI AGENT",
    tone: "violet",
    cases: [
      { title: "采购请购单 AI 预审助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=rOt7SlwZH110QjLDvzE1bhdj" },
      { title: "数据分析助手", detail: "数据库工具 + 图表 MCP 工具", href: "https://cloud.fastgpt.cn/chat/share?shareId=tYKotDTWrZoTd2C9E2ubPG2Q" },
      { title: "飞书智能助理", href: "https://cloud.fastgpt.cn/chat/share?shareId=uN6LqadADVIuxgsxbSNG4jJZ" },
      { title: "瑞幸咖啡助手", detail: "瑞幸咖啡 MCP + 高德地图 MCP", href: "https://cloud.fastgpt.cn/chat/share?shareId=uBy7AvJH1D8wUXeHUVCmoZ9x" },
    ],
  },
  {
    code: "04",
    title: "智能体驱动工作流编排",
    type: "AGENTIC WORKFLOW",
    tone: "amber",
    cases: [
      { title: "飞书 AI 报销助手", venue: "飞书工作台演示" },
      { title: "FastGPT 智能客服", venue: "飞书社群演示" },
      { title: "科研专家推荐助手", href: "https://cloud.fastgpt.cn/chat/share?shareId=c4IV8oZEC8cNmwNrqhh0GBt0" },
    ],
  },
  {
    code: "05",
    title: "AI 原生系统",
    type: "AI-NATIVE",
    tone: "green",
    cases: [
      { title: "智能开单系统", href: "https://pylnavfhvljv.sealoshzh.site/" },
      { title: "AI 合同审查系统", href: "https://tfwoqixtxxpf.sealoshzh.site/" },
      { title: "AI 合同对比系统", href: "https://tfwoqixtxxpf.sealoshzh.site/compare" },
      { title: "ERP 智能开单系统", href: "https://beapdpfiquwa.sealoshzh.site/sales-orders" },
      { title: "企业微信会话智能洞察系统", href: "https://kyzygkpbwlhn.sealoshzh.site" },
      { title: "AI 会议纪要系统", href: "https://jzvxyqwdyzde.sealoshzh.site/" },
      { title: "AI 社媒推文批量生成系统", href: "https://tooqczacisqi.sealoshzh.site/", detail: "FastGPT" },
    ],
  },
];

const nav = [
  { href: "/home", label: "工作台", icon: BriefcaseBusiness },
  { href: "/materials", label: "材料中心", icon: FolderOpen },
  { href: "/quotes", label: "报价单", icon: ReceiptText },
  { href: "/materials/version-comparison", label: "版本对比与报价", icon: FileText },
  { href: "/contracts/new", label: "自动化做合同", icon: FilePenLine },
];

export default function Home() {
  const [stats, setStats] = useState({ cases: 0, resources: 0, quotes: 0 });
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("dashboard unavailable")))
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => setConnected(false));
  }, []);

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span className={styles.mark}>S</span><div><strong>SalesKit</strong><small>商务材料工作台</small></div></div>
      <p className={styles.navTitle}>工作区</p>
      <nav className={styles.nav}>{nav.map(({ href, label, icon: Icon }) => <a key={href} href={href} className={`${styles.navItem} ${href === "/" ? styles.active : ""}`}><Icon size={16} /><span>{label}</span></a>)}</nav>
      <div className={styles.sideBottom}><span className={connected ? styles.online : styles.offline} /><span>{connected ? "云端数据已连接" : "数据连接异常"}</span><small>PostgreSQL</small></div>
    </aside>
    <main className={styles.main}>
      <header className={styles.topbar}><div><span className={styles.crumb}>SalesKit</span><span className={styles.slash}>/</span><strong>工作台</strong></div><span className={styles.today}><Clock3 size={14} /> {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span></header>
      <section className={styles.intro}><div><p className={styles.eyebrow}>SALES WORKSPACE</p><h1>今天要准备什么？</h1><p>报价、合同和客户材料，集中在一个清晰的工作区。</p></div><div className={styles.stats}><div><strong>{stats.resources}</strong><span>可下载材料</span></div><div><strong>{stats.cases}</strong><span>客户案例</span></div><div><strong>{stats.quotes}</strong><span>历史报价</span></div></div></section>
      <section className={styles.tasks}><div className={styles.sectionHead}><div><h2>开始工作</h2><p>直接进入真实业务流程</p></div></div><div className={styles.taskGrid}><Task href="/materials" icon={<FolderOpen size={18} />} title="找销售材料" text="下载产品介绍、客户案例和合同附件" tone="green" /><Task href="/quotes" icon={<ReceiptText size={18} />} title="制作报价单" text="按套餐、税率和折扣生成 Excel" tone="amber" /><Task href="/contracts/new" icon={<FilePenLine size={18} />} title="自动化做合同" text="选择合同类型，填写信息并导出 Word" tone="blue" /><Task href="/materials/version-comparison" icon={<FileText size={18} />} title="版本对比与报价" text="快速比较版本能力、价格和服务等级" tone="violet" /><Task href="/materials/support-paid" icon={<FileText size={18} />} title="查看服务套餐" text="对比支持等级、SLA 和服务权益" tone="violet" /></div></section>
      <section className={styles.demoSection}>
        <div className={styles.sectionHead}><div><h2>可演示案例</h2><p>按 FastGPT 的典型应用场景整理，点击案例可直接打开演示</p></div></div>
        <div className={styles.demoGrid}>{demoGroups.map((group) => <article key={group.code} className={`${styles.demoGroup} ${group.tone === "amber" ? styles.demoAmber : group.tone === "blue" ? styles.demoBlue : group.tone === "violet" ? styles.demoViolet : styles.demoGreen} ${group.code === "05" ? styles.demoWide : ""}`}>
          <header className={styles.demoGroupHead}><span className={styles.demoCode}>{group.code}</span><div><h3>{group.title}</h3><span>{group.type}</span></div><small>{group.cases.length} 个案例</small></header>
          <div className={`${styles.demoCaseList} ${group.code === "05" ? styles.demoCaseColumns : ""}`}>{group.cases.map((item) => <div key={item.title} className={styles.demoCaseRow}>
            {"href" in item && item.href ? <a className={styles.demoCaseLink} href={item.href} target="_blank" rel="noreferrer"><span><strong>{item.title}</strong>{"detail" in item && item.detail && <small>{item.detail}</small>}</span><ExternalLink size={13} /></a> : <div className={styles.demoCaseStatic}><span><strong>{item.title}</strong><small>{"venue" in item && item.venue}</small></span><em>现场演示</em></div>}
            {"related" in item && item.related && <a className={styles.demoRelated} href={item.related.href} target="_blank" rel="noreferrer">{item.related.title} <ExternalLink size={11} /></a>}
          </div>)}</div>
        </article>)}</div>
      </section>
      <section className={styles.externalSection}><div className={styles.sectionHead}><div><h2>外部资源</h2><p>打开常用产品环境和客户案例</p></div></div><div className={styles.externalGrid}><ExternalLinkCard href="https://solutions.fastgpt.cn/customers" icon={<UsersRound size={18} />} title="客户案例" text="查看 FastGPT 客户解决方案与落地案例" tone="green" /><ExternalLinkCard href="https://fgptfegrn.sealoshzh.site/login" icon={<Server size={18} />} title="测试环境前台" text="进入 FastGPT 测试环境" tone="blue" /><ExternalLinkCard href="https://fastgptadmin.sealoshzh.site/login" icon={<Server size={18} />} title="FastGPT 后台" text="进入管理后台（root）" tone="violet" /></div></section>
    </main>
  </div>;
}

function Task({ href, icon, title, text, tone }: { href: string; icon: React.ReactNode; title: string; text: string; tone: "green" | "amber" | "blue" | "violet" }) { return <a href={href} className={`${styles.task} ${styles[tone]}`}><div className={styles.taskIcon}>{icon}</div><div><strong>{title}</strong><span>{text}</span></div><ArrowRight size={15} /></a>; }
function ExternalLinkCard({ href, icon, title, text, tone }: { href: string; icon: React.ReactNode; title: string; text: string; tone: "green" | "blue" | "violet" }) { return <a className={`${styles.externalCard} ${styles[tone]}`} href={href} target="_blank" rel="noreferrer"><div className={styles.externalIcon}>{icon}</div><div><strong>{title}</strong><span>{text}</span></div><ExternalLink size={15} /></a>; }
