# LP制作環境 セットアップ記録

**作成日**: 2026年7月6日
**環境**: macOS（Darwin 25.3）
**作業ディレクトリ**: `/Users/yudu/Desktop/LP作成`

このドキュメントは、Claude Code + GitHub + Vercel でLP制作環境を構築した際の全手順を記録したものです。別のPCで同じ環境を再構築する際、または後で振り返る際の資料としてご活用ください。

---

## 目次

1. [初期状態](#1-初期状態)
2. [Git のセットアップ](#2-git-のセットアップ)
3. [初回LP作成とローカルコミット](#3-初回lp作成とローカルコミット)
4. [GitHubリポジトリの作成](#4-githubリポジトリの作成)
5. [Personal Access Token（PAT）による認証](#5-personal-access-tokenpatによる認証)
6. [macOSキーチェーンへのトークン安全保存](#6-macosキーチェーンへのトークン安全保存)
7. [Vercelとの連携・自動デプロイ](#7-vercelとの連携自動デプロイ)
8. [プロジェクト構成の決定（サブフォルダ運用）](#8-プロジェクト構成の決定サブフォルダ運用)
9. [運用ルールのCLAUDE.md化](#9-運用ルールのclaudemd化)
10. [トラブルシューティング](#10-トラブルシューティング)

---

## 1. 初期状態

作業開始時、以下の状態でした：

| ツール | 状態 |
|---|---|
| Git | ✅ インストール済み（`/usr/bin/git`） |
| Git ユーザー名/メール | ❌ 未設定 |
| GitHub CLI (`gh`) | ❌ 未インストール |
| Node.js / npm | ❌ 未インストール |
| Homebrew (`brew`) | ❌ 未インストール |
| GitHubアカウント | ✅ `yudkfy1` 作成済み・ログイン済み |
| Vercelアカウント | ✅ 作成済み・GitHub連携準備済み |

**選択した技術スタック**: HTML/CSS（シンプル・軽量・環境依存が少ない）
→ Next.jsなどは Node.js が必要なため今回は見送り。

---

## 2. Git のセットアップ

### 手順

**ターミナルを開く**
- `command (⌘) + スペース` → 「ターミナル」で検索 → Enter

**Gitバージョン確認**
```bash
git --version
```
→ `git version 2.xx.x` と表示されればOK

**ユーザー情報を設定**（コミット時に記録される情報）
```bash
git config --global user.name "yudkfy1"
git config --global user.email "love.125.friend.1224@icloud.com"
```

**確認**
```bash
git config --global user.name
git config --global user.email
```

---

## 3. 初回LP作成とローカルコミット

### 手順

作業ディレクトリ `/Users/yudu/Desktop/LP作成` に、シンプルなテストLPを作成：
- `index.html`（HTML）
- `style.css`（スタイル）
- `README.md`（プロジェクト説明）

**Gitリポジトリを初期化**
```bash
git init -b main
git add .
git commit -m "Initial commit: test LP"
```

これでローカルにGit管理が開始されました。この時点ではまだGitHubには何もアップロードされていません。

---

## 4. GitHubリポジトリの作成

### 手順（ブラウザ操作）

1. **リポジトリ作成ページを開く**
   👉 https://github.com/new

2. **入力項目**
   - Repository name: `lp`
   - Description: 空欄
   - Public / Private: どちらでも可（Public推奨）
   - ⚠️ **「Add a README」等の3つのチェックは全部OFF**（既存のローカル内容と競合するため）

3. **緑ボタン「Create repository」をクリック**

4. **作成後、リポジトリURLが表示される**：`https://github.com/yudkfy1/lp`

### ローカルとリモートを連携

作成されたリポジトリのURLを使ってローカルと接続：
```bash
git remote add origin https://github.com/yudkfy1/lp.git
git branch -M main
git push -u origin main
```

---

## 5. Personal Access Token（PAT）による認証

初回プッシュ時、認証エラー：
```
fatal: could not read Username for 'https://github.com': Device not configured
```

GitHubは2021年以降、パスワード認証を廃止し **Personal Access Token（PAT）** による認証が必須になっています。

### 手順（ブラウザ操作）

1. **トークン作成ページを開く**
   👉 https://github.com/settings/tokens/new

2. **入力項目**
   - Note（メモ）: `mac-claude-code`（自分がわかる名前）
   - Expiration（有効期限）: `90 days`
   - Select scopes（権限）: **`repo` にチェック**（子項目全部が自動でONになる）

3. **緑ボタン「Generate token」をクリック**

4. **生成されたトークン（`ghp_xxxxxxxxxxxxxxxx`）をコピー**
   ⚠️ **このトークンは一度しか表示されない**ため、必ず控えること。

5. **プッシュ時にトークンを認証情報として使用**
   ```bash
   git remote set-url origin https://yudkfy1:ghp_xxxxxxxxx@github.com/yudkfy1/lp.git
   git push -u origin main
   ```

---

## 6. macOSキーチェーンへのトークン安全保存

URLに直接トークンを埋め込むのはセキュリティリスクがあるため、**macOSキーチェーン**に安全保存し、URLからトークンを取り除きます。

### 手順

```bash
# URLからトークン部分を削除して元のURLに戻す
git remote set-url origin https://github.com/yudkfy1/lp.git

# Gitの認証情報をキーチェーンで管理する設定
git config --global credential.helper osxkeychain

# トークンをキーチェーンに登録
printf "protocol=https\nhost=github.com\nusername=yudkfy1\npassword=ghp_xxxxxxxxxxxxxxxx\n" \
  | git credential-osxkeychain store
```

### 効果

- 今後 `git push` するたびに、認証プロンプトなしで自動的に通る
- トークンはmacOSのキーチェーン内に暗号化保存される
- コマンド履歴やGit設定ファイルからトークンが除去される

### トークンの管理

- **トークンの確認/削除**: 「キーチェーンアクセス」アプリで検索（"github.com"）
- **GitHub側でのトークン管理**: https://github.com/settings/tokens
- **有効期限が切れたら**: 新規発行して同じ手順でキーチェーン更新

---

## 7. Vercelとの連携・自動デプロイ

VercelとGitHubは事前に連携済みだったため、リポジトリのインポートだけで自動デプロイが有効になります。

### 手順（ブラウザ操作）

1. **Vercelインポートページを開く**
   👉 https://vercel.com/new

2. **「Import Git Repository」の一覧から `yudkfy1/lp` を選ぶ**
   - 一覧に出ない場合: 「Adjust GitHub App Permissions」からアクセス許可

3. **設定画面**
   - Framework Preset: `Other`（自動検出）
   - Root Directory: そのまま（変更不要）
   - Build / Output settings: 触らない

4. **「Deploy」ボタンをクリック**

5. **30秒〜1分で初回デプロイ完了**

### URLの種類

Vercelには2種類のURLがあります：

| 種類 | 例 | 用途 |
|---|---|---|
| **デプロイメントURL** | `lp-24chbmhdu-yudkfy.vercel.app` | この1回のプッシュ専用（履歴用・変わる） |
| **本番URL** | `lp-xi-khaki.vercel.app` | 常に最新版（← クライアント配布用） |

本番URLの確認方法:
1. https://vercel.com/dashboard を開く
2. `lp` プロジェクトを選ぶ
3. 上部「ドメイン」の下に表示されているURL

### 以降の運用

**ローカルで編集 → `git push` → Vercelが自動デプロイ**（30秒〜1分）

もう毎回Vercelを開く必要はありません。

---

## 8. プロジェクト構成の決定（サブフォルダ運用）

### 課題

複数クライアントのLPを1リポジトリで管理する必要がある。過去のLPを消さずに残しつつ、新規LPを追加していきたい。

### 決定した構成

**1 GitHubリポジトリ × 1 Vercelプロジェクト × 複数サブフォルダ**

```
lp/（GitHubリポジトリ）
├── index.html          ← ポートフォリオ入口（各LPへのリンク集）
├── style.css
├── koen/               ← 麻辣湯LP（テスト制作）
│   ├── index.html
│   └── style.css
├── brighthope/         ← 合同会社BrightHope（本番案件）
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── recruit.html
│   ├── news.html
│   ├── style.css
│   ├── images/
│   └── scripts/
└── クライアント名/      ← 新規LPはここに追加
```

### URL構成

- ポートフォリオ入口: `lp-xi-khaki.vercel.app/`
- 各LP: `lp-xi-khaki.vercel.app/クライアント名/`

### メリット

- 過去の制作物がポートフォリオとして残る
- 1つのVercelプロジェクトで全部管理できる
- クライアントには各LP専用URLだけ渡せば良い

### 独自ドメインを当てたい場合

将来クライアントに `client-lp.com` などの独自ドメインを提供したい場合は、Vercelのカスタムドメイン設定でサブパス配下に向けることが可能。まずはVercelサブパス方式で運用し、必要になったら別途対応。

---

## 9. 運用ルールのCLAUDE.md化

Claude Codeが常に参照する運用ルールを `CLAUDE.md` にまとめました。新しいセッションでも自動的に読み込まれます。

### 主なルール

**依頼受付時の分岐**
- 新規LP依頼を受けたら、必ず最初に「本格制作 or テスト」を確認
- 本格制作 → ヒアリングMAXモード（9カテゴリ40項目を段階的に確認）
- テスト → 題材・雰囲気だけ確認して即着手

**必須ヒアリング項目（本格制作モード）**
1. 基本情報（会社名・業種・背景・予算・納期）
2. ターゲット・ペルソナ
3. 目的・KPI
4. 訴求内容（USP・料金・実績）
5. デザイン方針
6. 素材
7. 必須セクション
8. 技術要件
9. 運用・保守

**制作フロー**
1. ヒアリング完了 → 制作方針を1文で最終確認
2. `/クライアント名/` フォルダを新規作成
3. index.html + style.css を制作
4. `git add . && git commit -m "..." && git push`
5. Vercelが自動デプロイ

**絶対にやってはいけないこと**
- 既存のLPフォルダを上書き・削除しない
- 本格制作モードで、ヒアリング完了前にコードを書き始めない
- 「おまかせで」の一言で本格制作を始めない

---

## 10. トラブルシューティング

### `git push` で認証エラー
```
fatal: could not read Username for 'https://github.com'
```
→ PATが失効している可能性。第5・6章を参照して再発行＆キーチェーン更新。

### Vercelでプッシュしても反映されない
- ブラウザキャッシュを疑う: **Cmd + Shift + R** で強制リロード
- Vercelダッシュボードでデプロイ状態を確認: https://vercel.com/dashboard
- ビルドエラーの場合はログを確認

### `git status` が「fatal: not a git repository」
→ Gitリポジトリの外にいる。`cd /Users/yudu/Desktop/LP作成` で移動。

### ローカルサーバーで確認したい
Node.jsまたはPythonの簡易サーバーで実行可能：
```bash
# Python 3
python3 -m http.server 8000
# → ブラウザで http://localhost:8000/ を開く
```
※ macOSのサンドボックス制限で動かない場合はVercelのURLで確認。

---

## 環境情報まとめ

| 項目 | 値 |
|---|---|
| **GitHubアカウント** | `yudkfy1` |
| **メールアドレス** | `love.125.friend.1224@icloud.com` |
| **GitHubリポジトリ** | https://github.com/yudkfy1/lp |
| **Vercel本番URL** | https://lp-xi-khaki.vercel.app |
| **作業ディレクトリ** | `/Users/yudu/Desktop/LP作成` |
| **技術スタック** | HTML / CSS（Vanilla） |
| **フォント配信** | Google Fonts（Noto Sans JP + Noto Serif JP） |
| **PAT保存先** | macOSキーチェーン |

---

## 参考URL

- GitHub: https://github.com
- GitHub Token管理: https://github.com/settings/tokens
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Google Fonts: https://fonts.google.com
- Gemini（画像生成）: https://gemini.google.com

---

**このドキュメントは、必要に応じて追記・更新してください。**
