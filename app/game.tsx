"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
type State={round:null|{id:number;status:string;deadline:number;countA:number|null;countB:number|null};question:string;optionA:string;optionB:string;serverNow:number;total:number;myVote:string|null;winner:string|null;commentary:string;commentarySource:string};
export default function Game({mode}:{mode:"player"|"screen"|"host"}) {
  const [data,setData]=useState<State|null>(null), [error,setError]=useState(""), [busy,setBusy]=useState(false), [time,setTime]=useState(Date.now()), [offset,setOffset]=useState(0);
  const [question,setQuestion]=useState("AIに任せたいのは？"), [optionA,setA]=useState("バグ修正"), [optionB,setB]=useState("会議の進行"), [comment,setComment]=useState("");
  const [seconds,setSeconds]=useState(30);
  async function load() {try {const r=await fetch("/api/state",{cache:"no-store"});const d=await r.json() as State & { error: string };if(!r.ok)throw Error(d.error);setData(d);setOffset(d.serverNow*1000-Date.now());setError("");}catch(e){setError((e as Error).message);}}
  useEffect(()=>{void load();const poll=setInterval(load,1000);return()=>clearInterval(poll);},[]);
  useEffect(()=>{const tick=setInterval(()=>setTime(Date.now()+offset),100);return()=>clearInterval(tick);},[offset]);
  async function action(url:string,body:unknown) {setBusy(true);setError("");try {const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json() as State & { error: string };if(!r.ok)throw Error(d.error);setData(d);setOffset(d.serverNow*1000-Date.now());}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  const remaining=data?.round ? Math.max(0,Math.ceil(data.round.deadline-time/1000)) : seconds;
  const open=data?.round?.status==="open", closed=data?.round?.status==="closed";
  const canVote=mode==="player" && open && remaining>0 && !data?.myVote && !busy;
  const result=!closed ? "" : data?.winner==="draw" ? "引き分け！" : `${data?.winner} の少数派が勝利！`;
  const personal=closed && data?.myVote ? data.winner==="draw" ? "あなたも引き分け！" : data.myVote===data.winner ? "あなたの勝ち！" : "今回は多数派。次は少数派を狙おう！" : "";
  useEffect(()=>{
    const context=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options?:unknown)=>Promise<void>}}).modelContext;
    if(!context?.registerTool)return;
    const controller=new AbortController();
    void context.registerTool({name:"read_game_state",description:"画面と同じサーバーのお題・受付状態・匿名集計を取得する。",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:async()=>{const r=await fetch("/api/state",{cache:"no-store"});if(!r.ok)throw Error("集計を取得できません");return r.json();}},{signal:controller.signal}).catch(()=>{});
    return()=>controller.abort();
  },[]);
  return <main className={`game ${mode}`}>
    <header><a className="brand" href="/">dots <span>少数派ゲーム</span></a><span className="rule">少ない方を選んだ人が勝ち</span></header>
    <div className="arena"><section className="play">
      <div className="status"><span>{!data?.round ? "まもなくスタート" : closed ? "結果発表" : remaining>0 ? "投票受付中" : "サーバーで集計中"}</span><span className="votes">{data?.total ?? 0}<small>人が投票</small></span></div>
      <h1>{data?.question ?? "AIに任せたいのは？"}</h1>
      {!closed && <div className="clock"><strong>{open ? remaining : seconds}</strong><span>秒</span></div>}
      {closed && <h2 className="result" aria-live="polite">{result}</h2>}
      <div className="choices">{(["A","B"] as const).map(choice=><Button key={choice} className={`choice choice-${choice} ${data?.myVote===choice ? "selected" : ""}`} disabled={mode==="player" ? !canVote : true} onClick={()=>action("/api/vote",{roundId:data?.round?.id,choice})}><span className="letter">{choice}</span><span className="option">{choice==="A" ? data?.optionA ?? "バグ修正" : data?.optionB ?? "会議の進行"}</span>{closed && <span className="count">{choice==="A" ? data?.round?.countA : data?.round?.countB}<small>票</small></span>}{data?.myVote===choice && <span className="voted">あなたの選択</span>}</Button>)}</div>
      {mode==="player" && <p className="player-message" aria-live="polite">{personal || (data?.myVote ? `${data.myVote} に投票しました。結果を待とう！` : !data?.round ? "司会が始めたら、AかBを一度だけタップ！" : open && remaining>0 ? "1端末1票。投票すると変更できません。" : "投票の受付は終了しました。")}</p>}
      {mode==="player" && (!open || remaining===0) && <p className="player-message">このゲームは管理者が開始操作を行う必要があります。参加者だけでは開始できません。管理者が不在の場合は、開始を待ってください。</p>}
      <div className="comment"><span className="dot-mark">d</span><div><small>{data?.commentarySource==="dots_mcp" ? "dots のライブ実況（MCP）" : data?.commentarySource==="manual" ? "司会コメント" : "dots の事前コメント・定型実況"}</small><p>{data?.commentary ?? "みんなと同じ？ それとも少数派？"}</p></div></div>
      {error && <div className="error" role="alert">{error}<Button variant="outline" onClick={load}>再試行</Button></div>}
    </section>{mode!=="player" && <aside className="join"><img src="/qr.svg" alt="このQRを読むとゲームに参加できます" width="320" height="320"/><h2>QRで参加</h2><p>ログイン・名前・メール不要</p><a href="/play">ゲームに参加</a></aside>}</div>
    {mode==="host" && <section className="host-controls"><h2>司会コントロール</h2><p>MCPを接続するまではここから手動で進行できます。</p><label>お題<input value={question} onChange={e=>setQuestion(e.target.value)} maxLength={150}/></label><div className="host-grid"><label>A<input value={optionA} onChange={e=>setA(e.target.value)} maxLength={60}/></label><label>B<input value={optionB} onChange={e=>setB(e.target.value)} maxLength={60}/></label><label>制限時間（秒）<input type="number" value={seconds} onChange={e=>setSeconds(Number(e.target.value))} min={5} max={120}/></label></div><div className="host-buttons"><Button className="start" disabled={busy || open} onClick={()=>action("/api/host",{action:"start",question,optionA,optionB,seconds})}>{closed ? "もう一度スタート" : "投票スタート"}</Button><Button variant="outline" disabled={busy || !open} onClick={()=>action("/api/host",{action:"close"})}>締め切って結果発表</Button><a href="/screen" target="_blank">投影画面を開く</a></div><label>実況文<input value={comment} onChange={e=>setComment(e.target.value)} maxLength={1000}/></label><Button variant="outline" disabled={busy || !data?.round || !comment.trim()} onClick={()=>action("/api/host",{action:"commentary",roundId:data?.round?.id,commentary:comment})}>コメントを表示</Button></section>}
    <footer>匿名の票数だけを公開します。Cookieを削除すると別端末扱いになります。</footer>
  </main>;
}
