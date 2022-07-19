import express from 'express';
import {AgreedResponseDeadline} from '../../../common/form/models/agreedResponseDeadline';
import {
  AGREED_T0_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {ResponseDeadlineService} from '../../../services/features/response/responseDeadlineService';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';

const responseDeadlineService = new ResponseDeadlineService();
const agreedResponseDeadlineViewPath = 'features/response/agreed-response-deadline';
const agreedResponseDeadlineController = express.Router();
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);
let claim: Claim;


agreedResponseDeadlineController
  .get(
    AGREED_T0_MORE_TIME_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      // TODO : revist
      const backLink = constructResponseUrlWithIdParams(req.params.id, RESPONSE_DEADLINE_OPTIONS_URL);
      try {
        claim = await getCaseDataFromStore(req.params.id);
        const agreedResponseDeadline = responseDeadlineService.getAgreedResponseDeadline(claim);
        res.render(agreedResponseDeadlineViewPath, {
          form: new GenericForm(agreedResponseDeadline),
          nextMonth: nextMonth,
          claimantName : claim.getClaimantName(),
          backLink,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    AGREED_T0_MORE_TIME_URL, async (req, res, next: express.NextFunction) => {
      const backLink = constructResponseUrlWithIdParams(req.params.id, RESPONSE_DEADLINE_OPTIONS_URL);
      const originalResponseDeadline = claim?.respondent1ResponseDeadline;
      const {year, month, day} = req.body;
      const agreedResponseDeadlineDate = new AgreedResponseDeadline(year, month, day, originalResponseDeadline);
      const form: GenericForm<AgreedResponseDeadline> = new GenericForm<AgreedResponseDeadline>(agreedResponseDeadlineDate);
      await form.validate();

      if (form.hasErrors()) {
        res.render(agreedResponseDeadlineViewPath, {
          form: form,
          nextMonth: nextMonth,
          claimantName: claim.getClaimantName(),
          backLink,
        });
      } else {
        try {
          await responseDeadlineService.saveAgreedResponseDeadline(req.params.id, agreedResponseDeadlineDate.date);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, NEW_RESPONSE_DEADLINE_URL,
));
        } catch (error) {
          next(error);
        }
      }
    });

export default agreedResponseDeadlineController;