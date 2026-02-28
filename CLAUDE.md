# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Asana へ定期タスクを自動登録する Google Apps Script (GAS) プロジェクト。
Google スプレッドシートにタスク定義（日次/週次/月次/年次）を記述し、Asana API でタスクを作成する。

## デプロイ

clasp で GAS プロジェクトにデプロイする。

```bash
clasp push          # ローカル → GAS に反映
clasp pull          # GAS → ローカルに取得
clasp open          # スクリプトエディタをブラウザで開く
clasp status        # 追跡ファイルの確認
```

- `clasp push` だけでデプロイ完了（別途「デプロイ」操作は不要。トリガーは HEAD を実行する）
- `clasp pull` すると `.gs` と重複する `.js` ファイルが生成される。`.js` は削除してよい
- Apps Script API が有効でないと push できない（https://script.google.com/home/usersettings）

## アーキテクチャ

```
src/
├── appsscript.json  # GAS マニフェスト（ランタイム設定、Moment.js ライブラリ依存）
├── main.gs          # エントリポイント: グローバル定数/キャッシュ、スプレッドシートメニュー、main関数
├── masters.gs       # マスター同期: Asana API → スプレッドシートのマスターシートに反映
├── tasks.gs         # タスク登録: スプレッドシートのタスク定義 → Asana API でタスク作成
└── utils.gs         # ユーティリティ: 認証、日付処理、キャッシュパーサー、メール送信
```

### グローバルキャッシュの仕組み（重要）

`main.gs` でスプレッドシートの各マスターシートを `parseCache()` でオブジェクトに読み込み、グローバル変数として保持する。

```
settingsCache      ← settings シート
workspacesCache    ← [MST]workspaces シート
usersCache         ← [MST]users シート
membershipsCache   ← [MST]memberShips シート
tagsCache          ← [MST]tags シート
```

**注意**: グローバルキャッシュはスクリプト起動時に1回だけ読み込まれる。`masters.gs` の各 sync 関数はシート更新後にキャッシュも明示的にリフレッシュする必要がある（`syncUserInfo` → `settingsCache` 更新、`syncWorkspaces` → `workspacesCache` 更新、等）。キャッシュ更新を忘れると後続の関数が古い値を参照してエラーになる。

### 実行フロー

- `mainSyncMasters`: syncUserInfo → syncWorkspaces → syncUsers → syncMemberships → syncTags（順序依存）
- `mainRegisterTasks`: registerDaily → registerWeekly → registerMonthly → registerYearly

## Asana API 注意点

- レスポンスの ID フィールドは **`gid`**（`id` ではない）
- 複数ワークスペース所属時、`/projects` や `/tags` には workspace 指定が必須
  - projects: `/projects?workspace=<workspace_gid>`
  - tags: `/workspaces/<workspace_gid>/tags`（パスパラメータ）
  - users: `/workspaces/<workspace_gid>/users`（パスパラメータ）
- 認証: `Authorization: Bearer <personal_access_token>` ヘッダー
- API ベース URL: `https://app.asana.com/api/1.0/`

## 外部ライブラリ

- **Moment.js**: GAS ライブラリ機能で追加（`appsscript.json` の `dependencies.libraries` に定義）。コード中は `Moment.load()` で利用。npm ではない。
