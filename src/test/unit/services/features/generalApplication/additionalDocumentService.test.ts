import { CivilServiceClient } from 'client/civilServiceClient';
import { AppRequest, AppSession } from 'common/models/AppRequest';
import { FileUpload } from 'common/models/caseProgression/fileUpload';
import { Claim } from 'common/models/claim';
import { CaseDocument } from 'common/models/document/caseDocument';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { summaryRow } from 'common/models/summaryList/summaryList';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import { generateRedisKey, saveDraftClaim } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL } from 'routes/urls';
import { TypeOfDocumentSectionMapper } from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {
  buildSummarySectionForAdditionalDoc, canUploadAddlDoc,
  getClaimDetailsById,
  getContentForBody,
  getContentForCloseButton,
  getContentForPanel,
  getSummaryList,
  prepareCCDData,
  removeSelectedDocument,
  uploadSelectedFile,
} from 'services/features/generalApplication/additionalDocumentService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {ApplicationState} from 'models/generalApplication/applicationSummary';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('additionalDocumentService');

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));
jest.mock('../../../../../main/modules/draft-store/draftStoreService', () => ({
  saveDraftClaim: jest.fn(),
  generateRedisKey: jest.fn(),
}));
jest.mock('../../../../../main/modules/utilityService');
jest.mock('i18next', () => ({
  t: jest.fn((key) => key),
}));
jest.mock('../../../../../main/services/features/caseProgression/TypeOfDocumentSectionMapper', () => ({
  TypeOfDocumentSectionMapper: {
    mapToSingleFile: jest.fn(),
  },
}));
jest.mock('../../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  isConfirmYouPaidCCJAppType: jest.fn(),
}));

