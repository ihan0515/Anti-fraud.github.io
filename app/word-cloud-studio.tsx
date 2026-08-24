"use client";

import { useEffect, useMemo, useState } from "react";
import clouds from "./wordclouds.json";
import {extraWords} from "./extra-words";
import {getMediaRanking,searchNews,type NewsSearchResult} from "./news";
import {getLaw} from "./criminal-law";

type Word = (typeof clouds)[number]["words"][number];
type Box = Word & { x:number; y:number; width:number; height:number; size:number };

const riskLabel:Record<string,string>={high:"高危",medium:"中危",low:"低危"};
// GitHub Pages 子路径前缀（由构建环境注入，本地为空）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const evolution=[
  {
    thesis:"萌芽期：机构身份包装下的单点式话术雏形",
    text:"萌芽期（2017—2019）的电信网络诈骗在作案手段与组织形态上均呈现发展初期的典型特征。互联网金融快速扩张，“现金贷”等无场景信贷野蛮生长，公民个人信息经地下产业链被批量买卖，为针对性欺骗提供了数据基础。案件多集中于贷款代办、收藏品拍卖等相对独立的交易情境，行为人伪装为信贷公司职员、拍卖行业务员或银行客户经理等机构身份，借助伪造的合同、证件与营业执照，以看似规范的业务流程消解疑虑，再以低息放款、藏品高价拍出等利益承诺诱导受害人交付费用。此阶段信任建构主要依托机构可信度与利益诱因，焦虑施压等情绪操控手段运用有限，话术尚未形成分工精细、剧本化的犯罪作业体系。",
    evidence:"数据对应：代表词“客户”（权重50.64）、“公司”（27.23）、“贷款”（24.05）位居前列；据同期反诈部门披露，2017年前后电话、短信为主要实施渠道，占比约六至七成，QQ、微信多用于后续联系与信任维护。",
    transition:"萌芽期 → 发展期：作案场景由单点交易（贷款代办、收藏品拍卖）转向平台化、关系化融合（婚恋交友、股票荐股与虚假投资），信任建构由机构背书转向“老师”“好友”“成功人士”等关系化人设。"
  },
  {
    thesis:"发展期：“杀猪盘”与平台化转型，强信任、弱焦虑的双通道格局",
    text:"发展期（2020—2021）是电诈从单点作案向平台化、产业化跃迁的过渡阶段。疫情防控推动线上社交、线上理财需求集中释放，缅北境外园区话术逐步走向标准化、剧本化；“断卡行动”启动后，作案主阵地从传统通讯渠道转向互联网平台，资金流转转向第三方支付与虚假平台账户。“杀猪盘”类模式成为主流，形成“情感铺垫—信任建立—诱导投资—集中收割”的完整闭环。信任建构不再仅依托利益承诺与机构背书，而是嵌入长期关系培养，再以“内幕消息”“稳赚不赔”“专属渠道”等说辞绑定利益信任；焦虑施压仅在提现受阻环节少量出现，整体呈“强信任、弱焦虑”的双通道特征。",
    evidence:"数据对应：代表词“投资”（权重42.20）、“股票”（26.41）、“平台”（20.79）居前；“微信”“好友”“老师”“恋爱”等关系化词汇密集，反映载体由电话短信转向即时通讯、伪装由机构身份转向关系化人设。",
    transition:"发展期 → 升级期：伪装策略由“关系信任”让位于“专业包装”，心理操控由“强信任、弱焦虑”转向信任与焦虑“双通道耦合施压”，核心驱动力从情感认同与利益诱惑的叠加，转向利益诱惑与操作控制的捆绑。"
  },
  {
    thesis:"升级期：虚拟资产化与操作控制化，“包装取信＋操作控制”的复合话术",
    text:"升级期（2022—2023）是电诈从平台化经营向虚拟资产化、操作控制化跃迁的关键阶段。《反电信网络诈骗法》施行，“断卡”“断流”“拔钉”等专项行动与缅北专项打击形成治理高压；央行严控虚拟货币交易后，USDT等稳定币与黄金成为资金转移新通道。话术主动“蹭热点包装”，把虚拟币、黄金、直播投资包装成“稳赚不赔”的稀缺机会；非法投资APP、直播间、数字钱包与指定账户配合，绕开应用市场审核、银行账户监管与第三方支付风控，实现“引流—投资—转账—洗钱”全流程闭环。信任建构通过“承诺高回报—小额返利—平台背书”快速完成，焦虑施压前置为全程核心驱动力，“指定账户”“账户冻结”“无法提现”“缴纳解冻金”等话术持续施压，迫使受害人不断追加投入。",
    evidence:"数据对应：代表词“投资”（权重57.73）、“平台”（36.19）、“转账”（25.86）、“账户”（23.49）居前；词云量化指标中“信任”“承诺”居于高位，与“包装取信＋操作控制”特征吻合。",
    transition:"升级期 → 智能化期：操控手段由“操作控制”叠加“技术证据”，AI换脸、AI语音与深度伪造让伪装从“口头宣称”质变为视频、图像、声音的全套技术证据，信任建构趋于“即时化”。"
  },
  {
    thesis:"智能化期：技术证据伪装、即时信任与精准焦虑施压的复合操控",
    text:"智能化期（2024—2026）的电诈在技术形态与心理操控上呈现前所未有的质变。AI生成、AI换脸、深度伪造等技术门槛大幅降低，犯罪行为智能化成本显著下降；《反电信网络诈骗法》施行后国内打击力度持续加大，诈骗团伙加速向境外转移，此前各时期积累的海量个人信息泄露数据被AI激活为精准诈骗资源。诈骗场景边界消失——社交平台、短视频、直播、投资APP、视频通话均可成为诈骗场域；伪装完成从“口头宣称”到“技术证据”的质变，AI合成的视频、盈利截图使信任可在第一次接触时即基本完成，焦虑施压上升至“涉嫌犯罪”“账户异常”等身份层面威胁，形成“技术证据伪装、即时信任建构、精准焦虑施压”于一体的复合话术体系。",
    evidence:"数据对应：代表词“AI”（权重31.31）、“网络”（28.16）、“资金”（29.27）、“视频”（24.70）居前；“AI换脸”“伪造”“精准”等词反映技术证据伪装与精准施压成为核心手段。",
    transition:"四时期总体演化：话术由单点费用诱骗 → 关系信任 → 包装控制 → 技术证据递进，心理操控从“利益诱惑”单一驱动演化为“利益＋焦虑＋权威”复合驱动，标志着电诈进入技术驱动的精准操控时代。"
  }
];

