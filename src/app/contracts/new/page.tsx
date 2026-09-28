import { ArrowLeft, ArrowRight, FileCheck2, FileText, Handshake } from "lucide-react";
import styles from "./page.module.css";

const choices = [
  {
    href: "/contracts",
    icon: FileText,
    title: "FastGPT 产品销售及技术服务合同",
    description: "适用于软件授权、部署、培训与技术支持服务。",
    tag: "产品销售",
  },
  {
    href: "/contracts/channel",
    icon: Handshake,
    title: "渠道服务商合作协议",
    description: "适用于渠道报备、项目合作、提点政策与交付职责确认。",
    tag: "渠道合作",
  },
];

export default function NewContractPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.back}><ArrowLeft size={16} /> 返回工作台</a>
        <div className={styles.brand}><span>S</span><strong>SalesKit</strong></div>
      </header>
      <section className={styles.wrap}>
        <div className={styles.eyebrow}>合同自动化</div>
        <h1>选择合同类型</h1>
        <p className={styles.lead}>先选择业务场景，系统会带你填写对应信息并生成正式 Word 合同。</p>
        <div className={styles.grid}>
          {choices.map(({ href, icon: Icon, title, description, tag }) => (
            <a className={styles.card} href={href} key={href}>
              <div className={styles.cardTop}><div className={styles.icon}><Icon size={20} /></div><span>{tag}</span></div>
              <h2>{title}</h2><p>{description}</p>
              <div className={styles.open}>开始填写 <ArrowRight size={15} /></div>
            </a>
          ))}
        </div>
        <div className={styles.note}><FileCheck2 size={16} /> 生成后会自动下载 Word 文件，并同步保存到合同台账。</div>
      </section>
    </main>
  );
}
