# 夫婦のライフプラン・キャリア設計アプリ

夫婦向けライフプラン・キャリア設計WebアプリのMVPです。

## 機能
- 基本情報入力（夫婦プロフィール・就業情報）
- 収入・支出・資産入力
- ダッシュボード（総資産・月間収支サマリ）
- 資産推移グラフ（5/10/20/30年）

## 起動方法

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:3000

#### WSL / Windows環境でのビルドについて
WSLのWindowsファイルシステム（/mnt/c/）上でのビルドはTurbopackの制約により
`npm run build`が失敗する場合があります。
その場合はLinuxファイルシステム上でビルドしてください：
```bash
cp -r frontend /tmp/lcp-frontend
cd /tmp/lcp-frontend
npm install
npm run build
```

### バックエンド（オプション）
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
→ http://localhost:8000