// ===== 反诈便民工具箱（四时期通用渠道 + 各时期差异化诈骗类型速查表）=====
const toolkitChannels={
  phone:{name:"全国反诈中心专线",value:"96110",desc:"公安部统一的反诈预警劝阻咨询专线，接到来电务必接听；发现被骗或疑似诈骗可拨打咨询、举报。"},
  app:{name:"国家反诈中心APP",desc:"公安部刑侦局官方出品，可举报涉诈线索、预警诈骗来电短信、学习反诈知识。",ios:"https://apps.apple.com/cn/app/id1552823102",android:"https://sj.qq.com/appdetail/com.hicorenational.antifraud"},
  report:{name:"网络违法犯罪举报平台",desc:"公安部网络安全保卫局建设运维的官方网络违法犯罪举报网站；另可向12321网络不良与垃圾信息举报受理中心举报涉诈电话短信。",url:"http://www.cyberpolice.cn/",backup:"https://www.12321.cn/"}
};
const toolkitScams:[number,{type:string;desc:string;tip:string}[]][]=[
  [1,[
    {type:"贷款代办/提额诈骗",desc:"假冒信贷公司、银行职员，以“低息放款”“先交保证金、包装费、验资费”为名骗钱。",tip:"正规贷款不会要求先交任何费用；放款前要钱的都是诈骗。"},
    {type:"收藏品拍卖诈骗",desc:"谎称藏品可高价拍卖，先收取鉴定费、手续费、保证金。",tip:"拍卖机构不会在成交前反复收费；要求先交费的“高价收购”多为骗局。"},
    {type:"冒充公检法/银行客服",desc:"电话通知“涉嫌洗钱、账户异常”，要求将资金转入“安全账户”。",tip:"公检法、银行不会电话要求转账至“安全账户”；此类来电直接挂断。"},
    {type:"中奖/退税诈骗",desc:"通知“中奖需先缴税、公证费”或“退税需先交手续费”。",tip:"先交钱再领奖、退税的，一律是诈骗；主动找你的“大奖”不可信。"},
    {type:"伪基站短信钓鱼",desc:"伪基站群发“银行积分兑换、信用卡提额”短信，诱导点击钓鱼链接。",tip:"银行短信链接勿轻点；涉及账号密码、验证码的页面立即关闭。"},
    {type:"QQ盗号冒充熟人",desc:"盗取QQ后冒充亲友“急需用钱”要求转账。",tip:"熟人线上借钱务必电话或当面二次确认，不向陌生账户直接转账。"}
  ]],
  [2,[
    {type:"“杀猪盘”婚恋投资",desc:"社交平台建立恋爱关系后，诱导下载虚假平台“一起投资”并收割。",tip:"网恋对象提到投资、理财、代操作，立即终止资金往来。"},
    {type:"虚假投资理财平台",desc:"“老师带单”、群友晒盈利，小额可提现，大额无法提现。",tip:"投资只选持牌正规机构；群内晒单、稳赚话术全是托与剧本。"},
    {type:"刷单返利诈骗",desc:"先小额返利骗取信任，再诱导垫付大额任务后“无法提现”。",tip:"刷单本身违法且必是骗局，切勿垫付资金。"},
    {type:"注销校园贷/征信诈骗",desc:"冒充平台客服，以“影响征信、注销校园贷账户”为由诱导借贷转账。",tip:"个人征信无法由客服私下处理；接到“影响征信”电话直接挂断。"},
    {type:"冒充客服退款理赔",desc:"以订单异常、退款理赔为由套取验证码或诱导屏幕操作。",tip:"退款理赔只在原平台操作；客服索要验证码的必是诈骗。"},
    {type:"虚假贷款APP",desc:"下载虚假贷款软件后以“银行卡输错、解冻费、保证金”为由骗钱。",tip:"贷款放款前先收费的都是诈骗；认准银行与持牌机构。"}
  ]],
  [3,[
    {type:"虚拟货币投资诈骗",desc:"以USDT、比特币等“稳赚不赔”话术诱导进入虚假交易平台。",tip:"虚拟币交易须选持牌合规平台；任何“包赚”承诺都是骗局。"},
    {type:"黄金/贵金属投资诈骗",desc:"直播间、分析师包装“内部行情”，诱导在虚假平台交易“伦敦金”等。",tip:"直播间荐金、荐股、喊单都是高风险信号，勿跟随转账。"},
    {type:"直播荐股杀猪盘",desc:"“大师”直播间荐股，群友晒盈利截图，诱导下载非法炒股APP。",tip:"荐股群、直播间里的“股神”和晒单者多为托，勿入陌生群。"},
    {type:"账户冻结/解冻金话术",desc:"以“账户被冻结、操作异常”为由，要求缴纳解冻金、保证金继续充值。",tip:"正规平台不会以解冻名义收费；要求继续充值的必是诈骗。"},
    {type:"刷单+赌博复合诈骗",desc:"以“做任务、博彩刷单”名义诱导下注充值，先返利后收割。",tip:"网络赌博违法且不可提现；所谓“博彩刷单”是复合骗局。"},
    {type:"冒充领导/老板诈骗",desc:"冒充公司领导、熟人添加财务或员工，要求紧急转账。",tip:"领导线上要求转账，务必当面或原号码核实，不轻信头像与昵称。"}
  ]],
  [4,[
    {type:"AI换脸/AI拟声诈骗",desc:"用AI合成亲友、领导的声音与面容，以“紧急救场”等话术索要钱款。",tip:"视频、语音均可伪造；涉及钱款务必用原号码回拨或当面核实。"},
    {type:"AI荐股/AI智能投资诈骗",desc:"包装“AI量化选股、智能理财”技术，诱导下载虚假投资APP。",tip:"凡宣称“AI稳赚、内部技术”荐股的，都是投资理财诈骗。"},
    {type:"数字人民币/虚拟币诈骗",desc:"冒充公检法要求将资金转入“数字人民币安全账户”或兑换虚拟币。",tip:"公检法不会要求转账至任何“安全账户”，数字人民币同样可被诈骗利用。"},
    {type:"屏幕共享诈骗",desc:"诱导开启屏幕共享/远程协助，窃取验证码与银行卡信息。",tip:"任何要求开启屏幕共享的都是诈骗，立即拒绝并挂断。"},
    {type:"FaceTime/畅连来电诈骗",desc:"通过FaceTime等视频通话冒充客服、公安实施诈骗。",tip:"陌生FaceTime来电多为诈骗，可在设置中关闭陌生来电功能。"},
    {type:"冒充“反诈/征信中心”诈骗",desc:"谎称“账户涉诈、征信需修复”，诱导转账或借贷。",tip:"反诈中心不会要求转账“验资”；征信修复是骗局，请走官方渠道。"}
  ]]
];

