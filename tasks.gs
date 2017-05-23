Logger.log('LOAD: tasks.gs');

/*
 * 日次タスク登録
 * 曜日 ごとに送信のON/OFFを切り替えできます。
 */
function registerDaily(auth) {
  Logger.log("registerDaily");

  const COLNUM_SUN = 0;
  const COLNUM_MON = 1;
  const COLNUM_TUE = 2;
  const COLNUM_WED = 3;
  const COLNUM_THU = 4;
  const COLNUM_FRI = 5;
  const COLNUM_SAT = 6;
  const COLNUM_TASK = 7;

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEETNAME_DAILY);
  var data = sheet.getDataRange().getValues();
  
  // 今日の曜日番号（インデックス）
  var todayNum = getProcessDate().day();

  // データ行を全件ループ
  for (var i = 1; i < data.length; i++) {
    // コンテンツ
    var taskContent = parseTaskContent(data[i], COLNUM_TASK);

    // 曜日フラグ配列
    var dayFlags = [];
    dayFlags.push(data[i][COLNUM_SUN]);
    dayFlags.push(data[i][COLNUM_MON]);
    dayFlags.push(data[i][COLNUM_TUE]);
    dayFlags.push(data[i][COLNUM_WED]);
    dayFlags.push(data[i][COLNUM_THU]);
    dayFlags.push(data[i][COLNUM_FRI]);
    dayFlags.push(data[i][COLNUM_SAT]);
    if (! dayFlags[todayNum]) {
      Logger.log("-- SKIP " + taskContent.name + ': 登録対象の曜日ではありません。対象の曜日フラグ配列=' + dayFlags + '、今日の曜日番号（インデックス）=' + todayNum)
      continue;
    }
    
    // タスク登録
    Logger.log("-- REGIST " + taskContent.name)
    registerTask(auth, taskContent);
  }
}

/*
 * 週次タスク登録
 * 曜日を指定できます。
 * 週番号 ごとにON/OFFを切り替えできます。
 */
function registerWeekly(auth) {
  Logger.log("registerWeekly");

  const COLNUM_DAYOFWEEK = 0;
  const COLNUM_1ST = 1;
  const COLNUM_2ND = 2;
  const COLNUM_3RD = 3;
  const COLNUM_4TH = 4;
  const COLNUM_5TH = 5;
  const COLNUM_TASK = 6;
  
  const DAYOFWEEK_ARRAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEETNAME_WEEKLY);
  var data = sheet.getDataRange().getValues();

  // 今日
  const today = getProcessDate();
  // 今日の曜日名
  const todayOfWeek = DateFormat.format(today, 'ddd');
  
  var weeklyRegisterOnArray = settingsCache.weekly_register_on.split("/");
  // 登録対象の相対週
  const targetWeekRelNum = parseInt(weeklyRegisterOnArray[0]);
  // 登録実施曜日
  const execRegisterDayOfWeek = weeklyRegisterOnArray[1];
  
  // 登録実施チェック
  if (todayOfWeek != execRegisterDayOfWeek) {
    Logger.log("-- SKIP-ALL 登録実施曜日ではありません。登録実施曜日：" + execRegisterDayOfWeek + "、処理日の曜日：" + todayOfWeek);
    return;
  }

  // データ行を全件ループ
  for (var i = 1; i < data.length; i++) {
    // コンテンツ
    var taskContent = parseTaskContent(data[i], COLNUM_TASK);

    // 登録対象の曜日
    var targetDayOfWeek = data[i][COLNUM_DAYOFWEEK];
    var targetDayOfWeekNum = 0;
    for (var idx = 0; idx < DAYOFWEEK_ARRAY.length; idx++) {
      if (DAYOFWEEK_ARRAY[idx] === targetDayOfWeek) {
        targetDayOfWeekNum = idx;
        break;
      }
    }
    var todayOfWeekNum = 0;
    for (var idx = 0; idx < DAYOFWEEK_ARRAY.length; idx++) {
      if (DAYOFWEEK_ARRAY[idx] === todayOfWeek) {
        todayOfWeekNum = idx;
        break;
      }
    }
    
    // 登録実施曜日 と 登録対象曜日 の相対日数
    var dateDiff = targetDayOfWeekNum - todayOfWeekNum;
    
    // 登録対象の期日に変換
    var dueDate = getProcessDate().add("days", dateDiff);
    if (targetWeekRelNum > 0 ) {
      // 1週以上前の場合、週数 * 7日進める
      dueDate.add("days", (targetWeekRelNum * 7));
    }

    // 月の第x曜日（インデックス）
    var dueDateWeekIndexOfMonth = Math.floor((dueDate.date() + 6 ) / 7)　- 1;
    
    // 登録対象の週番号フラグ配列
    var weekFlags = [];
    weekFlags.push(data[i][COLNUM_1ST]);
    weekFlags.push(data[i][COLNUM_2ND]);
    weekFlags.push(data[i][COLNUM_3RD]);
    weekFlags.push(data[i][COLNUM_4TH]);
    weekFlags.push(data[i][COLNUM_5TH]);
    if (! weekFlags[dueDateWeekIndexOfMonth]) {
      Logger.log("-- SKIP " + taskContent.name + ': '
          + '登録対象の週番号ではありません。'
          + '対象の週番号フラグ配列=' + weekFlags
          + '、期日=' + DateFormat.format(dueDate, "YYYY-MM-DD(ddd)")
          + '、期日の週番号インデックス=' + dueDateWeekIndexOfMonth)
      continue;
    }
    
    // タスク登録
    taskContent.dueDate = dueDate;
    Logger.log("-- REGIST " + taskContent.name)
    registerTask(auth, taskContent);
  }
}


