---
name: fix-pr-reviews
description: PRのレビューコメントを取得し、指摘を修正してレビュー・テスト・デプロイチェックを通してからコミット＆プッシュするスキル。「レビュー指摘対応」「PR修正」「/fix-pr-reviews」と言ったとき使用する。
version: 1.0.0
disable-model-invocation: true
---

# PR レビュー指摘対応

引数: $ARGUMENTS（PR番号。省略時は現在のブランチの PR を自動検出）

## Step 1: PR のレビューコメント取得

### gh CLI が認証済みの場合

```bash
# PR番号が指定されていない場合、現在のブランチから検出
gh pr view --json number --jq '.number'

# レビューコメント（インラインコメント）を取得
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments \
  --jq '.[] | "---\nFile: \(.path):\(.line // .original_line)\nBody: \(.body)\n"'
```

### gh CLI が未認証 or 使えない場合

WebFetch で PR ページからコメントを取得する：

```
WebFetch: https://github.com/{owner}/{repo}/pull/{pr_number}
Prompt: このPRのレビューコメント（指摘事項）をすべて抽出してください。各コメントについて、ファイル名、行番号、指摘内容、提案されたコード変更を含めてください。
```

## Step 2: 指摘内容の整理

取得したコメントを以下の表形式で整理する。前回のラウンドで対応済みのコメントは除外し、未対応のもののみリストアップする。

```
| # | ファイル | 行 | 指摘内容 | 対応方針 |
|---|---------|-----|---------|---------|
| 1 | ... | ... | ... | ... |
```

未対応のコメントがない場合は「すべて対応済みです」と報告して終了する。

## Step 3: 指摘の修正

各指摘に対して以下を行う：

1. 該当ファイルを Read で読み込む
2. Edit で修正を適用する
3. 提案コード（suggestion）がある場合はそれを参考にする（ただし盲目的にコピーせず、文脈に合った修正にする）

## Step 4: コードレビュー（/review スキル相当）

修正したファイルに対して、`git diff HEAD` で変更差分を取得し、以下のチェックリストでレビューする：

### バグ・ロジック
- null/undefined のガード漏れがないか
- 配列インデックスや数値フィールドに不正値が入り込まないか

### フロントエンド
- localStorage の読み書きに try/catch があるか
- aria-* 属性やラベルが適切か
- 未使用のインポート・変数がないか
- 型安全性が確保されているか

問題があれば修正してから次のステップへ進む。

## Step 5: テスト実行

```bash
cd frontend && npx tsc --noEmit
```

型エラーがあれば修正する。

```bash
cd frontend && npm test
```

テストが失敗したら修正する。

## Step 6: 静的ビルド確認

```bash
cd frontend && GITHUB_ACTIONS=true npm run build
```

ビルドが失敗したら修正する。

## Step 7: コミット＆プッシュ

```bash
git add <修正したファイル>
git commit -m "fix: PRレビューコメント対応（第Nラウンド・M件）

- 修正内容1
- 修正内容2
...

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push
```

## Step 8: 結果サマリー

```
=== PRレビュー指摘対応結果 ===

PR: #<番号>
対応ラウンド: 第N回
対応件数: M件

チェック結果:
- TypeScript 型チェック : ✅ PASS / ❌ FAIL
- Vitest テスト         : ✅ PASS / ❌ FAIL
- 静的ビルド           : ✅ PASS / ❌ FAIL
- コミット＆プッシュ   : ✅ 完了

対応内容:
| # | ファイル | 指摘内容 | 対応 |
|---|---------|---------|------|
| 1 | ... | ... | ... |
```
