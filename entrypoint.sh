#!/usr/bin/env bash
set -Eeuo pipefail

# Sealos 会在发布前自动执行 `pnpm run build`（包含 scripts/prepare-standalone.mjs）。
# entrypoint.sh 只负责启动已构建好的生产服务器，不包含任何构建步骤。
cd "$(dirname "$0")"

export NODE_ENV=production
export PORT="${PORT:-3000}"
# standalone/server.js 会读取 HOSTNAME，shell 默认的 HOSTNAME 是容器主机名，
# 会导致只监听该主机名。这里显式绑定 0.0.0.0。
export HOSTNAME=0.0.0.0

# Next.js standalone 产物由 next build 生成并补齐静态资源后启动。
exec node .next/standalone/server.js
