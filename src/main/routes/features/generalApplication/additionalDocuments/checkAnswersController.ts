import { AppRequest } from 'common/models/AppRequest';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { changeLabel } from 'common/utils/checkYourAnswer/changeButton';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { getClaimById } from 'modules/utilityService';
import config from 'config';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL } from 'routes/urls';
import { GaServiceClient } from 'client/gaServiceClient';
import { ApplicationEvent } from 'common/models/gaEvents/applicationEvent';

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
        // const formattedSummary = getSummaryList(gaApplication.uploadAdditionalDocuments, id, gaId)
        //  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
        const summaryRows = buildSummarySection(gaApplication.uploadAdditionalDocuments, id, gaId)
        res.render(viewPath, { claimIdPrettified, claim, summaryRows });
    } catch (error) {
        next(error);
    }
}) as RequestHandler)

gaAdditionalDocCheckAnswerController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {

    const { gaId, id } = req.params;
    console.log(gaId);
    const claim = await getClaimById(id, req, true);
    const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    const uploadedDocuments = gaApplication.uploadAdditionalDocuments.map(doc => {

        return {
            documentType: doc.typeOfDocument,
            additionalDocument: {
                documentUrl: doc.caseDocument.documentLink.document_url,
                documentBinaryUrl: doc.caseDocument.documentLink.document_binary_url,
                documentFileName: doc.caseDocument.documentName,
            }
        }

    })
    const data = await gaServiceClient.submitEvent(ApplicationEvent.UPLOAD_ADDL_DOCUMENTS, gaId, { uploadDocument: uploadedDocuments }, req);
    console.log(data);

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