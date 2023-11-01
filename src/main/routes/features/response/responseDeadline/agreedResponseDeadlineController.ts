import {NextFunction, Request, Response, Router} from 'express';
import {AgreedResponseDeadline} from '../../../../common/form/models/agreedResponseDeadline';
import {
  AGREED_TO_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {ResponseDeadlineService} from '../../../../services/features/response/responseDeadlineService';
import {generateRedisKey, getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {deadLineGuard} from '../../../../routes/guards/deadLineGuard';
import {AppRequest} from 'common/models/AppRequest';

const responseDeadlineService = new ResponseDeadlineService();
const agreedResponseDeadlineViewPath = 'features/response/responseDeadline/agreed-response-deadline';
const agreedResponseDeadlineController = Router();

agreedResponseDeadlineController
  .get(
    AGREED_TO_MORE_TIME_URL, deadLineGuard, async (req: Request, res: Response, next: NextFunction) => {
      const backLink = constructResponseUrlWithIdParams(req.params.id, RESPONSE_DEADLINE_OPTIONS_URL);
      try {
        const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
        const agreedResponseDeadline = responseDeadlineService.getAgreedResponseDeadline(claim);
        res.render(agreedResponseDeadlineViewPath, {
          form: new GenericForm(agreedResponseDeadline),
          today: new Date(),
          claimantName: claim.getClaimantFullName(),
          backLink,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    AGREED_TO_MORE_TIME_URL, deadLineGuard, async (req, res, next: NextFunction) => {
      const {year, month, day} = req.body;
      const redisKey = generateRedisKey(<AppRequest>req);
      const backLink = constructResponseUrlWithIdParams(req.params.id, RESPONSE_DEADLINE_OPTIONS_URL);
      try {
        const claim = await getCaseDataFromStore(redisKey);
        const originalResponseDeadline = claim?.respondent1ResponseDeadline;
        const agreedResponseDeadlineDate = new AgreedResponseDeadline(year, month, day, originalResponseDeadline);
        const form: GenericForm<AgreedResponseDeadline> = new GenericForm<AgreedResponseDeadline>(agreedResponseDeadlineDate);
        await form.validate();

        if (form.hasErrors()) {
          res.render(agreedResponseDeadlineViewPath, {
            form,
            today: new Date(),
            claimantName: claim.getClaimantFullName(),
            backLink,
          });
        } else {
          await responseDeadlineService.saveAgreedResponseDeadline(redisKey, agreedResponseDeadlineDate.date);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, NEW_RESPONSE_DEADLINE_URL));
        }
      } catch (error) {
        next(error);
      }
    });

export default agreedResponseDeadlineController;
