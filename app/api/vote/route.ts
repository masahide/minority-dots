import { vote, participantCookie, checkOrigin, GameError, errorResponse } from "@/lib/game";
export async function POST(request: Request) {
  try {checkOrigin(request);const token=participantCookie(request);if(!token)throw new GameError("ページを更新してから投票してください。",400);return Response.json(await vote(await request.json(),token),{headers:{"Cache-Control":"no-store"}});}catch(error){return errorResponse(error);}
}
