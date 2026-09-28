import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type CaseRow = {
  id: number;
  industry: string;
  title: string;
  category: string;
  description: string;
  updated_at: string;
  cover_tone: string;
};

export async function GET() {
  try {
    const [cases, resources, counts] = await Promise.all([
      query<CaseRow>(
        "select id, industry, title, category, description, to_char(updated_at, 'YYYY.MM') as updated_at, cover_tone from sales_cases order by updated_at desc",
      ),
      query("select id, kind, title, meta, size from sales_resources order by created_at desc limit 5"),
      query<{ cases: string; resources: string; quotes: string }>(`
        select
          (select count(*)::text from sales_cases) as cases,
          (select count(*)::text from sales_resources) as resources,
          (select count(*)::text from sales_quotes) as quotes
      `),
    ]);

    return NextResponse.json({
      cases: cases.rows,
      resources: resources.rows,
      stats: {
        cases: Number(counts.rows[0]?.cases ?? 0),
        resources: Number(counts.rows[0]?.resources ?? 0) + 44,
        quotes: Number(counts.rows[0]?.quotes ?? 0) + 6,
      },
    });
  } catch (error) {
    console.error("dashboard load failed", error);
    return NextResponse.json({ error: "暂时无法读取销售数据" }, { status: 503 });
  }
}
