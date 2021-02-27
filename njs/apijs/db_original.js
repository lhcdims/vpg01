"use strict";
// const sqlite3 = require('sqlite3').verbose();
// The new method use connection pool, which connection(s) will be created automatically when needed
var mysql = require('mysql');
const bcrypt = require('bcrypt');
const mUt = require('./utils.js');
const mRU = require('./redisUtil.js');


class clsDb {
  constructor() {
    //  this.db = new sqlite3.Database(file);
    //  this.createTable()
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: "192.168.123.10",
      user: "root",
      password: "Zephan915",
      database: "nbcdb"
    });
  }

  
  // Update Table General
  funUpdateTable(strTable, strSet, strWhere, listQuestion, callback) {
    let sql = '';
    let arySQL = [];
    sql = "UPDATE " + strTable + " " + strSet + " " + strWhere;
    arySQL = listQuestion;
    try {
      return this.pool.getConnection(function (err, connection) {
        connection.query(sql, arySQL, function (err, result) {
          if (err) {
            connection.release();
            callback({code: "8888", message: err}, result);
          } else {
            connection.release();

            if (result['affectedRows'] == 0) {
              // Record Not Updated, System Error
              callback({code: "1000", message: 'Record Not Updated'}, result);
            } else {
              // Record Updated
              callback({code: "3000", message: 'Record Updated'}, result);
            }
          }
        });
      });
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }



  // SELECT listOutput FROM strTable WHERE strField = strCheck
  funCheckFieldExist(strTable, strField, strCheck, listOutput, callback) {
    let sql = '';
    let arySql = [];
    let strOutput = strField;

    for (let i = 0; i < listOutput.length; i++) {
      if (i != 0) {
        strOutput = strOutput + ',' + listOutput[i] + ' ';
      } else {
        strOutput = ' ' + listOutput[i] + ' ';
      }
    }

    sql = 'SELECT ' + strOutput + ' FROM ' + strTable + ' WHERE ' + strField  + ' = ?';
    arySql = [strCheck];
    try {
      return this.pool.getConnection(function (err, connection) {
            connection.query(sql, arySql, function (err, result) {
                if (err) {
                  connection.release();
                  callback({code: "8888", message: err}, result);
                } else {
                  connection.release();
                  if (result.length == 0) {
                    // Record Not Found
                    callback({code: "1000", message: 'Record Not Found'}, result);
                  } else {
                    // Record Found
                    callback({code: "0000", message: 'Record Found'}, result);
                  }
                }
            });
      });
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }


  
  // SELECT listOutput FROM strTable WHERE strWhere      (with listQuestion in strWhere)
  funSelect(listOutput, strTable, strWhere, listQuestion, callback) {
    let sql = '';
    let arySql = listQuestion;
    let strOutput = '';

    for (let i = 0; i < listOutput.length; i++) {
      if (i != 0) {
        strOutput = strOutput + ',' + listOutput[i] + ' ';
      } else {
        strOutput = ' ' + listOutput[i] + ' ';
      }
    }

    sql = 'SELECT ' + strOutput + ' FROM ' + strTable + ' WHERE ' + strWhere;
    try {
      return this.pool.getConnection(function (err, connection) {
        connection.query(sql, arySql, function (err, result) {
          if (err) {
            connection.release();
            callback({code: "8888", message: err}, result);
          } else {
            connection.release();
            if (result.length == 0) {
              // Record Not Found
              callback({code: "1000", message: 'Record Not Found'}, result);
            } else {
              // Record Found
              callback({code: "0000", message: 'Record Found'}, result);
            }
          }
        });
      });
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }



  // SELECT inside strSql with listQuestion in strSql
  funSelectSql(strSql, listQuestion, callback) {
    let sql = strSql;
    let arySql = listQuestion;

    try {
      return this.pool.getConnection(function (err, connection) {
            connection.query(sql, arySql, function (err, result) {
                if (err) {
                  connection.release();
                  callback({code: "8888", message: err}, result);
                } else {
                  connection.release();
                  if (result.length == 0) {
                    // Record Not Found
                    callback({code: "1000", message: 'Record Not Found'}, result);
                  } else {
                    // Record Found
                    callback({code: "0000", message: 'Record Found'}, result);
                  }
                }
            });
      });
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }



  // SELECT listOutput FROM strTable WHERE strField LIKE strCheck
  funSelectLike(strTable, strField, strCheck, listOutput, callback) {
    let sql = '';
    let arySql = [];
    let strOutput = strField;

    for (let i = 0; i < listOutput.length; i++) {
      if (i != 0) {
        strOutput = strOutput + ',' + listOutput[i] + ' ';
      } else {
        strOutput = ' ' + listOutput[i] + ' ';
      }
    }

    sql = 'SELECT ' + strOutput + ' FROM ' + strTable + ' WHERE ' + strField  + ' LIKE ?';
    arySql = ["%" + strCheck + "%"];
    try {
      return this.pool.getConnection(function (err, connection) {
            connection.query(sql, arySql, function (err, result) {
                if (err) {
                  connection.release();
                  callback({code: "8888", message: err}, result);
                } else {
                  connection.release();
                  if (result.length == 0) {
                    // Record Not Found
                    callback({code: "1000", message: 'Record Not Found'}, result);
                  } else {
                    // Record Found
                    callback({code: "0000", message: 'Record Found'}, result);
                  }
                }
            });
      });
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }


  funAddDb(strTable, listFields, listValues, callback) {
    let sql = '';
    let arySql = listValues;
    let strFields = '';
    let strQuestions = '';
    let intNoFields = 0;
    let datCurDate = new Date();
    let strCurDate = datCurDate.Format("yyyy-MM-dd hh:mm:ss");
    
    intNoFields = listFields.length;
    try {
      // Check No. of Fields Matches ?
      if (listFields.length != listValues.length) {
        // Not Match
        callback({code: "9999", message: 'No of Fields Not Matched'}, null);
      } else {
        // Match

        // Construct strFields and strQuestions, Check Any System Date
        for (let i = 0; i < listFields.length; i++) {
          if (arySql[i] == '[SYSDATETIME]') {
            // Change arySql[i] with Current Date Time
            arySql[i] = strCurDate;
          }

          // Construct strFields
          if (i != 0) {
            strFields = strFields + ', ' + listFields[i];
            strQuestions = strQuestions + ',?';
          } else {
            strFields = '(' + listFields[i];
            strQuestions = '(?';
          }
          if (i == listFields.length - 1) {
            strFields = strFields + ')'
            strQuestions = strQuestions + ')';
          }
        }

        // Constrct sql statement
        sql = 'INSERT INTO ' + strTable + strFields + ' VALUES ' + strQuestions;

        return this.pool.getConnection(function (err, connection) {
          connection.query(sql, arySql, function (err, result) {
              if (err) {
                connection.release();
                callback({code: "8888", message: err}, result);
              } else {
                connection.release();

                if (result['affectedRows'] == 0) {
                  // Record Not Added, System Error
                  callback({code: "1000", message: 'Record Not Added'}, result);
                } else {
                  // Record Added
                  callback({code: "2000", message: 'Record Added'}, result);
                }
              }
          });
    });

      }
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }


  funAddUser(jsonInput, strUsr_Plist_3, strUsr_Plist_4, strUsr_Plist_10, callback) {
    let sql = '';
    let arySql = [];
    let strTempUsr_Code = jsonInput.strUsrCode.padEnd(16);
    let strTemp3 = strUsr_Plist_3 + strTempUsr_Code;
    let strTemp4 = strUsr_Plist_4 + strTempUsr_Code;
    let strTemp10 = strUsr_Plist_10 + strTempUsr_Code;
    let intCoins_G = 0;
    if (strTemp3.length > 48) {
      strTemp3 = strTemp3.substring(16);
    }
    if (strTemp4.length > 64) {
      strTemp4 = strTemp4.substring(16);
    }
    if (strTemp10.length > 160) {
      strTemp10 = strTemp10.substring(16);
    }
    // Get Current Date
    let datCurDate = new Date();
    let strCurDate = datCurDate.Format("yyyy-MM-dd hh:mm:ss");
    let datExpiryDate = datCurDate;
    // Set Expiry Date
    datExpiryDate = new Date(datExpiryDate.setDate(datExpiryDate.getDate() + 7));
    let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
    // Set Hash Password
    let strPassword = bcrypt.hashSync(jsonInput.strPassword, 8);
    // Set Random Email Confirmation Code
    let strRandomEmail = mUt.funGenRandomNumber(6);
    // Set Default Activation Retry Times
    let intActivateRetry = 3;

    sql = 'INSERT INTO usrs (usr_code, usr_code_p, usr_email, usr_joindt, usr_name, usr_plist_3, usr_plist_4, usr_plist_10, usr_pw, usr_status, usr_activate_e, usr_adt_e, usr_aretry_m, usr_aretry_e, usr_coins_g) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    arySql = [strTempUsr_Code, jsonInput.strUsrCode_Parent, jsonInput.strEmail, strCurDate, jsonInput.strUsrName, strTemp3, strTemp4, strTemp10, strPassword, 'A', strRandomEmail, strExpiryDate, intActivateRetry, intActivateRetry, intCoins_G];
    try {
      return this.pool.getConnection(function (err, connection) {
            connection.query(sql, arySql, function (err, result) {
                if (err) {
                  connection.release();
                  callback({code: "8888", message: err}, result);
                } else {
                  connection.release();

                  if (result['affectedRows'] == 0) {
                    // Record Not Added, System Error
                    callback({code: "1000", message: 'Record Not Found'}, result);
                  } else {
                    // Record Added
                    callback({code: "2000", message: 'Record Added'}, [strTempUsr_Code, strRandomEmail]);
                  }
                }
            });
      });
    } catch (Err) {
      callback({code: "9999", message: Err}, result);
    }
  }


  // End
}

module.exports = clsDb