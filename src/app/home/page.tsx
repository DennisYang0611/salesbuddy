"use client";

import { ArrowRight, BriefcaseBusiness, Clock3, ExternalLink, FilePenLine, FileText, FolderOpen, ReceiptText, Server, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const nav = [
  { href: "/home", label: "工作台", icon: BriefcaseBusiness },
  { href: "/materials", label: "材料中心", icon: FolderOpen },
  { href: "/quotes", label: "报价单", icon: ReceiptText },
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
      <section className={styles.tasks}><div className={styles.sectionHead}><div><h2>开始工作</h2><p>直接进入真实业务流程</p></div></div><div className={styles.taskGrid}><Task href="/materials" icon={<FolderOpen size={18} />} title="找销售材料" text="下载产品介绍、客户案例和合同附件" tone="green" /><Task href="/quotes" icon={<ReceiptText size={18} />} title="制作报价单" text="按套餐、税率和折扣生成 Excel" tone="amber" /><Task href="/contracts/new" icon={<FilePenLine size={18} />} title="自动化做合同" text="选择合同类型，填写信息并导出 Word" tone="blue" /><Task href="/materials/support-paid" icon={<FileText size={18} />} title="查看服务套餐" text="对比支持等级、SLA 和服务权益" tone="violet" /></div></section>
      <section className={styles.externalSection}><div className={styles.sectionHead}><div><h2>外部资源</h2><p>打开常用产品环境和客户案例</p></div></div><div className={styles.externalGrid}><ExternalLinkCard href="https://solutions.fastgpt.cn/customers" icon={<UsersRound size={18} />} title="客户案例" text="查看 FastGPT 客户解决方案与落地案例" tone="green" /><ExternalLinkCard href="https://fgptfegrn.sealoshzh.site/login" icon={<Server size={18} />} title="测试环境前台" text="进入 FastGPT 测试环境" tone="blue" /><ExternalLinkCard href="https://fastgptadmin.sealoshzh.site/login" icon={<Server size={18} />} title="FastGPT 后台" text="进入管理后台（root）" tone="violet" /></div></section>
    </main>
  </div>;
}

function Task({ href, icon, title, text, tone }: { href: string; icon: React.ReactNode; title: string; text: string; tone: "green" | "amber" | "blue" | "violet" }) { return <a href={href} className={`${styles.task} ${styles[tone]}`}><div className={styles.taskIcon}>{icon}</div><div><strong>{title}</strong><span>{text}</span></div><ArrowRight size={15} /></a>; }
function ExternalLinkCard({ href, icon, title, text, tone }: { href: string; icon: React.ReactNode; title: string; text: string; tone: "green" | "blue" | "violet" }) { return <a className={`${styles.externalCard} ${styles[tone]}`} href={href} target="_blank" rel="noreferrer"><div className={styles.externalIcon}>{icon}</div><div><strong>{title}</strong><span>{text}</span></div><ExternalLink size={15} /></a>; }