/*
 * 月次タスク登録
 * 日付を指定できます。
 */
function registerMonthly(auth) {
  Logger.log("registerMonthly");

  const COLNUM_TRG_DATE = 0;
  const COLNUM_TASK = 1;

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEETNAME_MONTHLY);
  var data = sheet.getDataRange().getValues();

  // 今日
  const today = getProcessDate();
  // 今日の日付
  const date = today.date();

  var monthlyRegisterOnArray = settingsCache.monthly_register_on.split("/");
  // 登録対象の相対月
  const targetMonthRelNum = parseInt(monthlyRegisterOnArray[0]);
  // 登録実施日付
  const execRegisterDate = monthlyRegisterOnArray[1];

  // 登録実施チェック
  if (date != execRegisterDate) {
    Logger.log("-- SKIP-ALL 登録実施日付ではありません。登録実施日付：" + execRegisterDate + "、処理日の日付：" + date);
    return;
  }
  
  // データ行を全件ループ
  for (var i = 1; i < data.length; i++) {
    // コンテンツ
    var taskContent = parseTaskContent(data[i], COLNUM_TASK);
    
    // 登録日付
    var targetDate = data[i][COLNUM_TRG_DATE];

    // 処理日を進めて、期日に変換
    var tempDate = getProcessDate();
    tempDate.add(targetMonthRelNum, 'months');
    var moment = Moment.load();
    var dueDate = moment([tempDate.year(), tempDate.month(), targetDate]);

    // タスク登録
    taskContent.dueDate = dueDate;
    Logger.log("-- REGIST " + taskContent.name)
    registerTask(auth, taskContent);
  }
}

/*
 * 年次タスク登録
 * 月日を指定できます。
 */
function registerYearly(auth) {
  Logger.log("registerYearly");

  const COLNUM_TRG_MONTH = 0;
  const COLNUM_TRG_DATE = 1;
  const COLNUM_TASK = 2;

  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEETNAME_YEARLY);
  var data = sheet.getDataRange().getValues();

  // 今日
  const today = getProcessDate();
  // 今日の月（インデックス）
  const month = today.month();
  // 今日の日付
  const date = today.date();

  var yearlyRegisterOnArray = settingsCache.yearly_register_on.split("/");
  // 登録対象の相対年
  const targetYearRelNum = parseInt(yearlyRegisterOnArray[0]);
  // 登録実施月
  const execRegisterMonth = parseInt(yearlyRegisterOnArray[1]);
  // 登録実施日付
  const execRegisterDate = yearlyRegisterOnArray[2];

  // 登録実施チェック
  if ((month + 1) != execRegisterMonth || date != execRegisterDate) {
    Logger.log("-- SKIP-ALL 登録実施月日ではありません。登録実施月日：" + execRegisterMonth + "/" + execRegisterDate + "、処理日の月日：" + (month + 1) + "/" + date);
    return;
  }

  // データ行を全件ループ
  for (var i = 1; i < data.length; i++) {
    // コンテンツ
    var taskContent = parseTaskContent(data[i], COLNUM_TASK);
    
    // 登録月（インデックス）
    var targetMonth = parseInt(data[i][COLNUM_TRG_MONTH]) - 1;
    // 登録日付
    var targetDate = data[i][COLNUM_TRG_DATE];

    // 処理日を進めて、期日に変換
    var tempDate = getProcessDate();
    tempDate.add(targetYearRelNum, 'years');
    var moment = Moment.load();
    var dueDate = moment([tempDate.year(), targetMonth, targetDate]);

    // タスク登録
    taskContent.dueDate = dueDate;
    Logger.log("-- REGIST " + taskContent.name)
    registerTask(auth, taskContent);
  }
}

