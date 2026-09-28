/**
 * Next.js 的 `output: "standalone"` 产物不会自动包含以下内容：
 *   - .next/static  （客户端 JS/CSS，缺失会导致页面白屏）
 *   - public        （静态资源）
 *   - 环境变量文件  （.env / .env.local）
 *   - 运行时会动态读取的目录（如 Python 脚本使用的 contract-assets）
 *
 * 本脚本在 `next build` 之后执行，把上述内容补齐到 .next/standalone，
 * 使 standalone 产物可以独立启动，供 Sealos entrypoint.sh 使用。
 */
import { cp, mkdir, access, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(from, to, label) {
  if (!(await exists(from))) {
    console.log(`[standalone] 跳过 ${label}（源不存在）`);
    return;
  }
  await mkdir(join(to, ".."), { recursive: true });
  await cp(from, to, { recursive: true, force: true });
  console.log(`[standalone] 已复制 ${label}`);
}

async function main() {
  if (!(await exists(standalone))) {
    console.error("[standalone] 未找到 .next/standalone，请确认 next.config.mjs 已启用 output: \"standalone\"");
    process.exit(1);
  }

  // 1. 客户端静态资源，缺失会导致样式与 JS 加载失败
  await copyIfExists(
    join(root, ".next", "static"),
    join(standalone, ".next", "static"),
    ".next/static",
  );

  // 2. public 目录
  await copyIfExists(join(root, "public"), join(standalone, "public"), "public");

  // 3. Python 合同/报价脚本依赖的模板目录
  for (const dir of ["contract-assets", "quote-assets", "scripts"]) {
    await copyIfExists(join(root, dir), join(standalone, dir), `${dir}/`);
  }

  // 4. 环境变量文件（本地开发用；生产建议在 Sealos 应用管理中配置）
  const entries = await readdir(root).catch(() => []);
  for (const file of entries) {
    if (/^\.env(\.|$)/.test(file)) {
      await copyIfExists(join(root, file), join(standalone, file), file);
    }
  }

  console.log("[standalone] 产物准备完成");
}

main().catch((error) => {
  console.error("[standalone] 准备失败:", error);
  process.exit(1);
});
