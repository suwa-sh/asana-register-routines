Logger.log('LOAD: utils.gs');

/* ====================================================================================================
 *  ユーティリティ
 * ==================================================================================================== */
/*
 * 日付フォーマット
 */
var DateFormat = {
  format: function(moment, format) {
    return moment.format(format);
  },
  parse: function(target) {
    var moment = Moment.load();
    return moment(target);
  }
}



/*
 * 認証情報を返します。
 */
function getAuth() {
  Logger.log("-- getAuth")

  // 入力チェック
  if ( settingsCache.personal_access_token === '' ) {
    var message = "settings.personal_access_token が設定されていません。";
    Logger.log(message);
    throw new Error(message);
  }
  
  // 認証情報を更新
  var auth = { "Authorization" : "Bearer " + settingsCache.personal_access_token };
  return auth;
}



// 処理日
var processDate;
/*
 * 処理日付を返します。
 */
function getProcessDate() {
  var moment = Moment.load();
  var returnDate;
  
  if ( processDate != null ) {
    returnDate = moment(processDate);

  } else {
    returnDate = moment();
  }
  
//  Logger.log("-- process_date: " + DateFormat.format(returnDate, 'YYYY-MM-DD'));
  return returnDate;
}



/*
 * キー、バリューだけを定義したシートの内容を、オブジェクトに変換します。
 *
 * @param sheetName {string} シート名
 * @return {object} キャッシュオブジェクト
 */
function parseCache(sheetName) {
  Logger.log("-- parseCache( " + sheetName + " )")

  var cache= {};
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  for (var curRow = 1; curRow < data.length; curRow++) {
    cache[data[curRow][0]] = data[curRow][1]
  }
//  Logger.log(sheetName + " cache: " + JSON.stringify(cache));
  return cache;
}



/*
 * メール送信
 *
 * @param {string} to 送信先アドレス
 * @param {string} subject 題名
 * @param {string} body 本文
 */
function sendEMail(to, subject, body) {
  Logger.log("sendMail (" + to + ", " + subject + ")");  
  GmailApp.sendEmail(
    to,
    subject,
    body
  );
}
