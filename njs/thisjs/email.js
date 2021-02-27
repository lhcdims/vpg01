// Import
var nodemailer = require('nodemailer');

// Email Related
var transporter = nodemailer.createTransport({
  //     host: "smtp.mxhichina.com",
  //     port: 465,
  //     secure: true, // true for 465, false for other ports
  //    auth: {
  //      user: 'info@zephan.top', // Email User Name
  //      pass: fs.readFileSync('infoATzephan.top.txt').toString().replace(/\n/g, '') // Email Password stored in a file in the same directory of app.js
  //    }
  //    host: "smtp.qq.com",
  //    port: 465,
  //    secure: true, // true for 465, false for other ports
  //    auth: {
  //      user: '778314947@qq.com', // Email User Name
  //      // use either pop3 or imap, both ok
  //      // pass: 'frhbkmhrpczibegb' // qq pop3/smtp pw
  //      pass:  'wlxycdntkhdfbbfj' // qq imap/smtp pw
  //    }
  //    host: "smtp.yandex.com",
  //    port: 465,
  //    secure: true, // true for 465, false for other ports
  //    auth: {
  //      user: 'mmsteam001', // Email User Name
  //      // use either pop3 or imap, both ok
  //      // pass: 'frhbkmhrpczibegb' // qq pop3/smtp pw
  //      pass:  'mhkgazfragezxbaa' // qq imap/smtp pw
  //    }
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
      user: 'mmsteam001@gmail.com', // Email User Name
      // use either pop3 or imap, both ok
      // pass: 'frhbkmhrpczibegb' // qq pop3/smtp pw
      pass: 'vivian74' // qq imap/smtp pw
  }
});


