const DB = require('../apijs/db');
const db = new DB();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../thisjs/config');
const mUt = require('../apijs/utils.js');

module.exports = function(appNBC) {

//Define Router Methods





// Change Email
appNBC.post('/changeemail', (req, res) => {
  // Check User Email Exist
  try {
      db.funCheckFieldExist('usrs', 'usr_email', req.body.jsonInput.strEmailOld, ['usr_code', 'usr_name', 'usr_email'], (err, result1) => {
          if (err.code != "0000") {
              // User Email Not Exist, System Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              db.funCheckFieldExist('usrs', 'usr_email', req.body.jsonInput.strEmail, ['usr_code', 'usr_name', 'usr_email'], (err, result2) => {
                  if (err.code == "0000") {
                      // New User Email Already Exist, System Error
                      res.status(200).send({
                          errCode: "1002"
                      });
                  } else {
                      // User Old Email Exist, New Email Not Exist, OK

                      // Set Expiry Date
                      let datExpiryDate = new Date();
                      datExpiryDate = new Date(datExpiryDate.getTime() + config.cintEmailCPWExpiryM * 60000);
                      let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
                      // Set New Activation Code
                      let strTempActCode = mUt.funGenRandomNumber(6);
                      // Update Database
                      db.funUpdateTable('usrs', "SET usr_activate_e = ?, usr_adt_e = ?, usr_aretry_e = 3, usr_status = 'A', usr_email = ?", "WHERE usr_email = ?", [strTempActCode, strExpiryDate, req.body.jsonInput.strEmail, req.body.jsonInput.strEmailOld], (err, result3) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Email Changed
                              res.status(200).send({
                                  errCode: "2000"
                              });

                              // Send Email Again, strType = "CHE"
                              funSendEmail(result1[0]['usr_code'], result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "CHE");
                          }
                      });
                  }
              });
          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})



// Change Passowrd By Email Activation Code
appNBC.post('/changepasswordbyemail', (req, res) => {
  // Check User Email Exist
  try {
      db.funCheckFieldExist('usrs', 'usr_email', req.body.jsonInput.strEmail, ['usr_code', 'usr_name', 'usr_email', 'usr_activate_fp', 'UNIX_TIMESTAMP(usr_adt_fp) AS usr_adt_fp_s', 'usr_aretry_fp'], (err, result1) => {
          if (err.code != "0000") {
              // User Email Not Exist, System Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              // User Email Exist, OK

              // Check User Activation Code
              if (result1[0]['usr_activate_fp'] != req.body.jsonInput.strActCode) {
                  // Check Activation Retry Times
                  if (result1[0]['usr_aretry_fp'] > 0) {
                      // Still Have Retry Times

                      // Update Database, retry time MINUS 1
                      db.funUpdateTable('usrs', "SET usr_aretry_fp = usr_aretry_fp - 1", "WHERE usr_email = ?", [req.body.jsonInput.strEmail], (err, result2) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Activation Code not correct and retry Times Updated
                              res.status(200).send({
                                  errCode: "1002",
                                  intRetryTimes: result1[0]['usr_aretry_fp']
                              });
                          }
                      });
                  } else {
                      // Retry Times Exceeded

                      // Reset Database and Retry Times
                      // Set Expiry Date
                      let datExpiryDate = new Date();
                      datExpiryDate = new Date(datExpiryDate.getTime() + config.cintEmailCPWExpiryM * 60000);
                      let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
                      // Set New Activation Code
                      let strTempActCode = mUt.funGenRandomNumber(6);
                      // Update Database
                      db.funUpdateTable('usrs', "SET usr_activate_fp = ?, usr_adt_fp = ?, usr_aretry_fp = 3", "WHERE usr_email = ?", [strTempActCode, strExpiryDate, req.body.jsonInput.strEmail], (err, result3) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Forget Password Activation Code Retry Time Exceed
                              res.status(200).send({
                                  errCode: "1003"
                              });

                              // Send Email Again, strType = "FGP"
                              funSendEmail(result1[0]['usr_code'], result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "FGP");
                          }
                      });
                  }
              } else {
                  // Check Activation Code Expiry
                  let datTemp = new Date(result1[0]['usr_adt_fp_s'] * 1000);
                  if (datTemp < Date.now()) {
                      // Set Expiry Date
                      let datExpiryDate = new Date();
                      datExpiryDate = new Date(datExpiryDate.getTime() + config.cintEmailCPWExpiryM * 60000);
                      let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
                      // Set New Activation Code
                      let strTempActCode = mUt.funGenRandomNumber(6);
                      // Update Database
                      db.funUpdateTable('usrs', "SET usr_activate_fp = ?, usr_adt_fp = ?, usr_aretry_fp = 3", "WHERE usr_email = ?", [strTempActCode, strExpiryDate, req.body.jsonInput.strEmail], (err, result4) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Activation Code Expired
                              res.status(200).send({
                                  errCode: "1004"
                              });

                              // Send Email Again, strType = "FGP"
                              funSendEmail(result1[0]['usr_code'], result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "FGP");
                          }
                      });
                  } else {
                      // Not Expired, can update record
                      
                      // Get Password Hash
                      let strPassword = bcrypt.hashSync(req.body.jsonInput.strPassword, 8);

                      db.funUpdateTable('usrs', "SET usr_pwretry = 10, usr_pw = ? ", "WHERE usr_email = ?", [strPassword, req.body.jsonInput.strEmail], (err, result5) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Record Updated
                              res.status(200).send({
                                  errCode: "2000"
                              });
                          }
                      });
                  }
              }
          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})



