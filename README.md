# 电诈话术文本演化规律研究与防诈平台

> 2017—2026 年四时期电信网络诈骗话术情感加权词云 · 可交互数据可视化
>
> 仓库：https://github.com/Ming-Light-Code/Anti-fraud.github.io（GitHub Pages 静态站点）

一个基于 **Next.js（App Router）+ React + Tailwind CSS** 构建的电信网络诈骗话术可视化研究应用。它以「情感加权词云」为核心，将 2017 年至 2026 年间电诈话术按四个演化时期拆解，量化每个关键词的情感权重、焦虑/信任强度与风险等级，并联动真实的公安、政府、媒体新闻案例，呈现诈骗话术从传统电话接触向平台化、虚拟资产化与 AI 智能化演变的完整脉络。

---

## ✨ 功能特性

- **四时期话术演化**：萌芽期（2017—2019）→ 发展期（2020—2021）→ 升级期（2022—2023）→ 智能化期（2024—2026），一键切换。
- **交互式 SVG 词云**：字号由情感加权权重决定、颜色反映风险等级；悬停高亮、点击跳转专题页。
- **六维量化指标**：每个关键词携带 `情感加权权重 / 情感强度 / 焦虑 / 信任 / 每万词频 / 覆盖度` 六项指标。
- **关键词专题页**：四维话术风险画像（焦虑 / 信任 / 权威 / 综合风险）+ 关联新闻案例 + 逐条「防诈小贴士」。
- **媒体来源排行**：四时期均已接入，按新闻引用次数统计来源媒体占比。
- **阶段演化解读**：四时期「论点—数据对应—阶段转折」研究性文本已填入（依据 `ziliao/` 演化规律资料改写）。
- **双主题配色**：深色科技风（`globals.css` 基线）与「公安蓝白」浅色主题（`police-theme.css` 覆盖，当前默认加载浅色主题）。

---

## 🛠 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Next.js（App Router，React Server / Client Components） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 + 原生 CSS（CSS Variables 主题化） |
| 可视化 | 原生 SVG（自研词云布局算法，无第三方词云库） |
| 数据 | 静态 JSON + TypeScript 数据模块 |

---

## 📁 项目结构

```
app/
├── page.tsx                  # 首页：渲染词云工作室组件 + 元信息
├── layout.tsx                # 根布局：挂载全部样式与全局元信息
├── word-cloud-studio.tsx     # 核心组件：词云布局、时期切换、演化解读、媒体排行
├── wordclouds.json           # 四时期词云数据（核心数据集）
├── news.ts                   # 新闻统一入口：按时期查询关键词新闻与媒体排行
├── news-types.ts             # NewsItem 共享类型
├── stage1-news.ts            # 萌芽期新闻案例库（由 ziliao 素材自动构建，100 条）
├── stage2-news.ts            # 发展期新闻案例库（逐条人工核验，24 条）
├── stage3-news.ts            # 升级期新闻案例库（由 ziliao CSV 自动构建，189 条）
├── stage4-news.ts            # 智能化期新闻案例库（由 ziliao docx 自动构建，183 条）
├── extra-words.ts            # 各时期的补充展示词
├── chatgpt-auth.ts           # ChatGPT OAuth 身份鉴权辅助模块（可选集成）
│
├── keyword/
│   └── page.tsx              # 关键词专题页路由（/keyword?stage=&word=）
│
├── globals.css               # 全局样式 + 深色主题基线 + Tailwind 入口
├── tiles.css                 # 词云节点（云块 / 索引 / 词文本）样式
├── evolution.css             # 阶段演化解读区样式
├── media-ranking.css         # 媒体来源排行表格样式
├── police-theme.css          # 「公安蓝白」浅色主题覆盖
└── keyword-news.css          # 关键词专题页样式

ziliao/                       # 研究素材：各时期案例链接汇编、演化规律、关键词新闻 CSV
```

---

## 🗂 数据模型

### 词云数据（`wordclouds.json`）

每个时期为一个对象，`words` 为关键词数组：

```ts
interface Word {
  word: string;               // 关键词
  weight: number;             // 情感加权权重（决定字号与风险等级）
  risk: "high" | "medium" | "low"; // 与权重规则同步：≥20 高危 / 10–20 中危 / <10 低危
  emotionStrength: number;    // 情感强度
  anxiety: number;            // 焦虑值
  trust: number;              // 信任值
  frequency: number;          // 每万词频
  coverage: number;           // 覆盖度
  rank: number;               // 权重排名
  fontSize: number;           // 由权重经期内对数缩放得到的字号
}
```

> 说明：渲染时风险等级由 `weight` 实时推导，不直接读取 JSON 中的 `risk` 字段；数据文件中的 `risk` 已与该规则保持同步。萌芽期样本中 `anxiety` 多为 0、`trust` 与 `emotionStrength` 相同，反映该时期以机构身份与利益诱因建构信任、焦虑施压有限的口径设计。

### 新闻案例库（`stage1-4-news.ts` + `news.ts`）

```ts
interface NewsItem {
  id: string; title: string; source: string; date: string; url: string;
  summary: string;
  anxiety: number; trust: number; authority: number; risk: number;
  tip: string;                // 防诈小贴士
}
```