const funSendEmail = (strUsrID, strUsrNick, strUsrEmail, strTempRandom, strLang, strType) => {
  try {
      let strSubject = '';
      let strText = '';
      let strHTML = '';
      if (strType == 'REG' || strType == 'RES' || strType == 'CHE') {
          // Register Send Activation or Resend Activation
          switch (strLang) {
              case 'tch':
                  strSubject = 'game.bigaibot.com 賬戶激活郵件';
                  strHTML = strUsrNick + ' 您好,<br><br>';
                  switch(strType) {
                      case 'REG':
                          strHTML += '您註冊了一個新的賬號：' + strUsrID + '<br><br>';
                          break;
                      case 'RES':
                          strHTML += '您舊的激活碼已過期或嘗試次數過多，已重新為您安排了一個，您的賬號是：' + strUsrID + '<br><br>';
                          break;
                      case 'CHE':
                          strHTML += '您正在申請更改電郵地址，您的賬號是：' + strUsrID + '<br><br>';
                          break;
                  }
                  strHTML += '激活碼是：' + strTempRandom + '<br><br>';
                  strHTML += '請登陸系統後使用本激活碼激活賬戶，謝謝。<br><br>';
                  strHTML += 'info@bigaibot.com';
                  strText = strUsrNick + ' 您好,\n\n';
                  switch(strType) {
                      case 'REG':
                          strText += '您註冊了一個新的賬號：' + strUsrID + '\n\n';
                          break;
                      case 'RES':
                          strText += '您舊的激活碼已過期或嘗試次數過多，已重新為您安排了一個，您的賬號是：' + strUsrID + '\n\n';
                          break;
                      case 'CHE':
                          strText += '您正在申請更改電郵地址，您的賬號是：' + strUsrID + '\n\n';
                          break;
                  }
                  strText += '激活碼是：' + strTempRandom + '\n\n';
                  strText += '請登陸系統後使用本激活碼激活賬戶，謝謝。\n\n';
                  strText += 'info@bigaibot.com';
                  break;
              case 'sch':
                  strSubject = 'game.bigaibot.com 账户激活邮件';
                  strHTML = strUsrNick + ' 您好,<br><br>';
                  switch(strType) {
                      case 'REG':
                          strHTML += '您注册了一个新的账号：' + strUsrID + '<br><br>';
                          break;
                      case 'RES':
                          strHTML += '您旧的激活码已过期或尝试次数过多，已重新为您安排了一个，您的账号是：' + strUsrID + '<br><br>';
                          break;
                      case 'CHE':
                          strHTML += '您正在申请更改电邮地址，您的账号是：' + strUsrID + '<br><br>';
                          break;
                  }
                  strHTML += '激活码是：' + strTempRandom + '<br><br>';
                  strHTML += '请登陆系统后用本激活码激活账户，谢谢。<br><br>';
                  strHTML += 'info@bigaibot.com';
                  strText = strUsrNick + ' 您好,\n\n';
                  switch(strType) {
                      case 'REG':
                          strText += '您注册了一个新的账号：' + strUsrID + '\n\n';
                          break;
                      case 'RES':
                          strText += '您旧的激活码已过期或尝试次数过多，已重新为您安排了一个，您的账号是：' + strUsrID + '\n\n';
                          break;
                      case 'CHE':
                          strText += '您正在申请更改电邮地址，您的账号是：' + strUsrID + '\n\n';
                          break;
                  }
                  strText += '激活码是：' + strTempRandom + '\n\n';
                  strText += '请登陆系统后使用本激活码激活账户，谢谢。\n\n';
                  strText += 'info@bigaibot.com';
                  break;
              default:
                  strSubject = 'game.bigaibot.com Account Activation Email';
                  strHTML = 'Dear ' + strUsrNick + ',<br><br>';
                  switch(strType) {
                      case 'REG':
                          strHTML += 'You have created an User ID: ' + strUsrID + '<br><br>';
                          break;
                      case 'RES':
                          strHTML += 'Your old activation code has been expired or no. of retry exceeded, a new one is prepared for you, your User ID is: ' + strUsrID + '<br><br>';
                          break;
                      case 'CHE':
                          strHTML += 'We have received a request to change your email, your User ID is: ' + strUsrID + '<br><br>';
                          break;
                  }
                  strHTML += 'The Activation Code is: ' + strTempRandom + '<br><br>';
                  strHTML += 'Please use the Activation Code to activate your account after Login, thank you.<br><br>';
                  strHTML += 'Best Regards, <br><br>';
                  strHTML += 'info@bigaibot.com';
                  strText = 'Dear ' + strUsrNick + ',\n\n';
                  switch(strType) {
                      case 'REG':
                          strText += 'You have created an User ID: ' + strUsrID + '\n\n';
                          break;
                      case 'RES':
                          strText += 'Your old activation code has been expired or no. of retry exceeded, a new one is prepared for you, your User ID is: ' + strUsrID + '\n\n';
                          break;
                      case 'CHE':
                          strText += 'We have received a request to change your email, your User ID is: ' + strUsrID + '\n\n';
                          break;
                  }
                  strText += 'The Activation Code is: ' + strTempRandom + '\n\n';
                  strText += 'Please use the Activation Code to activate your account after Login, thank you.\n\n';
                  strText += 'Best Regards, \n\n';
                  strText += 'info@bigaibot.com';
                  break;
          }
      } else if (strType == 'FGP') {
          // Forget Password Email
          switch (strLang) {
              case 'tch':
                  strSubject = 'game.bigaibot.com 忘記密碼郵件';
                  strHTML = strUsrNick + ' 您好,<br><br>';
                  strHTML += '您的賬號：' + strUsrID + ' 想更改密碼。<br><br>';
                  strHTML += '激活碼是：' + strTempRandom + '<br><br>';
                  strHTML += '請根據系統指示利用本激活碼更改密碼，謝謝。<br><br>';
                  strHTML += 'info@bigaibot.com';
                  strText = strUsrNick + ' 您好,\n\n';
                  strText += '您的賬號：' + strUsrID + ' 想更改密碼。\n\n';
                  strText += '激活碼是：' + strTempRandom + '\n\n';
                  strText += '請根據系統指示利用本激活碼更改密碼，謝謝。\n\n';
                  strText += 'info@bigaibot.com';
                  break;
              case 'sch':
                  strSubject = 'game.bigaibot.com 忘记密码邮件';
                  strHTML = strUsrNick + ' 您好,<br><br>';
                  strHTML += '您的账号：' + strUsrID + ' 想更改密码。<br><br>';
                  strHTML += '激活码是：' + strTempRandom + '<br><br>';
                  strHTML += '请根据系统指示利用本激活码更改密码，谢谢。<br><br>';
                  strHTML += 'info@bigaibot.com';
                  strText = strUsrNick + ' 您好,\n\n';
                  strText += '您的账号：' + strUsrID + ' 想更改密码。\n\n';
                  strText += '激活码是：' + strTempRandom + '\n\n';
                  strText += '请根据系统指示利用本激活码更改密码，谢谢。\n\n';
                  strText += 'info@bigaibot.com';
                  break;
              default:
                  strSubject = 'game.bigaibot.com Forget Password Email';
                  strHTML = 'Dear ' + strUsrNick + ',<br><br>';
                  strHTML += 'Your User ID: ' + strUsrID + ' wants to change password, <br><br>';
                  strHTML += 'The Activation Code is: ' + strTempRandom + '<br><br>';
                  strHTML += 'Please follow the instructions and use this Activation Code to change the password, thank you.<br><br>';
                  strHTML += 'Best Regards, <br><br>';
                  strHTML += 'info@bigaibot.com';
                  strText = 'Dear ' + strUsrNick + ',\n\n';
                  strText += 'Your User ID: ' + strUsrID + ' wants to change password, \n\n';
                  strText += 'The Activation Code is: ' + strTempRandom + '\n\n';
                  strText += 'Please follow the instructions and use this Activation Code to change the password, thank you.\n\n';
                  strText += 'Best Regards, \n\n';
                  strText += 'info@bigaibot.com';
                  break;
          }
      }
      let mailOptions = {
          from: 'info@bigaibot.com',
          to: strUsrEmail,
          subject: strSubject,
          text: strText,
          html: strHTML
      };
      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              // console.log(error);
              funUpdateServerMonitor('transporter.sendEmail Error:' + error, true);
          } else {
              // console.log('Email sent: ' + info.response);
              funUpdateServerMonitor('Email Sent', true);
          }
      });
  } catch (err) {
      // Send Email System Error
      funUpdateServerMonitor('Send Email Error:' + err.message, true);
  }
}


// Export Modules
module.exports = {
  funSendEmail,
}
