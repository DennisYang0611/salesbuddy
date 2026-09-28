import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await query(`select id, contract_no, project_name, party_a_name, party_b_name, amount, status, created_at from sales_contracts order by created_at desc limit 20`);
    return NextResponse.json({ contracts: result.rows });
  } catch (error) {
    console.error("contract list failed", error);
    return NextResponse.json({ error: "合同记录读取失败" }, { status: 503 });
  }
}
