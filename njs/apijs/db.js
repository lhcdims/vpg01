"use strict";
//var mysql = require('mysql');
const mysql = require('mysql2/promise')

Date.prototype.Format = function (fmt) { //author: meizz
    let o = {
        "M+": this.getMonth() + 1, // Month
        "d+": this.getDate(), // Day
        "h+": this.getHours(), // Hour
        "m+": this.getMinutes(), // Minute
        "s+": this.getSeconds(), // Seconds
        "q+": Math.floor((this.getMonth() + 3) / 3), // Quarter
        "S": this.getMilliseconds() // Milliseconds
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  };

class clsDb {
  
  constructor() {
    //  this.db = new sqlite3.Database(file);
    //  this.createTable()
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: "192.168.123.10",
      user: "root",
      password: "Zephan915",
      database: "ib_bigaibot_com"
    });

    this.objFields = {
      "usrs_getCoins": [ 
        "usr_coins_g",
        "usr_coins_j",
        "usr_coins_d",
      ],
    };
  }

  // funAddDb(strTable, listFields, listValues, callback) {
  //   let sql = '';
  //   let arySql = listValues;
  //   let strFields = '';
  //   let strQuestions = '';
  //   let datCurDate = new Date();
  //   let strCurDate = datCurDate.Format("yyyy-MM-dd hh:mm:ss");
    
  //   try {
  //     // Check No. of Fields Matches ?
  //     if (listFields.length != listValues.length) {
  //       // Not Match
  //       callback({code: "9999", message: 'No of Fields Not Matched'}, null);
  //     } else {
  //       // Match

  //       // Construct strFields and strQuestions, Check Any System Date
  //       for (let i = 0; i < listFields.length; i++) {
  //         if (arySql[i] == '[SYSDATETIME]') {
  //           // Change arySql[i] with Current Date Time
  //           arySql[i] = strCurDate;
  //         }

  //         // Construct strFields
  //         if (i != 0) {
  //           strFields = strFields + ', ' + listFields[i];
  //           strQuestions = strQuestions + ',?';
  //         } else {
  //           strFields = '(' + listFields[i];
  //           strQuestions = '(?';
  //         }
  //         if (i == listFields.length - 1) {
  //           strFields = strFields + ')'
  //           strQuestions = strQuestions + ')';
  //         }
  //       }

  //       // Constrct sql statement
  //       sql = 'INSERT INTO ' + strTable + strFields + ' VALUES ' + strQuestions;

  //       return this.pool.getConnection(function (err, connection) {
  //         connection.query(sql, arySql, function (err, result) {
  //             if (err) {
  //               connection.release();
  //               callback({code: "8888", message: err}, result);
  //             } else {
  //               connection.release();

  //               if (result['affectedRows'] == 0) {
  //                 // Record Not Added, System Error
  //                 callback({code: "1000", message: 'Record Not Added'}, result);
  //               } else {
  //                 // Record Added
  //                 callback({code: "2000", message: 'Record Added'}, result);
  //               }
  //             }
  //         });
  //   });

  //     }
  //   } catch (Err) {
  //     callback({code: "9999", message: Err}, result);
  //   }
  // }

  // Transaction
  
  funGS(strTable, strTableList, strRule) {
    // SELECT * FROM `usrs` WHERE 1

    let strList = strTable;
    if (strTableList != null) {
      strList = strTableList;
    }

    let aryFields = this.objFields[strList];
    let strFields = '';
    for (let i = 0; i < aryFields.length; i++) {
      if (i == 0) {
        strFields += aryFields[i];
      } else {
        strFields += ', ' + aryFields[i];
      }
    }

    let strSql = "SELECT " + strFields + " From " + strTable + " WHERE " + strRule;

    return strSql;
  }
  
  funGI(strTable, strTableList) {
    // INSERT INTO `tbheader`(`tbh_sys_id`, `tbh_id`, `tbh_value`) VALUES ([value-1],[value-2],[value-3])
    
    let strList = strTable;
    if (strTableList != null) {
      strList = strTableList;
    }

    let aryFields = this.objFields[strList];

    let strSql = "INSERT INTO " + strTable + " ";

    let strFields = "";
    let strValues = "";
    for (let i = 0; i < aryFields.length; i++) {
      if (i == 0) {
        // First
        strFields += "(" + aryFields[i];
        strValues += "(?";
        if (aryFields.length == 1) {
          strFields += ") ";
          strValues += ") ";
        }
      } else if (i == aryFields.length-1) {
        // Last
        strFields += ", " + aryFields[i] + ") ";
        strValues += ", ?)";
      } else {
        // Middle
        strFields += ", " + aryFields[i];
        strValues += ", ?";
      }
    }
    strSql += strFields + "VALUES " + strValues;
    return strSql;
  }

  funGU(strTable, strTableList, strRule) {
    // UPDATE `tbheader` SET `tbh_sys_id`=[value-1],`tbh_id`=[value-2],`tbh_value`=[value-3] WHERE 1
  
    let strList = strTable;
    if (strTableList != null) {
      strList = strTableList;
    }

    let aryFields = this.objFields[strList];

    if (strRule == null) {
      strRule = "1";
    }

    let strSql = "UPDATE ";
    strSql += strTable + " SET ";

    let strFields = "";
    for (let i = 0; i < aryFields.length; i++) {
      if (i == 0) {
        strFields += aryFields[i] + " = ?";
      } else {
        strFields += ", " + aryFields[i] + " = ?";
      }
    }
  
    strSql += strFields;
    strSql += " WHERE " + strRule;
    return strSql;
  }

  funGD(strTable, strRule) {
    // DELETE FROM `tbheader` WHERE 0

    if (strRule == null) {
      strRule = "1";
    }

    let strSql = "DELETE FROM " + strTable + " WHERE " + strRule;
    return strSql;
  }

  async tst(queries, queryValues) {
    if (queries.length !== queryValues.length) {
        return Promise.reject('Number of provided queries did not match the number of provided query values arrays')
    }
    //const connection = await mysql.createConnection(databaseConfigs)
    const connection = await this.pool.getConnection();
      try {
        //console.log("1");
        await connection.beginTransaction();
        const queryPromises = [];
        //console.log("2");
        queries.forEach((query, index) => {
            queryPromises.push(connection.query(query, queryValues[index]));
        });
        //console.log("3");
        const results = await Promise.all(queryPromises);
        await connection.commit();
        await connection.release();
        //console.log("4");
        return results;
        //return "tst success";
      } catch (err) {
          await connection.rollback();
          await connection.release();
          //console.log("tst err: " + err);
          //return Promise.reject(err);
          return "tst error: " + err.message;
      }
  }

  // End
}

module.exports = clsDb