import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, GA_VIEW_APPLICATION_URL } from 'routes/urls';
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
import { translateErrors } from 'services/features/generalApplication/uploadEvidenceDocumentService';
import { t } from 'i18next';
import { Claim } from 'common/models/claim';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';

const uploadAdditionalDocumentsController = Router();
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
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
    try {
    const { gaId, id } = req.params
        const uploadedDocument = new UploadAdditionalDocument();
    let form = new GenericForm(uploadedDocument);
        const redisKey = generateRedisKey(req);
    const claim = await getClaimById(id, req, true)
    const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication)
        claim.generalApplication = gaApplication;

        if (req?.session?.fileUpload) {
            const parsedData = JSON.parse(req?.session?.fileUpload);
            form = new GenericForm(uploadedDocument, parsedData);
            req.session.fileUpload = undefined;
        }
        if (req.query?.indexId) {
            const index = req.query.indexId;
            await removeSelectedDocument(redisKey, claim, Number(index) - 1);
        }
        const cancelUrl = await getCancelUrl(id, claim);
        const backLinkUrl = `${constructResponseUrlWithIdParams(id, GA_VIEW_APPLICATION_URL)}?applicationId=${gaId}`;
    const formattedSummary = getSummaryList(gaApplication.uploadAdditionalDocuments, id, gaId)
        res.render(viewPath, { cancelUrl, backLinkUrl, form, formattedSummary })
    } catch (err) {
        next(err);
    }
}) as RequestHandler)

uploadAdditionalDocumentsController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
    const { gaId, id } = req.params
        const currentUrl = GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', id).replace(':gaId', gaId)

        const claim = await getClaimById(id, req, true)
        const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication)
        claim.generalApplication = gaApplication;
        if (req.body.action === 'uploadButton') {
            uploadSelectedFile(req, claim);
            return res.redirect(`${currentUrl}`);
        }
        if (gaApplication.uploadAdditionalDocuments.length === 0) {
            const errors = [{
                target: {
                    fileUpload: '',
                    typeOfDocument: '',
                },
                value: '',
                property: '',

                constraints: {
                    isNotEmpty: 'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE'
                },
            }]
            req.session.fileUpload = JSON.stringify(errors);
            return res.redirect(`${currentUrl}`);
    }
    res.redirect(constructResponseUrlWithIdParams(id, GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL).replace(':gaId', gaId));
    } catch (err) {
        next(err)
    }
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
        formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', `${GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', claimId).replace(':gaId', gaId)}?indexId=${index}`, 'Remove document'));
    });
    return formattedSummary
};

export const removeSelectedDocument = async (redisKey: string, claim: Claim, index: number): Promise<void> => {
    try {
        claim?.generalApplication?.uploadAdditionalDocuments?.splice(index, 1);
        await saveDraftClaim(redisKey, claim);
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const uploadSelectedFile = async (req: AppRequest, claim: Claim) => {
    const uploadedDocument = new UploadAdditionalDocument();
    const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    uploadedDocument.fileUpload = fileUpload;
    uploadedDocument.typeOfDocument = req.body.typeOfDocument;
    const form = new GenericForm(uploadedDocument);
    const uploadAdditionalDocuments = claim.generalApplication.uploadAdditionalDocuments
    form.validateSync()
    if (!form.hasErrors()) {
        uploadedDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
        uploadAdditionalDocuments.push(uploadedDocument);
        // claim.generalApplication = gaApplication;
        await saveDraftClaim(generateRedisKey(req), claim);
    } else {
        const errors = translateErrors(form.getAllErrors(), t);
        req.session.fileUpload = JSON.stringify(errors);
    }
}
export default uploadAdditionalDocumentsController;