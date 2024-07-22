'use strict';

var sizeof = require('object-sizeof');
var _uuid = require('uuid');
var crypto = require('crypto');
var lodash = require('lodash');
var moment = require('moment');
var path = require('path');

const functions = {
  gv: getvalue,
  getvalue: getvalue,
  gvq: getvaluequoted,
  getvaluequoted: getvaluequoted,
  getvalueescape: getvalueescape,
  gvescape: getvalueescape,
  getvalueunescape: getvalueunescape,
  gvunescape: getvalueunescape,
  genv: getenv,
  env: getenv,
  if: _if,
  eq: eq,
  ne: ne,
  gt: gt,
  gte: gte,
  lt: lt,
  lte: lte,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  abs: Math.abs,
  round: Math.round,
  ceil: Math.ceil,
  floor: Math.floor,
  log: Math.log,
  exp: Math.exp,
  pow: Math.pow,
  sqrt: Math.sqrt,
  max: Math.max,
  min: Math.min,
  random: random,
  add: add,
  trim: trim,
  ltrim: ltrim,
  rtrim: rtrim,
  substr: substr,
  length: length,
  replace: replace,
  escape: escape,
  unescape: unescape,
  htmlescape: htmlescape,
  htmlunescape: htmlunescape,
  hash: hash,
  encrypt: encrypt,
  decrypt: decrypt,
  uuid: uuid,
  uuidv4: uuid,
  uuidv1: uuidv1,
  uuidv3: uuidv3,
  uuidv5: uuidv5,
  uuidvalidate: uuid_validate,
  uuidversion: uuid_version,
  subtract: subtract,
  divide: divide,
  multiply: multiply,
  modulus: modulus,
  lpad: lpad,
  rpad: rpad,
  concat: concat,
  concatws: concatws,
  upper: upper,
  lower: lower,
  includes: includes,
  indexof: indexof,
  getdate: getDate,
  lastday: lastDay,
  dateformat: dateFormat,
  charcode: charcode,
  ifnull: ifnull,
  pathparse: pathParse,
  pathnormalize: path.normalize,
  pathjoin: path.join,
  urlparse: urlParse,
  quote: quote,
  stringify: stringify,
  jsonstringify: stringify,
  forof: for_of
};

/**
 * Get Environment variable.
 * Used by GetValue / GetEnv
 * @param s string
 * @returns string
 */
function getENVs(s) {
  let res = '';
  const envName = s.substr(4, s.length);
  if (s.startsWith('ENV_') && process.env[envName]) {
    res = process.env[envName];
  }
  return res;
}

/**
 * GetValue/GV: Returns a value (idvalue) of values
 * Used to obtain values of the dynamic variables
 * @param idvalue
 * @param values
 * @returns {string}
 */
function getvalue(idvalue, quote, values) {
  let res = '';
  if (values.hasOwnProperty(idvalue)) {
    const match = values[idvalue];
    if (match || match === 0 || match === false) res = match;
  } else if (idvalue.startsWith('ENV_')) {
    res = getENVs(idvalue);
  }

  if (quote) {
    if (quote === "\\'") quote = "'";
    res = quote + res + quote;
  }
  return res;
}

/**
 * GetValueQuoted/GVQ: Returns a value (idvalue) of values
 * Used to obtain values of the dynamic variables
 * @param idvalue
 * @quote quote (quote string)
 * @param values
 * @returns {string}
 */
function getvaluequoted(idvalue, quote = "'", values) {
  return getvalue(idvalue, quote, values);
}

/**
 * GetEnv/GENV: Returns a environment value
 * Used to obtain values of the environment
 * @param envName
 * @param values
 * @returns {string}
 */
function getenv(envName, quote) {
  let res = process.env[envName] || '';
  if (quote) {
    if (quote === "\\'") quote = "'";
    res = quote + res + quote;
  }
  return res;
}

/**
 * Escape
 * @param string
 * @returns {string} escaped string
 */
function escape(string) {
  return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, _char => {
    switch (_char) {
      case '"':
        return '\\' + _char;
      case "'":
        return '\\' + _char;
      case '\\':
        return '\\' + _char;
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
      default:
        return _char;
    }
  });
}

