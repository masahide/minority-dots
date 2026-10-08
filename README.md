# dots 少数派ゲーム

QRで参加して二択に投票し、締切後に少ない方を選んだ人が勝つ匿名ゲーム。同数は引き分けです。Sites上の共有D1データベースが秒数・票数・勝敗を確定します。

2026年10月8日の [Codex Community Meetup – Tokyo: DevDay Recap & Workshop](https://luma.com/538veir3) のワークショップをきっかけに制作。アイデアをdotsに伝え、実装・公開まで任せました。#DevDayCommunity

## 遊ぶ

- [紹介](https://minority-dots-meetup.masahide-y.chatgpt.site/)
- [スマホで参加](https://minority-dots-meetup.masahide-y.chatgpt.site/play)
- [会場に投影](https://minority-dots-meetup.masahide-y.chatgpt.site/screen)
- [司会用画面（所有者のみ）](https://minority-dots-meetup.masahide-y.chatgpt.site/host)

このゲームは管理者が開始操作を行う必要があります。参加者だけでは開始できません。管理者が不在の場合は開始を待ってください。管理者はホスト画面、または所有者として認証したdotsのMCP操作で進行します。

最初のお題は「AIに任せたいのは？」。Aは「バグ修正」、Bは「会議の進行」。標準30秒（5〜120秒）。投票は1端末1票程度で、変更できません。HttpOnly Cookieの匿名IDをハッシュし、ラウンドごとの重複をデータベースで拒否します。Cookie削除や別ブラウザーは別参加者として扱われます。氏名・メールは収集せず、公開する集計は票数だけです。

## 開発

Node.js 22.13以上。vinext、React、Vite、Cloudflare Workers、D1を使用します。外部AI APIキーは不要です。

```sh
npm ci
cp .dev.vars.example .dev.vars
```

ローカルで司会操作を試す場合は`.dev.vars`の`OWNER_EMAIL`を`seedy@sites.test`に設定してください。これはViteがループバック接続時だけ使用する架空のmock identityです。本番所有者には使用しないでください。Windowsでは`cp`の代わりに`Copy-Item .dev.vars.example .dev.vars`を使用できます。

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_public_ken_ellis.sql
npm run dev
```

開発ページは標準で`http://localhost:5173`です。マイグレーション後、`/host`で開始します。`npm start`はビルド済みWorkerの確認用で、ChatGPTログインのmockを提供しません。

## 公開・認証

`.openai/hosting.json`は汎用のバインディング構成です。`DB`（D1）、MCP capability、実行時の`OWNER_EMAIL`が必要です。新しいSiteを標準Sitesワークフローで登録し、そのSiteのIDを設定して、マイグレーション・実行時設定・ビルド・ソース保存・バージョン公開を行います。既存デモの登録ID・データベース・資格情報は含めていません。

司会操作はSitesが付与する信頼済みユーザーIDとメールを確認し、`OWNER_EMAIL`に一致する所有者だけに許可します。匿名での開始・締切・お題変更・実況変更は403です。本番所有者のメールは実行時設定に登録し、Gitに入れないでください。

認証はSitesのゲートウェイが入力認証ヘッダーを除去し、検証済みの値を付与する前提です。独立した一般公開Workerで、クライアント指定の`oai-authenticated-user-*`ヘッダーをそのまま信用してはいけません。他のホスティングでは信頼できる認証ゲートウェイが必要です。所有者チェックを無効化して公開しないでください。

QRは現在のデモの参加URLを指しています。別Siteの場合は実際の参加URLで生成し直します。

```sh
node scripts/generate-qr.mjs https://your-site.example/play
```

## dotsとMCP

`/mcp`はStreamable HTTP JSON-RPCです。Sitesの接続情報から、そのSiteのMCP pluginをインストール・接続し、所有者としてOAuth認証してください。接続設定を読むだけでは接続は完了しません。

| ツール | 動作 |
| --- | --- |
| `get_round` | 確定状態・匿名集計を取得 |
| `start_round` | 出題と秒数を設定して開始 |
| `close_round` | 受付を締切 |
| `set_commentary` | 最新ラウンドの実況を設定 |

すべてのMCPツール呼び出しは所有者認証が必要です。dotsは出題と結果コメントを担当し、時間・集計・勝敗はサーバーが決めます。接続だけでは自動の連続実況は始まりません。所有者がdotsに進行を指示します。未接続でも所有者ホスト画面から手動進行できます。画面では事前コメント・手動コメント・MCP実況を区別しています。

## 公開ソースとライセンス

ゲーム、紹介ページ、紹介画像、QR、ビルド設定、D1スキーマとマイグレーションを含みます。元のSitesリポジトリを維持したまま、新しい公開用履歴へ書き出しました。実行時設定、`.env`、ログ、投票データ、依存パッケージ、生成ビルド、コンパイラーキャッシュ、Sites登録ID、元履歴の個人メールは含みません。

独自コードや紹介画像への包括的なライセンスは付与していません。第三者の通知・ライセンスは維持しています。`build/sites-vite-plugin.LICENSE`と`vendor/shadcn-tailwind-4.13.0.LICENSE.md`を参照してください。依存パッケージには各ライセンスが適用されます。
