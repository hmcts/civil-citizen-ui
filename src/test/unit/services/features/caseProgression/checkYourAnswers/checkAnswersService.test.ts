import {
  getDisclosureSummarySection,
  getExpertSummarySection,
  getTrialSummarySection,
  getWitnessSummarySection,
} from 'services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows';
import {UploadDocumentsUserForm, WitnessSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {
  getBottomElements,
  getSummarySections,
  getTopElements,
  hasValidNewDocuments,
  saveUploadedDocuments,
} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import {DocumentUploadSections} from 'models/caseProgression/documentUploadSections';
import {SummarySections} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {t} from 'i18next';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {UploadDocuments, UploadEvidenceWitness} from 'models/caseProgression/uploadDocumentsType';
import {
  getMockEmptyUploadDocumentsUserForm,
  getMockFullUploadDocumentsUserForm,
} from '../../../../../utils/caseProgression/mockEvidenceUploadSections';
import {createCCDClaimForUploadedDocuments} from '../../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {CaseRole} from 'form/models/caseRoles';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {AppRequest} from 'models/AppRequest';
import {request} from 'express';
import {CCDClaim} from 'models/civilClaimResponse';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

jest.mock('i18next');
jest.mock('client/civilServiceClient');
jest.mock('services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

jest.mock('uuid', () => ({ v4: () => '1221' }));
const mockSubmitEvent = civilServiceClient.submitEvent as jest.Mock;
const mockTranslate = t as jest.Mock;
const mockWitnessSummarySection = getWitnessSummarySection as jest.Mock;
const mockExpertSummarySection = getExpertSummarySection as jest.Mock;
const mockDisclosureSummarySection = getDisclosureSummarySection as jest.Mock;
const mockTrialSummarySection = getTrialSummarySection as jest.Mock;
const returnValue = {sections: [{}]} as SummarySections;

mockTranslate.mockImplementation((stringToTranslate) => {
  return stringToTranslate;
});
mockWitnessSummarySection.mockReturnValue(returnValue);
mockExpertSummarySection.mockReturnValue(returnValue);
mockDisclosureSummarySection.mockReturnValue(returnValue);
mockTrialSummarySection.mockReturnValue(returnValue);
mockSubmitEvent.mockImplementation((eventName, claimId, updatedCcdClaim, req) => {
  return {eventName: eventName, claimId: claimId, updatedCcdClaim: updatedCcdClaim, req: req};
});

describe('checkAnswersServiceTest', () => {
  describe('return page elements', () => {
    test('return all evidence sections', () => {
      //given
      const uploadedDocuments = getMockFullUploadDocumentsUserForm();
      const claimId = '1234';
      const isSmallClaims = true;
      const lang = 'en';

      //when
      const summarySectionActual = getSummarySections(uploadedDocuments, claimId, isSmallClaims, lang);
      //then
      const summarySectionExpected = {
        witnessEvidenceSection: returnValue,
        disclosureEvidenceSection: returnValue,
        expertEvidenceSection: returnValue,
        trialEvidenceSection: returnValue,
      } as DocumentUploadSections;
      expect(summarySectionActual).toEqual(summarySectionExpected);
    });

    test('should return null without building sections when uploaded documents are undefined', () => {
      //given
      mockWitnessSummarySection.mockClear();
      mockDisclosureSummarySection.mockClear();
      mockExpertSummarySection.mockClear();
      mockTrialSummarySection.mockClear();
      //when
      const actualSummarySection = getSummarySections(undefined, '1234', false, 'en');
      //then
      expect(actualSummarySection).toBeNull();
      expect(mockWitnessSummarySection).not.toHaveBeenCalled();
      expect(mockDisclosureSummarySection).not.toHaveBeenCalled();
      expect(mockExpertSummarySection).not.toHaveBeenCalled();
      expect(mockTrialSummarySection).not.toHaveBeenCalled();
    });

    test('should return null when uploaded documents are null', () => {
      //when
      const actualSummarySection = getSummarySections(null, '1234', false, 'en');
      //then
      expect(actualSummarySection).toBeNull();
    });

    test('should return null when no uploaded documents have a document link', () => {
      //given
      const uploadedDocuments = new UploadDocumentsUserForm();
      uploadedDocuments.witnessStatement = [{witnessName: 'witness', caseDocument: undefined} as WitnessSection];
      //when
      const actualSummarySection = getSummarySections(uploadedDocuments, '1234', false, 'en');
      //then
      expect(actualSummarySection).toBeNull();
    });

    describe('hasValidNewDocuments', () => {
      test.each([
        ['undefined', undefined],
        ['null', null],
        ['an empty draft', getMockEmptyUploadDocumentsUserForm()],
        ['a draft whose only document has no case document', new UploadDocumentsUserForm(undefined, undefined, [{witnessName: 'witness', caseDocument: undefined} as WitnessSection])],
        ['a draft whose only document has no document link', new UploadDocumentsUserForm(undefined, undefined, [{witnessName: 'witness', caseDocument: {documentName: 'test.png'}} as WitnessSection])],
        ['a draft whose only document is null', new UploadDocumentsUserForm(undefined, undefined, [null])],
        ['a draft whose only document has an empty document link', new UploadDocumentsUserForm(undefined, undefined, [{witnessName: 'witness', caseDocument: {documentName: 'test.png', documentLink: {}}} as WitnessSection])],
        ['a draft whose only document link has no binary url', new UploadDocumentsUserForm(undefined, undefined, [{witnessName: 'witness', caseDocument: {documentName: 'test.png', documentLink: {document_url: 'http://dm-store/documents/1'}}} as WitnessSection])],
      ])('should return false for %s', (_description, uploadedDocuments) => {
        //when
        const actual = hasValidNewDocuments(uploadedDocuments as UploadDocumentsUserForm);
        //then
        expect(actual).toBe(false);
      });

      test('should return true when at least one document has a document link', () => {
        //given
        const uploadedDocuments = getMockFullUploadDocumentsUserForm();
        uploadedDocuments.witnessStatement[0] = {...uploadedDocuments.witnessStatement[0], caseDocument: undefined} as WitnessSection;
        //when
        const actual = hasValidNewDocuments(uploadedDocuments);
        //then
        expect(actual).toBe(true);
      });
    });

    test('return top page elements', () => {
      //given
      const claim = new Claim();
      claim.id = '1234';
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = {partyName: 'John Smith', firstName: 'John', lastName: 'Smith', title: 'Dr'} as PartyDetails;

      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = {partyName: 'John Smith', firstName: 'John', lastName: 'Smith', title: 'Dr'} as PartyDetails;

      //when
      const topElementsActual = getTopElements(claim);
      //then
      const topElementsExpected = [
        {type: ClaimSummaryType.MICRO_TEXT, data: {text: 'PAGES.DASHBOARD.HEARINGS.HEARING'}},
        {type: ClaimSummaryType.MAINTITLE, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_TITLE'}},
        {type: ClaimSummaryType.LEAD_PARAGRAPH, data: {text: 'COMMON.CASE_NUMBER_PARAM', variables:{claimId:caseNumberPrettify( claim.id)}, classes:'govuk-!-margin-bottom-1'}},
        {type: ClaimSummaryType.LEAD_PARAGRAPH, data: {text: 'COMMON.CLAIM_AMOUNT_WITH_VALUE', variables:{claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)}}},
        {type: ClaimSummaryType.INSET_TEXT, data: {html: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_FULL'}},
      ];
      expect(topElementsActual).toEqual(topElementsExpected);
    });

    test('return bottom page elements', () => {

      //when
      const bottomElementsActual = getBottomElements();

      //then
      const bottomElementsExpected = [
        {type: ClaimSummaryType.MAINTITLE, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_CONFIRMATION'}},
        {type: ClaimSummaryType.WARNING, data: {text: 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_SHORT'}},
      ];
      expect(bottomElementsActual).toEqual(bottomElementsExpected);
    });

    describe('saveUploadedDocuments', () => {

      beforeEach(() => {
        emptyClaim.caseProgression.claimantUploadDocuments = {disclosure: [], witness: [], expert: [], trial: []} as UploadDocuments;
        emptyClaim.caseProgression.defendantUploadDocuments = {disclosure: [], witness: [], expert: [], trial: []} as UploadDocuments;

        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(emptyClaim),
            ),
          );
      });

      const emptyClaim = new Claim();
      emptyClaim.caseProgression = new CaseProgression();

      const claimWithUploadedDocuments = new Claim();
      claimWithUploadedDocuments.caseProgression = new CaseProgression();
      claimWithUploadedDocuments.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
      claimWithUploadedDocuments.caseProgression.defendantDocuments = getMockFullUploadDocumentsUserForm();

      const claimWithoutUploadedDocuments = new Claim();
      claimWithoutUploadedDocuments.caseProgression = new CaseProgression();
      claimWithoutUploadedDocuments.caseProgression.claimantDocuments = getMockEmptyUploadDocumentsUserForm();
      claimWithoutUploadedDocuments.caseProgression.defendantDocuments = getMockEmptyUploadDocumentsUserForm();

      test('For claimant - all arrays filled', async ()=> {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithUploadedDocuments.caseRole = CaseRole.CLAIMANT;
        const req = request;
        req.params = {
          id: '12345',
        };
        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(2,true), <AppRequest>req);

      });

      test('For claimant - all arrays empty', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithoutUploadedDocuments.caseRole = CaseRole.CLAIMANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithoutUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(0,true),  <AppRequest>req);

      });
      test('For defendant - all arrays filled', async ()=> {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithUploadedDocuments.caseRole = CaseRole.DEFENDANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', req.params.id, createCCDClaimForUploadedDocuments(2,false),  <AppRequest>req);

      });

      test('For defendant - all arrays empty', async() => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        claimWithoutUploadedDocuments.caseRole = CaseRole.DEFENDANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithoutUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalled();
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', req.params.id, createCCDClaimForUploadedDocuments(0,false),  <AppRequest>req);
      });

      test('For claimant - should not throw when uploaded documents are undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithNoDraft = new Claim();
        claimWithNoDraft.caseRole = CaseRole.CLAIMANT;
        claimWithNoDraft.caseProgression = new CaseProgression();
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithNoDraft, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(0, true), <AppRequest>req);
      });

      test('For defendant - should not throw when uploaded documents are undefined', async() => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithNoDraft = new Claim();
        claimWithNoDraft.caseRole = CaseRole.DEFENDANT;
        claimWithNoDraft.caseProgression = new CaseProgression();
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithNoDraft, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', req.params.id, createCCDClaimForUploadedDocuments(0, false), <AppRequest>req);
      });

      test('For claimant - should not throw when existing uploaded documents are undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithNoExistingDocuments = new Claim();
        claimWithNoExistingDocuments.caseProgression = new CaseProgression();
        jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claimWithNoExistingDocuments);
        claimWithUploadedDocuments.caseRole = CaseRole.CLAIMANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(2, true), <AppRequest>req);
      });

      test('For defendant - should not throw when existing case progression is undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(new Claim());
        claimWithUploadedDocuments.caseRole = CaseRole.DEFENDANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', req.params.id, createCCDClaimForUploadedDocuments(2, false), <AppRequest>req);
      });

      test('For claimant - should not throw when some existing document arrays are undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithPartialDocuments = new Claim();
        claimWithPartialDocuments.caseProgression = new CaseProgression();
        claimWithPartialDocuments.caseProgression.claimantUploadDocuments = {disclosure: []} as UploadDocuments;
        jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claimWithPartialDocuments);
        claimWithUploadedDocuments.caseRole = CaseRole.CLAIMANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(2, true), <AppRequest>req);
      });

      test('For claimant - should not throw when claim case progression is undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithNoCaseProgression = new Claim();
        claimWithNoCaseProgression.caseRole = CaseRole.CLAIMANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithNoCaseProgression, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(0, true), <AppRequest>req);
      });

      test('For claimant - should not throw when existing case progression is undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(new Claim());
        claimWithUploadedDocuments.caseRole = CaseRole.CLAIMANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithUploadedDocuments, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_APPLICANT', req.params.id, createCCDClaimForUploadedDocuments(2, true), <AppRequest>req);
      });

      test('For defendant - should not throw when claim case progression is undefined', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithNoCaseProgression = new Claim();
        claimWithNoCaseProgression.caseRole = CaseRole.DEFENDANT;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithNoCaseProgression, <AppRequest>req);

        //then
        expect(mockSubmitEvent).toHaveBeenCalledWith('EVIDENCE_UPLOAD_RESPONDENT', req.params.id, createCCDClaimForUploadedDocuments(0, false), <AppRequest>req);
      });

      test('should skip documents with a missing document link and log the claim id', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation();
        const claimWithMissingLink = new Claim();
        claimWithMissingLink.caseRole = CaseRole.CLAIMANT;
        claimWithMissingLink.caseProgression = new CaseProgression();
        claimWithMissingLink.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
        claimWithMissingLink.caseProgression.claimantDocuments.witnessStatement[0] = {
          ...claimWithMissingLink.caseProgression.claimantDocuments.witnessStatement[0],
          caseDocument: undefined,
        } as WitnessSection;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithMissingLink, <AppRequest>req);

        //then
        const submittedClaim = mockSubmitEvent.mock.calls[mockSubmitEvent.mock.calls.length - 1][2] as CCDClaim;
        expect(submittedClaim.documentWitnessStatement).toHaveLength(1);
        expect(submittedClaim.documentWitnessSummary).toHaveLength(2);
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('ClaimId: 12345'));
        loggerSpy.mockRestore();
      });

      test.each([
        ['documentsForDisclosure', 'documentForDisclosure'],
        ['disclosureList', 'documentDisclosureList'],
        ['witnessSummary', 'documentWitnessSummary'],
        ['noticeOfIntention', 'documentHearsayNotice'],
        ['documentsReferred', 'documentReferredInStatement'],
        ['expertStatement', 'documentJointStatement'],
        ['expertReport', 'documentExpertReport'],
        ['questionsForExperts', 'documentQuestions'],
        ['answersForExperts', 'documentAnswers'],
        ['trialCaseSummary', 'documentCaseSummary'],
        ['trialSkeletonArgument', 'documentSkeletonArgument'],
        ['trialAuthorities', 'documentAuthorities'],
        ['trialCosts', 'documentCosts'],
        ['trialDocumentary', 'documentEvidenceForTrial'],
      ] as [keyof UploadDocumentsUserForm, keyof CCDClaim][])('should skip %s documents with a missing document link', async (uploadField, ccdField) => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation();
        const claimWithMissingLink = new Claim();
        claimWithMissingLink.caseRole = CaseRole.CLAIMANT;
        claimWithMissingLink.caseProgression = new CaseProgression();
        claimWithMissingLink.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
        const documents = claimWithMissingLink.caseProgression.claimantDocuments[uploadField] as {caseDocument?: unknown}[];
        documents[0] = {...documents[0], caseDocument: undefined};
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithMissingLink, <AppRequest>req);

        //then
        const submittedClaim = mockSubmitEvent.mock.calls[mockSubmitEvent.mock.calls.length - 1][2] as CCDClaim;
        expect(submittedClaim[ccdField]).toHaveLength(1);
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('ClaimId: 12345'));
        loggerSpy.mockRestore();
      });

      test.each([
        ['a null document', null],
        ['a case document without a document link', {caseDocument: {documentName: 'test.png'}}],
        ['a case document with an empty document link', {caseDocument: {documentName: 'test.png', documentLink: {}}}],
      ])('should skip %s', async (_description, document) => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation();
        const claimWithInvalidDocument = new Claim();
        claimWithInvalidDocument.caseRole = CaseRole.CLAIMANT;
        claimWithInvalidDocument.caseProgression = new CaseProgression();
        claimWithInvalidDocument.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
        claimWithInvalidDocument.caseProgression.claimantDocuments.witnessStatement[0] = document as WitnessSection;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithInvalidDocument, <AppRequest>req);

        //then
        const submittedClaim = mockSubmitEvent.mock.calls[mockSubmitEvent.mock.calls.length - 1][2] as CCDClaim;
        expect(submittedClaim.documentWitnessStatement).toHaveLength(1);
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        loggerSpy.mockRestore();
      });

      test.each([
        ['documentsForDisclosure', 'documentForDisclosure', 'documentIssuedDate'],
        ['witnessSummary', 'documentWitnessSummary', 'witnessOptionUploadDate'],
        ['noticeOfIntention', 'documentHearsayNotice', 'witnessOptionUploadDate'],
        ['documentsReferred', 'documentReferredInStatement', 'documentIssuedDate'],
        ['expertStatement', 'documentJointStatement', 'expertOptionUploadDate'],
        ['expertReport', 'documentExpertReport', 'expertOptionUploadDate'],
        ['trialDocumentary', 'documentEvidenceForTrial', 'documentIssuedDate'],
      ] as [keyof UploadDocumentsUserForm, keyof CCDClaim, string][])('should still submit %s documents when the date input fields are missing', async (uploadField, ccdField, dateField) => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithMissingDate = new Claim();
        claimWithMissingDate.caseRole = CaseRole.CLAIMANT;
        claimWithMissingDate.caseProgression = new CaseProgression();
        claimWithMissingDate.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
        const documents = claimWithMissingDate.caseProgression.claimantDocuments[uploadField] as {dateInputFields?: unknown}[];
        documents[0] = {...documents[0], dateInputFields: undefined};
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithMissingDate, <AppRequest>req);

        //then
        const submittedClaim = mockSubmitEvent.mock.calls[mockSubmitEvent.mock.calls.length - 1][2] as CCDClaim;
        const submittedDocuments = submittedClaim[ccdField] as {value: Record<string, unknown>}[];
        expect(submittedDocuments).toHaveLength(2);
        expect(submittedDocuments[0].value[dateField]).toBeUndefined();
      });

      test('should still submit documents when the date input fields are missing', async () => {
        //given
        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');
        const claimWithMissingDate = new Claim();
        claimWithMissingDate.caseRole = CaseRole.CLAIMANT;
        claimWithMissingDate.caseProgression = new CaseProgression();
        claimWithMissingDate.caseProgression.claimantDocuments = getMockFullUploadDocumentsUserForm();
        claimWithMissingDate.caseProgression.claimantDocuments.witnessStatement[0] = {
          ...claimWithMissingDate.caseProgression.claimantDocuments.witnessStatement[0],
          dateInputFields: undefined,
        } as WitnessSection;
        const req = request;
        req.params = {
          id: '12345',
        };

        //when
        await saveUploadedDocuments(claimWithMissingDate, <AppRequest>req);

        //then
        const submittedClaim = mockSubmitEvent.mock.calls[mockSubmitEvent.mock.calls.length - 1][2] as CCDClaim;
        expect(submittedClaim.documentWitnessStatement).toHaveLength(2);
        expect((submittedClaim.documentWitnessStatement[0].value as UploadEvidenceWitness).witnessOptionUploadDate).toBeUndefined();
      });
    });
  });
});
