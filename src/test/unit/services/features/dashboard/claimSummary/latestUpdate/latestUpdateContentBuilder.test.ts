import {DateTime, Settings} from 'luxon';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL} from 'routes/urls';
import {DocumentType} from 'models/document/documentType';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT';
const getClaimWithSdoDocument = () =>  {
  const claim = new Claim();
  claim.id = '001';
  claim.sdoOrderDocument = {
    createdBy: 'Civil',
    documentLink: {
      document_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
      document_filename: 'sdo.pdf',
      document_binary_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
    },
    documentName: 'small_claims_sdo.pdf',
    documentSize: 45794,
    documentType: DocumentType.SDO_ORDER,
    createdDatetime: new Date('2022-06-21T14:15:19'),
  };
  return claim;
};

const getLastUpdateSdoDocumentExpected = (claimId: string) => {
  const builder = new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, claimId, null, `${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
    .build();
  return builder;
};

describe('Latest Update Content Builder', () => {
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
  const claimId = '5129';
  const bilingualLanguagePreferencetUrl = BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', claimId);

  describe('test buildResponseToClaimSection', () => {
    it('should have responseNotSubmittedTitle and respondToClaimLink', () => {
      // Given
      const expectedNow = DateTime.local(2022, 7, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM');
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should have deadlline extended title when defendant extended response deadline', () => {
      //Given
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      //When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.MORE_TIME_REQUESTED');
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should have responseDeadlineNotPassedContent when defendant not responded before dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 6, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
    });
    it('should have responseDeadlinePassedContent when defendant not responded after dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 8, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(5);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[3].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[4].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[4].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should be empty when claim state is different from AWAITING_RESPONDENT_ACKNOWLEDGEMENT', () => {
      // Given
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      // when
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(0);
    });
  });
  describe('test SDO Document buildResponseToClaimSection', () => {
    it('should have build SDO document section', () => {
      // Given
      const claim = getClaimWithSdoDocument();
      const lastUpdateSdoDocumentExpected = getLastUpdateSdoDocumentExpected(claim.id);

      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(lastUpdateSdoDocumentExpected.flat()).toEqual(responseToClaimSection);
    });
  });
});
