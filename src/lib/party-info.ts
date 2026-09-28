export type ParsedPartyInfo = {
  name: string;
  code: string;
  legal: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  invoiceCompany: string;
  invoiceAddress: string;
  invoicePhone: string;
  invoiceTaxCode: string;
  invoiceBank: string;
  invoiceAccount: string;
};

export const partyInfoTemplate = `您好，这边需要收集一下咱们的信息，填入合同模板，信息如下：
公司名：XX
统一社会信用代码：XX
法定代表人：XX
公司地址：XX
联系人：XX
联系电话：XX
电子邮箱：XX
开票公司：XX
开票地址：XX
开票电话：XX
纳税人识别号：XX
开户银行：XX
银行账号：XX`;

const aliases: Record<keyof ParsedPartyInfo, string[]> = {
  name: ["公司名", "公司名称", "公司全称", "单位名称"],
  code: ["统一社会信用代码", "社会信用代码", "信用代码"],
  legal: ["法定代表人", "法人", "授权代表"],
  address: ["公司地址", "注册地址", "合同送达地址", "送达地址", "联系地址", "邮寄地址"],
  contact: ["联系人", "项目负责人", "负责人"],
  phone: ["联系电话", "公司电话", "联系人电话", "负责人电话", "项目负责人电话"],
  email: ["电子邮箱", "邮箱", "联系邮箱", "负责人邮箱", "Email", "email"],
  invoiceCompany: ["开票公司", "开票公司名称", "开票抬头", "发票抬头"],
  invoiceAddress: ["开票地址"],
  invoicePhone: ["开票电话"],
  invoiceTaxCode: ["纳税人识别号", "开票税号"],
  invoiceBank: ["开户银行", "开票银行"],
  invoiceAccount: ["银行账号", "银行账户", "开票账号"],
};

function readValue(source: string, labels: string[]) {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^([^:：]+)\s*[:：]\s*(.*)$/);
    if (!match) continue;
    const label = match[1].trim().toLowerCase();
    if (labels.some((item) => item.toLowerCase() === label)) return match[2].trim();
  }
  return "";
}

export function parsePartyInfo(source: string): ParsedPartyInfo {
  return Object.fromEntries(Object.entries(aliases).map(([key, labels]) => [key, readValue(source, labels)])) as ParsedPartyInfo;
}
