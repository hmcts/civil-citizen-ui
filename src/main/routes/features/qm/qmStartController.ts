import {Request, RequestHandler, Response, Router} from "express";
import uploadDocumentsController from "routes/features/caseProgression/uploadDocumentsController";
import {QM_BASE_START_PAGE} from "routes/urls";
import {generateRedisKey} from "modules/draft-store/draftStoreService";
import {AppRequest} from "models/AppRequest";
import {getMediationCarm} from "services/features/response/mediation/mediationService";
import {GenericForm} from "form/models/genericForm";
import {GenericYesNo} from "form/models/genericYesNo";
import {t} from "i18next";


const qmStartController = Router();
const qmStartViewPath = 'features/qm/view-qm-start';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request): void => {

  res.render(qmStartViewPath, {form, pageTitle, pageText, pageHintText, variation, isCarm: true});
};

qmStartController.get(QM_BASE_START_PAGE, (req, resn ,next) => {
  try {
    //todo add redis key
    //renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);


export default qmStartController;
