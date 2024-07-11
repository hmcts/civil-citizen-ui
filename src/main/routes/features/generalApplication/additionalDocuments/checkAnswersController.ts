import { AppRequest } from 'common/models/AppRequest';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { changeLabel } from 'common/utils/checkYourAnswer/changeButton';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { getClaimById } from 'modules/utilityService';
import config from 'config';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL } from 'routes/urls';
import { GaServiceClient } from 'client/gaServiceClient';
import { ApplicationEvent } from 'common/models/gaEvents/applicationEvent';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
const { v4: uuidv4 } = require('uuid');
const gaAdditionalDocCheckAnswerController = Router();
const viewPath = 'features/generalApplication/additionalDocuments/check-answers';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

gaAdditionalDocCheckAnswerController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const { gaId, id } = req.params
        const claim = await getClaimById(id, req, true);
        const claimIdPrettified = caseNumberPrettify(id);
        const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication)
        const cancelUrl = await getCancelUrl(id, claim);
        const backLinkUrl = GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', id).replace(':gaId', gaId)
        const summaryRows = buildSummarySection(gaApplication.uploadAdditionalDocuments, id, gaId)
        res.render(viewPath, { backLinkUrl, cancelUrl, claimIdPrettified, claim, summaryRows });
    } catch (error) {
        next(error);
    }
}) as RequestHandler)

gaAdditionalDocCheckAnswerController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
    const { gaId, id } = req.params;
    console.log(gaId);
    console.log(id);
    const claim = await getClaimById(id, req, true);
    const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    const uploadedDocuments = gaApplication.uploadAdditionalDocuments.map(doc => {
        return {
            id: uuidv4(),
            value: {
                typeOfDocument: doc.typeOfDocument,
                documentUpload: {
                    document_url: doc.caseDocument.documentLink.document_url,
                    document_binary_url: doc.caseDocument.documentLink.document_binary_url,
                    document_filename: doc.caseDocument.documentName,
                }

            }
        }
    })
    const generalApplication = {
        uploadDocument: uploadedDocuments
    };
    await gaServiceClient.submitEvent(ApplicationEvent.UPLOAD_ADDL_DOCUMENTS, gaId, generalApplication, req);
    res.redirect(GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL.replace(':id', id).replace(':gaId', gaId));
}) as RequestHandler);

const buildSummarySection = (additionalDocumentsList: UploadAdditionalDocument[], claimId: string, gaId: string) => {
    const rows: SummaryRow[] = []
    additionalDocumentsList.forEach(doc => {
        rows.push(summaryRow('Type of document', doc.typeOfDocument));
        rows.push(summaryRow('Uploaded document', doc.caseDocument.documentName, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', claimId).replace(':gaId', gaId), changeLabel('en')))
    })
    return rows;
}

export default gaAdditionalDocCheckAnswerController;