# FG Site

保険代理店向け外部監査会社の会社案内サイトです。

## 目的
- 外部監査・内部統制／ガバナンス・各種フォローアップに関する信頼感のあるブランド表現
- スマホ対応の静的サイト
- Cloudflare Pages へのそのままデプロイ対応

## 主要ページ
- index.html
- company.html
- services.html
- message.html
- access.html
- contact.html

## スタイル
- 見出し: Manrope / Noto Sans JP
- 基本色: ネイビー + ゴールド
- 雰囲気: 信頼感 / 爽やか / 親しみやすさ

## デプロイ方法
1. GitHub にこのリポジトリを push
2. Cloudflare Dashboard > Pages > Create Project
3. GitHub から `FG-site` を選択
4. Production Build の設定を確認しデプロイ

## 補足
会社名、住所、メールアドレス、電話番号、代表者名などは仮入力です。正式情報が決まり次第差し替えできます。

- トップページ (`/index.html`) は「選ばれる理由」以降でフルスクリーン・スクロールスナップを採用しています。`feature-story-01/02/03` は `background-image` ベースのため、`assets/css/style.css` の `--feature-bg-image`（`feature-01.jpg` など）を差し替えるだけで背景を更新できます。画像未配置でも壊れた画像枠は表示されません。

## トップページ操作確認（主要ブラウザ）
- 対象ブラウザ: 最新版 Chrome / Edge / Safari / Firefox（デスクトップ・モバイル）
- `index.html` の「選ばれる理由」以降で、ホイール・トラックパッド・タッチ・キーボード（↑↓/PgUp/PgDn/Space）でセクション単位に遷移できること
- 各フルスクリーンコマ内で本文が長い場合、コマ内スクロールが優先され、末尾到達後に次セクションへ遷移すること
- `prefers-reduced-motion: reduce` では強いスナップを抑え、通常スクロールに近い挙動になること
