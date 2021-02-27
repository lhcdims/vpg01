class ClsAryClients {
  constructor(strSocketID, strUserID, strToken, intLastHB) {
    this.strSocketID = strSocketID;
    this.strUserID = strUserID;
    this.strToken = strToken;
    this.intLastHB = intLastHB;
  }
}

class ClsAryGLRList {
  constructor(strGli_ID, strGre_Result, strGre_OpenDT, intDurationSecond) {
    this.strGli_ID = strGli_ID;
    this.strGre_Result = strGre_Result;
    this.strGre_OpenDT = strGre_OpenDT;
    this.intDurationSecond = intDurationSecond;
  }
}


// Get Structure of DB Table
function funGetStruct(strTable) {
  let aryStruct = [];
  switch (strTable) {
    case "glist":
      aryStruct = [
        "gli_sys_id",
        "gli_id",
        "gli_name_zh",
        "gli_gno",
        "gli_status",
        "gli_duration",
        "gli_daytimestart",
        "gli_daytimeend",
      ];
      break;
    case "gresult":
      aryStruct = [
        "gre_sys_id",
        "gre_id",
        "gre_result",
        "gre_opendt",
        "gre_realopendt",
        "gre_sysdt",
        "gli_id",
        "gli_api_id",
      ];
      break;
    default:
      break;
  };
  return aryStruct;
}


module.exports = {
  ClsAryClients,
  ClsAryGLRList,
  funGetStruct,
}