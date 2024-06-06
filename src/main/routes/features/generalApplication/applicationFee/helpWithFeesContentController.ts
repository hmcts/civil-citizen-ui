import {Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  GA_APPLY_HELP_WITH_FEE_REFERENCE,
  GA_APPLY_HELP_WITH_FEES,
  GA_APPLY_HELP_WITH_FEES_START,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const applyHelpWithFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-content';
const helpWithFeesContentController: Router = Router();

helpWithFeesContentController.get(GA_APPLY_HELP_WITH_FEES_START, (async (req: AppRequest, res: Response) => {
  const claimId = req.params.id;
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_APPLY_HELP_WITH_FEES);
  res.render(applyHelpWithFeeViewPath,
    {
      redirectUrl,
      backLinkUrl,
      applyHelpWithFeeContents:getHelpWithApplicationFeeContent(claimId),
    });
}) as RequestHandler);

helpWithFeesContentController.post(GA_APPLY_HELP_WITH_FEES_START, (async (req: AppRequest | Request, res: Response) => {
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_REFERENCE));
})as RequestHandler);

const getHelpWithApplicationFeeContent = (claimId: string) => {
  const nextPageUrl = GA_APPLY_HELP_WITH_FEE_REFERENCE.replace(':id', claimId);
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
    .addMainTitle('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_IF')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_INSTEAD')
    .addParagraph('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.APPLICATION_FEE_PARAGRAPH_DURING')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_ONCE')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.LINK','https://www.gov.uk/get-help-with-court-fees','','','',true)
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', nextPageUrl,false, dashBoardClaimantUrl).build();
};
export default helpWithFeesContentController;
