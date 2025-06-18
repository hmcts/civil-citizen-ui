import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  QM_SHARE_QUERY_CONFIRMATION,
  QUERY_MANAGEMENT_CREATE_QUERY,
} from 'routes/urls';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {ShareQueryForm} from 'form/models/queryManagement/shareQueryForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {t} from 'i18next';

const shareQueryConfirmationController = Router();
const viewPath = 'features/queryManagement/qm-share-query-confirmation.njk';

const renderView = async (lang: string, form: GenericForm<ShareQueryForm>, res: Response, claimId: string, req: AppRequest): Promise<void> => {
  const pageContent = getPageContent(lang);
  const backLinkUrl = BACK_URL;
  const cancelUrl = getCancelUrl(req.params.id);

  res.render(viewPath, {
    backLinkUrl,
    claimId,
    pageHeaders,
    pageContent,
    form,
    cancelUrl,
  });
};

const pageHeaders = {
  caption: 'PAGES.QM.HEADINGS.CAPTION',
  heading: 'PAGES.QM.SHARE_QUERY_CONFIRMATION.PAGE_HEADING',
  pageTitle: 'PAGES.QM.SHARE_QUERY_CONFIRMATION.PAGE_TITLE',
};

export const getPageContent = (lang:string) => {
  return new PageSectionBuilder()
    .addParagraph('PAGES.QM.SHARE_QUERY_CONFIRMATION.PARAGRAPH_1')
    .addSubTitle('PAGES.QM.SHARE_QUERY_CONFIRMATION.SUB_TITLE',null, 'govuk-!-font-size-24')
    .addParagraph('PAGES.QM.SHARE_QUERY_CONFIRMATION.PARAGRAPH_2')
    .addParagraph('PAGES.QM.SHARE_QUERY_CONFIRMATION.PARAGRAPH_3')
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet">
                <li>${t('PAGES.QM.SHARE_QUERY_CONFIRMATION.PRIVATE_QUERY_VALID_REASON_1', {lng: lang})}</li>
                <li>${t('PAGES.QM.SHARE_QUERY_CONFIRMATION.PRIVATE_QUERY_VALID_REASON_2', {lng: lang})}</li>
            </ul>`)
    .addFullStopLink('PAGES.QM.SHARE_QUERY_CONFIRMATION.QUERY_EMAIL_ADDRESS', 'mailto:contactocmc@justice.gov.uk', 'PAGES.QM.SHARE_QUERY_CONFIRMATION.PARAGRAPH_4', null, null, true)
    .addParagraph('PAGES.QM.SHARE_QUERY_CONFIRMATION.PARAGRAPH_5')
    .addParagraph('PAGES.QM.SHARE_QUERY_CONFIRMATION.CONFIRMATION_HEADER',null, 'govuk-!-font-weight-bold')
    .build();
};

shareQueryConfirmationController.get(QM_SHARE_QUERY_CONFIRMATION, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new ShareQueryForm());
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    await renderView(lang, form, res, claimId, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

shareQueryConfirmationController.post(QM_SHARE_QUERY_CONFIRMATION, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const {confirmed} = req.body;
    const form = new GenericForm(new ShareQueryForm(confirmed));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(lang, form, res, claimId, req);
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default shareQueryConfirmationController;

