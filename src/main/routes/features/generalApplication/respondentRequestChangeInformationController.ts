import {NextFunction, RequestHandler, Response, Router} from 'express';
import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {GA_RESPONDENT_INFORMATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';

const respondentRequestChangeInformationController = Router();
const viewPath = 'features/generalApplication/respondent-request-change-information';
const backLinkUrl = 'test'; // TODO: add url

respondentRequestChangeInformationController.get(GA_RESPONDENT_INFORMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const contentList = getUploadFormContent(lng);
    res.render(viewPath, {
      cancelUrl,
      backLinkUrl,
      contentList,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getUploadFormContent = (lng: string) => {
  return new PageSectionBuilder()
    .addParagraph('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.OTHER_PARTY_REQUEST')
    .addParagraph('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.REQUEST_BY_APPLICATION')
    .addParagraph('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.INCLUDE_APPLICATION')
    .addTitle('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.WHAT_TO_DO_NEXT')
    .addRawHtml(`<ul class="govuk-list govuk-list--number">
            <li>${t('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.REVIEW_APPLICATION', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.CLICK_RESPOND', {lng})}</li>
          </ul>`)
    .addParagraph('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.SENT_TO_JUDGE')
    .addStartButton('COMMON.BUTTONS.START_NOW','test')
    .build();
};

export default respondentRequestChangeInformationController;
