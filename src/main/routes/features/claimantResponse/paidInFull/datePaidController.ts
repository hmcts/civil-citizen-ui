import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DATE_PAID_CONFIRMATION_URL, DATE_PAID_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const claimantResponsePropertyName = 'datePaid';
const datePaidViewPath = 'features/claimantResponse/paidInFull/date-paid';
const datePaidViewController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(form: GenericForm<CitizenDate>, res: Response): void {
  res.render(datePaidViewPath, {
    form, today: new Date(),
    pageTitle: 'PAGES.CLAIMANT_SETTLE_DATE.PAGE_TITLE'});
}

datePaidViewController.get(DATE_PAID_URL, (async (req: Request,res: Response,next: NextFunction) => {
  try {
    const form: ClaimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    renderView(new GenericForm<CitizenDate>(form.datePaid),res);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

datePaidViewController.post(DATE_PAID_URL, (async (req: Request,res: Response,next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const {year, month, day} = req.body;
    const form = new GenericForm(new CitizenDate(day,month,year));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form,res);
    } else {
      const redisKey = generateRedisKey(req as unknown as AppRequest);
      await saveClaimantResponse(redisKey, form.model, claimantResponsePropertyName);
      const claim = await getCaseDataFromStore(redisKey);
      const ccdTranslatedClaimSettledDate = { 'applicant1ClaimSettledDate': claim?.claimantResponse?.datePaid?.date};
      await civilServiceClient.submitClaimSettled(claimId, ccdTranslatedClaimSettledDate , <AppRequest>req);
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(constructResponseUrlWithIdParams(claimId, DATE_PAID_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default datePaidViewController;
