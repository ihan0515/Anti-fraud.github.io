import type { NewsItem } from "./news-types";
import { newsCatalog as s1Catalog, keywordNews as s1Map } from "./stage1-news";
import { newsCatalog as s2Catalog, keywordNews as s2Map } from "./stage2-news";
import { newsCatalog as s3Catalog, keywordNews as s3Map } from "./stage3-news";
import { newsCatalog as s4Catalog, keywordNews as s4Map } from "./stage4-news";

export type { NewsItem };

export interface StageNews {
  id: number;
  title: string;
  catalog: Record<string, NewsItem>;
  keywordMap: Record<string, string[]>;
  /** 是否已完成资料核验（stage2 由文档结构化生成；stage1/3 由素材构建；stage4 为原始链接，待核验） */
  verified: boolean;
}

export const stageMeta: Record<number, { title: string; newsNote: string }> = {
  1: { title: "萌芽期", newsNote: "2017—2019 官方案例链接汇编（与萌芽期年份一致）" },
  2: { title: "发展期", newsNote: "2020—2021 公开案例（与发展期年份一致，共 104 条）" },
  3: { title: "升级期", newsNote: "2022—2023 公开反诈报道（与升级期年份一致）" },
  4: { title: "智能化期", newsNote: "2024—2026 公开报道（原始链接，摘要待人工核验）" },
};

export const newsByStage: Record<number, StageNews> = {
  1: { id: 1, title: "萌芽期", catalog: s1Catalog, keywordMap: s1Map, verified: true },
  2: { id: 2, title: "发展期", catalog: s2Catalog, keywordMap: s2Map, verified: true },
  3: { id: 3, title: "升级期", catalog: s3Catalog, keywordMap: s3Map, verified: true },
  4: { id: 4, title: "智能化期", catalog: s4Catalog, keywordMap: s4Map, verified: false },
};

/** 按时期与关键词取新闻案例 */
export function getKeywordNews(stage: number, word: string): NewsItem[] {
  const s = newsByStage[stage];
  if (!s) return [];
  return (s.keywordMap[word] || []).map((id) => s.catalog[id]).filter(Boolean);
}

/** 媒体来源排行：按当前时期关键词关联的新闻案例引用次数汇总 */
export function getMediaRanking(stage: number) {
  const s = newsByStage[stage];
  if (!s) return [];
  const counts = new Map<string, { source: string; count: number; keywords: Set<string> }>();
  Object.entries(s.keywordMap).forEach(([word, ids]) =>
    ids.forEach((id) => {
      const item = s.catalog[id];
      if (!item) return;
      const row = counts.get(item.source) || { source: item.source, count: 0, keywords: new Set<string>() };
      row.count++;
      row.keywords.add(word);
      counts.set(item.source, row);
    }),
  );
  const total = [...counts.values()].reduce((sum, row) => sum + row.count, 0);
  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((row) => ({ ...row, keywords: [...row.keywords], share: total ? row.count / total : 0 }));
}

export interface NewsSearchResult {
  stage: number;
  stageTitle: string;
  item: NewsItem;
  keywords: string[];
}

/** 全站静态案例搜索：完全在浏览器中运行，无需服务器。 */
export function searchNews(query: string): NewsSearchResult[] {
  const q = query.trim().toLocaleLowerCase("zh-CN");
  if (!q) return [];
  const results: Array<NewsSearchResult & { score: number }> = [];
  Object.values(newsByStage).forEach((stage) => {
    const keywordById = new Map<string, string[]>();
    Object.entries(stage.keywordMap).forEach(([word, ids]) => ids.forEach((id) => {
      const words = keywordById.get(id) || [];
      if (!words.includes(word)) words.push(word);
      keywordById.set(id, words);
    }));
    Object.values(stage.catalog).forEach((item) => {
      const keywords = keywordById.get(item.id) || [];
      const title = item.title.toLocaleLowerCase("zh-CN");
      const summary = item.summary.toLocaleLowerCase("zh-CN");
      const source = item.source.toLocaleLowerCase("zh-CN");
      const tip = item.tip.toLocaleLowerCase("zh-CN");
      const keywordHit = keywords.some((word) => word.toLocaleLowerCase("zh-CN").includes(q));
      if (!title.includes(q) && !summary.includes(q) && !source.includes(q) && !tip.includes(q) && !keywordHit) return;
      const score = (title.includes(q) ? 8 : 0) + (keywordHit ? 6 : 0) + (summary.includes(q) ? 3 : 0) + (source.includes(q) ? 2 : 0) + (tip.includes(q) ? 1 : 0);
      results.push({ stage: stage.id, stageTitle: stage.title, item, keywords, score });
    });
  });
  return results.sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date)).map(({ score: _score, ...result }) => result);
}
