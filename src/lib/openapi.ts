export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "SalesBuddy API",
    version: "1.1.0",
    description:
      "SalesBuddy（SalesKit）是 FastGPT 商务团队使用的销售材料工作台，提供客户案例展示、报价单生成、合同自动化与材料中心等功能。\n\n" +
      "合同生成接口返回可下载的 DOCX 文件，报价单生成接口返回可下载的 XLSX 文件，其他接口返回 JSON。",
  },
  servers: [{ url: "/", description: "当前 SalesBuddy 服务" }],
  paths: {
    // ─── Dashboard ───────────────────────────────────────────────
    "/api/dashboard": {
      get: {
        summary: "获取工作台首页数据",
        operationId: "getDashboard",
        tags: ["仪表盘"],
        responses: {
          "200": {
            description: "仪表盘数据",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardResponse" },
              },
            },
          },
          "503": { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },

    // ─── Quotes ──────────────────────────────────────────────────
    "/api/quotes": {
      post: {
        summary: "生成报价单",
        operationId: "generateQuote",
        tags: ["报价单"],
        description: "生成一份带明细的报价单 Excel 文件。响应为二进制 XLSX 流。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/QuoteRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "XLSX 报价单文件",
            content: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                schema: { type: "string", format: "binary" },
              },
            },
            headers: {
              "X-Quote-Id": {
                schema: { type: "integer" },
                description: "报价单数据库记录 ID",
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "503": { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },

    // ─── Contracts ───────────────────────────────────────────────
    "/api/contracts": {
      post: {
        summary: "创建合同台账记录（草稿）",
        operationId: "createContractRecord",
        tags: ["合同"],
        description: "保存一条合同草稿记录到数据库，不触发 DOCX 生成。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContractDraftRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "创建成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ok", "id"],
                  properties: {
                    ok: { type: "boolean" },
                    id: { type: "integer" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "503": { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/contracts/list": {
      get: {
        summary: "查询合同台账列表",
        operationId: "listContracts",
        tags: ["合同"],
        description: "返回最近 20 条合同记录的概览数据。",
        responses: {
          "200": {
            description: "合同记录列表",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["contracts"],
                  properties: {
                    contracts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ContractRecord" },
                    },
                  },
                },
              },
            },
          },
          "503": { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/contracts/generate": {
      post: {
        summary: "生成 FastGPT 产品销售及技术服务合同",
        operationId: "generateProductContract",
        tags: ["合同"],
        description:
          "基于 Word 模板 (.docx) 填充甲乙方信息、软件版本、服务套餐、价格和验收清单，返回完整的 DOCX 文件。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductContractRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "DOCX 合同文件",
            content: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "503": { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },
    "/api/contracts/channel/generate": {
      post: {
        summary: "生成渠道服务商合作协议",
        operationId: "generateChannelContract",
        tags: ["合同"],
        description:
          "基于渠道合作协议模板生成 DOCX，交易模式、渠道档位和乙方核心职责由协议模板固定。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChannelContractRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "DOCX 协议文件",
            content: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "503": { $ref: "#/components/responses/ServiceUnavailable" },
        },
      },
    },

    // ─── OpenAPI spec ───────────────────────────────────────────
    "/api/openapi": {
      get: {
        summary: "获取 OpenAPI 规范文档",
        operationId: "getOpenApiSpec",
        tags: ["系统"],
        responses: {
          "200": {
            description: "OpenAPI 3.0.3 JSON 规范",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
        },
      },
    },
  },

  components: {
    schemas: {
      // ─── Dashboard ──────────────────────────────────────────────
      DashboardResponse: {
        type: "object",
        required: ["cases", "resources", "stats"],
        properties: {
          cases: {
            type: "array",
            items: { $ref: "#/components/schemas/CaseItem" },
          },
          resources: {
            type: "array",
            items: { $ref: "#/components/schemas/ResourceItem" },
          },
          stats: {
            type: "object",
            properties: {
              cases: { type: "integer" },
              resources: { type: "integer" },
              quotes: { type: "integer" },
            },
          },
        },
      },
      CaseItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          industry: { type: "string" },
          title: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          updated_at: { type: "string" },
          cover_tone: { type: "string" },
        },
      },
      ResourceItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          kind: { type: "string" },
          title: { type: "string" },
          meta: { type: "string" },
          size: { type: "string" },
        },
      },

      // ─── Quotes ──────────────────────────────────────────────────
      QuoteRequest: {
        type: "object",
        required: [
          "sellerName", "sellerAddress", "sellerPhone",
          "customerName", "customerContact", "customerPhone",
          "quoteDate", "validUntil", "owner", "items",
        ],
        properties: {
          sellerName: { type: "string", example: "广州环界云计算有限公司" },
          sellerAddress: { type: "string" },
          sellerPhone: { type: "string" },
          sellerEmail: { type: "string", format: "email" },
          customerName: { type: "string" },
          customerContact: { type: "string" },
          customerPhone: { type: "string" },
          quoteDate: { type: "string", format: "date" },
          validUntil: { type: "string", format: "date" },
          owner: { type: "string" },
          items: {
            type: "array",
            maxItems: 4,
            items: { $ref: "#/components/schemas/QuoteItem" },
          },
          notes: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      QuoteItem: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          quantity: { type: "string", example: "1" },
          unit: { type: "string", example: "套" },
          unitPrice: { type: "string" },
          taxRate: { type: "string", example: "0.13" },
          discount: { type: "string", example: "1" },
          remark: { type: "string" },
        },
      },

      // ─── Contracts ────────────────────────────────────────────────
      ContractDraftRequest: {
        type: "object",
        required: ["customerName", "contact", "contractType", "amount"],
        properties: {
          customerName: { type: "string" },
          contact: { type: "string" },
          contractType: { type: "string" },
          amount: { type: "string" },
          note: { type: "string" },
        },
      },

      ProductContractRequest: {
        type: "object",
        description:
          "产品销售合同字段。服务层会校验下列 required 字段，其他模板字段可按需传入。",
        required: [
          "partyAName", "partyACode", "partyALegal", "partyAPhone",
          "partyAAddress", "invoiceCompany", "invoiceAddress", "invoicePhone",
          "invoiceTaxCode", "invoiceBank", "invoiceAccount",
          "partyBName", "partyBCode", "partyBLegal", "partyBPhone",
          "partyBAddress", "contractNo", "signPlace", "signDate",
          "projectName", "softwarePrice", "paymentTerms", "servicePlace",
          "scope", "partyAContact", "partyAContactPhone", "partyAEmail",
          "partyBContact", "partyBContactPhone", "partyBEmail",
        ],
        properties: {
          // 甲方
          partyAName: { type: "string", example: "北京某某科技有限公司" },
          partyACode: { type: "string", description: "统一社会信用代码" },
          partyALegal: { type: "string", description: "法定代表人" },
          partyAPhone: { type: "string" },
          partyAAddress: { type: "string", description: "合同送达地址" },
          partyAContact: { type: "string", description: "项目负责人" },
          partyAContactPhone: { type: "string" },
          partyAEmail: { type: "string", format: "email" },
          // 开票信息
          invoiceCompany: { type: "string" },
          invoiceAddress: { type: "string" },
          invoicePhone: { type: "string" },
          invoiceTaxCode: { type: "string", description: "纳税人识别号" },
          invoiceBank: { type: "string" },
          invoiceAccount: { type: "string" },
          // 乙方
          partyBName: { type: "string", example: "广州环际云计算有限公司" },
          partyBCode: { type: "string" },
          partyBLegal: { type: "string" },
          partyBPhone: { type: "string" },
          partyBAddress: { type: "string" },
          partyBContact: { type: "string" },
          partyBContactPhone: { type: "string" },
          partyBEmail: { type: "string", format: "email" },
          // 合同信息
          contractNo: { type: "string", example: "FG-2026-0001" },
          signPlace: { type: "string" },
          signDate: { type: "string", format: "date" },
          projectName: { type: "string" },
          edition: {
            type: "string",
            enum: [
              "标准版 FastGPT - 买断", "标准版 FastGPT - 订阅",
              "专业版 FastGPT - 买断", "专业版 FastGPT - 订阅",
              "旗舰版 FastGPT - 买断", "旗舰版 FastGPT - 订阅",
            ],
            example: "标准版 FastGPT - 买断",
          },
          quantity: { type: "string", example: "1" },
          softwarePrice: { type: "string", example: "128000" },
          serviceTier: {
            type: "string",
            enum: ["none", "free", "basic", "advanced", "flagship"],
            description: "技术支持服务套餐档位",
          },
          servicePrice: { type: "string" },
          paymentTerms: { type: "string" },
          termType: {
            type: "string",
            enum: ["fixed", "warranty", "acceptance", "other"],
          },
          serviceStart: { type: "string", format: "date" },
          serviceEnd: { type: "string", format: "date" },
          servicePlace: { type: "string" },
          deliveryMode: {
            type: "string",
            enum: ["远程交付服务", "甲方指定地点", "混合方式"],
          },
          acceptancePlace: { type: "string" },
          training: { type: "string" },
          scope: { type: "string", description: "产品功能及技术服务描述" },
          warranty: { type: "string" },
          supportChannels: { type: "string" },
          supportOwner: { type: "string" },
          supportPhone: { type: "string" },
          invoiceType: {
            type: "string",
            enum: ["增值税专用发票", "增值税普通发票"],
          },
          bankName: { type: "string" },
          bankBranch: { type: "string" },
          bankAccount: { type: "string" },
          services: {
            type: "array",
            items: { type: "string" },
            description: "勾选的服务项（匹配模板中的复选框）",
          },
          scopeRows: {
            type: "array",
            items: { $ref: "#/components/schemas/ScopeRow" },
            description: "附件二自定义清单行",
          },
        },
        additionalProperties: true,
      },

      ScopeRow: {
        type: "object",
        properties: {
          module: { type: "string", description: "模块名称" },
          description: { type: "string", description: "功能点 / 描述" },
          deliverable: { type: "string", description: "交付物" },
          acceptance: { type: "string", description: "验收标准" },
        },
      },

      ChannelContractRequest: {
        type: "object",
        required: [
          "productName", "partyAName", "partyBName", "signPlace", "signDate",
          "agreementStart", "agreementEnd", "authorizedScope",
          "partyACode", "partyAAddress", "partyALegal", "partyAContact", "partyAPhone",
          "partyBCode", "partyBAddress", "partyBLegal", "partyBContact", "partyBPhone", "partyBEmail",
          "clientName", "projectName", "clientDepartment", "registrationNo",
          "confirmDate", "protectionEnd", "projectScope", "milestones", "deliverables", "acceptance",
        ],
        properties: {
          productName: { type: "string", example: "FastGPT" },
          // 甲方
          partyAName: { type: "string", example: "广州环际云计算有限公司" },
          partyACode: { type: "string" },
          partyAAddress: { type: "string" },
          partyALegal: { type: "string" },
          partyAContact: { type: "string" },
          partyAPhone: { type: "string" },
          partyAEmail: { type: "string", format: "email" },
          // 乙方
          partyBName: { type: "string" },
          partyBCode: { type: "string" },
          partyBAddress: { type: "string" },
          partyBLegal: { type: "string" },
          partyBContact: { type: "string" },
          partyBPhone: { type: "string" },
          partyBEmail: { type: "string", format: "email" },
          // 协议信息
          signPlace: { type: "string" },
          signDate: { type: "string", format: "date" },
          termYears: { type: "string", example: "1" },
          agreementStart: { type: "string", format: "date" },
          agreementEnd: { type: "string", format: "date" },
          authorizedScope: { type: "string" },
          authorizedProduct: { type: "string" },
          // 项目合作确认
          clientName: { type: "string", description: "客户全称" },
          projectName: { type: "string" },
          clientDepartment: { type: "string" },
          registrationNo: { type: "string", description: "报备编号" },
          confirmDate: { type: "string", format: "date" },
          protectionEnd: { type: "string", format: "date" },
          projectProduct: { type: "string" },
          projectScope: { type: "string" },
          taxRate: { type: "string", example: "13%" },
          includedBase: { type: "string", description: "可分成基数·计入" },
          excludedBase: { type: "string", description: "可分成基数·扣除" },
          milestones: { type: "string" },
          deliverables: { type: "string" },
          acceptance: { type: "string" },
          renewalDetail: { type: "string" },
          specialTerms: { type: "string" },
        },
        additionalProperties: true,
      },

      ContractRecord: {
        type: "object",
        properties: {
          id: { type: "integer" },
          contract_no: { type: "string", nullable: true },
          project_name: { type: "string", nullable: true },
          party_a_name: { type: "string", nullable: true },
          party_b_name: { type: "string", nullable: true },
          amount: { type: "string" },
          status: { type: "string", enum: ["draft", "generated"] },
          created_at: { type: "string", format: "date-time" },
        },
      },

      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" },
        },
      },
    },

    responses: {
      BadRequest: {
        description: "请求字段不完整或格式错误",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      ServiceUnavailable: {
        description: "生成器或数据库暂不可用",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
} as const;