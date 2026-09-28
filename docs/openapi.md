# SalesBuddy API 接口文档

在线规范地址：`GET /api/openapi`

接口默认返回 JSON 响应。文件生成接口（合同、报价单）返回二进制文件流。

---

## 仪表盘

### `GET /api/dashboard` — 获取工作台首页数据

返回客户案例、可下载材料和统计数据，用于渲染工作台首页。

**响应示例：**

```json
{
  "cases": [
    { "id": 1, "industry": "制造业", "title": "某大型制造集团", "category": "KNOWLEDGE BASE", "description": "沉淀 20 年设备知识…", "updated_at": "2026.08", "cover_tone": "sky" }
  ],
  "resources": [
    { "id": 1, "kind": "PPT", "title": "FastGPT 产品介绍 · 2026 版", "meta": "产品 PPT · 更新于今天 09:42", "size": "12.4 MB" }
  ],
  "stats": { "cases": 6, "resources": 47, "quotes": 6 }
}
```

---

## 报价单

### `POST /api/quotes` — 生成报价单

生成标准 Excel (XLSX) 报价单。响应头部包含 `X-Quote-Id`。

**请求体（JSON）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sellerName | string | 是 | 报价方公司名称 |
| sellerAddress | string | 是 | 报价方地址 |
| sellerPhone | string | 是 | 报价方电话 |
| sellerEmail | string | 否 | 报价方邮箱 |
| customerName | string | 是 | 客户名称 |
| customerContact | string | 是 | 客户联系人 |
| customerPhone | string | 是 | 客户联系方式 |
| quoteDate | date | 是 | 报价日期 |
| validUntil | date | 是 | 有效期至 |
| owner | string | 是 | 负责人 |
| items | array | 是 | 报价明细（最多 4 项） |
| notes | array | 否 | 补充说明 |

**报价明细项（item）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 产品/服务名称 |
| description | string | 否 | 规格型号描述 |
| quantity | string | 是 | 数量 |
| unit | string | 否 | 单位（如"套"） |
| unitPrice | string | 是 | 含税单价 |
| taxRate | string | 是 | 税率（如 "0.13"） |
| discount | string | 否 | 折扣率（如 "0.80"） |
| remark | string | 否 | 备注 |

---

## 合同

### `POST /api/contracts` — 创建合同台账草稿

保存一条简要的合同台账记录，不触发 DOCX 生成。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerName | string | 是 | 客户名称 |
| contact | string | 是 | 联系人 |
| contractType | string | 是 | 合同类型 |
| amount | string | 是 | 金额 |
| note | string | 否 | 备注 |

### `GET /api/contracts/list` — 查询合同台账列表

返回最近 20 条合同记录。

**响应：**

```json
{
  "contracts": [
    { "id": 1, "contract_no": "FG-2026-0001", "project_name": "FastGPT 部署项目", "party_a_name": "北京某某科技有限公司", "party_b_name": "广州环际云计算有限公司", "amount": "128000", "status": "generated", "created_at": "2026-09-28T10:00:00Z" }
  ]
}
```

### `POST /api/contracts/generate` — 生成产品销售及技术服务合同

基于 FastGPT v1.2 模板填充甲乙方信息、软件版本、服务套餐、价格和验收清单，返回 DOCX 文件。

**请求体字段说明（按步骤分组）：**

#### 步骤 1 — 双方主体与开票信息

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| partyAName | string | 是 | 甲方公司全称 |
| partyACode | string | 是 | 甲方统一社会信用代码 |
| partyALegal | string | 是 | 甲方法定代表人 |
| partyAPhone | string | 是 | 甲方联系电话 |
| partyAAddress | string | 是 | 甲方合同送达地址 |
| partyAContact | string | 是 | 甲方项目负责人 |
| partyAContactPhone | string | 是 | 甲方负责人电话 |
| partyAEmail | string | 是 | 甲方负责人邮箱 |
| invoiceCompany | string | 是 | 开票公司名称 |
| invoiceAddress | string | 是 | 开票地址 |
| invoicePhone | string | 是 | 开票电话 |
| invoiceTaxCode | string | 是 | 纳税人识别号 |
| invoiceBank | string | 是 | 开户银行 |
| invoiceAccount | string | 是 | 银行账号 |
| partyBName | string | 是 | 乙方公司全称 |
| partyBCode | string | 是 | 乙方信用代码 |
| partyBLegal | string | 是 | 乙方法定代表人 |
| partyBPhone | string | 是 | 乙方电话 |
| partyBAddress | string | 是 | 乙方地址 |
| partyBContact | string | 是 | 乙方项目负责人 |
| partyBContactPhone | string | 是 | 乙方负责人电话 |
| partyBEmail | string | 是 | 乙方负责人邮箱 |

