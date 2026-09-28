import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var salesbuddyPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

export const pool =
  global.salesbuddyPool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  global.salesbuddyPool = pool;
}

let schemaReady: Promise<void> | undefined;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        create table if not exists sales_cases (
          id serial primary key,
          industry text not null,
          title text not null,
          category text not null,
          description text not null,
          updated_at date not null default current_date,
          cover_tone text not null default 'sky',
          created_at timestamptz not null default now()
        );
        create table if not exists sales_resources (
          id serial primary key,
          kind text not null,
          title text not null,
          meta text not null,
          size text not null,
          created_at timestamptz not null default now()
        );
        create table if not exists sales_quotes (
          id serial primary key,
          customer_name text not null,
          software_version text not null,
          service_package text not null,
          validity text not null,
          currency text not null,
          created_at timestamptz not null default now()
        );
        create table if not exists sales_contracts (
          id serial primary key,
          customer_name text not null,
          contact text not null,
          contract_type text not null,
          amount text not null,
          note text not null default '',
          contract_no text,
          project_name text,
          party_a_name text,
          party_b_name text,
          status text not null default 'draft',
          payload jsonb not null default '{}'::jsonb,
          created_at timestamptz not null default now()
        );
        alter table sales_contracts add column if not exists contract_no text;
        alter table sales_contracts add column if not exists project_name text;
        alter table sales_contracts add column if not exists party_a_name text;
        alter table sales_contracts add column if not exists party_b_name text;
        alter table sales_contracts add column if not exists status text not null default 'draft';
        alter table sales_contracts add column if not exists payload jsonb not null default '{}'::jsonb;
      `);

      const { rows: caseCount } = await pool.query<{ count: string }>(
        "select count(*)::text as count from sales_cases",
      );
      if (caseCount[0]?.count === "0") {
        await pool.query(`
          insert into sales_cases (industry, title, category, description, updated_at, cover_tone) values
          ('制造业', '某大型制造集团', 'KNOWLEDGE BASE', '沉淀 20 年设备知识，现场问答效率提升 80%。', '2026-08-01', 'sky'),
          ('金融', '某股份制银行', 'AI ASSISTANT', '构建合规知识助手，支持 2 万名员工日常查询。', '2026-07-01', 'sand'),
          ('政务', '某省政务服务中心', 'SMART SERVICE', '统一政策问答入口，群众咨询响应从天级到秒级。', '2026-06-01', 'rose'),
          ('教育', '某 985 高校', 'CAMPUS GPT', '面向师生的校内 AI 助手，覆盖课程与行政服务。', '2026-05-01', 'lilac'),
          ('零售', '某连锁零售品牌', 'RETAIL COPILOT', '让一线门店快速生成营销内容，周转效率提升 3 倍。', '2026-04-01', 'mint'),
          ('医疗', '某三甲医院', 'CARE AI', '搭建院内知识服务平台，帮助医护快速定位规范。', '2026-03-01', 'sky')
        `);
      }

      const { rows: resourceCount } = await pool.query<{ count: string }>(
        "select count(*)::text as count from sales_resources",
      );
      if (resourceCount[0]?.count === "0") {
        await pool.query(`
          insert into sales_resources (kind, title, meta, size) values
          ('PPT', 'FastGPT 产品介绍 · 2026 版', '产品 PPT · 更新于今天 09:42', '12.4 MB'),
          ('CASE', '某大型制造集团 · 知识库落地案例', '客户案例 · 更新于昨天 16:18', '8.7 MB'),
          ('PDF', '技术支持服务套餐 · 付费版', '报价单 · 更新于 8 月 19 日', '2.1 MB')
        `);
      }
    })();
  }
  return schemaReady;
}

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  await ensureSchema();
  return pool.query<T>(text, values);
}
