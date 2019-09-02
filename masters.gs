Logger.log('LOAD: masters.gs');

function syncUserInfo(auth) {
  Logger.log("syncUserInfo");

  // ユーザー情報取得
  var params = {'headers' : auth};
  var apiUrl = "https://app.asana.com/api/1.0/users/me"
  var response = UrlFetchApp.fetch(apiUrl, params)
  var result = JSON.parse(response.getContentText());
  
  // シート情報
  var sheetName = SHEETNAME_SETTINGS;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var range= sheet.getRange(1, 1);

  // ユーザー情報反映
  range.offset(2, 1).setValue(result.data.id + "");
  range.offset(3, 1).setValue(result.data.name);
  range.offset(4, 1).setValue(result.data.email);
  
  // 設定キャッシュ更新
  settingsCache = parseCache(SHEETNAME_SETTINGS);
}


function syncWorkspaces(auth) {
  Logger.log("syncWorkspaces");

  // ユーザー情報取得
  var params = {'headers' : auth};
  var apiUrl = "https://app.asana.com/api/1.0/users/me"
  var response = UrlFetchApp.fetch(apiUrl, params)
  var result = JSON.parse(response.getContentText());
  
  // シート情報
  var sheetName = SHEETNAME_MST_WORKSPACES;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);

  // データをクリア
  sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();

  var range= sheet.getRange(1, 1);
  for(var i = 0; i < result.data.workspaces.length; i++) {
    Logger.log("-- " + result.data.workspaces[i].name);
    range.offset(i + 1, 0).setValue(result.data.workspaces[i].name);
    range.offset(i + 1, 1).setValue(result.data.workspaces[i].id + "");
  }
}

function syncUsers(auth) {
  Logger.log("syncUsers");
  
  var workspaceId = workspacesCache[settingsCache.workspace];

  // ユーザ一覧取得
  var params = {'headers' : auth};
  var apiUrl = "https://app.asana.com/api/1.0/workspaces/" + workspaceId + "/users?opt_fields=name,email"
  var response = UrlFetchApp.fetch(apiUrl, params)
  var result = JSON.parse(response.getContentText());
  
  // シート情報
  var sheetName = SHEETNAME_MST_USERS;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);

  // データをクリア
  sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();

  var range= sheet.getRange(1, 1);
  for(var i = 0; i < result.data.length; i++) {
    Logger.log("-- " + result.data[i].name);
    range.offset(i + 1, 0).setValue(result.data[i].name);
    range.offset(i + 1, 1).setValue(result.data[i].id + "");
    range.offset(i + 1, 2).setValue(result.data[i].email);
  }
}


function syncMemberships(auth) {
  Logger.log("syncMemberships");

  // プロジェクト一覧取得
  var params = {'headers' : auth};
  var apiUrl = "https://app.asana.com/api/1.0/projects"
  var response = UrlFetchApp.fetch(apiUrl, params)
  var projectsResult = JSON.parse(response.getContentText());
  
  // シート情報
  var sheetName = SHEETNAME_MST_MEMBERSHIPS;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);

  // データをクリア
  sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();

  var range= sheet.getRange(1, 1);
  var curRowNum = 0;
  for(var i = 0; i < projectsResult.data.length; i++) {
    var curProjectName = projectsResult.data[i].name;
    var curProjectId = projectsResult.data[i].id + "";
    Logger.log("-- " + curProjectName);
    
    // プロジェクト反映
    curRowNum++;
    range.offset(curRowNum, 0).setValue(curProjectName);
    range.offset(curRowNum, 1).setValue(curProjectId);

    // セクション一覧取得
    apiUrl = "https://app.asana.com/api/1.0/projects/" + curProjectId + "/sections"
    response = UrlFetchApp.fetch(apiUrl, params)
    var sectionsResult = JSON.parse(response.getContentText());
    
    for (var j = 0; j < sectionsResult.data.length; j++) {
      var curSectionName = sectionsResult.data[j].name;
      var curSectionId = sectionsResult.data[j].id + "";
      Logger.log("---- " + curSectionName);
      
      // セクション反映
      curRowNum++;
      range.offset(curRowNum, 0).setValue(curProjectName + "/" + curSectionName);
      range.offset(curRowNum, 1).setValue(curSectionId);
    }
  }
}


function syncTags(auth) {
  Logger.log("syncTags");

  // タグ一覧取得
  var params = {'headers' : auth};
  var apiUrl = "https://app.asana.com/api/1.0/tags"
  var response = UrlFetchApp.fetch(apiUrl, params)
  var result = JSON.parse(response.getContentText());
  
  // シート情報
  var sheetName = SHEETNAME_MST_TAGS;
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);

  // データをクリア
  sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();

  var range= sheet.getRange(1, 1);
  for(var i = 0; i < result.data.length; i++) {
    Logger.log("-- " + result.data[i].name);
    range.offset(i + 1, 0).setValue(result.data[i].name);
    range.offset(i + 1, 1).setValue(result.data[i].id + "");
  }
}
