"use client";
import {useEffect,useMemo,useState} from "react";
import {getKeywordNews,stageMeta} from "../news";
import clouds from "../wordclouds.json";
import {extraWords} from "../extra-words";
import DonutChart from "../sentiment-pie";

type Word = (typeof clouds)[number]["words"][number];
const metricNames=["焦虑","信任","权威","综合风险"] as const;
// GitHub Pages 子路径前缀（由构建环境注入，本地为空）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const norm=(v:number)=>Math.max(0,Math.min(100,v));

export default function KeywordDetail(){
  const [word,setWord]=useState("关键词");const [stage,setStage]=useState("");
  useEffect(()=>{const p=new URLSearchParams(location.search);setWord(p.get("word")||"关键词");setStage(p.get("stage")||"")},[]);
  const stageNum=Number(stage)||0;
  const stageTitle=stageMeta[stageNum]?.title||"该时期";
  const news=useMemo(()=>stageNum?getKeywordNews(stageNum,word):[],[stageNum,word]);
  const average=useMemo(()=>news.length?(["anxiety","trust","authority","risk"] as const).map(k=>Math.round(news.reduce((s,n)=>s+n[k],0)/news.length)):[0,0,0,0],[news]);

  // 从词云数据集 / 补充展示词中查找该关键词的六维量化指标
  const wordData=useMemo<Word|null>(()=>{
    if(!stageNum) return null;
    const list=clouds[stageNum-1]?.words??[];
    const found=list.find(x=>x.word===word);
    if(found) return found;
    const extra=extraWords.find(x=>x.stage===stageNum&&x.word===word);
    if(!extra) return null;
    const {stage:_s,...rest}=extra;
    return rest as unknown as Word;
  },[stageNum,word]);

  // 各维度按 0—100 量纲归一化（每万词频÷5、覆盖度×100）后用于占比
  const pieSlices=useMemo(()=>{
    if(!wordData) return [];
    return [
      {label:"情感强度",value:norm(wordData.emotionStrength),display:wordData.emotionStrength.toFixed(1),color:"#2563a8"},
      {label:"焦虑",value:norm(wordData.anxiety),display:wordData.anxiety.toFixed(1),color:"#cf343d"},
      {label:"信任",value:norm(wordData.trust),display:wordData.trust.toFixed(1),color:"#3f8a5c"},
      {label:"每万词频",value:norm(wordData.frequency/5),display:wordData.frequency.toFixed(1),color:"#d19a0e"},
      {label:"覆盖度",value:norm(wordData.coverage*100),display:`${(wordData.coverage*100).toFixed(1)}%`,color:"#7a5fb0"}
    ];
  },[wordData]);
  const pieTotal=pieSlices.reduce((s,x)=>s+x.value,0)||1;

  const weightPie=wordData?<section className="weight-pie-section" aria-labelledby="weight-pie-title">
    <header><div><p>EMOTION WEIGHT COMPOSITION / STAGE {stage||"—"}</p><h2 id="weight-pie-title">“{word}”情感加权权重构成</h2></div><span>{stageTitle} · 六维量化指标</span></header>
    <div className="weight-pie-body">
      <div className="donut-wrap"><DonutChart
        slices={pieSlices.map(s=>({label:s.label,value:s.value,color:s.color}))}
        centerTop="情感加权权重"
        centerValue={wordData.weight.toFixed(2)}
        centerSub="综合量化值"
        ariaLabel={`${word}情感加权权重构成饼状图`}
      /></div>
      <div className="weight-legend">
        <div className="weight-legend-head"><span/><span>指标</span><span>原始值</span><span>归一 (0—100)</span><span>占比</span></div>
        {pieSlices.map(s=><div className="weight-row" key={s.label}>
          <i style={{background:s.color}}/>
          <span className="wl-name">{s.label}</span>
          <span className="wl-raw">{s.display}</span>
          <span className="wl-norm">{s.value.toFixed(1)}</span>
          <b>{((s.value/pieTotal)*100).toFixed(1)}%</b>
        </div>)}
      </div>
    </div>
    <footer><p>占比按各维度归一化强度（0—100）计算：每万词频＝原值÷5，覆盖度＝原值×100；圆心数值为该关键词综合情感加权权重。</p><span>六维 · {wordData.rank?`#${wordData.rank}`:"展示词"}</span></footer>
  </section>:null;

  return <main className="keyword-page">
    <a className="back" href={`${basePath}/?stage=${stage}`}>← 返回词云</a>
    <header className="keyword-hero"><div><span>KEYWORD INTELLIGENCE / STAGE {stage||"—"}</span><h1>“{word}”专题分析</h1><p>{stageTitle}相关新闻案例、话术风险分布与防诈提示</p></div><b>{news.length?`${news.length} 条${stageNum===4?"已接入":"已核验"}新闻`:`数据待接入`}</b></header>
    {news.length?<section className="distribution-panel"><div><p>关键词新闻情感加权分布</p><h2>四维话术风险画像</h2><small>依据新闻案例描述与{stageTitle}话术特征进行规则化分析，数值范围0—100，不代表新闻媒体原始评分。</small></div><div className="metric-bars">{average.map((v,i)=><div key={metricNames[i]}><span>{metricNames[i]}<b>{v}</b></span><i><em style={{width:`${v}%`}}/></i></div>)}</div></section>:null}
    {weightPie}
    {news.length?<section className="news-section"><div className="section-heading"><span>RELATED CASES</span><h2>“{word}”相关新闻案例</h2></div><div className="news-list">{news.map((item,index)=><article className="news-card" key={item.id}>
      <header><span>CASE {String(index+1).padStart(2,"0")}</span><div><b>{item.source}</b><time>{item.date}</time></div></header>
      <h3><a href={item.url} target="_blank" rel="noreferrer">{item.title} ↗</a></h3>{item.summary!==item.title&&<p>{item.summary}</p>}
      <div className="case-metrics">{[["焦虑",item.anxiety],["信任",item.trust],["权威",item.authority],["综合风险",item.risk]].map(([name,value])=><div key={String(name)}><span>{name}<b>{value}</b></span><i><em style={{width:`${value}%`}}/></i></div>)}</div>
      <aside className="fraud-tip"><strong>防诈小贴士</strong><p>{item.tip}</p></aside>
    </article>)}</div></section>:<section className="detail-panel empty-detail"><h2>相关新闻案例待接入</h2><p>{stageNum===4?"智能化期原始链接已接入，案情摘要与量化指标待人工核验补充。":"该时期新闻案例将在相应阶段资料核验后接入。"}</p></section>}
  </main>
}
