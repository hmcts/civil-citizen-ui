import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL,
  CONFIRM_YOU_HAVE_BEEN_PAID_URL,
  DASHBOARD_CLAIMANT_URL, VIEW_THE_JUDGMENT_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {t} from 'i18next';
import {getClaimById} from 'modules/utilityService';
import {DateYouHaveBeenPaidForm} from 'form/models/judmentOnline/confirmYouHaveBeenPaidForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {DateConverter} from 'common/utils/dateConverter';
import {CuiJudgmentPaidInFull} from 'models/judgmentOnline/cuiJudgmentPaidInFull';
import {toCCDjudgmentPaidInFull} from 'services/translation/judgmentOnline/convertToCCDjudgmentPaidInFull';
import {JudgmentOnline} from 'models/judgmentOnline/judgmentOnline';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const confirmYouHaveBeenPaidViewPath = 'features/judgmentOnline/confirm-you-have-been-paid';
const confirmYouHaveBeenPaidController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const getSupportLinks = (lng: string, claimId: string) => {
  const iWantToTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.I_WANT_TO', { lng });
  const iWantToLinks = [
    { text: t('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.JUDGMENT_LINK', { lng }), url: VIEW_THE_JUDGMENT_URL.replace(':id', claimId) },
  ];
  return [iWantToTitle, iWantToLinks] as const;
};

function renderView(form: GenericForm<DateYouHaveBeenPaidForm>, res: Response, lang: string, cancelUrl: string, claimId: string) {
  const [iWantToTitle, iWantToLinks] = getSupportLinks(lang, claimId);
  const dashboardUrl = cancelUrl;

  res.render(
    confirmYouHaveBeenPaidViewPath, {
      pageTitle: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.PAGE_TITLE',
      dashboardUrl,
      form,
      iWantToTitle,
      iWantToLinks,
      cancelUrl,
    },
  );
}

confirmYouHaveBeenPaidController.get(CONFIRM_YOU_HAVE_BEEN_PAID_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const isClaimant = claim.isClaimant();
    await deleteDraftClaimFromStore(claimId);
    const cancelUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

    const form = new GenericForm(new DateYouHaveBeenPaidForm());
    if (isClaimant) {
      renderView(form, res, lang, cancelUrl, claimId);
    } else {
      throw new Error(t('ERRORS.SOMETHING_WENT_WRONG'));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

confirmYouHaveBeenPaidController.post(CONFIRM_YOU_HAVE_BEEN_PAID_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const isClaimant = claim.isClaimant();
    const {year, month, day, confirmed} = req.body;
    const joIssuedDate = claim.joJudgementByAdmissionIssueDate != null ? claim.joJudgementByAdmissionIssueDate : claim.joDJCreatedDate;
    const form = new GenericForm(new DateYouHaveBeenPaidForm(year, month, day, confirmed, joIssuedDate));
    await form.validate();

    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const cancelUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
    if (isClaimant) {
      if (form.hasErrors()) {
        renderView(form, res, lang, cancelUrl, claimId);
        return;
      } else {
        const judgmentOnline = new JudgmentOnline();
        const judgmentPaidInFull = new CuiJudgmentPaidInFull;
        judgmentPaidInFull.dateOfFullPaymentMade = DateConverter.convertToDate(year, month, day);
        judgmentPaidInFull.confirmFullPaymentMade = confirmed;
        judgmentOnline.joJudgmentPaidInFull = judgmentPaidInFull;
        const claimUpdate = toCCDjudgmentPaidInFull(judgmentOnline);
        await civilServiceClient.submitJudgmentPaidInFull(claimId, claimUpdate, req);
        await deleteDraftClaimFromStore(claimId);
        res.redirect(constructResponseUrlWithIdParams(claimId, CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL));
      }
    } else {
      throw new Error(t('ERRORS.SOMETHING_WENT_WRONG'));
    }
  } catch (error) {
    next(error);
  }

})as RequestHandler);

export default confirmYouHaveBeenPaidController;
