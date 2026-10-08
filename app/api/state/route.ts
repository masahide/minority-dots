import { state, participantCookie, errorResponse } from "@/lib/game";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const existing=participantCookie(request), token=existing || crypto.randomUUID();
    const response=Response.json(await state(token),{headers:{"Cache-Control":"no-store"}});
    if(!existing) response.headers.set("Set-Cookie",`dots_player=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`);
    return response;
  } catch(error) {return errorResponse(error);}
}
