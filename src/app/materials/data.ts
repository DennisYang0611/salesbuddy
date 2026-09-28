export type Material = { name: string; type: string; group: string; href: string; note: string };

const files = "https://objectstorageapi.hzh.sealos.run/sazklie5-sealaf-nhm3iwiuid-cloud-bin/";

export const materials: Material[] = [
  { name: "软件采购合同模板", type: "DOCX", group: "合同文件", href: `${files}软件采购合同 模板 20260413.docx`, note: "合同模板" },
  { name: "居间合同模板", type: "DOCX", group: "合同文件", href: `${files}居间合同.docx`, note: "合同模板" },
  { name: "模型中转服务合同", type: "DOCX", group: "合同文件", href: `${files}模型中转服务合同.docx`, note: "服务合同" },
  { name: "FastGPT 产品介绍", type: "PDF", group: "演示材料", href: `${files}PPT/FastGPT产品介绍PPT25-11.pdf`, note: "产品介绍" },
  { name: "客户欢迎", type: "PPTX", group: "演示材料", href: `${files}PPT/客户欢迎.pptx`, note: "客户会议" },
  { name: "Sealos 云操作系统 2.1", type: "PPTX", group: "演示材料", href: `${files}PPT/Sealos 云操作系统2.1.pptx`, note: "平台介绍" },
  { name: "AO 史密斯", type: "PPTX", group: "客户案例", href: `${files}PPT/AO 史密斯.pptx`, note: "案例汇报" },
  { name: "凯博座椅落地案例", type: "PDF", group: "客户案例", href: `${files}PPT/凯博座椅 & FastGPT 落地案例.pdf`, note: "落地案例" },
  { name: "宁夏希望信息案例集", type: "PDF", group: "客户案例", href: `${files}PPT/宁夏希望信息产业股份有限公司案例集.pdf`, note: "案例集" },
  { name: "华润啤酒 AI 探索", type: "PPTX", group: "客户案例", href: `${files}PPT/华润啤酒AI探索介绍(1).pptx`, note: "案例汇报" },
  { name: "华润雪花啤酒", type: "PPTX", group: "客户案例", href: `${files}PPT/华润雪花啤酒.pptx`, note: "案例汇报" },
  { name: "三峡集团项目汇报", type: "PPTX", group: "客户案例", href: `${files}PPT/副本三峡集团项目年度汇报.pptx`, note: "年度汇报" },
  { name: "长城汽车汇报", type: "PPTX", group: "客户案例", href: `${files}PPT/长城汽车汇报.pptx`, note: "案例汇报" },
  { name: "周五活动 PPT", type: "PDF", group: "演示材料", href: `${files}PPT/周五活动ppt.pdf`, note: "活动材料" },
  { name: "EdUHK Scite", type: "PDF", group: "客户案例", href: `${files}PPT/EdUHK Scite.pdf`, note: "案例材料" },
  { name: "EdUHK LLM Studio", type: "PDF", group: "客户案例", href: `${files}PPT/EdUHK-LTTC-LLM-Studio-Recent_Work-20240731.pdf`, note: "案例材料" },
  { name: "宁夏希望信息案例集（可编辑版）", type: "PPTX", group: "客户案例", href: `${files}PPT/宁夏希望信息产业股份有限公司案例集.pptx`, note: "可编辑案例集" },
];

