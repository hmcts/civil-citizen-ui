import {BACK_URL, ROOT_URL} from 'routes/urls';
import {RequestHandler, Router} from 'express';
import {AppRequest} from 'models/AppRequest';

const backController = Router();

backController.get(BACK_URL, (async (req: AppRequest, res, next) => {
  try {
    if (req.session.history.length > 1) {
      req.session.history.pop(); // Remove current page
      const previousUrl = req.session.history.pop(); // Get previous page
      res.redirect(previousUrl || ROOT_URL);
    } else {
      res.redirect(ROOT_URL);
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default backController;
