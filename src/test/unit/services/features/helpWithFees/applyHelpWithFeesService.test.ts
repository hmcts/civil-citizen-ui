import {Claim} from 'models/claim';
import {getApplyHelpWithFeesContent} from 'services/features/helpWithFees/applyHelpWithFeesService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../../utils/dateUtils';

describe('hasAnythingChanged', () => {

  it('should return all the content if Hearing Fee Type', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.feeTypeHelpRequested = FeeType.HEARING;
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '7000', code: 'test', version: '1'}, FIXED_DATE));

    //when
    const actualHelpWithFeesContent = getApplyHelpWithFeesContent(claim.id, claim);

    //Then
    expect(actualHelpWithFeesContent[0].data.text).toEqual('PAGES.DASHBOARD.HEARINGS.HEARING');
    expect(actualHelpWithFeesContent[1].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.TITLE');
    expect(actualHelpWithFeesContent[2].data.text).toEqual('COMMON.CASE_NUMBER_PARAM');
    expect(actualHelpWithFeesContent[3].data.text).toEqual('COMMON.CLAIM_AMOUNT_WITH_VALUE');
    expect(actualHelpWithFeesContent[4].data.html).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.HEARING_FEE_INSET');
    expect(actualHelpWithFeesContent[4].data.variables).toEqual({'feeAmount': 70});
    expect(actualHelpWithFeesContent[5].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK');
    expect(actualHelpWithFeesContent[6].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.RECEIVE_DECISION');
    expect(actualHelpWithFeesContent[7].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY_TITLE');
    expect(actualHelpWithFeesContent[8].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY');
    expect(actualHelpWithFeesContent[9].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY_TITLE');
    expect(actualHelpWithFeesContent[10].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY');
    expect(actualHelpWithFeesContent[11].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED_TITLE');
    expect(actualHelpWithFeesContent[12].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED');
    expect(actualHelpWithFeesContent[13].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION');
  });

  it('should return partially undefined if no feeType', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    //when
    const actualHelpWithFeesContent = getApplyHelpWithFeesContent(claim.id, claim);

    //Then
    expect(actualHelpWithFeesContent[0].data.text).toEqual('PAGES.DASHBOARD.HEARINGS.HEARING');
    expect(actualHelpWithFeesContent[1].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.TITLE');
    expect(actualHelpWithFeesContent[4].data.html).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.undefined_FEE_INSET');
    expect(actualHelpWithFeesContent[4].data.variables).toEqual({'feeAmount': undefined});
  });
});
