import {DateTime, Settings} from 'luxon';
import {Claim} from '../../../../../../../main/common/models/claim';
import {buildResponseToClaimSection} from '../../../../../../../main/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';
import {CaseState} from '../../../../../../../main/common/form/models/claimDetails';
import {CounterpartyType} from '../../../../../../../main/common/models/counterpartyType';
import {ClaimSummaryType} from '../../../../../../../main/common/form/models/claimSummarySection';
import {CLAIM_TASK_LIST_URL} from '../../../../../../../main/routes/urls';

describe('Latest Update Content Builder', () => {
  const partyName = 'Mr. John Doe';
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  claim.respondent1ResponseDeadline = new Date('2022-07-29T15:59:59');
  claim.applicant1 = {
    type: CounterpartyType.INDIVIDUAL,
    partyName: partyName,
  };
  const claimId = '5129';
  const claimTaskListUrl = CLAIM_TASK_LIST_URL.replace(':id', claimId);
  const lang = 'en';
  describe('test buildResponseToClaimSection', () => {
    it('should have responseNotSubmittedTitle and respondToClaimLink', () => {
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, lang, claimId);
      // Then
      expect(responseToClaimSection).toHaveLength(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data.href).toEqual(claimTaskListUrl);
    });

    it('should have responseDeadlineNotPassedContent when defendant not responded before dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 6, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, lang, claimId);
      // Then
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
    });
    it('should have responseDeadlinePassedContent when defendant not responded after dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 8, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, lang, claimId);
      // Then
      expect(responseToClaimSection).toHaveLength(5);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[3].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[4].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[4].data.href).toEqual(claimTaskListUrl);
    });

    it('should be empty when claim state is different from AWAITING_RESPONDENT_ACKNOWLEDGEMENT', () => {
      // Given
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      // when
      const responseToClaimSection = buildResponseToClaimSection(claim, lang, claimId);
      // Then
      expect(responseToClaimSection).toHaveLength(0);
    });
  });
});
