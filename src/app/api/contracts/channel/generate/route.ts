import { NextResponse } from "next/server";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { query } from "@/lib/db";

export const runtime = "nodejs";
type Payload = Record<string, unknown>;

function text(payload: Payload, key: string) { return String(payload[key] ?? "").trim(); }
function runGenerator(payloadPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("python3", [join(process.cwd(), "scripts/generate_channel_contract.py"), payloadPath, outputPath], { cwd: process.cwd(), env: process.env });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr.trim() || `合同生成进程退出码 ${code}`)));
  });
}

export async function POST(request: Request) {
  let folder = "";
  try {
    const payload = await request.json() as Payload;
    const required = [
      "productName", "partyAName", "partyBName", "signPlace", "signDate", "agreementStart", "agreementEnd", "authorizedScope",
      "partyACode", "partyAAddress", "partyALegal", "partyAContact", "partyAPhone",
      "partyBCode", "partyBAddress", "partyBLegal", "partyBContact", "partyBPhone", "partyBEmail",
      "clientName", "projectName", "clientDepartment", "registrationNo", "confirmDate", "protectionEnd", "projectScope",
      "milestones", "deliverables", "acceptance",
    ];
    const missing = required.filter((key) => !text(payload, key));
    if (missing.length) return NextResponse.json({ error: `请补齐必填字段：${missing.slice(0, 4).join("、")}${missing.length > 4 ? "等" : ""}` }, { status: 400 });

    const contractNo = `CH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const enriched = { ...payload, contractNo };
    folder = await mkdtemp(join(tmpdir(), "salesbuddy-channel-contract-"));
    const payloadPath = join(folder, "payload.json");
    const outputPath = join(folder, "contract.docx");
    await writeFile(payloadPath, JSON.stringify(enriched, null, 2), "utf8");
    await runGenerator(payloadPath, outputPath);
    const document = await readFile(outputPath);
    await query(
      `insert into sales_contracts (customer_name, contact, contract_type, amount, note, contract_no, project_name, party_a_name, party_b_name, status, payload)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'generated', $10::jsonb)`,
      [text(enriched, "clientName"), text(enriched, "partyBContact"), "渠道服务商合作协议", text(enriched, "fixedRate"), text(enriched, "specialTerms"), contractNo, text(enriched, "projectName"), text(enriched, "partyAName"), text(enriched, "partyBName"), JSON.stringify(enriched)],
    );
    const filename = `渠道服务商合作协议-${text(enriched, "partyBName")}.docx`;
    return new NextResponse(document, { status: 200, headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`, "Content-Length": String(document.length) } });
  } catch (error) {
    console.error("channel contract generation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "渠道协议生成失败" }, { status: 503 });
  } finally { if (folder) await rm(folder, { recursive: true, force: true }).catch(() => undefined); }
}