- `newsByStage`：四时期新闻库统一索引；`getKeywordNews(stage, word)` 按时期与关键词取新闻；`getMediaRanking(stage)` 统计媒体来源排行与占比。
- 各时期数据口径：
  - **萌芽期（100 条）**：由 `ziliao/萌芽期(2017-2019)1.md` 与补充汇编自动构建，案例发布于 2017—2019，与时期一致。
  - **发展期（24 条）**：逐条人工核验；关键词对应发展期话术，案例报道发布于 2022—2023 年。
  - **升级期（189 条）**：由 `ziliao/升级期关键词新闻链接_27关键词x7条2.csv` 自动构建，27 关键词 × 7 条，发布于 2022—2023，与时期一致。
  - **智能化期（183 条）**：由 `ziliao/智能化链接1.docx` 自动构建（原始链接 + 标题），摘要与量化指标待人工核验。
- 除发展期为手写核验外，其余时期的 `anxiety / trust / authority / risk` 为基于时期特征与来源类型的**规则化估算**（0—100），非新闻媒体原始评分。

---

## 🧠 核心实现

### 词云布局算法（`word-cloud-studio.tsx` 的 `layoutWords()`）

1. 按 `weight` 降序排列关键词。
2. 字号 = `min(fontSize, 62) × scale`，`scale` 随词条数量自适应（≤25 词 1.02、≤27 词 0.96、其余 0.88）。
3. 词块预留额外边距（`width = max(size×1.72, 字数×size×1.1) + 28`），防止字体渲染溢出。
4. 使用宽椭圆螺旋搜索空位 + 碰撞检测；失败时回退到确定性逐行全画布扫描。
5. 算法为**确定性布局**（无随机量），同一份数据渲染结果一致。

### 风险等级实时分级

| 等级 | 条件 | 颜色 |
| --- | --- | --- |
| 高危 `high` | `weight ≥ 20` | 红 |
| 中危 `medium` | `10 ≤ weight < 20` | 橙 |
| 低危 `low` | `weight < 10` | 绿 |

### 时期与路由

- 时期切换通过 URL 查询参数 `?stage=N`（`history.replaceState` 免刷新更新）。
- 点击词云节点跳转 `/keyword?stage=N&word=关键词`，专题页读取参数渲染新闻与风险画像。

---

## 🚀 本地运行

```bash
npm install
npm run dev     # 开发模式 http://localhost:3000
npm run build   # 生产构建（output: export，生成静态 out/ 目录）
npm start       # 生产模式预览
```

> 页面依赖 `/favicon.svg`（位于 `public/`）。

## 📦 静态部署（GitHub Pages）

项目已配置 `next.config.mjs` 的 `output: "export"`，`npm run build` 会生成纯静态 `out/` 目录。同时提供 `.github/workflows/deploy.yml`：推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages（仓库 Settings → Pages → Source 选择 GitHub Actions 即可生效）。

> **子路径部署说明**：GitHub Pages 项目站部署在 `/<仓库名>/` 子路径下，静态资源与页面链接必须带上该前缀。项目通过构建环境变量 `NEXT_PUBLIC_BASE_PATH` 注入前缀（如 `/Anti-fraud.github.io`），`.github/workflows/deploy.yml` 已内置该配置；**本地开发不设置该变量，行为与根路径部署一致**。如需本地模拟子路径，可执行：
>
> ```bash
> $env:NEXT_PUBLIC_BASE_PATH = "/Anti-fraud.github.io"; npm run build
> ```

---

## 📊 数据接入映射（ziliao → 代码）

| 时期 | 数据源（ziliao/） | 产物 | 数量 |
| --- | --- | --- | --- |
| 萌芽期 | `萌芽期(2017-2019)1.md` + `补充萌芽期…md` | `stage1-news.ts` | 100 |
| 发展期 | 人工核验新闻库 | `stage2-news.ts` | 24 |
| 升级期 | `升级期关键词新闻链接_27关键词x7条2.csv` | `stage3-news.ts` | 189 |
| 智能化期 | `智能化链接1.docx` | `stage4-news.ts` | 183 |

各时期演化解读文本取自 `萌芽期演化规律.docx`、`发展期演化规律发展期规律.docx`、`升级期演化规律升级期.docx`、`智能化期规律6.docx`。

---

## 🔐 ChatGPT 鉴权模块（可选）

`chatgpt-auth.ts` 提供与 ChatGPT 托管应用联动的身份鉴权工具（读取 `oai-authenticated-user-*` 请求头、安全重定向路径校验等），当前页面未直接调用，如需接入受保护路由可复用其中的 `requireChatGPTUser()` / `chatGPTSignInPath()`。

---

## 📌 待完善事项

- **智能化期新闻**：原始链接已接入，案情摘要与量化指标待人工核验补录（专题页与媒体排行已标注「待核验」）。
- **演化解读校对**：四时期解读为基于演化规律资料的结构化改写，建议研究团队逐条校对数据对应与阶段转折表述。
- **「收益」词**：为各期数据集中保留的通用展示词，暂无专题新闻映射，已在词云中过滤（数据保留）。
- **媒体排行口径**：当前按关键词→新闻映射统计；可扩展为 CSV / 新闻数据库自动导入。

---

## ⚠️ 免责声明

本项目用于电信网络诈骗话术的可视化研究与反诈宣传教育。所有新闻案例均来自公开的政府、公安、检察院及正规媒体发布内容；各维度的情感量化数值为依据案例描述与话术特征进行的**规则化估算**（0—100），不代表新闻媒体的原始评分。