/**
 * Unescape
 * @param string
 * @returns {string} unescaped string
 */
function unescape(string) {
  return ('' + string).replace(/\\'|\\"|\\n|\\r|\\u2028|\\u2029/g, _escapedChar => {
    switch (_escapedChar) {
      case '\\"':
        return '"';
      case "\\'":
        return "'";
      case '\\n':
        return '\n';
      case '\\r':
        return '\r';
      case '\\u2028':
        return '\u2028';
      case '\\u2029':
        return '\u2029';
      default:
        return _escapedChar;
    }
  });
}

/**
 * Htmlescape
 * @param string
 * @returns {string} Escaped string for insertion into HTML, replacing "&", "<", ">", '"', and "'" by &amp;, &lt;, &gt;, &quot;, and &#39;
 */
function htmlescape(string) {
  return lodash.escape(string);
}

/**
 * Htmlunescape
 * @param string
 * @returns {string} Escaped string for insertion into HTML, replacing &amp;, &lt;, &gt;, &quot;, and &#39; by "'", "<", ">", '"', and "'"
 */
function htmlunescape(string) {
  return lodash.unescape(string);
}

/**
 * GetValueEscape/GVEscape: Returns a escaped value (idvalue) of values
 * Used to obtain values of the dynamic variables
 * @param idvalue
 * @param values
 * @returns {string}
 */
function getvalueescape(idvalue, values) {
  const match = values[idvalue];
  let res = '';

  if (match) {
    res = match;
  } else {
    if (idvalue.startsWith('ENV_')) {
      res = getENVs(idvalue);
    }
  }
  return escape(res);
}

/**
 * GetValueUnescape/GVUnescape: Returns a unescaped value (idvalue) of values
 * Used to obtain values of the dynamic variables
 * @param idvalue
 * @param values
 * @returns {string}
 */
function getvalueunescape(idvalue, values) {
  const match = values[idvalue];
  let res = '';

  if (match) {
    res = match;
  } else {
    if (idvalue.startsWith('ENV_')) {
      res = getENVs(idvalue);
    }
  }
  return unescape(res);
}

/**
 * Trim: Return trim input string
 * @param s {string}
 * @returns {string}
 */
function trim(s) {
  return s.replace(/'/g, '').trim();
}

/**
 * LTrim: Return left trim input string
 * @param s {string}
 * @returns {string}
 */
function ltrim(s) {
  return s.replace(/'/g, '').ltrim();
}

/**
 * RTrim: Return right trim input string
 * @param s {string}
 * @returns {string}
 */
function rtrim(s) {
  return s.replace(/'/g, '').rtrim();
}

/**
 * LPad: Returns a string(s) that is left-padded with a specified string(p) to a certain length(l).
 * @param s {string}
 * @param l length {string}
 * @param p padded string {string}
 * @returns {string}
 */
function lpad(s, l, p) {
  return s.replace(/'/g, '').padStart(l, p.replace(/'/g, ''));
}

/**
 * RPad: Returns a string(s) that is right-padded with a specified string(p) to a certain length(l).
 * @param s {string}
 * @param l length {string}
 * @param p padded string {string}
 * @returns {string}
 */
function rpad(s, l, p) {
  return s.replace(/'/g, '').padEnd(l, p.replace(/'/g, ''));
}

/**
 * Concat: Concatenates two or more expressions together
 * @params N strings or functions
 * @returns {string}
 */
function concat() {
  let strOutput = '';
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    strOutput += arg;
  }
  return strOutput;
}

/**
 * ConcatWS: Concatenates two or more expressions together and adds a separator between them
 * @params separator {string}
 * @params N strings or functions
 * @returns {string}
 */
function concatws() {
  let strOutput = '';
  let separator = '';
  for (let i = 1; i < arguments.length; i++) {
    if (strOutput !== '') separator = arguments[0];
    const arg = arguments[i];
    strOutput += separator + arg;
  }
  return strOutput;
}

/**
 * Upper: Converts a string to upper-case
 * @param s
 * @returns {string}
 */
