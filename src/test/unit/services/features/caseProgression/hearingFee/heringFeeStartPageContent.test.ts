import {getHearingFeeStartPageContent} from 'services/features/caseProgression/hearingFee/hearingFeeStartPageContent';
import {Claim} from 'models/claim';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE} from '../../../../../utils/dateUtils';

describe('getPayHearingFeeStartScreenContent', () => {
  it('should return all the content', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getHearingFeeStartPageContent(claim.id, 'en', claim.caseProgressionHearing.hearingFeeInformation);

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual('COMMON.MICRO_TEXT.HEARING_FEE');
    expect(payHearingFeeStartScreenContentActual[1].data.text).toEqual('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE');
    expect(payHearingFeeStartScreenContentActual[2].data.text).toEqual('PAGES.PAY_HEARING_FEE.START_PAGE.YOU_MUST_PAY');
    expect(payHearingFeeStartScreenContentActual[3].data.text).toEqual('PAGES.PAY_HEARING_FEE.START_PAGE.IF_YOU_DO_NOT_PAY');
    expect(payHearingFeeStartScreenContentActual[4].data.text).toEqual('COMMON.BUTTONS.START_NOW');
  });
});
