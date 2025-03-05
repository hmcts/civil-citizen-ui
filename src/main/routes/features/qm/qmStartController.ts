import {Request, RequestHandler, Response, Router} from "express";
import {BACK_URL, CANCEL_URL, QM_BASE_START_PAGE} from 'routes/urls';

const qmStartController = Router();
const qmStartViewPath = 'features/qm/qm-questions-template.njk';

const renderView = (res: Response, req: Request)=> {
  const cancelUrl = CANCEL_URL
    .replace(':id', 'claimId')
    .replace(':propertyName', 'generalApplication');
  const backLinkUrl = BACK_URL;
  res.render(qmStartViewPath, {
    cancelUrl,
    backLinkUrl,
    pageTitle: 'title',
    title:'title',
    caption: 'caption',
  });
};

qmStartController.get(QM_BASE_START_PAGE, (async (req, res ,next) => {
  try {
    //todo add redis key
    renderView(res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmStartController;
