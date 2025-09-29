import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CITIZEN_TIMELINE_URL, RESPONSE_YOUR_DEFENCE_URL} from '../../urls';
import {saveYourDefence} from 'services/features/response/yourDefenceService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {Defence} from 'form/models/defence';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const yourDefenceViewPath = 'features/response/your-defence';
const yourDefenceController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('yourDefenceController');

yourDefenceController.get(RESPONSE_YOUR_DEFENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
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
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const defence = new Defence(req.body.text);
    const form = new GenericForm(defence);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(yourDefenceViewPath, {
        form,
        claimantName: claim.getClaimantFullName(),
      });
    } else {
      await saveYourDefence(claim, redisKey, defence);
      res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    logger.error(`Error when getting your defence, req.params.claimId  ${ req.params.claimId } -  ${error}`);
    next(error);
  }
}) as RequestHandler);

export default yourDefenceController;
