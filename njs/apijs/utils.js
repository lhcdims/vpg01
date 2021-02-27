// Functions that may be useful to all projects


// console.log
function funUpdateConsole(msg, bolDebugOnly) {
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



// Generate a Random Number of length intLength
const funGenRandomNumber = (intLength) => {
  let strTemp = "";
  let codeChars = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
  for (let i = 0; i < intLength; i++) {
      let charNum = Math.floor(Math.random() * 10);
      strTemp += codeChars[charNum];
  }
  return strTemp;
}



// Generate a Random String of length intLength
const funGenRandomString = (intLength) => {
  let strTemp = "";
  // 所有候选组成验证码的字符，当然也可以用中文的
  // Below we don't want 0, o, O, i, j, l, u, v which may be mistakenly recognized as other chars
  let codeChars = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9,
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'); 
  for (let i = 0; i < intLength; i++) {
      let charNum = Math.floor(Math.random() * 51);
      strTemp += codeChars[charNum];
  }
  return strTemp;
}



// Encode String to UTF-8
const utf8Encode = (strTemp) => {
  strTemp = strTemp.replace(/\r\n/g, "\n");
  let utftext = "";
  for (let n = 0; n < strTemp.length; n++) {
      let c = strTemp.charCodeAt(n);
      if (c < 128) {
          utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
      } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
      }

  }
  return utftext;
}



// Decode String From UTF-8
const utf8Decode = (utftext) => {
  let strTemp = "";
  let i = 0;
  let c = c1 = c2 = 0;
  while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        strTemp += String.fromCharCode(c);
          i++;
      } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          strTemp += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
      } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          strTemp += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
      }
  }
  return strTemp;
}



// Json Decode a json into string
const json_decode = (str_json) => {
  let json = JSON;
  if (typeof json === 'object' && typeof json.parse === 'function') {
      return json.parse(str_json);
  }

  let cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  let j;
  let text = str_json;

  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.
  cx.lastIndex = 0;
  if (cx.test(text)) {
      text = text.replace(cx, function (a) {
          return '\\u' +
              ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      });
  }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
  if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

      // In the third stage we use the eval function to compile the text into a
      // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
      // in JavaScript: it can begin a block or an object literal. We wrap the text
      // in parens to eliminate the ambiguity.

      j = eval('(' + text + ')');

      return j;
  }

  // If the text is not JSON parseable, then a SyntaxError is thrown.
  throw new SyntaxError('json_decode');
}



// Json Encode a string into json
const json_encode = (mixed_val) => {
  let json = JSON;
  if (typeof json === 'object' && typeof json.stringify === 'function') {
      return json.stringify(mixed_val);
  }

  let value = mixed_val;

  let quote = function (string) {
      let escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      let meta = { // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"': '\\"',
          '\\': '\\\\'
      };

      escapable.lastIndex = 0;
      return escapable.test(string) ?
          '"' + string.replace(escapable, function (a) {
              let c = meta[a];
              return typeof c === 'string' ? c :
                  '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          }) + '"' :
          '"' + string + '"';
  };

  let str = function (key, holder) {
      let gap = '';
      let indent = '    ';
      let i = 0; // The loop counter.
      let k = ''; // The member key.
      let v = ''; // The member value.
      let length = 0;
      let mind = gap;
      let partial = [];
      let value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && typeof value === 'object' &&
          typeof value.toJSON === 'function') {
          value = value.toJSON(key);
      }

      // What happens next depends on the value's type.
      switch (typeof value) {
          case 'string':
              return quote(value);

          case 'number':
              // JSON numbers must be finite. Encode non-finite numbers as null.
              return isFinite(value) ? String(value) : 'null';

          case 'boolean':
          case 'null':
              // If the value is a boolean or null, convert it to a string. Note:
              // typeof null does not produce 'null'. The case is included here in
              // the remote chance that this gets fixed someday.

              return String(value);

          case 'object':
              // If the type is 'object', we might be dealing with an object or an array or
              // null.
              // Due to a specification blunder in ECMAScript, typeof null is 'object',
              // so watch out for that case.
              if (!value) {
                  return 'null';
              }

              // Make an array to hold the partial results of stringifying this object value.
              gap += indent;
              partial = [];

              // Is the value an array?
              if (Object.prototype.toString.apply(value) === '[object Array]') {
                  // The value is an array. Stringify every element. Use null as a placeholder
                  // for non-JSON values.

                  length = value.length;
                  for (i = 0; i < length; i += 1) {
                      partial[i] = str(i, value) || 'null';
                  }

                  // Join all of the elements together, separated with commas, and wrap them in
                  // brackets.
                  v = partial.length === 0 ? '[]' :
                      gap ? '[\n' + gap +
                      partial.join(',\n' + gap) + '\n' +
                      mind + ']' :
                      '[' + partial.join(',') + ']';
                  gap = mind;
                  return v;
              }

              // Iterate through all of the keys in the object.
              for (k in value) {
                  if (Object.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }

              // Join all of the member texts together, separated with commas,
              // and wrap them in braces.
              v = partial.length === 0 ? '{}' :
                  gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                  mind + '}' : '{' + partial.join(',') + '}';
              gap = mind;
              return v;
      }
  };

  // Make a fake root object containing our value under the key of ''.
  // Return the result of stringifying the value.
  return str('', {
      '': value
  });
}


const funTemp = () => {
  global.gintTemp = 2;
}

module.exports = {
  funGenRandomNumber, 
  funGenRandomString,
  utf8Encode,
  utf8Decode,
  json_encode,
  json_decode,
  funTemp,
  funUpdateConsole,
}