// Change Passowrd By Password
appNBC.post('/changepasswordbypassword', (req, res) => {
  // Check User Exist
  try {
      db.funCheckFieldExist('usrs', 'usr_code', req.body.jsonInput.strUsrCode, ['usr_code', 'usr_name', 'usr_email', 'usr_pw', 'usr_pwretry'], (err, result1) => {
          if (err.code != "0000") {
              // User Not Exist, System Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              // User Exist, OK

              if (result1[0]['usr_pwretry'] < 1) {
                  // Set Expiry Date = Current Time + 1 hour
                  let datExpiryDate = new Date();
                  datExpiryDate = new Date(datExpiryDate.getTime() + config.cintEmailCPWExpiryM * 60000);
                  let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
                  // Set New Activation Code
                  let strTempActCode = mUt.funGenRandomNumber(6);

                  // Update User Table, set Forget Password Activation Code, Expiry and Retry Times
                  db.funUpdateTable('usrs', "SET usr_activate_fp = ?, usr_adt_fp = ?, usr_aretry_fp = 3", "WHERE usr_code = ?", [strTempActCode, strExpiryDate, result1[0]['usr_code']], (err, result2) => {
                      if (err.code != "3000") {
                          // Record Not Updated, System Error
                          res.status(200).send({
                              errCode: "1001"
                          });
                      } else {
                          // Record Updated

                          // Send Email "FGP"
                          funSendEmail(result1[0]['usr_code'], result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "FGP");

                          res.status(200).send({
                              errCode: "1002",
                              strEmail: result1[0]['usr_email']
                          });
                      }
                  });
              } else {
                  // Check Password
                  // let strNewPasswordHash = bcrypt.hashSync(jsonInput.strPassword, 8);
                  let passwordIsValid = bcrypt.compareSync(req.body.jsonInput.strPasswordOld, result1[0]['usr_pw']);

                  if (!passwordIsValid) {
                      // Password Not Correct

                      // Update Database, set Retry Times -= 1
                      db.funUpdateTable('usrs', "SET usr_pwretry = usr_pwretry - 1", "WHERE usr_code = ?", [result1[0]['usr_code']], (err, result3) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Record Updated
                              res.status(200).send({
                                  errCode: "1003"
                              });
                          }
                      });
                  } else {
                      // Password Correct

                      // Get Password Hash
                      let strPassword = bcrypt.hashSync(req.body.jsonInput.strPassword, 8);

                      db.funUpdateTable('usrs', "SET usr_pwretry = 10, usr_pw = ? ", "WHERE usr_code = ?", [strPassword, result1[0]['usr_code']], (err, result4) => {
                          if (err.code != "3000") {
                              // Record Not Updated, System Error
                              res.status(200).send({
                                  errCode: "1001"
                              });
                          } else {
                              // Record Updated
                              res.status(200).send({
                                  errCode: "2000"
                              });
                          }
                      });
                  }
              }
          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})



// Forget Password
appNBC.post('/forgetpassword', (req, res) => {
  // Check Email Exist
  try {
      db.funCheckFieldExist('usrs', 'usr_email', req.body.jsonInput.strEmail, ['usr_code', 'usr_name', 'usr_email'], (err, result1) => {
          if (err.code != "0000") {
              // Email Not Exist, Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              // Email Exist

              // Set Expiry Date = Current Time + 1 hour
              let datExpiryDate = new Date();
              datExpiryDate = new Date(datExpiryDate.getTime() + config.cintEmailCPWExpiryM * 60000);
              let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
              // Set New Activation Code
              let strTempActCode = mUt.funGenRandomNumber(6);

              // Update User Table, set Forget Password Activation Code, Expiry and Retry Times
              db.funUpdateTable('usrs', "SET usr_activate_fp = ?, usr_adt_fp = ?, usr_aretry_fp = 3", "WHERE usr_code = ?", [strTempActCode, strExpiryDate, result1[0]['usr_code']], (err, result2) => {
                  if (err.code != "3000") {
                      // Record Not Updated, System Error
                      res.status(200).send({
                          errCode: "1002"
                      });
                  } else {
                      // Record Updated
                      res.status(200).send({
                          errCode: "0000", strEmail: result1[0]['usr_email'],
                      });

                      // Send Email "FGP"
                      funSendEmail(result1[0]['usr_code'], result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "FGP");
                  }
              });


          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})



// Game List
appNBC.post('/gamelist', (req, res) => {
  // Check Game Exist
  try {
      db.funCheckFieldExist('giheader', 'gih_status', 'E', ['gih_code', 'gih_name_eng', 'gih_name_sch', 'gih_name_tch', 'gih_desc_eng', 'gih_desc_sch', 'gih_desc_tch'], (err, result1) => {
          if (err.code != "0000") {
              // Game Not Exist, Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              // Game Exist
              res.status(200).send({
                  errCode: "0000",
                  result: result1
              });
          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})



// Get Free Coin
appNBC.post('/getcoin', (req, res) => {
  // Check AlreadyGetCoin
  try {
      db.funCheckFieldExist('usrs', 'usr_code', req.body.strUserID, ['usr_status', 'usr_coins_g'], (err, result1) => {
          if (err.code != "0000") {
              // User Not Exist, Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              // User Exist, Check User Status

              if (result1[0]['usr_status'] != 'E') {
                  // User Not Activated, CANNOT Get Free Coin
                  res.status(200).send({
                      errCode: "1002"
                  });
              } else {
                  // Check Today Already Get Coin?
                  db.funSelectSql("SELECT usr_code FROM cgllist WHERE usr_code = ? AND Date(cgl_dt) = Date(CurDate())", [req.body.strUserID], (err, result2) => {
                      if (err.code == "0000") {
                          // Today Get Free Coin Already
                          res.status(200).send({
                              errCode: "1003"
                          });
                      } else {
                          // Add Record for User
                          db.funAddDb('cgllist', 
                              ['cgl_dt', 'usr_code', 'cgl_type', 'cgl_coins_g', 'cgl_coins_j', 'cgl_coins_d', 'cgl_remark'], 
                              ['[SYSDATETIME]', req.body.strUserID, 'LG', cintGameDefaultGainCoin, 0, 0, ''], 
                              (err, result3) => 
                          {
                              // Should OK
                          });

                          // Update coins for this user
                          db.funUpdateTable('usrs', "SET usr_coins_g = usr_coins_g + ? ", "WHERE usr_code = ?", [cintGameDefaultGainCoin, req.body.strUserID], (err, result4) => {
                              // Should OK
                          });

                          // Send Success
                          res.status(200).send({
                              errCode: "0000",
                              intCoins_G: result1[0]['usr_coins_g'] + cintGameDefaultGainCoin,
                          });
                      }
                  });
          
              }
          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})






// Activate User Account by Email
appNBC.post('/yourteam', (req, res) => {
  // Check User Exist
  try {
      db.funSelectLike('usrs', 'usr_plist_10', req.body.jsonInput, ['usr_plist_10'], (err, result1) => {
          if (err.code != "0000") {
              // User Not Exist, System Error
              res.status(200).send({
                  errCode: "1001"
              });
          } else {
              // User Exist, OK
              res.status(200).send({
                  errCode: "0000",
                  result: result1,
              });
          }
      });
  } catch (err) {
      return res.status(500).send('500');
  }
})




// Test
appNBC.get('/me', function (req, res) {
  console.log('me called');
  res.status(200).send('Hello: ' + process.pid);
});


}