export const pricingPages = {
  "support-free": {
    eyebrow: "SERVICE SUPPORT",
    title: "技术支持服务套餐",
    subtitle: "把售后权益、响应标准和增值服务讲清楚，让客户可以直接比较与决策。",
    note: "含免费版 · 四档服务对比",
    accent: "teal",
    kind: "plans",
    plans: [
      { name: "免费服务", tag: "入门", price: 0, unit: "/年", description: "首年赠送，适合先完成产品验证。", features: ["工单支持", "24 小时内响应", "自主升级技术支持"] },
      { name: "基础服务", tag: "稳妥起步", price: 30000, unit: "/年", description: "覆盖日常运维与标准支持。", features: ["1 套测试环境", "工作日 5×8 服务", "4 小时内首次响应", "每年 1 次远程巡检"] },
      { name: "进阶服务", tag: "推荐", price: 50000, unit: "/年", description: "适合持续建设知识库和业务工作流。", features: ["2 套测试环境", "工作日 5×12 服务", "2 小时内首次响应", "每年 2 次远程巡检", "专属线上培训"] },
      { name: "高级服务", tag: "关键业务", price: 90000, unit: "/年", description: "面向关键业务场景的高优先级支持。", features: ["3 套测试环境", "7×12 服务时段", "1 小时内首次响应", "每年 4 次远程巡检", "版本升级远程协助"] },
    ],
  },
  "support-paid": {
    eyebrow: "SERVICE SUPPORT",
    title: "付费技术支持套餐",
    subtitle: "按服务等级展示响应时段、交付权益和长期支持价值。",
    note: "基础版 · 进阶版 · 高级版",
    accent: "violet",
    kind: "plans",
    plans: [
      { name: "基础版", tag: "标准支持", price: 30000, unit: "/年", description: "覆盖日常运维与标准支持。", features: ["1 套测试环境", "工作日 5×8 服务", "4 小时内首次响应", "每年 1 次远程巡检"] },
      { name: "进阶版", tag: "推荐", price: 50000, unit: "/年", description: "适合持续建设知识库和业务工作流。", features: ["2 套测试环境", "工作日 5×12 服务", "2 小时内首次响应", "每年 2 次远程巡检", "专属线上培训"] },
      { name: "高级版", tag: "关键业务", price: 90000, unit: "/年", description: "面向关键业务场景的高优先级支持。", features: ["3 套测试环境", "7×12 服务时段", "1 小时内首次响应", "每年 4 次远程巡检", "版本升级远程协助"] },
    ],
  },
  "software-versions": {
    eyebrow: "PRODUCT LICENSING",
    title: "FastGPT 软件版本报价",
    subtitle: "把部署形态、授权模式和价格放在同一张表里，方便销售快速推荐版本。",
    note: "标准版 · 专业版 · 旗舰版",
    accent: "green",
    kind: "versions",
    versions: [
      { name: "标准版", description: "适合单团队和中小规模知识库应用", rows: [["单机订阅 / 年", 40000], ["单机买断", 86000]] },
      { name: "专业版", description: "适合多业务线和复杂工作流场景", rows: [["单机订阅 / 年", 70000], ["单机买断", 170000], ["集群订阅 / 年", 160000], ["集群买断", 360000]], featured: true },
      { name: "旗舰版", description: "适合关键业务和高并发生产环境", rows: [["单机订阅 / 年", 100000], ["单机买断", 300000], ["集群订阅 / 年", 240000], ["集群买断", 560000]] },
    ],
  },
  bundles: {
    eyebrow: "BUNDLE PRICING",
    title: "软件 + 服务优惠套餐",
    subtitle: "把三年合作方案拆成软件授权、技术支持和支付节奏，客户一眼看懂总价。",
    note: "三年优惠方案 · 统一取整报价",
    accent: "amber",
    kind: "bundles",
    bundles: [
      { name: "标准版 · 基础支持", price: 140000, software: 98000, service: "¥21,000 / 年", saving: "节省 20%" },
      { name: "标准版 · 进阶支持", price: 170000, software: 119000, service: "¥25,500 / 年", saving: "节省 28%" },
      { name: "标准版 · 高级支持", price: 250000, software: 175000, service: "¥37,500 / 年", saving: "节省 30%" },
      { name: "专业版 · 基础支持", price: 200000, software: 120000, service: "¥40,000 / 年", saving: "节省 23%" },
      { name: "专业版 · 进阶支持", price: 240000, software: 144000, service: "¥48,000 / 年", saving: "节省 25%" },
      { name: "专业版 · 高级支持", price: 300000, software: 180000, service: "¥60,000 / 年", saving: "节省 32%" },
      { name: "旗舰版 · 基础支持", price: 300000, software: 180000, service: "¥60,000 / 年", saving: "节省 23%" },
      { name: "旗舰版 · 进阶支持", price: 340000, software: 204000, service: "¥68,000 / 年", saving: "节省 25%" },
      { name: "旗舰版 · 高级支持", price: 380000, software: 228000, service: "¥76,000 / 年", saving: "节省 33%" },
    ],
  },
  "model-pricing": {
    eyebrow: "MODEL COST BENCHMARK",
    title: "AI 模型价格对照表",
    subtitle: "按输入、输出 Token 和上下文长度对比主流模型，支持销售现场快速估算成本。",
    note: "单位：美元 / 1M Tokens",
    accent: "blue",
    kind: "models",
    models: [
      ["Claude Sonnet 4.6", "3.00", "15.00", "1,000,000", "Claude"], ["Claude Haiku 4.5", "1.00", "5.00", "200,000", "Claude"], ["GPT-5.4", "2.50", "15.00", "1,050,000", "OpenAI"], ["GPT-5 Mini", "0.25", "2.00", "400,000", "OpenAI"], ["GPT-5.4 Pro", "30.00", "180.00", "1,050,000", "OpenAI"], ["GPT-4o-mini", "0.15", "0.60", "128,000", "OpenAI"], ["Gemini 3 Flash Preview", "0.50", "3.00", "1,048,576", "Google"], ["Gemini 2.5 Pro", "1.25", "10.00", "1,048,576", "Google"], ["Kimi K2.5", "0.45", "2.20", "262,144", "Kimi"], ["MiniMax M2.5", "0.20", "1.17", "196,608", "MiniMax"], ["GLM 5", "0.72", "2.30", "80,000", "智谱"], ["GLM 4.7 Flash", "0.06", "0.40", "202,752", "智谱"],
    ],
  },
} as const;

export type PricingPage = (typeof pricingPages)[keyof typeof pricingPages];
