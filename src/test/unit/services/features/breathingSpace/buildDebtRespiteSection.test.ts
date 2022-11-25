import {getSummarySections} from '../../../../../main/services/features/breathingSpace/checkAnswersService';
import {getClaimWithFewDetails} from '../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../utils/checkAnswersConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Dept Respite Section', () => {
  const claim = getClaimWithFewDetails();
  //breathingSpace: BreathingSpace
  it('should return debt respite summary sections', async () => {
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim.claimDetails.breathingSpace, 'cimode');
    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.REFERENCE_NUMBER');
    expect(summarySections.sections[0].summaryList.rows[1].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.WHEN_DID_IT_START');
    expect(summarySections.sections[0].summaryList.rows[2].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.TYPE.WHAT_TYPE_IS_IT');
    expect(summarySections.sections[0].summaryList.rows[3].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.EXPECTED_END_DATE');
  });

});
