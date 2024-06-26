import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {
  CASE_DOCUMENT_DOWNLOAD_URL,
  DEFENDANT_SUMMARY_TAB_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL, CASE_DOCUMENT_VIEW_URL,
} from 'routes/urls';
import {
  buildEvidenceUploadSection,
  buildFinaliseTrialArrangements,
  buildHearingTrialLatestUploadSection,
  buildViewBundleSection,
  buildViewTrialArrangementsSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {FAST_TRACK_CLAIM_AMOUNT, SMALL_CLAIM_AMOUNT} from 'form/models/claimType';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {t} from 'i18next';
import {
  SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock,
} from '../../../../../../../utils/mocks/SystemGeneratedCaseDocumentsMock';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {TabId} from 'routes/tabs';
import {YesNo} from 'form/models/yesNo';
import {CaseRole} from 'form/models/caseRoles';

const lang = 'en';
describe('Latest Update Content Builder Case Progression', () => {
  const partyName = 'Mr. John Doe';
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  claim.respondent1ResponseDeadline = new Date('2022-07-29T15:59:59');
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: partyName,
    },
  };
  claim.systemGeneratedCaseDocuments = SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock();
  const sdoUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', '123');

  describe('test buildEvidenceUploadSection', () => {
    it('should have evidence upload content with bundle deadline', () => {
      // Given
      claim.caseProgressionHearing.hearingDate = new Date();
      // when
      const evidenceUploadSection = buildEvidenceUploadSection(claim);
      // Then
      expect(evidenceUploadSection[0].length).toBe(6);
      expect(evidenceUploadSection[0][0].type).toEqual(ClaimSummaryType.TITLE);
      expect(evidenceUploadSection[0][0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(evidenceUploadSection[0][1].type).toEqual(ClaimSummaryType.WARNING);
      expect(evidenceUploadSection[0][2].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(evidenceUploadSection[0][3].type).toEqual(ClaimSummaryType.LINK);
      expect(evidenceUploadSection[0][3].data?.href).toEqual(sdoUrl);
      expect(evidenceUploadSection[0][4].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(evidenceUploadSection[0][4].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_SUBMITTED_NOT_CONSIDERED');
      expect(evidenceUploadSection[0][5].type).toEqual(ClaimSummaryType.BUTTON);
      expect(evidenceUploadSection[0][5].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    });

  });

  describe('test buildHearingTrialLatestUploadSection', () => {
    const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';
    claim.caseProgressionHearing = getCaseProgressionHearingMock();

    it('should have Hearing upload content with Small claims', () => {
      // Given
      claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
      const noticesAndOrdersBeforeText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BEFORE`;
      const noticesAndOrdersLinkText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_LINK`;
      const noticesAndOrdersAfterText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_AFTER`;

      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted(lang) ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addParagraph(`${TRIAL_HEARING_CONTENT}.KEEP_CONTACT_DETAILS_UP_TO_DATE`)
        .addLink(noticesAndOrdersLinkText,DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.NOTICES),noticesAndOrdersBeforeText, noticesAndOrdersAfterText)
        .addButtonOpensNewTab(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.caseProgressionHearing.hearingDocuments, DocumentType.HEARING_FORM)))
        .build();

      // when
      const evidenceUploadSection = buildHearingTrialLatestUploadSection(claim, lang);

      // Then
      expect(evidenceUploadSection).toEqual([lastedContentBuilderExpected]);
    });

    it('should have Hearing upload content with fast track', () => {
      // Given
      claim.totalClaimAmount = FAST_TRACK_CLAIM_AMOUNT - 5;
      const noticesAndOrdersBeforeText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BEFORE`;
      const noticesAndOrdersLinkText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_LINK`;
      const noticesAndOrdersAfterText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_AFTER`;

      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted(lang) ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addParagraph(`${TRIAL_HEARING_CONTENT}.KEEP_CONTACT_DETAILS_UP_TO_DATE`)
        .addLink(noticesAndOrdersLinkText,DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.NOTICES),noticesAndOrdersBeforeText, noticesAndOrdersAfterText)
        .addButtonOpensNewTab(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.caseProgressionHearing.hearingDocuments, DocumentType.HEARING_FORM)))
        .build();

      // when
      const evidenceUploadSection = buildHearingTrialLatestUploadSection(claim, lang);

      // Then
      expect(evidenceUploadSection).toEqual([lastedContentBuilderExpected]);
    });
  });

  describe('test buildFinaliseTrialArrangements', () => {
    const FINALISE_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS';

    it('should have trial arrangements content', () => {
      //Given
      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${FINALISE_TRIAL_ARRANGEMENTS}.TITLE`)
        .addWarning(`${FINALISE_TRIAL_ARRANGEMENTS}.DUE_BY`, {finalisingTrialArrangementsDeadline: claim.finalisingTrialArrangementsDeadline})
        .addRawHtml(`<p class="govuk-body">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_BEGINNING`)}
                                <span class="govuk-body govuk-!-font-weight-bold">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_END`, {finalisingTrialArrangementsDeadline: claim.finalisingTrialArrangementsDeadline})}</span>.
                              </p>`)
        .addLink(`${FINALISE_TRIAL_ARRANGEMENTS}.DIRECTIONS_QUESTIONNAIRE`,
          DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.NOTICES),
          `${FINALISE_TRIAL_ARRANGEMENTS}.YOU_MAY_WISH_TO_REVIEW`,
          `${FINALISE_TRIAL_ARRANGEMENTS}.UNDER_NOTICES_AND_ORDERS`)
        .addButton(`${FINALISE_TRIAL_ARRANGEMENTS}.FINALISE_TRIAL_ARRANGEMENTS_BUTTON`, CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claim.id))
        .build();

      //When
      const finaliseTrialArrangementsSection = buildFinaliseTrialArrangements(claim, 'en');

      //Then
      expect(finaliseTrialArrangementsSection).toEqual([lastedContentBuilderExpected]);
    });
  });

  describe('test buildViewBundleSection method', () => {
    const BUNDLE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE';

    it('should have view bundle content', () => {
      //Given
      const viewBundleContentExpected: ClaimSummarySection[] = new LatestUpdateSectionBuilder()
        .addTitle(`${BUNDLE_CONTENT}.TITLE`)
        .addParagraph(`${BUNDLE_CONTENT}.BUNDLE_CONTAINS_ALL_DOCUMENTS`)
        .addParagraph(`${BUNDLE_CONTENT}.YOU_ARE_REMINDED`)
        .addButton(`${BUNDLE_CONTENT}.VIEW_BUNDLE`, DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.BUNDLES))
        .build();

      //When
      const viewBundleContent = buildViewBundleSection(claim);

      //Then
      expect(viewBundleContent).toEqual([viewBundleContentExpected]);
    });
  });

  describe('test buildViewTrialArrangementsSection', () => {
    it('should have view trial arrangements content for the current party (respondent) if isOtherParty false', () => {
      //Given
      const claim: Claim = new Claim();
      claim.caseProgression = {
        defendantTrialArrangements: {
          isCaseReady: YesNo.NO,
          trialArrangementsDocument: {
            id: '2345',
            value: {
              'createdBy': 'Civil',
              'documentLink': {
                'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2',
                'document_filename': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
                'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2/binary',
              },
              'documentName': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
              'documentSize': 56461,
              documentType: DocumentType.TRIAL_READY_DOCUMENT,
              createdDatetime: new Date('2022-06-21T14:15:19'),
              ownedBy: CaseRole.DEFENDANT,
            },
          },
        },
      };
      const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';
      const isOtherParty = false;
      const lastedContentBuilderExpected: ClaimSummarySection[][] = [[
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`,
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_YOUR_TRIAL_ARRANGEMENTS`,
          },
        },
        {
          type: ClaimSummaryType.NEW_TAB_BUTTON,
          data: {
            text: `${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`,
            href: CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', 'e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2'),
          },
        },
      ]];
      //When
      const viewTrialArrangementsContent = buildViewTrialArrangementsSection(isOtherParty, claim);
      //Then
      expect(lastedContentBuilderExpected).toEqual(viewTrialArrangementsContent);
    });

    it('should have view trial arrangements content for the other party (claimant) if isOtherParty true', () => {
      //Given
      const claim: Claim = new Claim();
      claim.caseProgression = {
        claimantTrialArrangements: {
          isCaseReady: YesNo.NO,
          trialArrangementsDocument: {
            id: '1234',
            value: {
              'createdBy': 'Civil',
              'documentLink': {
                'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5',
                'document_filename': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
                'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5/binary',
              },
              'documentName': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
              'documentSize': 56461,
              documentType: DocumentType.TRIAL_READY_DOCUMENT,
              createdDatetime: new Date('2022-06-21T14:15:19'),
              ownedBy: CaseRole.CLAIMANT,
            },
          },
        },
      };
      const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';
      const isOtherParty = true;
      const lastedContentBuilderExpected: ClaimSummarySection[][] = [[
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`,
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_OTHER_PARTY`,
          },
        },
        {
          type: ClaimSummaryType.NEW_TAB_BUTTON,
          data: {
            text: `${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`,
            href: CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', 'e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5'),
          },
        },
      ]];
      //When
      const viewTrialArrangementsContent = buildViewTrialArrangementsSection(isOtherParty, claim);
      //Then
      expect(lastedContentBuilderExpected).toEqual(viewTrialArrangementsContent);
    });
  });
});
