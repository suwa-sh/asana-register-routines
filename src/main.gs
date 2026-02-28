Logger.log('LOAD: main.gs');

/* ====================================================================================================
 *  global定数
 * ==================================================================================================== */
var SHEETNAME_SETTINGS = 'settings';
var SHEETNAME_MST_WORKSPACES = '[MST]workspaces';
var SHEETNAME_MST_USERS = '[MST]users';
var SHEETNAME_MST_MEMBERSHIPS = '[MST]memberShips';
var SHEETNAME_MST_TAGS = '[MST]tags';

var SHEETNAME_DAILY = 'daily';
var SHEETNAME_WEEKLY = 'weekly';
var SHEETNAME_MONTHLY = 'monthly';
var SHEETNAME_YEARLY = 'yearly';


/* ====================================================================================================
 *  global変数
 * ==================================================================================================== */
// 設定キャッシュ
var settingsCache = parseCache(SHEETNAME_SETTINGS);
// ワークスペース マスターキャッシュ
var workspacesCache = parseCache(SHEETNAME_MST_WORKSPACES);
// ユーザ マスターキャッシュ
var usersCache = parseCache(SHEETNAME_MST_USERS);
// メンバーシップ マスターキャッシュ
var membershipsCache = parseCache(SHEETNAME_MST_MEMBERSHIPS);
// タグ マスターキャッシュ
var tagsCache = parseCache(SHEETNAME_MST_TAGS);



/* ====================================================================================================
 *  スプレッドシートイベント
 * ==================================================================================================== */
function onOpen(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menus = [
    {name: 'asana <-- タスクを一括登録する', functionName: 'mainRegisterTasks'},
    {name: 'asana <-- 指定日としてタスクを一括登録する', functionName: 'mainRegisterTasksAs'},
    {name: 'asana --> ユーザ情報を更新する', functionName: 'mainSyncUserInfo'},
    {name: 'asana --> マスターデータを一括更新する', functionName: 'mainSyncMasters'}
  ];
  ss.addMenu('【asana連携】', menus);
}



/* ====================================================================================================
 *  タスク登録
 * ==================================================================================================== */
/*
 * タスクを一括登録します。
 */
function mainRegisterTasks() {
  Logger.log("START mainRegisterTasks");
  
  var auth = getAuth();

  registerDaily(auth);
  registerWeekly(auth);
  registerMonthly(auth)
  registerYearly(auth);
  
  Logger.log("END mainRegisterTasks")
}



/*
 * 入力フォームに指定された処理日として、タスクを一括登録します。
 */
function mainRegisterTasksAs() {
/*
  // 実行確認
  var selection = Browser.msgBox("指定日付としてタスク登録を行います。実行しますか?", Browser.Buttons.YES_NO);
  if (selection != "yes") {
    Browser.msgBox("キャンセルしました。");
    return;
  }
*/

  // 処理日を入力フォームから取得
  var moment = Moment.load();
  var input;
  var isInvalidInput = true;
  while(isInvalidInput) {
    input = Browser.inputBox("処理日を「YYYY/MM/DD」形式で入力して下さい。");
    if (input == "") {
      Browser.msgBox("処理日が入力されなかったため、キャンセルしました。");
      return;
    }

    processDate = moment(input);

    // 入力チェック
    if (processDate.format("YYYY/MM/DD") == "Invalid date") {
      Browser.msgBox("「" + input + "」は日付に変換できません。");
    } else {
      isInvalidInput = false;
    }
  }
  
  // タスク登録
  mainRegisterTasks();
}



/* ====================================================================================================
 *  マスター同期
 * ==================================================================================================== */
function mainSyncUserInfo() {
  Logger.log("START mainSyncUserInfo");
  
  var auth = getAuth();

  syncUserInfo(auth);
  syncWorkspaces(auth);

  Logger.log("END mainSyncUserInfo");
}



function mainSyncMasters() {
  Logger.log("START mainSyncMasters");
  
  var auth = getAuth();

  syncUserInfo(auth);
  syncWorkspaces(auth);
  syncUsers(auth);
  syncMemberships(auth);
  syncTags(auth);

  Logger.log("END mainSyncMasters");
}


