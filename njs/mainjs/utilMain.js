function funPrint(msg, bolDebugOnly) {
    let bolShouldShow = false;
    try {
        if (bolDebugOnly) {
            if (global.gbolDebug) {
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
}



function funUpdateServerMonitor(strMsg, bolDebugOnly) {
    let bolShouldShow = false;
    try {
        if (bolDebugOnly) {
            if (global.gbolDebug) {
                bolShouldShow = true;
            }
        } else {
            bolShouldShow = true;
        }
        if (bolShouldShow) {
            let strTempDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
            global.ioServer.emit('chat message', strTempDate + " : " + strMsg);
        }
    } catch (err) {
        //
    }
}



function funSSLReadCertAndChainFromFullChain(strFullChain) {
    let intIndex = strFullChain.indexOf("-----END CERTIFICATE-----");
    let strCert = strFullChain.toString().substring(0, intIndex+26);
    let strTemp = strFullChain.toString().substring(intIndex+26, strFullChain.toString().length);

    intIndex = strTemp.indexOf("-----BEGIN CERTIFICATE-----");
    let strChain = strTemp.substring(intIndex, strTemp.length);

    return {
        'strCert': strCert,
        'strChain': strChain,
    };
}

// Export Modules
module.exports = {
    funPrint,
    funUpdateServerMonitor,
    funSSLReadCertAndChainFromFullChain,
}
