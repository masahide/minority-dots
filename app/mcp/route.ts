import { requireOwner, state, startRound, closeRound, setCommentary, errorResponse } from "@/lib/game";
const tools=[
 {name:"get_round",description:"現在のお題、サーバー締切、匿名の投票総数、締切後の集計と勝敗を取得する。所有者専用。",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true}},
 {name:"start_round",description:"二択のお題を出して5〜120秒の投票を開始する。少数派が勝利。同数は引き分け。所有者専用。",inputSchema:{type:"object",properties:{question:{type:"string",maxLength:150},optionA:{type:"string",maxLength:60},optionB:{type:"string",maxLength:60},seconds:{type:"integer",minimum:5,maximum:120}},required:["question","optionA","optionB","seconds"],additionalProperties:false}},
 {name:"close_round",description:"投票を締め切り、サーバーで集計を確定する。所有者専用。",inputSchema:{type:"object",properties:{},additionalProperties:false}},
 {name:"set_commentary",description:"現在のラウンドにdotsの実況文を表示する。票、勝敗、期限は変更しない。所有者専用。",inputSchema:{type:"object",properties:{roundId:{type:"integer"},commentary:{type:"string",maxLength:1000}},required:["roundId","commentary"],additionalProperties:false}},
];
export async function POST(request: Request) {
  try {
    const rpc=await request.json() as { id?: string | number; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };
    if(rpc.method?.startsWith("notifications/"))return new Response(null,{status:202});
    let result;
    if(rpc.method==="initialize")result={protocolVersion:"2025-03-26",capabilities:{tools:{}},serverInfo:{name:"dots-minority-game",version:"1.0.0"}};
    else if(rpc.method==="tools/list")result={tools};
    else if(rpc.method==="ping")result={};
    else if(rpc.method==="tools/call"){
      requireOwner(request.headers);
      const input=rpc.params?.arguments ?? {};let data;
      if(rpc.params?.name==="get_round")data=await state();
      else if(rpc.params?.name==="start_round")data=await startRound(input,"dots_mcp");
      else if(rpc.params?.name==="close_round")data=await closeRound();
      else if(rpc.params?.name==="set_commentary")data=await setCommentary(input,"dots_mcp");
      else return Response.json({jsonrpc:"2.0",id:rpc.id,error:{code:-32601,message:"Unknown tool"}});
      result={content:[{type:"text",text:JSON.stringify(data)}]};
    }else return Response.json({jsonrpc:"2.0",id:rpc.id,error:{code:-32601,message:"Unknown method"}});
    return Response.json({jsonrpc:"2.0",id:rpc.id,result},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return errorResponse(error);}
}