function ToolkitSection({stage}:{stage:number}){
  const scams=(toolkitScams.find(s=>s[0]===stage)||toolkitScams[0])[1];
  const c=toolkitChannels;
  return <section className="toolkit-section" aria-labelledby="toolkit-title">
    <header><div><p>ANTI-FRAUD TOOLKIT / 0{stage}</p><h2 id="toolkit-title">反诈便民工具箱</h2></div><span>{clouds.find(x=>x.id===stage)?.period||""} · 举报渠道与速查</span></header>
    <div className="toolkit-grid">
      <a className="toolkit-card toolkit-phone" href="tel:96110" target="_blank" rel="noreferrer">
        <i className="tk-ico">☎</i><div><b>{c.phone.name}</b><strong>96110</strong><p>{c.phone.desc}</p></div>
      </a>
      <div className="toolkit-card">
        <i className="tk-ico">▣</i><div><b>{c.app.name}</b><p>{c.app.desc}</p><div className="tk-links">
          <a href={c.app.ios} target="_blank" rel="noreferrer">iOS 官方下载 ↗</a>
          <a href={c.app.android} target="_blank" rel="noreferrer">安卓官方下载 ↗</a>
        </div></div>
      </div>
      <div className="toolkit-card">
        <i className="tk-ico">◎</i><div><b>{c.report.name}</b><p>{c.report.desc}</p><div className="tk-links">
          <a href={c.report.url} target="_blank" rel="noreferrer">公安部网络违法犯罪举报网站 ↗</a>
          <a href={c.report.backup} target="_blank" rel="noreferrer">12321 举报受理中心（备用）↗</a>
        </div></div>
      </div>
      <div className="toolkit-card toolkit-scams">
        <i className="tk-ico">▤</i><div><b>{clouds.find(x=>x.id===stage)?.title}常见诈骗类型速查表</b><table className="scam-table">
          <thead><tr><th>诈骗类型</th><th>话术/套路</th><th>识别要点</th></tr></thead>
          <tbody>{scams.map(s=><tr key={s.type}><td><b>{s.type}</b></td><td>{s.desc}</td><td>{s.tip}</td></tr>)}</tbody>
        </table></div>
      </div>
    </div>
    <footer><p>渠道均为官方权威入口：96110 为公安部反诈专线；国家反诈中心APP 由公安部刑侦局开发；举报平台由公安部网安局建设运维。遇到诈骗请立即拨打 96110 或 110，并保留聊天、转账记录。</p><span>全民反诈 · 人人有责</span></footer>
  </section>;
}

