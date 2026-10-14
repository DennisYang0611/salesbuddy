// 静态快照：来源于飞书“FastGPT版本对比与报价”，最近同步 2026-10-13。
export const sourceUpdatedAt = "2026-10-13";
export const detailHeaders = [
  "开源版",
  "F4 轻量版",
  "F4 标准版",
  "F4 专业版",
  "F4 旗舰版",
  "F5 专业版",
  "F5 旗舰版",
  "F5 定制版"
] as const;
export const simpleFeatures = [
  "索引增强",
  "智能切片",
  "外部知识库",
  "web站点同步",
  "文档标签",
  "文档权限",
  "权限管控",
  "团队应用",
  "身份验证",
  "用量管控",
  "IM对接",
  "Markdown 转文件",
  "团队云端记录",
  "团队插件",
  "沙箱环境",
  "skills"
] as const;

// 参考 FastGPT 软件版本对比页整理的销售重点能力，供销售速览使用。
export const referenceFeatureHeaders = ["开源版", "标准版", "专业版", "旗舰版"] as const;
export const referenceFeatureSections = [
  {
    "name": "重点功能",
    "items": [
      { "name": "租户数", "values": ["1", "100", "1,000", "不限"] },
      { "name": "用户支付（套餐 / 支付 / 开票）", "values": ["❌", "❌", "❌", "✅"] },
      { "name": "SSO 对接", "values": ["❌", "❌", "✅", "✅"] },
      { "name": "组织架构对接", "values": ["❌", "❌", "✅", "✅"] },
      { "name": "批量评估", "values": ["❌", "❌", "✅", "✅"] },
      { "name": "自定义模板", "values": ["❌", "❌", "✅", "✅"] },
      { "name": "外部对接（飞书 / 微信 / 钉钉）", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "精细化权限", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "审计模块", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "团队模式", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "资源管理", "values": ["❌", "✅", "✅", "✅"] }
    ]
  },
  {
    "name": "门户模块",
    "items": [
      { "name": "门户 - 模型直接对话", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "门户 - 自定义应用页", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "门户 - 版权信息配置", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "门户对话日志", "values": ["❌", "✅", "✅", "✅"] }
    ]
  },
  {
    "name": "应用模块",
    "items": [
      { "name": "基础工作流", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "Markdown 转文件", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "IM 对接", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "用量管控", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "身份验证", "values": ["❌", "✅", "✅", "✅"] },
      { "name": "团队应用", "values": ["❌", "✅", "✅", "✅"] }
    ]
  }
] as const;
export const versionPlans = [
  {
    "family": "开源版（F3）",
    "name": "开源版",
    "singleBuy": "-",
    "singleYear": "-",
    "clusterBuy": "-",
    "clusterYear": "-",
    "users": "❌",
    "support": "社区",
    "features": [
      {
        "name": "索引增强",
        "supported": "❌"
      },
      {
        "name": "智能切片",
        "supported": "❌"
      },
      {
        "name": "外部知识库",
        "supported": "❌"
      },
      {
        "name": "web站点同步",
        "supported": "❌"
      },
      {
        "name": "文档标签",
        "supported": "❌"
      },
      {
        "name": "文档权限",
        "supported": "❌"
      },
      {
        "name": "权限管控",
        "supported": "❌"
      },
      {
        "name": "团队应用",
        "supported": "❌"
      },
      {
        "name": "身份验证",
        "supported": "❌"
      },
      {
        "name": "用量管控",
        "supported": "❌"
      },
      {
        "name": "IM对接",
        "supported": "❌"
      },
      {
        "name": "Markdown 转文件",
        "supported": "❌"
      },
      {
        "name": "团队云端记录",
        "supported": "❌"
      },
      {
        "name": "团队插件",
        "supported": "❌"
      },
      {
        "name": "沙箱环境",
        "supported": "❌"
      },
      {
        "name": "skills",
        "supported": "❌"
      }
    ],
    "coverage": 0
  },
  {
    "family": "商业版（F4）无前置流程，直接签合同",
    "name": "标准版",
    "singleBuy": "100000",
    "singleYear": "40000",
    "clusterBuy": "-",
    "clusterYear": "-",
    "users": "100",
    "support": "L3",
    "features": [
      {
        "name": "索引增强",
        "supported": "✅"
      },
      {
        "name": "智能切片",
        "supported": "✅"
      },
      {
        "name": "外部知识库",
        "supported": "✅"
      },
      {
        "name": "web站点同步",
        "supported": "✅"
      },
      {
        "name": "文档标签",
        "supported": "✅"
      },
      {
        "name": "文档权限",
        "supported": "✅"
      },
      {
        "name": "权限管控",
        "supported": "✅"
      },
      {
        "name": "团队应用",
        "supported": "✅"
      },
      {
        "name": "身份验证",
        "supported": "✅"
      },
      {
        "name": "用量管控",
        "supported": "✅"
      },
      {
        "name": "IM对接",
        "supported": "✅"
      },
      {
        "name": "Markdown 转文件",
        "supported": "✅"
      },
      {
        "name": "团队云端记录",
        "supported": "✅"
      },
      {
        "name": "团队插件",
        "supported": "✅"
      },
      {
        "name": "沙箱环境",
        "supported": "✅"
      },
      {
        "name": "skills",
        "supported": "✅"
      }
    ],
    "coverage": 16
  },
  {
    "family": "商业版（F4）无前置流程，直接签合同",
    "name": "专业版",
    "singleBuy": "200000",
    "singleYear": "80000",
    "clusterBuy": "400000",
    "clusterYear": "180000",
    "users": "1000",
    "support": "L2",
    "features": [
      {
        "name": "索引增强",
        "supported": "✅"
      },
      {
        "name": "智能切片",
        "supported": "✅"
      },
      {
        "name": "外部知识库",
        "supported": "✅"
      },
      {
        "name": "web站点同步",
        "supported": "✅"
      },
      {
        "name": "文档标签",
        "supported": "✅"
      },
      {
        "name": "文档权限",
        "supported": "✅"
      },
      {
        "name": "权限管控",
        "supported": "✅"
      },
      {
        "name": "团队应用",
        "supported": "✅"
      },
      {
        "name": "身份验证",
        "supported": "✅"
      },
      {
        "name": "用量管控",
        "supported": "✅"
      },
      {
        "name": "IM对接",
        "supported": "✅"
      },
      {
        "name": "Markdown 转文件",
        "supported": "✅"
      },
      {
        "name": "团队云端记录",
        "supported": "✅"
      },
      {
        "name": "团队插件",
        "supported": "✅"
      },
      {
        "name": "沙箱环境",
        "supported": "✅"
      },
      {
        "name": "skills",
        "supported": "✅"
      }
    ],
    "coverage": 16
  },
  {
    "family": "商业版（F4）无前置流程，直接签合同",
    "name": "旗舰版",
    "singleBuy": "350000",
    "singleYear": "140000",
    "clusterBuy": "600000",
    "clusterYear": "270000",
    "users": "不限制",
    "support": "L1",
    "features": [
      {
        "name": "索引增强",
        "supported": "✅"
      },
      {
        "name": "智能切片",
        "supported": "✅"
      },
      {
        "name": "外部知识库",
        "supported": "✅"
      },
      {
        "name": "web站点同步",
        "supported": "✅"
      },
      {
        "name": "文档标签",
        "supported": "✅"
      },
      {
        "name": "文档权限",
        "supported": "✅"
      },
      {
        "name": "权限管控",
        "supported": "✅"
      },
      {
        "name": "团队应用",
        "supported": "✅"
      },
      {
        "name": "身份验证",
        "supported": "✅"
      },
      {
        "name": "用量管控",
        "supported": "✅"
      },
      {
        "name": "IM对接",
        "supported": "✅"
      },
      {
        "name": "Markdown 转文件",
        "supported": "✅"
      },
      {
        "name": "团队云端记录",
        "supported": "✅"
      },
      {
        "name": "团队插件",
        "supported": "✅"
      },
      {
        "name": "沙箱环境",
        "supported": "✅"
      },
      {
        "name": "skills",
        "supported": "✅"
      }
    ],
    "coverage": 16
  },
  {
    "family": "企业版（F5） 涉及：招投标、比价、供应商入库",
    "name": "专业版",
    "singleBuy": "300000",
    "singleYear": "120000",
    "clusterBuy": "500000",
    "clusterYear": "210000",
    "users": "1000",
    "support": "L0",
    "features": [
      {
        "name": "索引增强",
        "supported": "✅"
      },
      {
        "name": "智能切片",
        "supported": "✅"
      },
      {
        "name": "外部知识库",
        "supported": "✅"
      },
      {
        "name": "web站点同步",
        "supported": "✅"
      },
      {
        "name": "文档标签",
        "supported": "✅"
      },
      {
        "name": "文档权限",
        "supported": "✅"
      },
      {
        "name": "权限管控",
        "supported": "✅"
      },
      {
        "name": "团队应用",
        "supported": "✅"
      },
      {
        "name": "身份验证",
        "supported": "✅"
      },
      {
        "name": "用量管控",
        "supported": "✅"
      },
      {
        "name": "IM对接",
        "supported": "✅"
      },
      {
        "name": "Markdown 转文件",
        "supported": "✅"
      },
      {
        "name": "团队云端记录",
        "supported": "✅"
      },
      {
        "name": "团队插件",
        "supported": "✅"
      },
      {
        "name": "沙箱环境",
        "supported": "✅"
      },
      {
        "name": "skills",
        "supported": "✅"
      }
    ],
    "coverage": 16
  },
  {
    "family": "企业版（F5） 涉及：招投标、比价、供应商入库",
    "name": "旗舰版",
    "singleBuy": "450000",
    "singleYear": "180000",
    "clusterBuy": "800000",
    "clusterYear": "350000",
    "users": "不限制",
    "support": "L0",
    "features": [
      {
        "name": "索引增强",
        "supported": "✅"
      },
      {
        "name": "智能切片",
        "supported": "✅"
      },
      {
        "name": "外部知识库",
        "supported": "✅"
      },
      {
        "name": "web站点同步",
        "supported": "✅"
      },
      {
        "name": "文档标签",
        "supported": "✅"
      },
      {
        "name": "文档权限",
        "supported": "✅"
      },
      {
        "name": "权限管控",
        "supported": "✅"
      },
      {
        "name": "团队应用",
        "supported": "✅"
      },
      {
        "name": "身份验证",
        "supported": "✅"
      },
      {
        "name": "用量管控",
        "supported": "✅"
      },
      {
        "name": "IM对接",
        "supported": "✅"
      },
      {
        "name": "Markdown 转文件",
        "supported": "✅"
      },
      {
        "name": "团队云端记录",
        "supported": "✅"
      },
      {
        "name": "团队插件",
        "supported": "✅"
      },
      {
        "name": "沙箱环境",
        "supported": "✅"
      },
      {
        "name": "skills",
        "supported": "✅"
      }
    ],
    "coverage": 16
  },
  {
    "family": "企业版（F5） 涉及：招投标、比价、供应商入库",
    "name": "定制版",
    "singleBuy": "1e+06",
    "singleYear": "400000",
    "clusterBuy": "2e+06",
    "clusterYear": "-",
    "users": "不限制",
    "support": "L0",
    "features": [
      {
        "name": "索引增强",
        "supported": "✅"
      },
      {
        "name": "智能切片",
        "supported": "✅"
      },
      {
        "name": "外部知识库",
        "supported": "✅"
      },
      {
        "name": "web站点同步",
        "supported": "✅"
      },
      {
        "name": "文档标签",
        "supported": "✅"
      },
      {
        "name": "文档权限",
        "supported": "✅"
      },
      {
        "name": "权限管控",
        "supported": "✅"
      },
      {
        "name": "团队应用",
        "supported": "✅"
      },
      {
        "name": "身份验证",
        "supported": "✅"
      },
      {
        "name": "用量管控",
        "supported": "✅"
      },
      {
        "name": "IM对接",
        "supported": "✅"
      },
      {
        "name": "Markdown 转文件",
        "supported": "✅"
      },
      {
        "name": "团队云端记录",
        "supported": "✅"
      },
      {
        "name": "团队插件",
        "supported": "✅"
      },
      {
        "name": "沙箱环境",
        "supported": "✅"
      },
      {
        "name": "skills",
        "supported": "✅"
      }
    ],
    "coverage": 16
  }
] as const;
export const detailSections = [
  {
    "name": "用户限制",
    "items": [
      {
        "name": "最大用户数",
        "doc": "/",
        "values": [
          "1",
          "3",
          "100",
          "1000",
          "不限制",
          "1000",
          "不限制",
          "不限制"
        ],
        "note": ""
      }
    ]
  },
  {
    "name": "门户模块",
    "items": [
      {
        "name": "门户-模型直接对话",
        "doc": "",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "门户-自定义应用页",
        "doc": "",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "门户-版权信息配置",
        "doc": "",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "门户-对话日志",
        "doc": "",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      }
    ]
  },
  {
    "name": "权限、组织架构对接模块",
    "items": [
      {
        "name": "全局权限配置",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/team_permissions/team_roles_permissions/",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "应用权限配置",
        "doc": "FastGPT应用管理规范 ",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "知识库权限配置",
        "doc": "FastGPT知识库管理规范 ",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "管理员后台",
        "doc": "后台系统-使用指南",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "外部同步成员",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/admin/sso/",
        "values": [
          "❌",
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "组织架构对接",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/admin/sso/",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "单团队模式",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/admin/teammode/",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "SSO对接",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/admin/sso/",
        "values": [
          "❌",
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "审计模块",
        "doc": "审计日志",
        "values": [
          "❌",
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "资源管理",
        "doc": "资源管理",
        "values": [
          "❌",
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "用户支付功能",
        "doc": "套餐配置，套餐管理、支付记录、开票管理",
        "values": [
          "❌",
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": "包括套餐配置、套餐管理、支付记录、开票管理；"
      }
    ]
  },
  {
    "name": "应用模块",
    "items": [
      {
        "name": "基础工作流模块",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/dashboard/intro/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "应用权限配置",
        "doc": " FastGPT应用管理规范 ",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "支持调用团队共享应用",
        "doc": "调用团队工具",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "支持调用团队共享插件",
        "doc": "调用团队工具",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "配置工具箱",
        "doc": "https://fael3z0zfze.feishu.cn/sync/JBBMdXqxLsNw9BbGF2ZcGL65neg",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "配置应用模版",
        "doc": "https://fael3z0zfze.feishu.cn/sync/JrIwdBrLysnvmubYaINcVnH0nYf",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "通过团队云端版本回退",
        "doc": "通过团队云端版本回退",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "免密登录支持QPM配置",
        "doc": "免登录窗口",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "免密登录支持用量上限配置",
        "doc": "免登录窗口",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "免密登录支持身份验证",
        "doc": "免登录窗口",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "密钥支持用量上限管控",
        "doc": "/",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "飞书机器人接入",
        "doc": "接入飞书机器人教程",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "钉钉机器人接入",
        "doc": "接入钉钉机器人教程",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "微信公众号接入",
        "doc": "接入微信公众号教程",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "批量评估",
        "doc": "在写文档",
        "values": [
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "日志增强版本（马上上线）",
        "doc": "在写文档",
        "values": [
          "❌",
          "❌",
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      }
    ]
  },
  {
    "name": "知识库模块",
    "items": [
      {
        "name": "飞书知识库对接",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/knowledge_base/lark_dataset/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "语雀知识库对接",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/knowledge_base/yuque_dataset/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "API知识库对接",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/knowledge_base/api_dataset/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "通用（文档）知识库",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/course/quick-start/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "知识库权限配置",
        "doc": "FastGPT知识库管理规范 ",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "图片知识库",
        "doc": "图片知识库",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "使用模板导入知识库",
        "doc": "使用模板导入知识库",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "Web站点同步",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/knowledge_base/websync/",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "索引增强-标题",
        "doc": "文本数据集",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "自动生成索引",
        "doc": "文本数据集",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "图片自动索引",
        "doc": "文本数据集",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "大模型辅助分块",
        "doc": "文本数据集",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      }
    ]
  },
  {
    "name": "通用模块",
    "items": [
      {
        "name": "积分使用记录",
        "doc": "积分使用记录",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "系统公告",
        "doc": "通知管理",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "系统通知",
        "doc": "通知管理",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "前端展示配置",
        "doc": "基础配置",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "系统参数配置",
        "doc": "基础配置",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "pdf解析配置",
        "doc": "基础配置",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "侧边栏配置",
        "doc": "基础配置",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "第三方账号配置",
        "doc": "第三方供应商",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "通知配置",
        "doc": "用户配置",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      }
    ]
  },
  {
    "name": "系统工具",
    "items": [
      {
        "name": "支持配置调用价格",
        "doc": "工具箱",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "支持配置系统密钥",
        "doc": "开发中",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "支持配置密钥权限",
        "doc": "开发中",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "支持禁用工具",
        "doc": "工具箱",
        "values": [
          "❌",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      }
    ]
  },
  {
    "name": "MCP",
    "items": [
      {
        "name": "支持mcp服务",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/dashboard/mcp_server/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      },
      {
        "name": "支持mcp工具集",
        "doc": "https://doc.fastgpt.cn/docs/introduction/guide/dashboard/mcp_tools/",
        "values": [
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅",
          "✅"
        ],
        "note": ""
      }
    ]
  }
] as const;
export const supportPlans = [
  {
    "level": "L3",
    "content": "付费用户工单 / 邮件支持 · 工作日 5×8 · 4 h 内首次响应 · 离线培训视频",
    "price": "6000"
  },
  {
    "level": "L2",
    "content": "L3 + 每周线上直播（新功能演示 & Q&A）\n5次更新升级服务",
    "price": "16000"
  },
  {
    "level": "L1",
    "content": "L2 + 5人天远程知识库调优 & POC 验证（共 40 h）\n10次更新升级服务",
    "price": "30000"
  },
  {
    "level": "L0",
    "content": "L1 + 原厂多对一专属技术群 · 工作日 1 h 内响应 · 4 h 内解决方案 · 7×12 h 值守\n30次更新升级服务",
    "price": "70000"
  }
] as const;
export const deliveryRows = [
  {
    "mode": "远程 / 线上指导",
    "official": "¥2500 - 3,000 / 人天",
    "partner": "¥2000 - 2,500 / 人天"
  },
  {
    "mode": "驻场 / 本地实施",
    "official": "¥3000 - 3,500 / 人天",
    "partner": "¥2500 - 3,000 / 人天"
  }
] as const;
export const expertRows = [
  {
    "type": "售前工程师",
    "price": "¥5,000/人/天",
    "note": "以上为线上实施费用，线下需要额外+20%费用，三天起订。"
  },
  {
    "type": "培训讲师",
    "price": "¥10,000人/天",
    "note": ""
  },
  {
    "type": "培训专家",
    "price": "¥20,000人/天",
    "note": ""
  }
] as const;
