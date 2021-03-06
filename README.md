# asana-register-routines

## 概要
asanaへ定期的にタスクを登録するGoogleスプレッドシートスクリプトです。<br>
日次、週次、月次、年次で登録するタスクを定義できます。


## 機能一覧
| カテゴリ | 機能名 | 説明 |
|:-----:|:-----:|:-----|
| マスターデータ同期 | ユーザ情報同期 | ユーザID、ユーザ名、メールアドレス、ワークスペース一覧をスプレッドシートに同期します。 |
| マスターデータ同期 | マスターデータ一括同期 | ユーザ情報、ユーザ一覧、メンバーシップ一覧、タグ一覧をスプレッドシートに同期します。 |
| タスク登録 | タスク一括登録 | 当日に登録が必要なタスクを一括で登録します。 |
| タスク登録 | タスク一括登録（処理日指定） | 指定した処理日に登録が必要なタスクを一括で登録します。 |

## 設定
### 共通設定： settingsシート
各機能が共通で利用する設定です。

| 項目ID | 項目名 | 説明 |
|:-----:|:-----:|:-----|
| personal_access_token | パーソナルアクセストークン | asanaのパーソナルアクセストークンを設定してください。 |
| workspace | ワークスペース | タスクを登録するasanaのワークスペースを選択してください。ユーザ情報同期機能 でプルダウンリストが作成されます。 |
| weekly_register_on | 週次タスク登録日 | 週次タスクを登録するタイミングを設定してください。<br>「何週間前」の「何曜日」に登録するかを指定します。<br>「0週間前」の「日曜日」を指定した場合、毎週日曜日に今週分のタスクが登録されます。 |
| monthly_register_on | 月次タスク登録日 | 月次タスクを登録するタイミングを設定してください。<br>「何ヶ月前」の「何日」に登録するかを指定します。<br>「1ヶ月前」の「25日」を指定した場合、毎月25日に来月分のタスクが登録されます。 |
| yearly_register_on | 年次タスク登録日 | 年次タスクを登録するタイミングを設定してください。<br>「何年前」の「何月」「何日」に登録するかを指定します。<br>「1年前」の「12月」「30日」を指定した場合、毎年12月30日に来年分のタスクが登録されます。 |


### タスク定義（共通）
各繰り返し定義内で共通で設定できる、タスクの定義です。

| 項目名 | 説明 |
|:-----:|:-----|
| 題名 | asanaに登録するタスクの名前 |
| 説明 | asanaに登録するタスクの説明 |
| メンバーシップ1〜4 | asanaに登録するタスクのプロジェクト/セクション<br>マスターデータ一括同期機能 でプルダウンリストが作成されます。 |
| タグ1〜4 | asanaに登録するタスクのタグ<br>マスターデータ一括同期機能 でプルダウンリストが作成されます。 |
| 開始時刻 | asanaに登録するタスクの開始時刻（HH:mm:ss形式）<br>指定しない場合、asanaには期日だけが登録されます。 |
| 担当者 | asanaに登録するタスクの担当者<br>マスターデータ一括同期機能 でプルダウンリストが作成されます。 |


### 日次: dailyシート
日次で登録するタスクの定義です。<br>
曜日ごとに、タスク登録の要否が設定できます。

| 項目名 | 説明 |
|:-----:|:-----|
| Sun 〜 Sat | 各曜日ごとのタスク登録実施要否<br>TRUEが設定されている曜日に、タスクが登録されます。 |
| タスク定義（共通） | - |


### 週次: weeklyシート
週次で登録するタスクの定義です。<br>
登録する曜日を指定できます。<br>
週番号ごとにタスク登録の要否が設定できます。

| 項目名 | 説明 |
|:-----:|:-----|
| 曜日 | 登録を実施する曜日（Sun〜Sat）<br>設定されている曜日に、タスクが登録されます。 |
| 1〜5週目 | 週番号ごとの登録実施要否<br>TRUEが設定されている週に、タスクが登録されます。 |
| タスク定義（共通） | - |


### 月次: monthlyシート
月次で登録するタスクの定義です。<br>
登録する日付（日のみ）を指定できます。

| 項目名 | 説明 |
|:-----:|:-----|
| 日付 | 登録を実施する日付（1〜31日）<br>設定されている日付に、タスクが登録されます。 |
| タスク定義（共通） | - |


### 年次: yearlyシート
年次で登録するタスクの定義です。<br>
登録する日付（月日）を指定できます。

| 項目名 | 説明 |
|:-----:|:-----|
| 月 | 登録を実施する月（1〜12月）<br>下記の 日付 と合わせて、設定されている日付にタスクが登録されます。 |
| 日付 | 登録を実施する日付（1〜31日） |
| タスク定義（共通） | - |



## インストール
1. [スプレッドシート](https://docs.google.com/spreadsheets/d/1pftQnO6LNyHg5pd7455kVPcMKbsoZqglujedikruxnY/copy)を、マイドライブにコピー

1. 設定反映

    1. スプレッドシート.settingsシート.personal_access_token に [asanaのパーソナルアクセストークン](https://asana.com/guide/help/api/api) を記入
    
    1. スプレッドシート.メニュー.【asana連携】.'asana --> ユーザ情報を更新する'
    
    1. スプレッドシート.settingシート.workspace を選択
    
    1. スプレッドシート.メニュー.【asana連携】.'asana --> マスターデータを一括更新する'
  
1. 定期実行登録

    1. スプレッドシート.メニュー.ツール.スクリプトエディタ
    
    1. スクリプトエディタ.ツールバー.現在のプロジェクトのトリガー でトリガーを追加

        1. 実行: mainRegisterTasks
        
        1. イベント: 時間主導型 / 日タイマー / 午前1時〜2時 など、実行したい時間帯を設定



## Contact

- [要望を伝える](https://github.com/suwa-sh/asana_register_routines/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)
- [バグを報告する](https://github.com/suwa-sh/asana_register_routines/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
- [質問する](https://github.com/suwa-sh/asana_register_routines/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion)
- [その他](mailto:suwash01@gmail.com)



## ライセンス
[MIT license](https://raw.githubusercontent.com/suwa-sh/asana-register-routines/master/LICENSE)
