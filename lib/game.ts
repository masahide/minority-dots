import { env } from "cloudflare:workers";

const nowSQL = "CAST(strftime('%s','now') AS INTEGER)";
export const firstQuestion = { question: "AIに任せたいのは？", optionA: "バグ修正", optionB: "会議の進行" };
export class GameError extends Error { constructor(message: string, public status = 400) { super(message); } }
type Round = { id: number; question: string; option_a: string; option_b: string; deadline: number; status: string; count_a: number | null; count_b: number | null; commentary: string; commentary_source: string };
function db() { if (!env.DB) throw new GameError("集計サーバーに接続できません。少し待って再試行してください。", 503); return env.DB; }
export function isOwner(headers: Headers) {
  const owner = (env as unknown as Record<string, string>).OWNER_EMAIL;
  return Boolean(owner && headers.get("oai-authenticated-user-id") && headers.get("oai-authenticated-user-email")?.toLowerCase() === owner.toLowerCase());
}
export function requireOwner(headers: Headers) { if (!isOwner(headers)) throw new GameError("司会操作はこのSiteの所有者だけが利用できます。", 403); }
export function checkOrigin(request: Request) { if (request.headers.get("origin") !== new URL(request.url).origin) throw new GameError("このページから操作してください。", 403); }
export function participantCookie(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map(x => x.trim()).find(x => x.startsWith("dots_player="))?.slice(12);
  return value && /^[a-f0-9-]{36}$/.test(value) ? value : null;
}
async function digest(token: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))).map(x => x.toString(16).padStart(2,"0")).join(""); }
export async function finalize() {
  await db().prepare(`UPDATE rounds SET status='closed', count_a=(SELECT COUNT(*) FROM votes WHERE round_id=rounds.id AND choice='A'), count_b=(SELECT COUNT(*) FROM votes WHERE round_id=rounds.id AND choice='B') WHERE status='open' AND deadline<=${nowSQL}`).run();
}
export async function state(token?: string | null) {
  await finalize();
  const round = await db().prepare("SELECT * FROM rounds ORDER BY id DESC LIMIT 1").first<Round>();
  const clock = await db().prepare(`SELECT ${nowSQL} AS now`).first<{ now: number }>();
  if (!round) return { round: null, serverNow: clock!.now, total: 0, myVote: null, winner: null, commentary: "みんなと同じ？ それとも少数派？ 少ない方を選んだ人が勝ち！", commentarySource: "preset", ...firstQuestion };
  const live = await db().prepare("SELECT COUNT(*) AS total FROM votes WHERE round_id=?").bind(round.id).first<{ total: number }>();
  const mine = token ? await db().prepare("SELECT choice FROM votes WHERE round_id=? AND participant=?").bind(round.id, await digest(token)).first<{choice:string}>() : null;
  const closed = round.status === "closed";
  const a = closed ? round.count_a ?? 0 : null;
  const b = closed ? round.count_b ?? 0 : null;
  const winner = !closed ? null : a === b ? "draw" : a! < b! ? "A" : "B";
  const preset = !closed ? "多数派を読むか、直感で選ぶか。投票は一度だけ！" : winner === "draw" ? "見事に同数！ 今回は引き分けです。" : `${winner} が少数派！ ${winner === "A" ? round.option_a : round.option_b}を選んだ人の勝ち！`;
  return { round: { id: round.id, status: round.status, deadline: round.deadline, countA:a, countB:b }, question:round.question, optionA:round.option_a, optionB:round.option_b, serverNow:clock!.now, total:live?.total ?? 0, myVote:mine?.choice ?? null, winner, commentary:round.commentary || preset, commentarySource:round.commentary ? round.commentary_source : "preset" };
}
function textValue(value: unknown, max: number) { if(typeof value !== "string" || !value.trim() || value.trim().length > max) throw new GameError("お題と選択肢を確認してください。"); return value.trim(); }
export async function startRound(input: Record<string, unknown>, source: string) {
  const question = textValue(input.question ?? firstQuestion.question, 150);
  const optionA = textValue(input.optionA ?? firstQuestion.optionA, 60);
  const optionB = textValue(input.optionB ?? firstQuestion.optionB, 60);
  const seconds = input.seconds ?? 30;
  if(typeof seconds !== "number" || !Number.isInteger(seconds) || seconds < 5 || seconds > 120) throw new GameError("制限時間は5〜120秒です。");
  const results = await db().batch([
    db().prepare(`UPDATE rounds SET deadline=${nowSQL}, status='closed', count_a=(SELECT COUNT(*) FROM votes WHERE round_id=rounds.id AND choice='A'), count_b=(SELECT COUNT(*) FROM votes WHERE round_id=rounds.id AND choice='B') WHERE status='open'`),
    db().prepare(`INSERT INTO rounds(question,option_a,option_b,deadline,commentary_source) VALUES(?,?,?,${nowSQL}+?,?)`).bind(question,optionA,optionB,seconds,source),
  ]);
  if(!results.every(x=>x.success)) throw new GameError("ラウンドを開始できませんでした。",503);
  return state();
}
export async function closeRound() { await db().prepare(`UPDATE rounds SET deadline=${nowSQL} WHERE status='open'`).run(); return state(); }
export async function setCommentary(input: Record<string,unknown>, source: string) {
  const commentary = textValue(input.commentary, 1000);
  const roundId = input.roundId;
  if(typeof roundId !== "number" || !Number.isInteger(roundId)) throw new GameError("ラウンド番号が必要です。");
  const result = await db().prepare("UPDATE rounds SET commentary=?, commentary_source=? WHERE id=? AND id=(SELECT MAX(id) FROM rounds)").bind(commentary,source,roundId).run();
  if(!result.meta.changes) throw new GameError("お題が変わりました。最新のラウンドを取得してください。",409);
  return state();
}
export async function vote(input: Record<string,unknown>, token: string) {
  const roundId=input.roundId, choice=input.choice;
  if(typeof roundId!=="number" || !Number.isInteger(roundId) || (choice!=="A" && choice!=="B")) throw new GameError("投票内容を確認してください。");
  const result = await db().prepare(`INSERT OR IGNORE INTO votes(round_id,participant,choice) SELECT id,?,? FROM rounds WHERE id=? AND id=(SELECT MAX(id) FROM rounds) AND status='open' AND deadline>${nowSQL}`).bind(await digest(token),choice,roundId).run();
  if(!result.meta.changes) throw new GameError("投票済み、または受付が終了しました。",409);
  return state(token);
}
export function errorResponse(error: unknown) { console.error(error instanceof GameError ? error.message : "game_storage_error"); return Response.json({error:error instanceof GameError ? error.message : "集計サーバーに接続できません。再試行してください。"},{status:error instanceof GameError ? error.status : 503}); }
