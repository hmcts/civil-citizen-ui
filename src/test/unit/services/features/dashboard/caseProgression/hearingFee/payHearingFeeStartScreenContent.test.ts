import {
  getPayHearingFeeStartScreenContent,
} from 'services/features/dashboard/caseProgression/hearingFee/payHearingFeeStartScreenContent';

describe('getPayHearingFeeStartScreenContent', () => {
  it('should return all the content', () => {
    //Given
    const claim = require('../../../../../../utils/mocks/civilClaimResponseMock.json');

    //When
    const payHearingFeeStartScreenContentActual = getPayHearingFeeStartScreenContent(claim);

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual('PAGES.PAY_HEARING_FEE.START.MICRO_TEXT');
    expect(payHearingFeeStartScreenContentActual[1].data.text).toEqual('PAGES.PAY_HEARING_FEE.START.TITLE');
    expect(payHearingFeeStartScreenContentActual[2].data.text).toEqual('PAGES.PAY_HEARING_FEE.START.YOU_MUST_PAY');
    expect(payHearingFeeStartScreenContentActual[3].data.text).toEqual('PAGES.PAY_HEARING_FEE.START.IF_YOU_DO_NOT_PAY');
    expect(payHearingFeeStartScreenContentActual[4].data.text).toEqual('PAGES.PAY_HEARING_FEE.START.START_NOW');
  });
});