function upper(s) {
  return s.toUpperCase();
}

/**
 * Lower: Converts a string to lower-case
 * @param s
 * @returns {string}
 */
function lower(s) {
  return s.toLowerCase();
}

/**
 * Includes: Returns true or false depending on whether it finds or not a string in another string
 * @param s - The string that will be searched {string}
 * @param is - The substring to search for in string {string}
 * @returns {boolean}
 */
function includes(s, is) {
  return s.includes(is);
}

/**
 * IndexOf: Returns the position of the first occurrence of a string in another string
 * @param s - The string that will be searched {string}
 * @param is - The substring to search for in string {string}
 * @returns {number}
 */
function indexof(s, is) {
  return s.indexof(is);
}

/**
 * SubStr: Returns a substring from a string (starting at any position).
 * @param s - The string to extract from
 * @param i - The start position
 * @param e - The number of characters to extract. If omitted, the whole string will be returned (from the start position)
 * @returns {string}
 */
function substr(s, i, e) {
  let res = '';
  if (e) res = s.substr(i, e);
  else res = s.substr(i);
  return res;
}

/**
 * Length: Returns the length of the specified string (in bytes).
 * @param s {string}
 */
function length(s) {
  return s.length;
}

/**
 * Replace: Replaces all occurrences of a specified string.
 * @param s -  The string
 * @param sub - The substring to find
 * @param n - The replacement substring
 * @param f - The flags (RegExp)
 */
function replace(s, sub, n, f) {
  let _regexp = sub;
  if (f) {
    _regexp = new RegExp(sub, f);
  }
  return s.replace(_regexp, n);
}

/**
 * CharCode: Returns the number code that represents the specific character.
 * @param s
 * @returns {number}
 */
function charcode(s) {
  return s.charCodeAt(0);
}

/**
 * Subtract
 * @params N {number}
 * @returns {number}
 */
function subtract() {
  let res = 0;
  for (let i = 0; i < arguments.length; i++) {
    if (i === 0) {
      res = arguments[0];
    } else {
      res = res - arguments[i];
    }
  }
  return res;
}

/**
 * Add
 * @params N {number}
 * @returns {number}
 */
function add() {
  let res = 0;
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    res += arg;
  }
  return res;
}

/**
 * Random: Returns a random number.
 * @param round - Decimals number
 * @param min - Min number random
 * @param max - Max number random
 * @returns {float}
 */
function random(round, min, max) {
  let res;
  if (round && typeof round === 'string') round = parseInt(round);
  if (min && typeof min === 'string') min = parseInt(min);
  if (max && typeof max === 'string') max = parseInt(max);

  if (round || round === 0) {
    res = parseFloat(
      (min || min === 0) && (max || max === 0) ? Math.random() * (max + 1 - min) + min : Math.random()
    ).toFixed(round);
  } else {
    res = (min || min === 0) && (max || max === 0) ? Math.random() * (max + 1 - min) + min : Math.random();
  }

  return res;
}

/**
 * Multiply
 * @param x
 * @param y
 * @returns {number}
 */
function multiply(x, y) {
  return x * y;
}

/**
 * Divide
 * @param x
 * @param y
 * @returns {number}
 */
function divide(x, y) {
  return x / y;
}

/**
 * Modulus
 * @param x
 * @param y
 * @returns {number}
 */
function modulus(x, y) {
  return x % y;
}

/**
 * Ifnull: Returns an alternative (r) value if an expression is null and optionally other (e) if not.
 * @param v - The value to test whether is NULL
 * @param a - The value to return if expression is a NULL value
 * @param e - Optional: The value to return if expression is NOT NULL value
 * @returns {string}
 */
function ifnull(v, a, e) {
  let res = e || v;
  if (!v || v === '' || typeof v === 'undefined') {
    res = a;
  }
  return res;
}

/**
 * If
 * @param condition
 * @param ontrue
 * @param onfalse
 * @returns {*}
 * @private
 */
function _if(condition, ontrue, onfalse) {
  return condition === 'true' || condition === true ? ontrue : onfalse;
}

