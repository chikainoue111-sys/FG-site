# FG Site

外部監査会社向けの会社案内サイトです。

## 目的
- 外部監査・ガバナンス・内部統制に関する信頼感のあるブランド表現
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

- トップページ (`/index.html`) の「選ばれる理由」3項目は、`feature-media-slot` を実画像に置き換えやすい構成です。実運用時は `<figure class="feature-editorial-media">` の枠は残したまま、内側の `Image Slot 01/02/03` プレースホルダー要素を `<img>` に差し替えてください。あわせて `<figure>` の `aria-hidden="true"` を外し、画像に適切な `alt` を設定してください。
