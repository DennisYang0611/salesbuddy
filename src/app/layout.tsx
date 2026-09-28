import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesKit · 商务材料工作台",
  description: "FastGPT 商务团队的销售材料与客户案例工作台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
