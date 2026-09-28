import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = String(body.customerName ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    const contractType = String(body.contractType ?? "").trim();
    const amount = String(body.amount ?? "").trim();
    const note = String(body.note ?? "").trim();
    if (!customerName || !contact || !contractType || !amount) {
      return NextResponse.json({ error: "请完整填写必填字段" }, { status: 400 });
    }
    const result = await query(
      "insert into sales_contracts (customer_name, contact, contract_type, amount, note) values ($1, $2, $3, $4, $5) returning id, created_at",
      [customerName, contact, contractType, amount, note],
    );
    return NextResponse.json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    console.error("contract save failed", error);
    return NextResponse.json({ error: "合同信息保存失败" }, { status: 503 });
  }
}
