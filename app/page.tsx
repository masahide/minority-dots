import { Button } from "@/components/ui/button";
export default function Home() {
  return <main className="intro">
    <header className="intro-header"><a className="brand" href="/">dots <span>少数派ゲーム</span></a><span className="intro-event">Tokyo · 2026.10.08</span></header>
    <section className="intro-summary" aria-labelledby="intro-title">
      <div><p className="intro-kicker">アイデアから公開まで、dotsにおまかせ</p><h1 id="intro-title">dotsが司会！<br className="intro-mobile-break"/> 少数派ゲーム</h1><p className="intro-lead">QRで参加して、二択に投票。<strong>少ない方を選んだ人が勝ち！</strong></p></div>
      <nav className="intro-actions" aria-label="ゲームを開く"><Button asChild className="intro-primary"><a href="/play">ゲームに参加</a></Button><Button asChild variant="outline" className="intro-secondary"><a href="/screen">投影画面</a></Button></nav>
    </section>
    <p className="intro-origin">このゲームは管理者が開始操作を行う必要があります。参加者だけでは開始できません。管理者が不在の場合は、開始を待ってください。</p>
    <p className="intro-origin">2026年10月8日の <a href="https://luma.com/538veir3" target="_blank" rel="noopener">Codex Community Meetup – Tokyo: DevDay Recap &amp; Workshop</a> のワークショップをきっかけに制作。アイデアをdotsに伝え、実装・公開まで任せました。<a className="intro-hashtag" href="https://x.com/hashtag/DevDayCommunity" target="_blank" rel="noopener">#DevDayCommunity</a></p>
    <figure className="intro-art">
      <a className="intro-image-link" href="/game-introduction.png" target="_blank" rel="noopener" aria-label="紹介イラストを拡大して開く"><img src="/game-introduction.png" alt="手描きの紹介図。アイデアをdotsに伝えると、dotsが内部の開発技術を使って実装・公開まで担当。参加者はQRでスマホから二択投票し、Sites上のサーバーが30秒の締切と集計を確定。Aが3票、Bが1票の例ではBを選んだ少数派が勝利。dotsはMCPの操作窓口を通じて出題と結果コメントを担当する。" width="1536" height="1024" fetchPriority="high"/></a>
      <figcaption><span>アイデアをdotsへ → dotsが実装・公開 → QRで参加 → dotsが司会</span><a href="/game-introduction.png" target="_blank" rel="noopener">イラストを拡大</a></figcaption>
    </figure>
    <section className="intro-explainer" aria-label="今回使った機能">
      <article className="intro-dot"><span className="intro-tag">OpenAI DevDay 2026で登場</span><h2>dotsが制作から司会まで</h2><p>アイデアを受け取ったdotsが、開発作業を手配して実装・公開まで担当。ゲーム中はMCPを通じて出題・ラウンド開始を行い、確定した結果をコメントします。</p></article>
      <article><span className="intro-tag">組み合わせた技術</span><h2>Sites × MCP</h2><p><strong>Sites</strong>でWebゲームを公開。<strong>MCP</strong>はdotsがゲームを操作する窓口。<strong>Codex</strong>は、制作時にdotsが内部で使用した開発技術です。</p></article>
      <div className="intro-responsibility"><p><strong>秒数・票数・勝敗はサーバーが確定。</strong>dotsは出題と結果コメントを担当します。投票は匿名で1端末1票。同数は引き分けです。</p><p className="intro-direction">今回の接続：dots → MCPの操作窓口 → Sites上のゲーム<br/>DevDayで紹介された「Sitesから接続済みプラグインを利用する機能」とは、別の構成です。</p></div>
    </section>
    <footer className="intro-footer"><p>出典：<a href="https://openai.com/index/devday-2026-recap/" target="_blank" rel="noopener">OpenAI · DevDay 2026 Recap（2026年9月29日）</a> ／ <a href="https://modelcontextprotocol.io/docs/learn/server-concepts" target="_blank" rel="noopener">MCP公式 · サーバーとツール</a><br/>ゲームの仕組みは本デモの実装に基づきます。Sites・MCP自体がDevDayで初登場したという説明ではありません。</p><div><a className="intro-host-link" href="https://github.com/masahide/minority-dots" target="_blank" rel="noopener">ソースコード</a><br/><a className="intro-host-link" href="/host">司会用画面（所有者のみ）</a></div></footer>
  </main>;
}
