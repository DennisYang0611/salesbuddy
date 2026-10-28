import { NextResponse } from "next/server";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { query } from "@/lib/db";

export const runtime = "nodejs";

function runGenerator(payloadPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("python3", [join(process.cwd(), "scripts/generate_quote.py"), join(process.cwd(), "quote-assets/20260527_报价单_7.xlsx"), payloadPath, outputPath], { cwd: process.cwd(), env: process.env });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr.trim() || `报价单生成进程退出码 ${code}`)));
  });
}

export async function POST(request: Request) {
  let folder = "";
  try {
    const body = await request.json();
    const customerName = String(body.customerName ?? "").trim();
    const items = Array.isArray(body.items) ? body.items.filter((item: { name?: string }) => String(item?.name ?? "").trim()).slice(0, 4) : [];
    const required = [body.sellerName, body.sellerAddress, body.customerName, body.customerContact, body.customerPhone, body.quoteDate, body.validUntil, body.owner];
    if (body.sellerPhoneVisible !== false && !String(body.sellerPhone ?? "").trim()) required.push(body.sellerPhone);
    if (required.some((value) => !String(value ?? "").trim()) || !items.length) return NextResponse.json({ error: "请完整填写报价信息和至少一项明细" }, { status: 400 });
    const softwareVersion = String(items[0].name ?? "产品报价").trim();
    const servicePackage = items.slice(1).map((item: { name?: string }) => String(item.name ?? "").trim()).join("、") || "未添加技术服务";
    const validity = `有效至 ${String(body.validUntil).slice(0, 10)}`;
    const result = await query("insert into sales_quotes (customer_name, software_version, service_package, validity, currency) values ($1, $2, $3, $4, $5) returning id", [customerName, softwareVersion, servicePackage, validity, "人民币（CNY）"]);
    folder = await mkdtemp(join(tmpdir(), "salesbuddy-quote-"));
    const payloadPath = join(folder, "payload.json"); const outputPath = join(folder, "quote.xlsx");
    await writeFile(payloadPath, JSON.stringify({ ...body, items }, null, 2), "utf8");
    await runGenerator(payloadPath, outputPath);
    const document = await readFile(outputPath);
    const filename = `产品报价单-${customerName}.xlsx`;
    return new NextResponse(document, { status: 200, headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`, "Content-Length": String(document.length), "X-Quote-Id": String(result.rows[0].id) } });
  } catch (error) {
    console.error("quote save failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "报价单生成失败" }, { status: 503 });
  } finally { if (folder) await rm(folder, { recursive: true, force: true }).catch(() => undefined); }
}
