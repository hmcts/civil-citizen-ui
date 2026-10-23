import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {
  MediationTypeOfDocumentSection,
  TypeOfDocumentYourNameSection,
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {CaseDocument} from 'models/document/caseDocument';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveMediationUploadedDocuments} from 'services/features/mediation/uploadDocuments/mediationCheckAnswersService';
import {
  getNonAttendanceDocumentsCCD,
  getReferredDocumentCCD,
  getTypeOfDocuments, getTypeOfDocumentsWithReferredDocuments, getTypeOfDocumentsWithYourStatement,
} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('client/civilServiceClient');
jest.mock('uuid', () => ({ v4: () => '1221' }));
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const mockSubmitEvent = civilServiceClient.submitEvent as jest.Mock;
mockSubmitEvent.mockImplementation((eventName, claimId, updatedCcdClaim, req) => {
  return {eventName: eventName, claimId: claimId, updatedCcdClaim: updatedCcdClaim, req: req};
});

const CLAIMANT_ONE_MEDIATION_DOCS = 'ClaimantOneMediationDocs';
const DEFENDANT_ONE_MEDIATION_DOCS = 'DefendantOneMediationDocs';

const createRespondentOneClaim = () => {
  const claimRespondentOne = new Claim();
  claimRespondentOne.caseRole = CaseRole.RESPONDENTSOLICITORONE;
  return claimRespondentOne;
};

const createClaimantOneClaim = () => {
  const claimRespondentOne = new Claim();
  claimRespondentOne.caseRole = CaseRole.APPLICANTSOLICITORONE;
  return claimRespondentOne;
};

describe('Check answers service For Mediation', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save Mediation Uploaded Documents method', () => {
    describe('save Mediation Uploaded Documents method for claimant one', () => {
      it('should save the document with both documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createClaimantOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

        const updatedClaim = new Claim();
        updatedClaim.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        updatedClaim.app1MediationDocumentsReferred = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with app1MediationNonAttendance Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createClaimantOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithYourStatement());

        const updatedClaim = new Claim();
        updatedClaim.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with app1MediationDocumentsReferred Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createClaimantOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithReferredDocuments());

        const updatedClaim = new Claim();
        updatedClaim.app1MediationDocumentsReferred = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should add new documents on oldApp1MediationDocumentsReferred and oldApp1MediationNonAttendanceDocs', async () => {
        //given
        const oldClaimWithDocuments = createClaimantOneClaim();
        oldClaimWithDocuments.app1MediationDocumentsReferred = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        oldClaimWithDocuments.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(oldClaimWithDocuments),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

        const expectedOldClaim = new Claim();
        const referredDocumentCCD = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        referredDocumentCCD.push(referredDocumentCCD[0]);
        const nonAttendanceDocumentsCCD = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        nonAttendanceDocumentsCCD.push(nonAttendanceDocumentsCCD[0]);

        expectedOldClaim.app1MediationDocumentsReferred = referredDocumentCCD;
        expectedOldClaim.app1MediationNonAttendanceDocs = nonAttendanceDocumentsCCD;
        delete expectedOldClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', expectedOldClaim, null);

      });

    });

    describe('save Mediation Uploaded Documents method for respondent one', () => {
      it('should save the document with both documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createRespondentOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

        const updatedClaim = new Claim();
        updatedClaim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        updatedClaim.res1MediationDocumentsReferred = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with res1MediationNonAttendance Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createRespondentOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithYourStatement());

        const updatedClaim = new Claim();
        updatedClaim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with res1MediationDocumentsReferred Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createRespondentOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithReferredDocuments());

        const updatedClaim = new Claim();
        updatedClaim.res1MediationDocumentsReferred = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should add new documents on oldRes1MediationDocumentsReferred and oldRes1MediationNonAttendanceDocs', async () => {
        //given
        const oldClaimWithDocuments = createRespondentOneClaim();
        oldClaimWithDocuments.res1MediationDocumentsReferred = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        oldClaimWithDocuments.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(oldClaimWithDocuments),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

        const expectedOldClaim = new Claim();
        const referredDocumentCCD = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        referredDocumentCCD.push(referredDocumentCCD[0]);
        const nonAttendanceDocumentsCCD = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        nonAttendanceDocumentsCCD.push(nonAttendanceDocumentsCCD[0]);

        expectedOldClaim.res1MediationDocumentsReferred = referredDocumentCCD;
        expectedOldClaim.res1MediationNonAttendanceDocs = nonAttendanceDocumentsCCD;
        delete expectedOldClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', expectedOldClaim, null);

      });
    });
  });
  describe('when sections hold several files', () => {
    const uploadedFile = (documentName: string) => <CaseDocument>{
      documentName,
      documentLink: {document_url: `http://dm-store/${documentName}`, document_binary_url: `http://dm-store/${documentName}/binary`, document_filename: documentName},
      createdDatetime: new Date('2022-12-12T00:00:00.000Z'),
    };

    const yourStatement = (...caseDocuments: CaseDocument[]) => {
      const section = new TypeOfDocumentYourNameSection('1', '1', '2024');
      section.yourName = 'John Smith';
      section.caseDocuments = caseDocuments;
      return section;
    };

    const documentReferred = (...caseDocuments: CaseDocument[]) => {
      const section = new MediationTypeOfDocumentSection('1', '1', '2024');
      section.typeOfDocument = 'Letter';
      section.caseDocuments = caseDocuments;
      return section;
    };

    const uploadDocumentsWith = (statements: TypeOfDocumentYourNameSection[], referred: MediationTypeOfDocumentSection[]) => new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, statements),
      new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, referred),
    ]);

    const submittedClaim = async (uploadDocuments: UploadDocuments) => {
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(createClaimantOneClaim());
      const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
      await saveMediationUploadedDocuments('1111', uploadDocuments, null);
      return mockSubmitEvent.mock.calls.at(-1)[2] as CCDClaim;
    };

    const uploadedFileNames = (ccdDocuments: unknown[] | undefined) =>
      (ccdDocuments ?? []).map((ccdDocument) => JSON.stringify(ccdDocument).match(/dm-store\/([^/"]+)/)[1]);

    it('sends one document per uploaded file', async () => {
      const uploadDocuments = uploadDocumentsWith(
        [yourStatement(uploadedFile('statement-1.pdf'), uploadedFile('statement-2.pdf'))],
        [documentReferred(uploadedFile('letter-1.pdf')), documentReferred(uploadedFile('letter-2.pdf'), uploadedFile('letter-3.pdf'))],
      );

      const ccdClaim = await submittedClaim(uploadDocuments);

      expect(uploadedFileNames(ccdClaim.app1MediationNonAttendanceDocs)).toEqual(['statement-1.pdf', 'statement-2.pdf']);
      expect(uploadedFileNames(ccdClaim.app1MediationDocumentsReferred)).toEqual(['letter-1.pdf', 'letter-2.pdf', 'letter-3.pdf']);
    });

    it('sends nothing for sections without files', async () => {
      const sectionWithoutFiles = yourStatement();
      sectionWithoutFiles.caseDocuments = undefined;

      const ccdClaim = await submittedClaim(uploadDocumentsWith([sectionWithoutFiles], [documentReferred()]));

      expect(ccdClaim.app1MediationNonAttendanceDocs).toEqual([]);
      expect(ccdClaim.app1MediationDocumentsReferred).toEqual([]);
    });
  });
});
