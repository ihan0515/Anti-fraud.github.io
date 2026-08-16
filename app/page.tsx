import type { Metadata } from "next";
import WordCloudStudio from "./word-cloud-studio";

export const metadata: Metadata = {
  title: "电诈话术风险词云",
  description: "2017—2026年四时期电信网络诈骗话术情感加权词云",
};

export default function Home() {
  return <WordCloudStudio />;
}
