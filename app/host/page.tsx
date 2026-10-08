import { headers } from "next/headers";
import { requireChatGPTUser } from "../chatgpt-auth";
import { isOwner } from "@/lib/game";
import Game from "../game";
export const dynamic="force-dynamic";
export default async function Host() {
  await requireChatGPTUser("/host");
  if(!isOwner(await headers()))return <main><h1>所有者専用の司会画面です</h1><a href="/">ゲームに参加する</a></main>;
  return <Game mode="host" />;
}