function layoutWords(words:Word[]):Box[]{
  const placed:Box[]=[];
  const sorted=[...words].sort((a,b)=>b.weight-a.weight);
  const scale=words.length<=25?1.02:words.length<=27?.96:.88;
  for(const word of sorted){
    // The visual risk class is derived exclusively from the same emotion-
    // weighted value shown in the tooltip and legend. Never reuse a legacy
    // classification from the source table here.
    const risk:Word["risk"]=word.weight>=20?"high":word.weight>=10?"medium":"low";
    const size=Math.min(word.fontSize,62)*scale;
    // Reserve a little more room than the visible glyphs need. This keeps
    // heavier system fonts and different browser font rendering from letting
    // text escape its tile and touch a neighbour.
    const width=Math.max(size*1.72,word.word.length*size*1.1)+28;
    const height=size*1.38+24;
    let chosen:{x:number;y:number}|null=null;
    const isFree=(x:number,y:number)=>x>=28&&x+width<=972&&y>=28&&y+height<=492&&!placed.some(p=>x<p.x+p.width+20&&x+width+20>p.x&&y<p.y+p.height+16&&y+height+16>p.y);
    // Wide elliptical spiral: use the full panel instead of clustering at center.
    for(let i=0;i<5200;i++){
      const angle=i*.44+(word.rank%5)*.18;
      const radius=7.1*Math.sqrt(i);
      const x=500+radius*Math.cos(angle)-width/2;
      const y=260+radius*.54*Math.sin(angle)-height/2;
      if(isFree(x,y)){chosen={x,y};break}
    }
    // Deterministic full-canvas fallback; never stack failed words at center.
    if(!chosen){
      outer:for(let y=34;y<=480-height;y+=12){
        for(let x=34;x<=966-width;x+=12){if(isFree(x,y)){chosen={x,y};break outer}}
      }
    }
    if(chosen) placed.push({...word,risk,...chosen,width,height,size});
  }
  return placed;
}

