"use client";

import { ArrowDownToLine, ArrowLeft, ArrowUpRight, FileArchive, FileText, Filter, FolderOpen, Presentation, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { materials } from "./data";
import styles from "./materials.module.css";

const groups = ["全部", "合同文件", "演示材料", "客户案例"];

export default function MaterialsPage() {
  const [group, setGroup] = useState("全部");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => materials.filter((item) => (!search || `${item.name} ${item.type} ${item.note}`.toLowerCase().includes(search.toLowerCase())) && (group === "全部" || item.group === group)), [group, search]);
  return <main className={styles.page}>
    <header className={styles.header}><a href="/" className={styles.back}><ArrowLeft size={16} /> 返回工作台</a><div className={styles.brand}><div className={styles.mark}>S</div><div><strong>SalesKit</strong><span>材料中心</span></div></div><div className={styles.headerStatus}><span />{materials.length} 份可下载材料</div></header>
    <div className={styles.inner}>
      <section className={styles.hero}><div><p className={styles.eyebrow}>SALES LIBRARY</p><h1>材料中心</h1><p>报价、合同、产品介绍和客户案例，按场景整理，点击即可下载或打开。</p></div><div className={styles.heroMeta}><strong>{visible.length}</strong><span>当前可见</span></div></section>
      <a className={styles.featuredLink} href="/materials/version-comparison"><div><span>重点材料</span><strong>版本对比与报价</strong><small>快速了解授权版本、价格与功能差异</small></div><ArrowUpRight size={17} /></a>
      <a className={styles.serviceShortcut} href="/materials/support-paid"><div><strong>查看服务套餐</strong><small>对比技术支持等级、响应标准和服务权益</small></div><ArrowUpRight size={16} /></a>
      <section className={styles.toolbar}><label className={styles.search}><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索材料名称、类型或用途" /></label><div className={styles.filters}><Filter size={15} />{groups.map((item) => <button key={item} className={group === item ? styles.activeFilter : ""} onClick={() => setGroup(item)}>{item}</button>)}</div></section>
      <div className={styles.grid}>{visible.map((item) => <a className={styles.file} key={item.href} href={item.href} target="_blank" rel="noreferrer"><div className={`${styles.fileIcon} ${item.type === "PDF" ? styles.pdf : item.type === "PPTX" ? styles.ppt : styles.doc}`}><TypeIcon type={item.type} /></div><div className={styles.fileCopy}><div className={styles.fileTop}><span>{item.group}</span><b>{item.type}</b></div><strong>{item.name}</strong><small>{item.note} · 点击下载</small></div><ArrowDownToLine className={styles.download} size={17} /></a>)}</div>
      {!visible.length && <div className={styles.empty}><FolderOpen size={24} /><strong>没有匹配的材料</strong><span>换一个关键词或筛选范围试试。</span></div>}
    </div>
  </main>;
}

function TypeIcon({ type }: { type: string }) { if (type === "PPTX") return <Presentation size={20} />; if (type === "PDF") return <FileText size={20} />; return <FileArchive size={20} />; }
