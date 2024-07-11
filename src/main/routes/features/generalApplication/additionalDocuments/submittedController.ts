import { AppRequest } from 'common/models/AppRequest';
import { getLng } from 'common/utils/languageToggleUtils';
import { NextFunction, Response, Router } from 'express';
import { deleteDraftClaimFromStore, generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL } from 'routes/urls';
import { PaymentSuccessfulSectionBuilder } from 'services/features/claim/paymentSuccessfulSectionBuilder';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';

const additionalDocSubmittedController = Router();
const viewPath = 'features/generalApplication/additionalDocuments/submitted'
additionalDocSubmittedController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const { id } = req.params
    const claim = await getClaimById(id, req, true);
    const redisKey = generateRedisKey(req);
    await deleteDraftClaimFromStore(redisKey);
    res.render(viewPath, {
        gaPaymentSuccessfulPanel: getContentForPanel(lng),
        gaPaymentSuccessfulBody: getContentForBody(lng),
        gaPaymentSuccessfulButton: getContentForCloseButton(await getCancelUrl(id, claim)),
    })
})


const getContentForPanel = (lng: string) => {
    const panelBuilder = new PaymentSuccessfulSectionBuilder();
    panelBuilder.addPanelForConfirmation('PAGES.GENERAL_APPLICATION.ADDITIONAL_DOCUMENTS.UPLOADED_ADDITIONAL_DOCS', getLng(lng));
    return panelBuilder.build();
}

const getContentForBody = (lng: string) => {
    let contentBuilder = new PaymentSuccessfulSectionBuilder();
    return contentBuilder.addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT', { lng: getLng(lng) })
        .addParagraph('PAGES.GENERAL_APPLICATION.ADDITIONAL_DOCUMENTS.JUDGE_WILL_REVIEW', { lng: getLng(lng) })
        .build();
}

const getContentForCloseButton = (redirectUrl: string) => {
    return new PaymentSuccessfulSectionBuilder()
        .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', redirectUrl)
        .build();
}

export default additionalDocSubmittedController;