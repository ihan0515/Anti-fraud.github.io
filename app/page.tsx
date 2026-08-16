import type { Metadata } from "next";
import WordCloudStudio from "./word-cloud-studio";

export const metadata: Metadata = {
  title: "电诈话术文本演化规律研究与防诈平台",
  description: "2017—2026 年四时期电信网络诈骗话术情感加权词云与防诈研究平台",
};

export default function Home() {
  return <WordCloudStudio />;
}
