import {app} from '../../app';

export const setLanguage = function (req: any, res: any, next: any) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  app.locals.lang = lang;
  next();
};

export const getLanguage = () => {
  const lang = app.locals.lang;
  return lang;
};