/*
 * 行データの配列から、タスクコンテンツに変換します。
 *
 * @param line {array} 行データ
 * @param colNumTaskStart {integer} タスクコンテンツ開始列インデックス
 * @return {object} タスクコンテンツ(name, notes, memberships[{project, section}...], tags[tag...], startAt)
 */
function parseTaskContent(line, colNumTaskStart) {
  var name = line[colNumTaskStart];
  var notes = line[colNumTaskStart + 1];
  var membership1 = parseMembership(line[colNumTaskStart + 2]);
  var membership2 = parseMembership(line[colNumTaskStart + 3]);
  var membership3 = parseMembership(line[colNumTaskStart + 4]);
  var membership4 = parseMembership(line[colNumTaskStart + 5]);
  var tag1 = tagsCache[line[colNumTaskStart + 6]];
  var tag2 = tagsCache[line[colNumTaskStart + 7]];
  var tag3 = tagsCache[line[colNumTaskStart + 8]];
  var tag4 = tagsCache[line[colNumTaskStart + 9]];
  var startAt = line[colNumTaskStart + 10];
  var assignee = line[colNumTaskStart + 11];
  
  const NOTES_SUFFIX = '\n\nfrom: ' + SpreadsheetApp.getActive().getName() + '\n' + SpreadsheetApp.getActive().getUrl();

  var content = {};
  content.name = name;
  content.notes = notes + NOTES_SUFFIX;

  content.memberships = [];
  if (membership1 != null) { content.memberships.push(membership1) }
  if (membership2 != null) { content.memberships.push(membership2) }
  if (membership3 != null) { content.memberships.push(membership3) }
  if (membership4 != null) { content.memberships.push(membership4) }
    
  content.tags = [];
  if (tag1 != null) { content.tags.push(tag1) }
  if (tag2 != null) { content.tags.push(tag2) }
  if (tag3 != null) { content.tags.push(tag3) }
  if (tag4 != null) { content.tags.push(tag4) }

  content.dueDate = '';
  content.startAt = startAt;
  content.assignee = assignee;
  
  return content;
}
function parseMembership(membershipString) {
  if (membershipString === '') {
    return null;
  }

  var membershipArray = membershipString.split('/');
  var projectName = membershipArray[0];
  var sectionName = membershipArray[1];

  var membership = {};
  membership.project = membershipsCache[projectName];
  if (sectionName == null) {
    membership.section = null;
  } else {
    membership.section = membershipsCache[membershipString];
  }
  
  return membership;
}

/*
 * タスク登録
 *
 * @param {object} auth 認証オブジェクト
 * @param {object} taskContent タスクコンテンツ
 */
function registerTask(auth, taskContent) {
  var workspaceId = workspacesCache[settingsCache.workspace];

  var payload = {
    data : {
      workspace : workspaceId,
      memberships : taskContent.memberships,
      name : taskContent.name,
      notes : taskContent.notes,
      assignee : usersCache[taskContent.assignee],
      completed : false,
      tags : taskContent.tags
    }
  };

  var formattedToday = DateFormat.format(getProcessDate(), 'YYYY-MM-DD');
  if (taskContent.dueDate != '' ) {
    formattedToday = DateFormat.format(taskContent.dueDate, 'YYYY-MM-DD');
  }
  
  if ( taskContent.startAt != '' ) {
    // startAtの指定がある場合、due_atを指定
    payload.data['due_at'] = formattedToday + "T" + taskContent.startAt + ".000+0900";

  } else {
    // startAtの指定がない場合、due_onを指定
    payload.data['due_on'] = formattedToday;
  }

//  Logger.log("---- payload: " + JSON.stringify(payload));
  params = {
    "method" : "post",
    "contentType" : "application/json",
    "headers" : auth,
    "payload" : JSON.stringify(payload)
  };
  apiUrl = "https://app.asana.com/api/1.0/tasks";

  Logger.log("---- request");
  response = UrlFetchApp.fetch(apiUrl, params);
  result = JSON.parse(response.getContentText());
  Logger.log("------ response code: " + response.getResponseCode());
}