function HomeSearch(){
  const [query,setQuery]=useState("");
  const [searched,setSearched]=useState("");
  const [results,setResults]=useState<NewsSearchResult[]>([]);
  const [selected,setSelected]=useState<NewsSearchResult|null>(null);
  const close=()=>{setSearched("");setResults([]);setSelected(null)};
  const submit=(event:React.FormEvent)=>{
    event.preventDefault();
    const term=query.trim();
    if(!term)return;
    setSearched(term);setResults(searchNews(term));setSelected(null);
  };
  const law=selected?getLaw(selected.item):null;
  return <section className="home-search" aria-labelledby="home-search-title">
    <div className="search-copy"><span>CASE INTELLIGENCE SEARCH</span><h2 id="home-search-title">全时期案例与防诈信息检索</h2><p>输入诈骗关键词、新闻标题或媒体名称，直接查找案例分析、法律条文与防诈提示。</p></div>
    <form className="search-form" onSubmit={submit} role="search">
      <label htmlFor="case-search">案例关键词</label>
      <div><input id="case-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="例如：投资、AI换脸、贷款、刷单" autoComplete="off"/><button type="submit" aria-label="搜索案例">⌕<span>搜索</span></button></div>
    </form>
    {searched&&<div className="search-overlay" role="dialog" aria-modal="true" aria-label="案例搜索结果" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="search-modal">
        <header><div><span>SEARCH RESULTS</span><h2>“{searched}”相关案例</h2><p>共找到 {results.length} 条结果，数据来自网站四时期本地案例库。</p></div><button className="search-close" onClick={close} aria-label="关闭搜索结果">×</button></header>
        {!results.length?<div className="search-empty"><b>暂未找到相关案例</b><p>可以尝试更短的关键词，例如“投资”“平台”“贷款”或“AI”。</p></div>:<div className="search-layout">
          <div className="search-results" aria-label="搜索结果列表">{results.slice(0,60).map(result=><button key={`${result.stage}-${result.item.id}`} className={selected?.item.id===result.item.id&&selected.stage===result.stage?"active":""} onClick={()=>setSelected(result)}>
            <span><b>{result.stageTitle}</b><time>{result.item.date}</time></span><strong>{result.item.title}</strong><small>{result.item.source} · {result.keywords.slice(0,4).join("、")||"案例新闻"}</small>
          </button>)}</div>
          <article className="search-detail">{selected&&law?<>
            <div className="search-detail-meta"><span>{selected.stageTitle}</span><b>综合风险 {selected.item.risk}</b></div>
            <h3>{selected.item.title}</h3><p className="search-source">{selected.item.source} · {selected.item.date}</p>
            <section><h4>案例分析</h4><p>{selected.item.summary}</p></section>
            <div className="search-metrics">{[["焦虑",selected.item.anxiety],["信任",selected.item.trust],["权威",selected.item.authority],["风险",selected.item.risk]].map(([name,value])=><div key={String(name)}><span>{name}<b>{value}</b></span><i><em style={{width:`${value}%`}}/></i></div>)}</div>
            <aside className="search-tip"><b>防诈小贴士</b><p>{selected.item.tip}</p></aside>
            <section className="search-law"><h4>法律条文与应有处罚</h4><p className="search-case-type">本案定性：{law.caseType}</p>{law.laws.map((item,index)=><div key={index}><b>{item.article}</b><p>{item.clause}</p><em>应有处罚：{item.penalty}</em></div>)}<small>{law.note}</small></section>
            <a className="search-source-link" href={selected.item.url} target="_blank" rel="noreferrer">打开新闻原文 ↗</a>
          </>:<div className="search-detail-placeholder"><b>选择一条案例查看完整分析</b><p>这里会显示案例摘要、风险指标、防诈小贴士和相关法律条文。</p></div>}</article>
        </div>}
      </div>
    </div>}
  </section>;
}

