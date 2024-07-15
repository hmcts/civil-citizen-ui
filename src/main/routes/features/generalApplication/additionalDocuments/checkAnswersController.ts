import { ApplicationEvent } from 'common/models/gaEvents/applicationEvent';
import { AppRequest } from 'common/models/AppRequest';
import { buildSummarySectionForAdditionalDoc, getClaimDetailsById, prepareCCDData } from 'services/features/generalApplication/additionalDocumentService';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL } from 'routes/urls';
import { GaServiceClient } from 'client/gaServiceClient';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import config from 'config';

const gaAdditionalDocCheckAnswerController = Router();
const viewPath = 'features/generalApplication/additionalDocuments/check-answers';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

gaAdditionalDocCheckAnswerController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const { gaId, id: claimId } = req.params
        const claimIdPrettified = caseNumberPrettify(claimId);
        const claim = await getClaimDetailsById(req);
        const cancelUrl = await getCancelUrl(claimId, claim);
        const backLinkUrl = GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', claimId).replace(':gaId', gaId)
        const summaryRows = buildSummarySectionForAdditionalDoc(claim.generalApplication.uploadAdditionalDocuments, claimId, gaId)
        res.render(viewPath, { backLinkUrl, cancelUrl, claimIdPrettified, claim, summaryRows });
    } catch (error) {
        next(error);
    }
}) as RequestHandler)

gaAdditionalDocCheckAnswerController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const { gaId, id: claimId } = req.params;
        const claim = await getClaimDetailsById(req);
        const uploadedDocuments = prepareCCDData(claim.generalApplication.uploadAdditionalDocuments);
        const generalApplication = {
            uploadDocument: uploadedDocuments
        };
        await gaServiceClient.submitEvent(ApplicationEvent.UPLOAD_ADDL_DOCUMENTS, gaId, generalApplication as unknown, req);
        res.redirect(GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL.replace(':id', claimId).replace(':gaId', gaId));
    } catch (error) {
        next(error);
    }
}) as RequestHandler);


export default gaAdditionalDocCheckAnswerController;