/**
 * Eq
 * @param oper_l
 * @param oper_r
 * @returns {boolean}
 */
function eq(oper_l, oper_r) {
  return oper_l == oper_r;
}

/**
 * ne
 * @param oper_l
 * @param oper_r
 * @returns {boolean}
 */
function ne(oper_l, oper_r) {
  return oper_l != oper_r;
}

/**
 * gt
 * @param oper_l
 * @param oper_r
 * @returns {boolean}
 */
function gt(oper_l, oper_r) {
  return oper_l > oper_r;
}

/**
 * gte
 * @param oper_l
 * @param oper_r
 * @returns {boolean}
 */
function gte(oper_l, oper_r) {
  return oper_l >= oper_r;
}

/**
 * lt
 * @param oper_l
 * @param oper_r
 * @returns {boolean}
 */
function lt(oper_l, oper_r) {
  return oper_l < oper_r;
}

/**
 * lte
 * @param oper_l
 * @param oper_r
 * @returns {boolean}
 */
function lte(oper_l, oper_r) {
  return oper_l <= oper_r;
}

/**
 * GetDate: Returns date as specified by a format mask, language and period.
 * @param format (http://momentjs.com/docs/#/parsing/string-format/)
 * @param lang
 * @param period
 * @param increment
 * @param uppercase
 * @returns {string}
 */
function getDate(format, lang, period, increment = 1, uppercase) {
  if (lang && lang !== '') {
    lang = lang.toLowerCase();
    moment.locale(lang);
  } else {
    moment.locale('en');
  }
  const mom = moment();

  let strDate = '';

  if (period) {
    period = period.toLowerCase();
    strDate = mom.add(increment, period).format(format);
  } else {
    strDate = mom.format(format);
  }

  if (uppercase && uppercase !== 'false') {
    strDate = strDate.toUpperCase();
  }

  return strDate;
}

/**
 * dateFormat: Returns a date as specified by a format mask, language and period.
 * @param format (http://momentjs.com/docs/#/parsing/string-format/)
 * @param lang
 * @param period
 * @param increment
 * @param uppercase
 * @returns {string}
 */
function dateFormat(date, format = 'YYYYMMDD', output_format, lang, period, increment = 1, uppercase) {
  if (lang && lang !== '') {
    lang = lang.toLowerCase();
    moment.locale(lang);
  } else {
    moment.locale('en');
  }

  if (!date) date = moment();
  if (format && !output_format) output_format = format;

  let strDate = '';

  if (period) {
    period = period.toLowerCase();
    strDate = moment(date, format).add(increment, period).format(output_format);
  } else {
    strDate = moment(date, format).format(output_format);
  }

  if (uppercase && uppercase !== 'false') {
    strDate = strDate.toUpperCase();
  }

  return strDate;
}

/**
 * LastDay: Returns last day of a date as specified by a format mask, language and period.
 * @param format (http://momentjs.com/docs/#/parsing/string-format/)
 * @param lang
 * @param period
 * @param increment
 * @param uppercase
 * @returns {string}
 */
function lastDay(date, format = 'YYYYMMDD', output_format, lang, uppercase) {
  if (lang && lang !== '') {
    lang = lang.toLowerCase();
    moment.locale(lang);
  } else {
    moment.locale('en');
  }

  if (!date) date = moment();
  if (format && !output_format) output_format = format;

  let strDate = '';
  strDate = moment(date, format).endOf('month').format(output_format);

  if (uppercase && uppercase !== 'false') {
    strDate = strDate.toUpperCase();
  }

  return strDate;
}

/**
 * PathParser
 * @param _path
 * @param property
 * @returns {string}
 */
