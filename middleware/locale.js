const fs = require('fs');
const path = require('path');

const dictionaries = {
  vi: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'vi.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'en.json'), 'utf8'))
};

module.exports = function locale(req, res, next) {
  if (req.query.lang === 'vi' || req.query.lang === 'en') {
    res.cookie('lang', req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    req.locale = req.query.lang;
  } else {
    req.locale = req.cookies && req.cookies.lang === 'en' ? 'en' : 'vi';
  }

  const dict = dictionaries[req.locale];
  res.locals.locale = req.locale;
  res.locals.t = (key) => dict[key] || key;
  res.locals.field = (obj) => (obj ? obj[req.locale] || obj.vi || obj.en || '' : '');
  next();
};
