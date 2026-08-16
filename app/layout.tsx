import type { Metadata } from "next";
import "./globals.css";
import "./tiles.css";
import "./evolution.css";
import "./media-ranking.css";
import "./pie-chart.css";
import "./police-theme.css";
import "./keyword-news.css";

// GitHub Pages 子路径前缀（由构建环境注入，本地为空）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata:Metadata={
  title:"电诈话术文本演化规律研究与防诈平台",
  description:"四时期电信网络诈骗话术情感加权词云与防诈研究平台",
  icons:{icon:`${basePath}/favicon.svg`}
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="zh-CN"><body>{children}</body></html>
}
