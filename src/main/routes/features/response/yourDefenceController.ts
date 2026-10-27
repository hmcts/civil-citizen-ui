import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CITIZEN_TIMELINE_URL, RESPONSE_YOUR_DEFENCE_URL} from '../../urls';
import {saveYourDefence} from 'services/features/response/yourDefenceService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {Defence} from 'form/models/defence';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
const yourDefenceViewPath = 'features/response/your-defence';

const yourDefenceController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('yourDefenceController');

yourDefenceController.get(RESPONSE_YOUR_DEFENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(<AppRequest>req, caseId);
    const form = new GenericForm(claim);
    res.render(yourDefenceViewPath, {
      form,
      claimantName: claim.getClaimantFullName(),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

yourDefenceController.post(RESPONSE_YOUR_DEFENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const appReq = <AppRequest>req;
    const claim = await getResponseClaimById(appReq, caseId);
    const defence = new Defence(req.body.text);
    const form = new GenericForm(defence);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(yourDefenceViewPath, {
        form,
        claimantName: claim.getClaimantFullName(),
      });
    } else {
      await saveYourDefence(appReq, defence);
      res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    logger.error(`Error when getting your defence, req.params.claimId  ${ req.params.claimId } -  ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default yourDefenceController;
