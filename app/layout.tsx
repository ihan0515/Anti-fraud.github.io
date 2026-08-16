import type { Metadata } from "next";
import "./globals.css";
import "./tiles.css";
import "./evolution.css";
import "./media-ranking.css";
import "./police-theme.css";
import "./keyword-news.css";

// GitHub Pages 子路径前缀（由构建环境注入，本地为空）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata:Metadata={
  title:"电诈话术风险词云",
  description:"四时期电信网络诈骗话术情感加权可交互词云",
  icons:{icon:`${basePath}/favicon.svg`}
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="zh-CN"><body>{children}</body></html>
}

