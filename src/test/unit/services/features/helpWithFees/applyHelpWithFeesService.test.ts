import {Claim} from 'models/claim';
import {getApplyHelpWithFeesContent} from 'services/features/helpWithFees/applyHelpWithFeesService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFee, HearingFeeInformation} from 'models/caseProgression/hearingFee';

jest.mock('.../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
describe('hasAnythingChanged', () => {

  it('should return all the content if Hearing Fee Type', () => {
    //Given
    const claim = new Claim();
    claim.feeTypeHelpRequested = FeeType.HEARING;
    claim.caseProgressionHearing = new CaseProgressionHearing();
    claim.caseProgressionHearing.hearingFeeInformation = new HearingFeeInformation();
    claim.caseProgressionHearing.hearingFeeInformation.hearingFee = new HearingFee();
    claim.caseProgressionHearing.hearingFeeInformation.hearingFee.calculatedAmountInPence = '7000';

    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });

    //when
    const actualHelpWithFeesContent = getApplyHelpWithFeesContent(claim);

    //Then
    expect(actualHelpWithFeesContent[0].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.HEARING_FEE');
    expect(actualHelpWithFeesContent[1].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.TITLE');
    expect(actualHelpWithFeesContent[2].data.html).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.HEARING_FEE_INSET');
    expect(actualHelpWithFeesContent[2].data.variables).toEqual({'feeAmount': 70});
    expect(actualHelpWithFeesContent[3].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK');
    expect(actualHelpWithFeesContent[4].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.RECEIVE_DECISION');
    expect(actualHelpWithFeesContent[5].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY_TITLE');
    expect(actualHelpWithFeesContent[6].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY');
    expect(actualHelpWithFeesContent[7].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY_TITLE');
    expect(actualHelpWithFeesContent[8].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY');
    expect(actualHelpWithFeesContent[9].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED_TITLE');
    expect(actualHelpWithFeesContent[10].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED');
    expect(actualHelpWithFeesContent[11].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION');
  });

  it('should return partially undefined if no feeType', () => {
    //Given
    const claim = new Claim();

    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });

    //when
    const actualHelpWithFeesContent = getApplyHelpWithFeesContent(claim);

    //Then
    expect(actualHelpWithFeesContent[0].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.undefined_FEE');
    expect(actualHelpWithFeesContent[1].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.TITLE');
    expect(actualHelpWithFeesContent[2].data.html).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.undefined_FEE_INSET');
    expect(actualHelpWithFeesContent[2].data.variables).toEqual({'feeAmount': undefined});
  });
});