export default function WordCloudStudio(){
  const [stage,setStage]=useState(1);
  const [hovered,setHovered]=useState<Word|null>(null);
  useEffect(()=>{const n=Number(new URLSearchParams(location.search).get("stage"));if(n>=1&&n<=4)setStage(n)},[]);
  const cloud=clouds.find(c=>c.id===stage)!;
  const story=evolution[stage-1];
  const mediaRanking=useMemo(()=>getMediaRanking(stage),[stage]);
  const periodWords=useMemo(()=>{
    // Original metrics win whenever an added display word happens to repeat
    // one already selected for the period. Unique keys also prevent React
    // from reusing two SVG nodes for the same word during stage switching.
    //
    // 「收益」为各期数据集中保留的通用展示词，暂无对应专题新闻映射，
    // 为避免点击后进入空专题页，此处统一从词云中过滤（数据本身保留）。
    const unique=new Map<string,Word>();
    cloud.words.filter(word=>word.word!=="收益").forEach(word=>unique.set(word.word,word));
    extraWords.filter(word=>word.stage===stage).forEach(({stage:_,...word})=>{
      if(word.word!=="收益"&&!unique.has(word.word)) unique.set(word.word,word as Word);
    });
    return [...unique.values()];
  },[cloud,stage]);
  const words=useMemo(()=>layoutWords(periodWords),[periodWords]);
  const tierShare=useMemo(()=>{
    const tierOf=(w:Word)=>w.weight>=20?"high":w.weight>=10?"medium":"low";
    const tiers=[
      {key:"high",name:"高危",def:"≥20",color:"#c92f38"},
      {key:"medium",name:"中危",def:"10—20",color:"#d9a90f"},
      {key:"low",name:"低危",def:"＜10",color:"#3f794b"}
    ] as const;
    const total=periodWords.reduce((s,w)=>s+w.weight,0)||1;
    return tiers.map(t=>{
      const ws=periodWords.filter(w=>tierOf(w)===t.key);
      const weight=ws.reduce((s,w)=>s+w.weight,0);
      return {...t,count:ws.length,weight,share:weight/total};
    });
  },[periodWords]);

  const change=(id:number)=>{setStage(id);setHovered(null);history.replaceState(null,"",`?stage=${id}`)};
  return <main className="site-shell">
    <div className="grid-glow" />
    <header className="topbar">
      <div className="brand"><img className="brand-logo" src={`${basePath}/logo-mark.svg`} alt="电诈话术演化 LOGO" /><div><b>电诈话术演化分析与反诈宣传教育</b><small>2017—2026 数据驱动研究</small></div></div>
      <div className="topbar-side"><div className="school-brand"><img src="https://yzb.ppsuc.edu.cn/z_g_r_m_g_a_d_x_y_j_s_y_g_w__files/web-logo2.png" alt="中国人民公安大学校徽" referrerPolicy="no-referrer"/><div><b>中国人民公安大学</b><small>PEOPLE'S PUBLIC SECURITY UNIVERSITY OF CHINA</small></div></div><div className="top-hint"><span className="pulse"/>点击词语，进入新闻与情感分析</div></div>
    </header>
    <section className="hero">
      <div className="hero-title-lockup"><img src="https://yzb.ppsuc.edu.cn/z_g_r_m_g_a_d_x_y_j_s_y_g_w__files/web-logo2.png" alt="中国人民公安大学校徽" referrerPolicy="no-referrer"/><div><p className="eyebrow">DATA-DRIVEN TELECOM FRAUD DISCOURSE ANALYSIS</p><h1>数据驱动的电诈话术演化分析<br/><em>与反诈宣传教育平台</em></h1><p className="hero-institution">中国人民公安大学 · 反诈研究与宣传教育实践项目</p></div></div>
      <p className="intro">字号由原情感加权权重决定，颜色反映风险等级。选择时期，观察诈骗话术从传统接触向平台化、虚拟资产化与智能化演变。</p>
    </section>
    <HomeSearch />
    <nav className="stage-tabs" aria-label="诈骗话术时期">
      {clouds.map(c=><button key={c.id} className={stage===c.id?"active":""} onClick={()=>change(c.id)}><span>0{c.id}</span><b>{c.title}</b><small>{c.period}</small></button>)}
    </nav>
    <section className="cloud-card">
      <div className="card-heading"><div><span className="stage-number">0{cloud.id}</span><div><h2>{cloud.title}话术云</h2><p>{cloud.summary}</p></div></div><div className="live-tag"><i/>数据已量化</div></div>
      <div className="cloud-hint"><span className="cloud-hint-red">⚠ 点击词云中的词语即可查看更多防诈信息</span></div>
      <div className="cloud-stage">
        <svg viewBox="0 0 1000 520" role="img" aria-label={`${cloud.title}电诈话术风险词云`}>
          <defs><filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {words.map(w=><a key={w.word} href={`${basePath}/keyword?stage=${stage}&word=${encodeURIComponent(w.word)}`} aria-label={`${w.word}，${riskLabel[w.risk]}，权重${w.weight}`} onMouseEnter={()=>setHovered(w)} onMouseLeave={()=>setHovered(null)}>
            <g className={`cloud-node ${w.risk}`}>
              <rect className="cloud-tile" x={w.x} y={w.y} width={w.width} height={w.height} rx="7" />
              <text className="tile-index" x={w.x+8} y={w.y+13}>#{String(w.rank).padStart(2,"0")}</text>
              <text x={w.x+w.width/2} y={w.y+w.height*.72} textAnchor="middle" className="cloud-word" style={{fontSize:w.size}}>{w.word}</text>
            </g>
          </a>)}
        </svg>
        <div className={`metric-float ${hovered?"show":""}`}>
          {hovered&&<><div><strong>{hovered.word}</strong><span className={hovered.risk}>{riskLabel[hovered.risk]}</span></div><dl><dt>情感加权权重</dt><dd>{hovered.weight}</dd><dt>情感强度</dt><dd>{hovered.emotionStrength}</dd><dt>焦虑 / 信任</dt><dd>{hovered.anxiety} / {hovered.trust}</dd><dt>每万词频</dt><dd>{hovered.frequency}</dd></dl><p>点击查看该词相关新闻及情感分布 →</p></>}
        </div>
      </div>
      <footer className="card-footer"><div className="legend"><span><i className="high"/>高危 ≥20</span><span><i className="medium"/>中危 10—20</span><span><i className="low"/>低危 ＜10</span></div><p>字号＝原情感加权权重 · 期内对数缩放</p></footer>
    </section>
    <section className="tier-bar-section" aria-labelledby="tier-bar-title">
      <header><div><p>RISK TIER SHARE / 0{stage}</p><h2 id="tier-bar-title">{cloud.title}关键词风险层级占比</h2></div><span>{cloud.period} · 按情感加权权重合计</span></header>
      <div className="tier-bar-body">
        <div className="tier-stack" role="img" aria-label={`${cloud.title}高危、中危、低危关键词情感加权权重占比条形图`}>
          {tierShare.filter(t=>t.share>0).map(t=><div key={t.key} className={`tier-seg ${t.key}`} style={{width:`${Math.max(t.share*100,3)}%`,background:t.color}}>
            <b>{t.name}</b><em>{t.share>=0.07?`${(t.share*100).toFixed(1)}%`:""}</em>
          </div>)}
        </div>
        <div className="tier-legend">
          {tierShare.map(t=><div className="tier-card" key={t.key}>
            <div className="tier-card-head"><i style={{background:t.color}}/><b>{t.name}</b><span>{t.def}</span></div>
            <dl>
              <div><dt>关键词数</dt><dd>{t.count}</dd></div>
              <div><dt>权重合计</dt><dd>{t.weight.toFixed(1)}</dd></div>
              <div><dt>占比</dt><dd>{(t.share*100).toFixed(1)}%</dd></div>
            </dl>
          </div>)}
        </div>
      </div>
      <footer><p>层级划分与词云图例一致：高危≥20、中危10—20、低危＜10（依据情感加权权重）；条形占比按各层级关键词情感加权权重合计计算。</p><span>{periodWords.length} 个关键词 · 总权重 {periodWords.reduce((s,w)=>s+w.weight,0).toFixed(1)}</span></footer>
    </section>
    <section className="evolution-section" aria-labelledby="evolution-title">
      <div className="evolution-kicker"><span>EVOLUTION / 0{stage}</span><i /></div>
      <div className="evolution-copy"><p>阶段演化解读</p><h2 id="evolution-title">{story.thesis}</h2><div className="story-columns"><p>{story.text}</p><aside><b>数据对应</b><span>{story.evidence}</span></aside></div></div>
      <div className="transition-line"><span>{stage<4?`0${stage}`:"总"}</span><p>{story.transition}</p><b>{stage<4?`0${stage+1}`:"结论"}</b></div>
      <div className="evolution-rail" aria-label="四时期演化进度">{clouds.map(c=><button key={c.id} className={stage===c.id?"active":""} onClick={()=>change(c.id)}><i/><span>{c.title}</span></button>)}</div>
    </section>
    <ToolkitSection stage={stage} />
    <section className="media-ranking" aria-labelledby="media-ranking-title">
      <header><div><p>MEDIA SOURCE RANKING / 0{stage}</p><h2 id="media-ranking-title">{cloud.title}关键词相关新闻媒体来源排行</h2></div><span>{cloud.period} · {mediaRanking.length?"已接入":"数据待录入"}</span></header>
      <div className="ranking-table-wrap"><table><thead><tr><th>排名</th><th>媒体来源</th><th>新闻引用</th><th>关联关键词</th><th>来源占比</th><th>状态</th></tr></thead><tbody>
        {mediaRanking.length?mediaRanking.map((row,i)=><tr key={row.source}><td><b>{String(i+1).padStart(2,"0")}</b></td><td><strong className="source-name">{row.source}</strong></td><td>{row.count}</td><td><span className="keyword-chips">{row.keywords.slice(0,5).join("、")}{row.keywords.length>5?"…":""}</span></td><td><div className="share-value"><div className="share-placeholder"><i style={{width:`${Math.max(8,row.share*100)}%`}}/></div><span>{(row.share*100).toFixed(1)}%</span></div></td><td><span className="verified-cell">{stage===4?"待核验":"已接入"}</span></td></tr>):Array.from({length:8},(_,i)=><tr key={i}><td><b>{String(i+1).padStart(2,"0")}</b></td><td><span className="empty-cell">待填入媒体名称</span></td><td>—</td><td><span className="empty-cell">待填入关键词</span></td><td><div className="share-placeholder"><i style={{width:`${88-i*8}%`}}/></div></td><td><span className="empty-cell">待补充</span></td></tr>)}
      </tbody></table></div>
      <footer><p>{mediaRanking.length?`统计口径：按${cloud.title}词云关键词关联的新闻案例引用次数汇总；同一新闻对应多个关键词时分别计入。${stage===2?"（发展期案例报道发布于 2020—2021 年，与该时期年份一致。）":""}`:"建议统计口径：按当前时期所选关键词检索相关新闻，统一媒体名称后汇总篇数并计算来源占比。"}</p><span>{mediaRanking.length?(stage===4?"2024—2026 原始链接已接入 · 待核验":"新闻案例已接入"):"数据待录入"}</span></footer>
    </section>
    <footer className="compliance-notice" aria-label="平台合规声明">
      <b>合规声明</b>
      <p>内容仅供参考，涉诈请拨 96110。</p>
    </footer>
  </main>
}

