import {getSummarySections} from 'services/features/breathingSpace/checkYourAnswer/checkAnswersService';
import {getClaimWithFewDetails, getClaimWithNoDetails} from '../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../utils/checkAnswersConstants';
import {
  BREATHING_SPACE_RESPITE_END_DATE_URL,
  BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL,
  BREATHING_SPACE_RESPITE_START_DATE_URL,
  BREATHING_SPACE_RESPITE_TYPE_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const claimId = ':id';

describe('Dept Respite Section', () => {
  let claim: Claim;
  beforeEach(()=>{
    claim = getClaimWithFewDetails();
  });

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

  it('should return debt respite summary sections with content ', async () =>{
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim.claimDetails.breathingSpace, 'cimode');
    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe('R225B1230');
    expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe('10 January 2022');
    expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe('PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE.STANDARD');
    expect(summarySections.sections[0].summaryList.rows[3].value.html).toBe('10 December 2022');
  });

  it('should return debt respite summary sections with href link', async () =>{
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim.claimDetails.breathingSpace, 'cimode');
    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[0].summaryList.rows[0].actions.items[0].href).toBe('/case/claimId/breathing-space/respite-reference-number');
    expect(summarySections.sections[0].summaryList.rows[1].actions.items[0].href).toBe('/case/claimId/breathing-space/respite-start');
    expect(summarySections.sections[0].summaryList.rows[2].actions.items[0].href).toBe('/case/claimId/breathing-space/respite-type');
    expect(summarySections.sections[0].summaryList.rows[3].actions.items[0].href).toBe('/case/claimId/breathing-space/respite-end');
  });

  it('should return debt respite summary sections with button change label', async () =>{
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim.claimDetails.breathingSpace, 'cimode');
    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[0].summaryList.rows[0].actions.items[0].text).toBe('COMMON.BUTTONS.CHANGE');
    expect(summarySections.sections[0].summaryList.rows[1].actions.items[0].text).toBe('COMMON.BUTTONS.CHANGE');
    expect(summarySections.sections[0].summaryList.rows[2].actions.items[0].text).toBe('COMMON.BUTTONS.CHANGE');
    expect(summarySections.sections[0].summaryList.rows[3].actions.items[0].text).toBe('COMMON.BUTTONS.CHANGE');
  });

  it('should return empty debt respite summary sections', async () => {
    //When
    const claim = getClaimWithNoDetails();
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim.claimDetails.breathingSpace, 'cimode');
    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.REFERENCE_NUMBER');
    expect(summarySections.sections[0].summaryList.rows[1].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.WHEN_DID_IT_START');
    expect(summarySections.sections[0].summaryList.rows[2].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.TYPE.WHAT_TYPE_IS_IT');
    expect(summarySections.sections[0].summaryList.rows[3].key.text).toBe('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.EXPECTED_END_DATE');
  });

  it('should return the parameter url', async ()=>{

    const claim = getClaimWithFewDetails();
    //When
    const summarySections = await getSummarySections(claimId, claim.claimDetails.breathingSpace, 'cimode');
    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[0].summaryList.rows[0].actions.items[0].href).toBe(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL);
    expect(summarySections.sections[0].summaryList.rows[1].actions.items[0].href).toBe(BREATHING_SPACE_RESPITE_START_DATE_URL);
    expect(summarySections.sections[0].summaryList.rows[2].actions.items[0].href).toBe(BREATHING_SPACE_RESPITE_TYPE_URL);
    expect(summarySections.sections[0].summaryList.rows[3].actions.items[0].href).toBe(BREATHING_SPACE_RESPITE_END_DATE_URL);

  });

});
