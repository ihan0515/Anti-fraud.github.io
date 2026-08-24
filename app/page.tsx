import type { Metadata } from "next";
import WordCloudStudio from "./word-cloud-studio";

export const metadata: Metadata = {
  title: "数据驱动的电诈话术演化分析与反诈宣传教育平台",
  description: "2017—2026 年四时期电信网络诈骗话术情感加权词云与防诈研究平台",
};

export default function Home() {
  return <WordCloudStudio />;
}
