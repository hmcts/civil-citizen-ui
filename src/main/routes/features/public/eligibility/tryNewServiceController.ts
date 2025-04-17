import {RequestHandler, Response, Router} from 'express';
import {
  BASE_ELIGIBILITY_URL,
  MAKE_CLAIM,
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {makeAClaimUrl} from 'common/utils/externalURLs';

const tryNewServiceController = Router();
const pageTitle= 'PAGES.TRY_NEW_SERVICE.PAGE_TITLE';

tryNewServiceController.get([BASE_ELIGIBILITY_URL, MAKE_CLAIM], (async (req: AppRequest, res: Response) => {
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  const userId = req.session?.user?.id;
  if(req.cookies['eligibilityCompleted'] && userId) {
    return res.redirect(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
  }
  res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL, pageContent: pageContent(lng), pageTitle});
}) as RequestHandler);

const pageContent = (lng: string) => {
  const makeClaim = t('PAGES.TRY_NEW_SERVICE.CLAIM_INTEREST', { lng });
  const makeClaimUrl = `<a href="${makeAClaimUrl}" target="_blank">${t('PAGES.TRY_NEW_SERVICE.MAKE_A_CLAIM', { lng })}</a>`;
  return new PageSectionBuilder()
    .addMainTitle('PAGES.TRY_NEW_SERVICE.TITLE')
    .addParagraph('PAGES.TRY_NEW_SERVICE.WE_ARE_BUILDING')
    .addParagraph('PAGES.TRY_NEW_SERVICE.YOU_WILL_BE_ASKED')
    .addRawHtml(`<p class="govuk-body"><strong><u>${t('PAGES.TRY_NEW_SERVICE.CLAIM_TITLE', {lng})}</u></strong> ${makeClaim.replace('MAKE_A_CLAIM', makeClaimUrl)}</p><br>`).build();
};

export default tryNewServiceController;
