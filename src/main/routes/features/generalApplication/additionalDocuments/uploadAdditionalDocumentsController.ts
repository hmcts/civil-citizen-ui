import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL } from 'routes/urls';
import multer from 'multer';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { TypeOfDocumentSectionMapper } from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import { getClaimById } from 'modules/utilityService';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { generateRedisKey, saveDraftClaim } from 'modules/draft-store/draftStoreService';
import { SummarySection, summarySection } from 'common/models/summaryList/summarySections';
import { summaryRow } from 'common/models/summaryList/summaryList';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

const uploadAdditionalDocumentsController = Router();
const viewPath = 'features/generalApplication/additionalDocuments/upload-additional-documents';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);
const fileSize = Infinity;
const upload = multer({
    limits: {
        fileSize: fileSize,
    },
});

uploadAdditionalDocumentsController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
    console.log(req.params)
    const { gaId, id } = req.params
    const uploadedDocument =
        new UploadAdditionalDocument();
    let form = new GenericForm(uploadedDocument);
    const claim = await getClaimById(id, req, true)
    const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication)
    const formattedSummary = getSummaryList(gaApplication.uploadAdditionalDocuments, id, gaId)

    res.render(viewPath, { form, formattedSummary })

}) as RequestHandler)

uploadAdditionalDocumentsController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
    const { gaId, id } = req.params
    const currentUrl = GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', id).replace(':gaId', gaId)
    const uploadedDocument = new UploadAdditionalDocument();

    //let form = new GenericForm(uploadedDocument);
    if (req.body.action === 'uploadButton') {
        const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
        uploadedDocument.fileUpload = fileUpload;
        uploadedDocument.typeOfDocument = req.body.typeOfDocument;
        const form = new GenericForm(uploadedDocument);
        form.validateSync()
        if (!form.hasErrors()) {
            uploadedDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
            const claim = await getClaimById(id, req, true)
            const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication)
            gaApplication.uploadAdditionalDocuments.push(uploadedDocument);
            claim.generalApplication = gaApplication;
            await saveDraftClaim(generateRedisKey(req), claim);
            return res.redirect(`${currentUrl}`);
        }
        //await uploadSelectedFile(req, formattedSummary, claimId);
      
    }
    res.redirect(constructResponseUrlWithIdParams(id, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL).replace(':gaId', gaId));
}))

export const getSummaryList = (additionalDocumentsList: UploadAdditionalDocument[], claimId: string, gaId: string): SummarySection => {
    let index = 0;
    const formattedSummary = summarySection(
        {
            title: '',
            summaryRows: [],
        });
    additionalDocumentsList.forEach((uploadDocument: UploadAdditionalDocument) => {
        index = index + 1;
        formattedSummary.summaryList.rows.push(summaryRow('Type of document', uploadDocument.typeOfDocument));
        formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', `${GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', claimId).replace(':gaId', gaId)}+ '?id=' + ${index}`, 'Remove document'));
    });
    return formattedSummary
};
export default uploadAdditionalDocumentsController;