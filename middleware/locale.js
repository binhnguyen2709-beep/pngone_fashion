const fs = require('fs');
const path = require('path');

const SUPPORTED_LOCALES = ['vi', 'en', 'fr', 'it', 'es', 'zh', 'ko'];

const dictionaries = {};
SUPPORTED_LOCALES.forEach((code) => {
  dictionaries[code] = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', `${code}.json`), 'utf8'));
});

module.exports = function locale(req, res, next) {
  if (SUPPORTED_LOCALES.includes(req.query.lang)) {
    res.cookie('lang', req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    req.locale = req.query.lang;
  } else if (req.cookies && SUPPORTED_LOCALES.includes(req.cookies.lang)) {
    req.locale = req.cookies.lang;
  } else {
    req.locale = 'vi';
  }

  const dict = dictionaries[req.locale];
  res.locals.locale = req.locale;
  res.locals.t = (key) => dict[key] || key;
  res.locals.field = (obj) => (obj ? obj[req.locale] || obj.en || obj.vi || '' : '');
  next();
};