function pathParse(_path, property) {
  let res = '';
  if (_path) {
    const pathProperties = path.parse(_path);
    property = property.replace(/['"]+/g, '').toLowerCase().trim();

    if (pathProperties[property]) {
      res = pathProperties[property];
    } else {
      throw new Error(`PathParse (${_path}) wrong property ${property}.`);
    }
  }

  return res;
}

/**
 * URLParser
 * @param _url
 * @param property
 * @returns {string}
 */
function urlParse(_url, property) {
  let res = '';
  if (_url) {
    const urlProperties = new URL(_url);
    property = property.replace(/['"]+/g, '').toLowerCase().trim();

    if (urlProperties[property]) {
      res = urlProperties[property];
    } else {
      throw new Error(`UrlParser (${_url}) wrong property ${property}.`);
    }
  }
  return res;
}

/**
 * Hash: Return hashed string
 * @param s {string}
 * @param hash (openssl list-message-digest-algorithms) {string}
 * @param digets (hex, base64 or latin1) {string}
 * @returns {string}
 */
function hash(s, hash, digets) {
  digets = digets || 'hex';
  return crypto.createHash(hash).update(s).digest(digets);
}

/**
 * Encrypt
 * @param s
 * @param algorithm (openssl list-cipher-algorithms)
 * @param password
 * @returns String crypted
 */
function encrypt(s, algorithm, password) {
  const IV_LENGTH = 16; // For AES, this is always 16
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(password), iv);
  let crypted = cipher.update(s, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

/**
 * Decrypt
 * @param s
 * @param algorithm (openssl list-cipher-algorithms)
 * @param password
 * @returns String decrypted
 */
function decrypt(s, algorithm, password) {
  const textParts = s.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(password), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * UUID
 * @returns A version 4 (random) UUID
 */
function uuid() {
  try {
    return _uuid.v4();
  } catch (err) {
    throw new Error(`UUID error: ${err}`);
  }
}

/**
 * UUID
 * @returns A version 1 (timestamp) UUID
 */
function uuidv1() {
  try {
    return _uuid.v1();
  } catch (err) {
    throw new Error(`UUID error: ${err}`);
  }
}

/**
 * UUID
 * @returns A version 5 (namespace w/ SHA-1) UUID
 */
function uuidv5(name, namespace_uuid) {
  if (_uuid.validate(namespace_uuid)) {
    try {
      return _uuid.v5(name, namespace_uuid);
    } catch (err) {
      throw new Error(`UUID error: ${err}`);
    }
  } else {
    throw new Error(`INVALID NAMESPACE UUID: ${namespace_uuid}`);
  }
}

/**
 * UUID
 * @returns A version 3 (namespace w/ MD5) UUID
 */
function uuidv3(name, namespace_uuid) {
  if (_uuid.validate(namespace_uuid)) {
    try {
      return _uuid.v3(name, namespace_uuid);
    } catch (err) {
      throw new Error(`UUID error: ${err}`);
    }
  } else {
    throw new Error(`INVALID NAMESPACE UUID: ${namespace_uuid}`);
  }
}

/**
 * UUID
 * @returns Test a string to see if it is a valid UUID
 */
function uuid_validate(uuid) {
  return _uuid.validate(uuid);
}

/**
 * UUID
 * @returns Detect RFC version of a UUID
 */
function uuid_version(uuid) {
  return _uuid.version(uuid);
}

/**
 * Quote
 * @param s (string)
 * @param quote (quote string)
 * @returns Quoted string
 */
function quote(s, quote = "'") {
  return quote + s + quote;
}

/**
 * JSON Stringify
 * @param obj
 * @returns {string} JSON stringified object
 */
function stringify(obj) {
  if (!obj) {
    throw new Error(`stringifying non value variable -> ${obj}`);
  } else {
    try {
      return JSON.stringify(obj);
    } catch (ex) {
      throw new Error(`Stringify exception: ${ex}`);
    }
  }
}

/**
 * Returns an array with one object for each element of the array of values
 * @param {Array<any>} values
 * @param {object} obj
 * @returns {Array<object>} Array of objects
 */
async function for_of(values, obj) {
  if (!Array.isArray(values)) {
    throw new Error(`For of exception: invalid array -> ${values}`);
  }

  if (typeof obj !== 'object') {
    try {
      obj = JSON.parse(obj);

      if (!obj) {
        throw new Error(`For of exception: null object -> ${obj}`);
      }
    } catch (ex) {
      if (typeof obj !== 'string') {
        throw new Error(`For of exception: invalid object -> ${obj}`);
      }
    }
  }

  const res = [];
  try {
    const interpreter = (await Promise.resolve().then(function () { return index; })).default;

    for (const value of values) {
      const newObj = await interpreter.interpret(obj, value);
      res.push(newObj);
    }
    return res;
  } catch (ex) {
    throw new Error(`For of exception: ${ex}`);
  }
}

const functFlag = '@';

async function interpret(input, values = {}) {
  try {
    const tokens = lex(input);
    const parseTree = parse(tokens);
    const output = await evaluate(parseTree, values);
    return output;
  } catch (err) {
    throw err;
  }
}

/**
 * Lexer
 * @param input (String)
 * @returns {Object} (Tokens)
 */
function lex(input) {
  const isOperator = c => {
    return /[(),]/.test(c);
  };
  const isDigit = c => {
    return /[0-9]/.test(c);
  };
  const isString = c => {
    return /('(?:[^'\\]|(?:\\\\)|(?:\\\\)*\\.{1})*')/gm.test(c);
  };
  const isWhiteSpace = c => {
    return c === ' ';
  };
  const isIdentifier = c => {
    return typeof c === 'string' && !isOperator(c) && !isWhiteSpace(c) && !isString(c);
  };
  const isFunction = c => {
    return typeof c === 'string' && c.startsWith(functFlag) && functions[c.toLowerCase().substring(1)];
  };

  const tokens = [];
  let c;
  let i = 0;
  const advance = () => {
    return (c = input[++i]);
  };
  const addToken = (type, value) => {
    tokens.push({
      type: type,
      value: value
    });
  };
  while (i < input.length) {
    c = input[i];

    if (isWhiteSpace(c)) {
      addToken('string', c);
      advance();
    } else if (isOperator(c)) {
      addToken(c);
      advance();
    } else if (isDigit(c)) {
      let num = c;
      while (isDigit(advance())) num += c;
      if (c === '.') {
        do num += c;
        while (isDigit(advance()));
      }
      addToken('number', num);
    } else if (c.startsWith("'")) {
      let str = '';
      do {
        str += c;
        advance();
      } while (str.startsWith("'") && !isString(str) && typeof c !== 'undefined');

      addToken('string', str);
    } else if (isIdentifier(c)) {
      let idn = c;
      while (isIdentifier(advance()) && c !== functFlag) idn += c;
      if (isFunction(idn)) {
        addToken('identifier', idn);
      } else {
        addToken('string', idn);
      }
    } else throw new Error('Interpretar: Unrecognized token.');
  }
  addToken('(end)');
  return tokens;
}

/**
 * Parser
 * @param tokens (lexer)
 * @returns {Array}
 */
function parse(tokens) {
  let i = 0;
  const symbols = {};
  const symbol = (id, nud, lbp, led) => {
    const sym = symbols[id] || {};
    symbols[id] = {
      lbp: sym.lbp || lbp,
      nud: sym.nud || nud,
      led: sym.led || led
    };
  };

  const interpretToken = token => {
    const sym = Object.create(symbols[token.type]);
    sym.type = token.type;
    sym.value = token.value;
    return sym;
  };

  const token = () => {
    return interpretToken(tokens[i]);
  };

  const advance = () => {
    i++;
    return token();
  };

  const isOperator = c => {
    return /[(),]/.test(c);
  };

  const expression = rbp => {
    let left;
    let t = token();
    const initType = t.type;
    advance();
    if (!isOperator(initType)) {
      if (!t.nud) throw new Error('Unexpected token: ' + t.type);
      left = t.nud(t);
      while (rbp < token().lbp) {
        t = token();
        advance();
        if (!t.led) throw new Error('Unexpected token: ' + t.type);
        left = t.led(left);
      }

      return left;
    } else {
      return { type: 'string', value: initType };
    }
  };

  symbol(',');
  symbol(')');
  symbol('(end)');

  symbol('number', number => {
    return number;
  });
  symbol('string', string => {
    return string;
  });
  symbol('identifier', name => {
    if (token().type === '(') {
      const args = [];
      if (tokens[i + 1].type === ')') advance();
      else {
        do {
          //Ignore whitespaces (start param):
          do {
            advance();
          } while (token().value === ' ');

          args.push(expression(2));

          //Ignore whitespace (end param):
          while (token().value === ' ') {
            advance();
          }
        } while (token().type === ',');
        if (token().type !== ')') throw new Error("Expected closing parenthesis ')': " + token().value);
      }
      advance();
      return {
        type: 'call',
        args: args,
        name: name.value.toLowerCase()
      };
    }
    return name;
  });

  symbol('(', () => {
    const value = expression(2);
    if (token().type !== ')') throw new Error("Expected closing parenthesis ')'");
    advance();
    return value;
  });

  const parseTree = [];
  while (token().type !== '(end)') {
    parseTree.push(expression(0));
  }
  return parseTree;
}

/**
 * Evaluator
 * @param parseTree
 * @param values
 * @returns {Promise<string>}
 */
async function evaluate(parseTree, values) {
  const variables = {
    pi: Math.PI,
    e: Math.E
  };

  let args = {};

  const parseNode = async node => {
    if (node.type === 'number') return node.value;
    if (node.type === 'string') return node.value;
    else if (node.type === 'identifier') {
      const value = args.hasOwnProperty(node.value) ? args[node.value] : variables[node.value];
      if (typeof value === 'undefined') throw new Error(node.value + ' is undefined');
      return value;
    } else if (node.type === 'assign') {
      variables[node.name] = await parseNode(node.value);
    } else if (node.type === 'call') {
      for (let i = 0; i < node.args.length; i++) {
        node.args[i] = await parseNode(node.args[i]);
        if (typeof node.args[i] === 'string') {
          node.args[i] = node.args[i].replace(/^'(.*)'$/, '$1');
        }
      }

      // GETVALUE / GETVALUEESCAPE / GETVALUEUNESCAPE:
      const _name = node.name.toLowerCase().substring(1);
      if (['gvescape', 'getvalueescape', 'gvunescape', 'getvalueunescape'].indexOf(_name) !== -1) {
        node.args[1] = values;
      } else if (['gv', 'getvalue', 'gvq', 'getvaluequoted'].indexOf(_name) !== -1) {
        node.args[2] = values;
      }

      return await functions[node.name.toLowerCase().substring(1)].apply(null, node.args);
    } else if (node.type === 'function') {
      functions[node.name.toLowerCase().substring(1)] = async () => {
        for (let i = 0; i < node.args.length; i++) {
          args[node.args[i].value] = arguments[i];
        }
        const ret = await parseNode(node.value);
        args = {};
        return ret;
      };
    }
  };

  let output = '';
  for (const node of parseTree) {
    const value = await parseNode(node);
    if (typeof value !== 'undefined') {
      if (typeof value === 'string') output += value;
      else output = value;
    }
  }
  return output;
}

// Recursive Object Interpreter:
class interpreter {
  static globalValues = {};

  static async interpret(inputObject, objParams, options, globalValues) {
    let params;
    if (options?.maxSize && sizeof(inputObject) > options.maxSize) {
      return inputObject;
    }

    if (objParams && Object.keys(objParams).length !== 0) {
      if (!objParams.objParamsIsReplaced) {
        objParams.objParamsReplaced = await this.interpret(objParams, {}, options, globalValues);
        objParams.objParamsIsReplaced = true;
        params = objParams.objParamsReplaced;
      } else {
        params = objParams.objParamsReplaced;
      }
    }

    if (!options?.ignoreGlobalValues) {
      if (globalValues) {
        Object.assign(this.globalValues, globalValues);
        params = await this._addGlobalValuesToObjParams(params, this.globalValues);
      } else if (this.globalValues) {
        params = await this._addGlobalValuesToObjParams(params, this.globalValues);
      }
    }

    if (typeof inputObject === 'string') {
      const res = await this._interpretSecure(objParams, inputObject, params, options);
      return res;
    } else if (inputObject instanceof Array) {
      const promArr = [];
      for (const item of inputObject) {
        promArr.push(await this.interpret(item, objParams, options, globalValues));
      }
      return await Promise.all(promArr);
    } else if (inputObject instanceof Object) {
      const keys = Object.keys(inputObject);
      const resObject = {};

      for (const key of keys) {
        const _value = await this.interpret(inputObject[key], objParams, options, globalValues);
        const _key = await this._interpretSecure(objParams, key, params, options);
        resObject[_key] = _value;
      }
      return resObject;
    } else {
      return inputObject;
    }
  }

  static async _addGlobalValuesToObjParams(objParams, globalValues) {
    const rw_options = {
      ignoreGlobalValues: true
    };
    const gvs = globalValues;
    let res = {};

    if (Array.isArray(gvs)) {
      for (const gv of gvs) {
        const keymaster = Object.keys(gv)[0];
        const valueObjects = gv[keymaster];
        const keysValueObjects = Object.keys(valueObjects);

        for (const valueKey of keysValueObjects) {
          const intialValue = gv[keymaster][valueKey];

          if (intialValue instanceof Object) {
            if (intialValue.format === 'text') {
              if (intialValue.value instanceof Array) {
                let i = intialValue.value.length;
                let finalValue = '';

                for (const initValue of intialValue.value) {
                  i--;
                  const rtext = initValue;

                  const quotechar = intialValue.quotechar || '';
                  const delimiter = intialValue.delimiter || '';

                  if (i !== 0) {
                    finalValue = finalValue + quotechar + rtext + quotechar + delimiter;
                  } else {
                    finalValue = finalValue + quotechar + rtext + quotechar;
                  }
                }

                res[keymaster + '_' + valueKey] = finalValue;
              } else {
                const value = intialValue.value;
                res[keymaster + '_' + valueKey] = value;
              }
            } else if (intialValue.format === 'json') {
              res[keymaster + '_' + valueKey] = await this._interpretSecure(
                objParams,
                JSON.stringify(intialValue.value),
                objParams,
                rw_options
              );
            } else if (!intialValue.format) {
              res[keymaster + '_' + valueKey] = intialValue;
            }
          } else {
            res[keymaster + '_' + valueKey] = intialValue;
          }
        }
      }
    } else if (gvs instanceof Object) {
      const keysValueObjects = Object.keys(gvs);
      for (const valueKey of keysValueObjects) {
        const intialValue = gvs[valueKey];

        if (intialValue instanceof Object) {
          if (intialValue.format === 'text') {
            if (intialValue.value instanceof Array) {
              let i = intialValue.value.length;
              let finalValue = '';

              for (const initValue of intialValue.value) {
                i--;
                const rtext = initValue;

                const quotechar = intialValue.quotechar || '';
                const delimiter = intialValue.delimiter || '';

                if (i !== 0) {
                  finalValue = finalValue + quotechar + rtext + quotechar + delimiter;
                } else {
                  finalValue = finalValue + quotechar + rtext + quotechar;
                }
              }

              res[valueKey] = finalValue;
            } else {
              const value = intialValue.value;
              res[valueKey] = value;
            }
          } else if (intialValue.format === 'json') {
            res[valueKey] = await this._interpretSecure(
              objParams,
              JSON.stringify(intialValue.value),
              objParams,
              rw_options
            );
          } else if (!intialValue.format) {
            res[valueKey] = intialValue;
          }
        } else {
          res[valueKey] = intialValue;
        }
      }
    }

    Object.assign(res, objParams);
    return res;
  }

  static async _interpretSecure(objParams, inputObject, params, options) {
    try {
      const interpret_res = await interpret(inputObject, params);
      return interpret_res;
    } catch (err) {
      let msg = '';
      if (objParams?.CHAIN_ID) {
        msg = 'CHAIN: ' + objParams.CHAIN_ID;
      } else if ('' + objParams?.PROCESS_ID) {
        msg = ' PROCESS: ' + objParams?.PROCESS_ID;
      }
      throw new Error(`Interpreter: ${msg}: ${err} IN: ${inputObject}`);
    }
  }
}

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: interpreter
});

module.exports = interpreter;