describe('Additional Documents Service', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    jest.clearAllMocks();
  });
  describe('uploadSelectedFile', () => {
    it('should upload file and save draft claim if no errors', async () => {
      const req = {
        body: { typeOfDocument: 'Type1' },
        session: {} as AppSession,
      } as unknown as AppRequest;
      const fileUpload = { name: 'file' };
      const uploadedDocument = {
        documentName: 'Document1',
        createdBy: 'User1',
        documentLink: { document_url: 'url', document_filename: 'filename', document_binary_url: 'binaryUrl' },
        documentType: null,
        documentSize: 123,
      } as CaseDocument;
      (TypeOfDocumentSectionMapper.mapToSingleFile as jest.Mock).mockReturnValue(fileUpload);
      const mockValue = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValue(uploadedDocument as unknown as CaseDocument);

      await uploadSelectedFile(req, claim as Claim);

      expect(TypeOfDocumentSectionMapper.mapToSingleFile).toHaveBeenCalledWith(req);
      expect(mockValue).toHaveBeenCalledWith(req, fileUpload);
      expect(claim.generalApplication.uploadAdditionalDocuments).toHaveLength(1);
      expect(saveDraftClaim).toHaveBeenCalledWith(generateRedisKey(req), claim);
    });

    it('should set errors in session if validation fails', async () => {
      const req = {
        body: { typeOfDocument: 'Type1' },
        session: { fileUpload: undefined } as AppSession,
      } as unknown as AppRequest;

      (TypeOfDocumentSectionMapper.mapToSingleFile as jest.Mock).mockReturnValue(undefined);

      await uploadSelectedFile(req, claim);

      expect(req.session.fileUpload).toBeDefined();
    });
  });
  describe('getSummaryList', () => {
    it('should generate a summary list', () => {
      const additionalDocumentsList: UploadAdditionalDocument[] = [
        {
          typeOfDocument: 'Type1',
          caseDocument: {
            documentName: 'Document1',
            createdBy: 'User1',
            documentLink: { document_url: 'ur1', document_filename: 'filename1', document_binary_url: 'binaryUrl1' },
            documentType: null,
            documentSize: 123,
          } as CaseDocument,
          fileUpload: {} as FileUpload,
        },
        {
          typeOfDocument: 'Type2',
          caseDocument: {
            documentName: 'Document2',
            createdBy: 'User2',
            documentLink: { document_url: 'ur2', document_filename: 'filename2', document_binary_url: 'binaryUrl2' },
            documentType: null,
            documentSize: 123,
          } as CaseDocument,
          fileUpload: {} as FileUpload,
        },
      ];
      const claimId = '1';
      const gaId = '2';

      const result = getSummaryList(additionalDocumentsList, claimId, gaId, undefined);

      expect(result.summaryList.rows).toHaveLength(4);
      expect(result.summaryList.rows[0]).toEqual(summaryRow('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', 'Type1'));
      expect(result.summaryList.rows[1]).toEqual(summaryRow('Document1', '', `${constructResponseUrlWithIdAndAppIdParams(claimId, gaId,GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL)}?indexId=1`, 'Remove document'));
    });
  });

  describe('buildSummarySectionForAdditionalDoc', () => {
    it('should generate additional summary list', () => {
      const additionalDocumentsList: UploadAdditionalDocument[] = [
        {
          typeOfDocument: 'Type1',
          caseDocument: {
            documentName: 'Document1',
            createdBy: 'User1',
            documentLink: { document_url: 'ur1', document_filename: 'filename1', document_binary_url: 'binaryUrl1' },
            documentType: null,
            documentSize: 123,
          } as CaseDocument,
          fileUpload: {} as FileUpload,
        },
        {
          typeOfDocument: 'Type2',
          caseDocument: {
            documentName: 'Document2',
            createdBy: 'User2',
            documentLink: { document_url: 'ur2', document_filename: 'filename2', document_binary_url: 'binaryUrl2' },
            documentType: null,
            documentSize: 123,
          } as CaseDocument,
          fileUpload: {} as FileUpload,
        },
      ];
      const claimId = '1';
      const gaId = '2';

      const result = buildSummarySectionForAdditionalDoc(additionalDocumentsList, claimId, gaId, undefined);

      expect(result).toHaveLength(4);
      expect(result[0].key.text).toContain('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT');
      expect(result[1].key.text).toContain('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_DOCUMENT_UPLOADED');
    });
  });

  describe('getClaimDetailsById', () => {
    it('should retrieve and return claim details', async () => {
      const req: AppRequest = {
        params: { id: '1' },
      } as unknown as AppRequest;
      claim.generalApplication = undefined;
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      const result = await getClaimDetailsById(req);

      expect(result.generalApplication.uploadAdditionalDocuments).toEqual([]);
      expect(getClaimById).toHaveBeenCalledWith(req.params.id, req, true);
    });
  });
  describe('prepareCCDData', () => {
    it('should correctly map UploadAdditionalDocuments to CCD format', () => {
      const uploadAdditionalDocuments: UploadAdditionalDocument[] = [
        {
          typeOfDocument: 'Type1',
          caseDocument: {
            documentName: 'Document1',
            createdBy: 'User1',
            documentLink: {
              document_url: 'url1',
              document_binary_url: 'binaryUrl1',
              document_filename: 'filename1',
            },
            documentType: null,
            documentSize: 123,
          } as CaseDocument,
          fileUpload: {} as FileUpload,
        },
        {
          typeOfDocument: 'Type2',
          caseDocument: {
            documentName: 'Document2',
            createdBy: 'User2',
            documentLink: {
              document_url: 'url2',
              document_binary_url: 'binaryUrl2',
              document_filename: 'filename2',
            },
            documentType: null,
            documentSize: 456,
          } as CaseDocument,
          fileUpload: {} as FileUpload,
        },
      ];

      const result = prepareCCDData(uploadAdditionalDocuments);

      expect(result).toHaveLength(2);
      result.forEach((item, index) => {
        expect(item.id).toBe('mocked-uuid');
        expect(item.value.typeOfDocument).toBe(uploadAdditionalDocuments[index].typeOfDocument);
        expect(item.value.documentUpload.document_url).toBe(uploadAdditionalDocuments[index].caseDocument.documentLink.document_url);
        expect(item.value.documentUpload.document_binary_url).toBe(uploadAdditionalDocuments[index].caseDocument.documentLink.document_binary_url);
        expect(item.value.documentUpload.document_filename).toBe(uploadAdditionalDocuments[index].caseDocument.documentName);
      });
    });
  });
  describe('removeSelectedDocument', () => {
    it('should remove selected document and save draft claim', async () => {
      const redisKey = 'key';
      const claim: Claim = {
        generalApplication: {
          uploadAdditionalDocuments: [
            {
              typeOfDocument: 'Type1', caseDocument: {
                documentName: 'Document2',
                createdBy: 'User2',
                documentLink: { document_url: 'ur2', document_filename: 'filename2', document_binary_url: 'binaryUrl2' },
                documentType: null,
                documentSize: 123,
              } as CaseDocument,
              fileUpload: {} as FileUpload,
            },
          ],
        } as GeneralApplication,
      } as Claim;
      const index = 0;

      await removeSelectedDocument(redisKey, claim, index);

      expect(saveDraftClaim).toHaveBeenCalledWith(redisKey, claim);
      expect(claim.generalApplication.uploadAdditionalDocuments).toHaveLength(0);
    });

    it('should handle error during document removal', async () => {
      const redisKey = 'key';
      claim.generalApplication.uploadAdditionalDocuments.push({ typeOfDocument: 'Type1', caseDocument: { documentName: 'Document1' } as CaseDocument, fileUpload: {} as FileUpload });
      const index = 0;
      const error = new Error('Error');
      (saveDraftClaim as jest.Mock).mockRejectedValue(error);

      const loggerErrorSpy = jest.spyOn(logger, 'error');

      await expect(removeSelectedDocument(redisKey, claim, index)).rejects.toThrow(error);
      expect(loggerErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('getContentForPanel', () => {
    it('should return built content for panel', () => {
      const lng = 'en';
      const result = getContentForPanel(lng);
      expect(result).toEqual([{ 'data': { 'title': '<span class=\'govuk-!-font-size-36\'>PAGES.GENERAL_APPLICATION.ADDITIONAL_DOCUMENTS.UPLOADED_ADDITIONAL_DOCS</span>' }, 'type': 'panel' }]);
    });
  });

  describe('getContentForBody', () => {
    it('should return built content for body', () => {
      const lng = 'en';
      const result = getContentForBody(lng);

      expect(result).toEqual([{ 'data': { 'classes': undefined, 'text': 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT', 'variables': { 'lng': 'en' } }, 'type': 'title' }, { 'data': { 'classes': undefined, 'text': 'PAGES.GENERAL_APPLICATION.ADDITIONAL_DOCUMENTS.JUDGE_WILL_REVIEW', 'variables': { 'lng': 'en' } }, 'type': 'p' }]);
    });
  });

  describe('getContentForCloseButton', () => {
    it('should return built content for close button', () => {
      const redirectUrl = '/redirect-url';
      const result = getContentForCloseButton(redirectUrl);
      expect(result).toEqual([{ 'data': { 'href': '/redirect-url', 'text': 'COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD' }, 'type': 'button' }]);
    });
  });
});

describe('canUploadAddlDoc', () => {
  let applicationResponse: ApplicationResponse;
  beforeEach(() => {
    applicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: {
          fee: undefined,
          paymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          additionalPaymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          serviceRequestReference: undefined,
        },
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '',
      last_modified: '',
      state: undefined,
    };
  });

  it('should allow upload additional document - APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', async () => {
    //Given
    applicationResponse.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
    //When
    const result = canUploadAddlDoc(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });

  it('should allow upload additional document - HEARING_SCHEDULED', async () => {
    //Given
    applicationResponse.state = ApplicationState.HEARING_SCHEDULED;
    //When
    const result = canUploadAddlDoc(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });

  it('should not allow upload additional document', async () => {
    //Given
    applicationResponse.state = ApplicationState.AWAITING_APPLICATION_PAYMENT;
    //When
    const result = canUploadAddlDoc(applicationResponse);
    //Then
    expect(result).toEqual(false);
  });
});
