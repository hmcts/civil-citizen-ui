import {BACK_URL, DASHBOARD_URL, GA_SUBMIT_OFFLINE} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {RequestHandler, Response, Router} from 'express';
import {t} from 'i18next';
import {applicationNoticeUrl} from 'common/utils/externalURLs';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {getClaimById} from 'modules/utilityService';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
const submitApplicationOfflineController = Router();
const submitApplicationOffline = 'features/generalApplication/submit-application-offline';

submitApplicationOfflineController.get(GA_SUBMIT_OFFLINE, (  async (req: AppRequest, res: Response) => {
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimId = req.params.id;
  const claim = await getClaimById(claimId, req, true);
  const isQmLipEnabled = await isQueryManagementEnabled(claim.submittedDate);
  const backUrl:string = isQmLipEnabled ? BACK_URL: DASHBOARD_URL;
  res.render(submitApplicationOffline,{
    pageContent: getSummaryPageContent(lng),
    backLinkUrl: backUrl,
  });
})as RequestHandler);

export const getSummaryPageContent = (lng: string) => {
  const welshTranslationSummary = t('PAGES.GENERAL_APPLICATION.SUBMIT_APPLICATION_OFFLINE.SUMMARY', { lng });
  const linkForN244Form = `<a href="${applicationNoticeUrl}" target="_blank" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.SUBMIT_APPLICATION_OFFLINE.N244_LINK', { lng })}</a>`;
  return new PageSectionBuilder()
    .addTitle('PAGES.GENERAL_APPLICATION.SUBMIT_APPLICATION_OFFLINE.TITLE')
    .addRawHtml(`<p class="govuk-body">${welshTranslationSummary.replace('N244_LINK', linkForN244Form)}</p>`)
    .build();
};

export default submitApplicationOfflineController;
