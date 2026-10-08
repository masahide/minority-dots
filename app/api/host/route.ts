import { requireOwner, checkOrigin, startRound, closeRound, setCommentary, GameError, errorResponse } from "@/lib/game";
export async function POST(request: Request) {
  try {requireOwner(request.headers);checkOrigin(request);const input=await request.json() as Record<string, unknown>;let result;if(input.action==="start")result=await startRound(input,"manual");else if(input.action==="close")result=await closeRound();else if(input.action==="commentary")result=await setCommentary(input,"manual");else throw new GameError("操作を確認してください。");return Response.json(result,{headers:{"Cache-Control":"no-store"}});}catch(error){return errorResponse(error);}
}
