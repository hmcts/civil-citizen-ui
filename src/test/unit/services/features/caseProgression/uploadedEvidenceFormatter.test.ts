import {UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';
import {t} from 'i18next';
import {
  UploadDocumentTypes,
  UploadEvidenceDocumentType,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {getMockDocument} from '../../../../utils/mockDocument';
import * as documentUrlFormatter from 'common/utils/formatDocumentURL';
import {getDocumentTypeToName} from '../../../../utils/caseProgression/mockDocumentTypeNameMap';

const lang = 'en';
jest.mock('i18next');
jest.mock('common/utils/formatDocumentURL');
const mockTranslate = t as jest.Mock;

mockTranslate.mockImplementation((key: string[]) => {
  return key.toString();
});

describe('UploadedEvidenceFormatter', () => {
  it('getDocumentType', () => {
    //given
    const documentTypeToNameMap = getDocumentTypeToName();

    //when-then
    documentTypeToNameMap.forEach((key: string, value: EvidenceUploadWitness | EvidenceUploadDisclosure | EvidenceUploadExpert | EvidenceUploadTrial) => {
      //when
      const actualTypeName = UploadedEvidenceFormatter.getDocumentTypeName(value, lang);

      //then
      expect(actualTypeName).toMatch(key);
    });
  });

  describe('getDocumentLink', () => {
    const claimId = '1234';
    const date = new Date('1-1-2023');
    const document = getMockDocument();

    it('should find filename & binary from UploadEvidenceWitness files', () => {
      //given
      const caseDocument = new UploadEvidenceWitness('witness', date, document, date);
      const uploadedDocument = new UploadDocumentTypes(false, caseDocument, EvidenceUploadWitness.WITNESS_STATEMENT, null);

      //when
      const urlSpy = jest.spyOn(documentUrlFormatter, 'formatDocumentViewURL');
      UploadedEvidenceFormatter.getDocumentLink(uploadedDocument, claimId);

      //then
      expect(urlSpy).toBeCalledWith(document.document_filename, claimId, document.document_binary_url);

    });

    it('should find filename & binary from UploadEvidenceExpert files', () => {
      //given
      const caseDocument = new UploadEvidenceExpert('name', 'expertise',
        'expertises', 'other party', 'question', 'answer',
        date, document, date);

      const uploadedDocument = new UploadDocumentTypes(false, caseDocument, EvidenceUploadExpert.STATEMENT, null);

      //when
      const urlSpy = jest.spyOn(documentUrlFormatter, 'formatDocumentViewURL');
      UploadedEvidenceFormatter.getDocumentLink(uploadedDocument, claimId);

      //then
      expect(urlSpy).toBeCalledWith(document.document_filename, claimId, document.document_binary_url);

    });

    it('should find filename & binary from UploadEvidenceDocumentType files', () => {
      //given
      const caseDocument = new UploadEvidenceDocumentType('type', date, document, date);
      const uploadedDocument = new UploadDocumentTypes(false, caseDocument, EvidenceUploadDisclosure.DISCLOSURE_LIST, null);

      //when
      const urlSpy = jest.spyOn(documentUrlFormatter, 'formatDocumentViewURL');
      UploadedEvidenceFormatter.getDocumentLink(uploadedDocument, claimId);

      //then
      expect(urlSpy).toBeCalledWith(document.document_filename, claimId, document.document_binary_url);

    });
  });
});
