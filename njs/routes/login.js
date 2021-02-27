const DB = require('../apijs/db');
const db = new DB();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../thisjs/config');
const mUt = require('../apijs/utils.js');

module.exports = function(appNBC) {



  // Activate User Account by Email
  appNBC.post('/activate', (req, res) => {
    let intNewCoins_G = 0;

    // Check User Exist
    try {
        db.funCheckFieldExist('usrs', 'usr_code', req.body.jsonInput.strUsrCode, ['usr_status', 'usr_activate_e', 'UNIX_TIMESTAMP(usr_adt_e) AS usr_adt_e_s', 'usr_name', 'usr_aretry_e', 'usr_coins_g'], (err, result1) => {
            if (err.code != "0000") {
                // User Not Exist, System Error
                res.status(200).send({
                    errCode: "1001"
                });
            } else {
                // User Exist, OK

                // Check User Status == 'A'
                switch (result1[0]['usr_status']) {
                    case 'E':
                        // User Already Enabled
                        res.status(200).send({
                            errCode: "1002"
                        });
                        break;
                    case 'D':
                        // User Disabled
                        res.status(200).send({
                            errCode: "1003"
                        });
                        break;
                    default:
                        // User Not Activated, continue

                        // Check User Activation Code
                        if (result1[0]['usr_activate_e'] != req.body.jsonInput.strActCode) {
                            // Check Activation Retry Times
                            if (result1[0]['usr_aretry_e'] > 0) {
                                // Still Have Retry Times

                                // Update Database, retry time MINUS 1
                                db.funUpdateTable('usrs', "SET usr_aretry_e = usr_aretry_e - 1", "WHERE usr_code = ?", [req.body.jsonInput.strUsrCode], (err, result2) => {
                                    if (err.code != "3000") {
                                        // Record Not Updated, System Error
                                        res.status(200).send({
                                            errCode: "1006"
                                        });
                                    } else {
                                        // Activation Code not correct and retry Times Updated
                                        res.status(200).send({
                                            errCode: "1004",
                                            intRetryTimes: result1[0]['usr_aretry_e']
                                        });
                                    }
                                });
                            } else {
                                // Retry Times Exceeded

                                // Reset Database and Retry Times
                                // Set Expiry Date
                                let datExpiryDate = new Date();
                                datExpiryDate = new Date(datExpiryDate.setDate(datExpiryDate.getDate() + 7));
                                let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
                                // Set New Activation Code
                                let strTempActCode = mUt.funGenRandomNumber(6);
                                // Update Database
                                db.funUpdateTable('usrs', "SET usr_activate_e = ?, usr_adt_e = ?, usr_aretry_e = 3", "WHERE usr_code = ?", [strTempActCode, strExpiryDate, req.body.jsonInput.strUsrCode], (err, result3) => {
                                    if (err.code != "3000") {
                                        // Record Not Updated, System Error
                                        res.status(200).send({
                                            errCode: "1006"
                                        });
                                    } else {
                                        // Activation Code Retry Time Exceed
                                        res.status(200).send({
                                            errCode: "1007"
                                        });

                                        // Send Email Again, strType = "RES"
                                        funSendEmail(req.body.jsonInput.strUsrCode, result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "RES");
                                    }
                                });
                            }
                        } else {
                            // Check Activation Code Expiry
                            let datTemp = new Date(result1[0]['usr_adt_e_s'] * 1000);
                            if (datTemp < Date.now()) {
                                // Set Expiry Date
                                let datExpiryDate = new Date();
                                datExpiryDate = new Date(datExpiryDate.setDate(datExpiryDate.getDate() + 7));
                                let strExpiryDate = datExpiryDate.Format("yyyy-MM-dd hh:mm:ss");
                                // Set New Activation Code
                                let strTempActCode = mUt.funGenRandomNumber(6);
                                // Update Database
                                db.funUpdateTable('usrs', "SET usr_activate_e = ?, usr_adt_e = ?, usr_aretry_e = 3", "WHERE usr_code = ?", [strTempActCode, strExpiryDate, req.body.jsonInput.strUsrCode], (err, result3) => {
                                    if (err.code != "3000") {
                                        // Record Not Updated, System Error
                                        res.status(200).send({
                                            errCode: "1006"
                                        });
                                    } else {
                                        // Activation Code Expired
                                        res.status(200).send({
                                            errCode: "1005"
                                        });

                                        // Send Email Again, strType = "RES"
                                        funSendEmail(req.body.jsonInput.strUsrCode, result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "RES");
                                    }
                                });
                            } else {
                                // Not Expired, can update record
                                db.funUpdateTable('usrs', "SET usr_status = 'E', usr_actsuc_no_e = usr_actsuc_no_e + 1", "WHERE usr_code = ?", [req.body.jsonInput.strUsrCode], (err, result4) => {
                                    if (err.code != "3000") {
                                        // Record Not Updated, System Error
                                        res.status(200).send({
                                            errCode: "1006"
                                        });
                                    } else {
                                        // Record Updated
                                        
                                        // Check No. of Activation = 1, if so, gain Coin for this user and its parent
                                        db.funCheckFieldExist('usrs', 'usr_code', req.body.jsonInput.strUsrCode, ['usr_code', 'usr_code_p', 'usr_actsuc_no_e'], (err, result5) => {
                                            if (err.code != "0000") {
                                                // Record Not Found, System Error, But Send Success Anyway
                                                res.status(200).send({
                                                    errCode: "2000"
                                                });
                                            } else {
                                                // Record Found, Check First Time Activation?
                                                if (result5[0]['usr_actsuc_no_e'] == 1) {
                                                    // Add Gain Coin Record for User
                                                    db.funAddDb('cgllist', 
                                                        ['cgl_dt', 'usr_code', 'cgl_type', 'cgl_coins_g', 'cgl_coins_j', 'cgl_coins_d', 'cgl_remark'], 
                                                        ['[SYSDATETIME]', result5[0]['usr_code'], 'FG', cintGameDefaultGainCoin, 0, 0, ''], 
                                                        (err, result6) => 
                                                    {
                                                        // Should OK
                                                    });

                                                    // Update coins for this user
                                                    db.funUpdateTable('usrs', "SET usr_coins_g = usr_coins_g + ? ", "WHERE usr_code = ?", [cintGameDefaultGainCoin, result5[0]['usr_code']], (err, result7) => {
                                                        // Should OK
                                                    });

                                                    // Add Gain Coin Record for Parent
                                                    db.funAddDb('cgllist', 
                                                        ['cgl_dt', 'usr_code', 'cgl_type', 'cgl_coins_g', 'cgl_coins_j', 'cgl_coins_d', 'cgl_remark'], 
                                                        ['[SYSDATETIME]', result5[0]['usr_code_p'], 'RG', cintGameDefaultGainCoin, 0, 0, result5[0]['usr_code']], 
                                                        (err, result8) => 
                                                    {
                                                        // Should OK
                                                    });

                                                    // Update coins for this parent
                                                    db.funUpdateTable('usrs', "SET usr_coins_g = usr_coins_g + ? ", "WHERE usr_code = ?", [cintGameDefaultGainCoin, result5[0]['usr_code_p']], (err, result9) => {
                                                        // Should OK
                                                    });

                                                    intNewCoins_G = result1[0]['usr_coins_g'] + cintGameDefaultGainCoin;
                                                }

                                                res.status(200).send({
                                                    errCode: "2000",
                                                    intNewCoins_G: intNewCoins_G
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                }
            }
        });
    } catch (err) {
        return res.status(500).send('500');
    }
  })



  // Login
  appNBC.post('/login', (req, res) => {
    // console.log("/login called");
    // db.selectByEmail(req.body.email, (err, user) => {
    //   if (err) return res.status(500).send('Error on the server.');
    //   if (!user) return res.status(404).send('No user found.');
    //   let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass);
    //   if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    //   let token = jwt.sign({ id: user.id }, config.secret, {
    //     expiresIn: 3600 // expires in 1 hour
    //   });
    //   res.status(200).send({ auth: true, token: token, user: user });
    // });

    // Check User Exist
    try {
        let strField = "usr_code";
        let strEmailUserID = req.body.jsonInput.strEmail;
        if (req.body.jsonInput.strEmail.indexOf("@") >= 0) {
            strField = "usr_email";
        } else {
            strEmailUserID = strEmailUserID.padEnd(16);
        }
        db.funCheckFieldExist('usrs', strField, strEmailUserID, ['usr_code', 'usr_name', 'usr_email', 'usr_pw', 'usr_status', 'usr_pwretry', 'usr_coins_g', 'usr_coins_j', 'usr_coins_d', 'usr_level'], (err, result1) => {
            if (err.code != "0000") {
                // User Not Exist, Error
                res.status(200).send({
                    errCode: "1001",
                    bolWithAuth: false,
                    token: null
                });
            } else {
                // User Exist

                // Check Password Retry
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
                                errCode: "1004",
                                bolWithAuth: false,
                                token: null
                            });
                        } else {
                            // Record Updated

                            // Send Email "FGP"
                            funSendEmail(result1[0]['usr_code'], result1[0]['usr_name'], result1[0]['usr_email'], strTempActCode, req.body.strLang, "FGP");

                            res.status(200).send({
                                errCode: "1003",
                                bolWithAuth: false,
                                token: null,
                                strEmail: result1[0]['usr_email']
                            });
                        }
                    });
                } else {
                    // Check Password
                    // let strNewPasswordHash = bcrypt.hashSync(jsonInput.strPassword, 8);
                    let passwordIsValid = bcrypt.compareSync(req.body.jsonInput.strPassword, result1[0]['usr_pw']);

                    if (!passwordIsValid) {
                        // Password Not Correct

                        // Update Database, set Retry Times -= 1
                        db.funUpdateTable('usrs', "SET usr_pwretry = usr_pwretry - 1", "WHERE usr_code = ?", [result1[0]['usr_code']], (err, result3) => {
                            if (err.code != "3000") {
                                // Record Not Updated, System Error
                                res.status(200).send({
                                    errCode: "1004",
                                    bolWithAuth: false,
                                    token: null
                                });
                            } else {
                                // Record Updated
                                res.status(200).send({
                                    errCode: "1001",
                                    bolWithAuth: false,
                                    token: null
                                });
                            }
                        });
                    } else {
                        // Password Correct

                        // Check Status
                        if (result1[0]['usr_status'] == "D") {
                            // User Disabled
                            res.status(200).send({
                                errCode: "1002",
                                bolWithAuth: false,
                                token: null
                            });
                        } else {
                            // User Enabled or Waiting to be Activated, OK

                            // Update Database Reset Retry Times = 10
                            db.funUpdateTable('usrs', "SET usr_pwretry = 10", "WHERE usr_code = ?", [result1[0]['usr_code']], (err, result4) => {
                                if (err.code != "3000") {
                                    // Record Not Updated, System Error
                                    res.status(200).send({
                                        errCode: "1004",
                                        bolWithAuth: false,
                                        token: null
                                    });
                                } else {
                                    // Record Updated

                                    // Generate Token
                                    let strToken = jwt.sign({
                                        id: result1[0]['usr_code']
                                    }, config.secret, {
                                        // Set Token Expiry
                                        expiresIn: config.cintTokenExpiryS
                                    });

                                    res.status(200).send({
                                        errCode: "0000",
                                        bolWithAuth: true,
                                        token: strToken,
                                        intTokenDate: Date.now(),
                                        strUserID: result1[0]['usr_code'],
                                        strUserStatus: result1[0]['usr_status'],
                                        strEmail: result1[0]['usr_email'],
                                        intCoins_G: result1[0]['usr_coins_g'],
                                        intCoins_J: result1[0]['usr_coins_j'],
                                        intCoins_D: result1[0]['usr_coins_d'],
                                        usr_level: result1[0]['usr_level']
                                    });
                                }
                            });
                        }
                    }
                }
            }
        });
    } catch (err) {
        return res.status(500).send('500');
    }
  })



  // Re-Login for Go Inside App Again
  appNBC.post('/relogin', (req, res) => {
    // Check User Exist
    try {
        db.funCheckFieldExist('usrs', 'usr_code', req.body.strUsrCode, ['usr_code', 'usr_name', 'usr_email', 'usr_pw', 'usr_status', 'usr_pwretry', 'usr_coins_g', 'usr_coins_j', 'usr_coins_d', 'usr_level'], (err, result1) => {
            if (err.code != "0000") {
                // User Not Exist, Error
                res.status(200).send({
                    errCode: "1001",
                    bolWithAuth: false,
                    token: null
                });
            } else {
                // Generate New Token
                let strToken = jwt.sign({
                    id: result1[0]['usr_code']
                }, config.secret, {
                    // Set Token Expiry
                    expiresIn: config.cintTokenExpiryS
                });

                res.status(200).send({
                    errCode: "0000",
                    bolWithAuth: true,
                    token: strToken,
                    intTokenDate: Date.now(),
                    strUserID: result1[0]['usr_code'],
                    strUserStatus: result1[0]['usr_status'],
                    strEmail: result1[0]['usr_email'],
                    intCoins_G: result1[0]['usr_coins_g'],
                    intCoins_J: result1[0]['usr_coins_j'],
                    intCoins_D: result1[0]['usr_coins_d'],
                    usr_level: result1[0]['usr_level']
                });
            }
        });
    } catch (err) {
        return res.status(500).send('500');
    }
  })



  // Register
  appNBC.post('/register', (req, res) => {
    // Check Parent Exist
    try {
        db.funCheckFieldExist('usrs', 'usr_code', req.body.jsonInput.strUsrCode_Parent, ['usr_plist_3', 'usr_plist_4', 'usr_plist_10'], (err, result1) => {
            if (err.code != "0000") {
                // Parent Not Exist, Error
                res.status(200).send({
                    errCode: "1001",
                    bolWithAuth: false,
                    token: null
                });
            } else {
                // Parent Exist, OK

                // Check User Code Duplicate
                db.funCheckFieldExist('usrs', 'usr_code', req.body.jsonInput.strUsrCode, [], (err, result2) => {
                    if (err.code != "1000") {
                        // User Exist or system Error
                        res.status(200).send({
                            errCode: "1002",
                            bolWithAuth: false,
                            token: null
                        });
                    } else {
                        // User Not Exist, OK

                        // Check Email Duplicate
                        db.funCheckFieldExist('usrs', 'usr_email', req.body.jsonInput.strEmail, [], (err, result3) => {
                            if (err.code != "1000") {
                                // Email Exist or system Error
                                res.status(200).send({
                                    errCode: "1003",
                                    bolWithAuth: false,
                                    token: null
                                });
                            } else {
                                // Email Not Exist, Can Add
                                db.funAddUser(req.body.jsonInput, result1[0]['usr_plist_3'], result1[0]['usr_plist_4'], result1[0]['usr_plist_10'], (err, result3) => {
                                    if (err.code != "2000") {
                                        console.log(err);
                                        // Unable to add user error
                                        res.status(200).send({
                                            errCode: "1004",
                                            bolWithAuth: false,
                                            token: null
                                        });
                                    } else {
                                        // Get Token
                                        let token = jwt.sign({
                                            id: req.body.jsonInput.strUsrCode
                                        }, config.secret, {
                                            expiresIn: config.cintTokenExpiryS // expires in 1 min
                                        });

                                        // User Added
                                        res.status(200).send({
                                            errCode: "0000",
                                            bolWithAuth: true,
                                            token: token,
                                            intTokenDate: Date.now(),
                                            strUserID: result3[0],
                                            strEmail: req.body.jsonInput.strEmail
                                        });

                                        // Send Registration Email
                                        funSendEmail(req.body.jsonInput.strUsrCode, req.body.jsonInput.strUsrName, req.body.jsonInput.strEmail, result3[1], req.body.strLang, "REG");
                                    }
                                });
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

}