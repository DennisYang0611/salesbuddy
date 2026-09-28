import { NextResponse } from "next/server";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type ContractPayload = Record<string, unknown>;

function runGenerator(payloadPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("python3", [join(process.cwd(), "scripts/generate_contract.py"), payloadPath, outputPath], {
      cwd: process.cwd(),
      env: process.env,
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr.trim() || `合同生成进程退出码 ${code}`)));
  });
}

function text(payload: ContractPayload, key: string) {
  return String(payload[key] ?? "").trim();
}

export async function POST(request: Request) {
  let folder = "";
  try {
    const payload = await request.json() as ContractPayload;
    const required = ["partyAName", "partyACode", "partyALegal", "partyAPhone", "partyAAddress", "invoiceCompany", "invoiceAddress", "invoicePhone", "invoiceTaxCode", "invoiceBank", "invoiceAccount", "partyBName", "partyBCode", "partyBLegal", "partyBPhone", "partyBAddress", "contractNo", "signPlace", "signDate", "projectName", "softwarePrice", "paymentTerms", "servicePlace", "scope", "partyAContact", "partyAContactPhone", "partyAEmail", "partyBContact", "partyBContactPhone", "partyBEmail"];
    const missing = required.filter((key) => !text(payload, key));
    if (missing.length) {
      return NextResponse.json({ error: `请补齐必填字段：${missing.slice(0, 4).join("、")}${missing.length > 4 ? "等" : ""}` }, { status: 400 });
    }

    folder = await mkdtemp(join(tmpdir(), "salesbuddy-contract-"));
    const payloadPath = join(folder, "payload.json");
    const outputPath = join(folder, "contract.docx");
    await writeFile(payloadPath, JSON.stringify(payload, null, 2), "utf8");
    await runGenerator(payloadPath, outputPath);
    const document = await readFile(outputPath);

    await query(
      `insert into sales_contracts (customer_name, contact, contract_type, amount, note, contract_no, project_name, party_a_name, party_b_name, status, payload)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'generated', $10::jsonb)`,
      [text(payload, "partyAName"), text(payload, "partyAContact"), "FastGPT 产品销售及技术服务合同", text(payload, "softwarePrice"), text(payload, "scope"), text(payload, "contractNo"), text(payload, "projectName"), text(payload, "partyAName"), text(payload, "partyBName"), JSON.stringify(payload)],
    );

    const filename = `FastGPT合同-${text(payload, "contractNo")}.docx`;
    return new NextResponse(document, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": String(document.length),
      },
    });
  } catch (error) {
    console.error("contract generation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "合同生成失败" }, { status: 503 });
  } finally {
    if (folder) await rm(folder, { recursive: true, force: true }).catch(() => undefined);
  }
}
