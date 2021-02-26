// Define utilities functions here



// A. Imports
import Vue from 'vue';



// Z. Supporting Functions


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


// Generate a random number
Vue.prototype.$funGenRandomNumber = function(intLength) {
    let strTemp = "";
    let codeChars = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
    for (let i = 0; i < intLength; i++) {
        let charNum = Math.floor(Math.random() * 10);
        strTemp += codeChars[charNum];
    }
    return strTemp;
};

// Update Client Browser Conosle
Vue.prototype.$funUpdateConsole = function(msg, bolDebugOnly) {
    let bolShouldShow = false;
    try {
        if (bolDebugOnly) {
            if (this.$gbolDebug) {
                bolShouldShow = true;
            }
        } else {
            bolShouldShow = true;
        }
        if (bolShouldShow) {
            let strTempDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
            console.log(strTempDate + " : " + msg);
        }
    } catch (err) {
        console.log(err.message);
    }
};