#### 步骤 2 — 版本与价格

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contractNo | string | 是 | 合同编号 |
| signPlace | string | 是 | 签约地点 |
| signDate | date | 是 | 签约日期 |
| projectName | string | 是 | 项目名称 |
| edition | string | 是 | 软件版本（标准版/专业版/旗舰版 · 买断/订阅） |
| quantity | string | 否 | 软件数量，默认 "1" |
| softwarePrice | string | 是 | 软件含税金额 |
| serviceTier | string | 否 | 服务套餐档位：none/free/basic/advanced/flagship |
| paymentTerms | string | 是 | 付款条件 |

#### 步骤 3 — 交付与验收

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| termType | string | 否 | 服务期限类型：fixed/warranty/acceptance/other |
| serviceStart | date | 否 | 服务开始日期 |
| serviceEnd | date | 否 | 服务结束日期 |
| servicePlace | string | 是 | 服务地点 |
| deliveryMode | string | 否 | 服务方式：远程交付服务/甲方指定地点/混合方式 |
| acceptancePlace | string | 否 | 验收地点 |
| training | string | 否 | 系统培训安排 |
| scope | string | 是 | 产品功能及技术服务描述 |
| warranty | string | 否 | 免费维保期 |
| scopeRows | array | 否 | 附件二自定义清单行 |

### `POST /api/contracts/channel/generate` — 生成渠道服务商合作协议

基于渠道合作协议模板生成 DOCX。交易模式、渠道档位和乙方核心职责由模板固定。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productName | string | 是 | 产品名称，默认 "FastGPT" |
| partyAName | string | 是 | 甲方（平台方）名称 |
| partyBName | string | 是 | 乙方（渠道商）名称 |
| partyBCode | string | 是 | 乙方信用代码 |
| partyBLegal | string | 是 | 乙方授权代表 |
| partyBContact | string | 是 | 乙方联系人 |
| partyBPhone | string | 是 | 乙方电话 |
| partyBEmail | string | 是 | 乙方邮箱 |
| signPlace | string | 是 | 签约地点 |
| signDate | date | 是 | 签署日期 |
| agreementStart | date | 是 | 协议开始日期 |
| agreementEnd | date | 是 | 协议结束日期 |
| authorizedScope | string | 是 | 授权区域/客户范围 |
| clientName | string | 是 | 客户全称 |
| projectName | string | 是 | 项目名称 |
| projectScope | string | 是 | 项目区域/客户范围 |
| milestones | string | 是 | 里程碑 |
| deliverables | string | 是 | 成果清单 |
| acceptance | string | 是 | 验收人及标准 |

---

## 系统

### `GET /api/openapi` — 获取 OpenAPI 规范文档

返回符合 OpenAPI 3.0.3 标准的 JSON 规范，可直接导入 Swagger UI、Postman 等工具。

---

## 错误处理

所有接口在出错时统一返回：

```json
{ "error": "错误信息描述" }
```

HTTP 状态码：
- **200** — 成功（JSON 或文件流）
- **400** — 请求字段不完整或格式错误
- **503** — 服务器内部错误或依赖服务不可用

---

## 使用示例

**生成产品销售合同：**

```bash
curl -X POST https://your-domain/api/contracts/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "partyAName": "北京某某科技有限公司",
    "partyACode": "91110108MA0XXXXXXX",
    "partyALegal": "张三",
    "partyAPhone": "13800138000",
    "partyAAddress": "北京市海淀区…",
    "partyAContact": "李四",
    "partyAContactPhone": "13900139000",
    "partyAEmail": "lisi@example.com",
    "invoiceCompany": "北京某某科技有限公司",
    "invoiceAddress": "北京市海淀区…",
    "invoicePhone": "010-88888888",
    "invoiceTaxCode": "91110108MA0XXXXXXX",
    "invoiceBank": "中国银行北京分行",
    "invoiceAccount": "123456789012",
    "partyBName": "广州环际云计算有限公司",
    "partyBCode": "91330110MA7LDJDX4M",
    "partyBLegal": "方海涛",
    "partyBPhone": "19032009190",
    "partyBAddress": "杭州市余杭区…",
    "partyBContact": "小王",
    "partyBContactPhone": "19032009191",
    "partyBEmail": "wang@example.com",
    "contractNo": "FG-2026-0001",
    "signPlace": "北京市",
    "signDate": "2026-09-28",
    "projectName": "FastGPT 私有化部署项目",
    "softwarePrice": "128000",
    "paymentTerms": "合同签订后支付 50%，验收后支付 50%",
    "servicePlace": "北京市海淀区",
    "scope": "FastGPT 私有化部署、知识库接入和业务工作流配置"
  }' \
  -o contract.docx
```

**查询合同台账：**

```bash
curl https://your-domain/api/contracts/list
```