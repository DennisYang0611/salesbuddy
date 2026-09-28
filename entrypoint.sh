#!/usr/bin/env bash
set -Eeuo pipefail

# Sealos 会在发布前自动执行 pnpm run build。
# entrypoint.sh 只负责启动已构建好的生产服务器，不包含构建步骤。
cd "$(dirname "$0")"

PORT="${PORT:-3000}"

# Next.js standalone 输出模式
export NODE_ENV=production
exec node .next/standalone/server.js
