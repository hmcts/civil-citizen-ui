import {getHearingFeeStartPageContent} from 'services/features/caseProgression/hearingFee/hearingFeeStartPageContent';
import {Claim} from 'models/claim';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE} from '../../../../../utils/dateUtils';
import {t} from 'i18next';

describe('getPayHearingFeeStartScreenContent en', () => {
  it('should return all the content', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getHearingFeeStartPageContent(claim.id, 'en', 1000,claim.caseProgressionHearing.hearingFeeInformation);

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual('PAGES.DASHBOARD.HEARINGS.HEARING');
    expect(payHearingFeeStartScreenContentActual[1].data.text).toEqual('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE');
    expect(payHearingFeeStartScreenContentActual[2].data.text).toEqual('COMMON.CASE_NUMBER_PARAM');
    expect(payHearingFeeStartScreenContentActual[3].data.text).toEqual('COMMON.CLAIM_AMOUNT_WITH_VALUE');
    expect(payHearingFeeStartScreenContentActual[4].data.text).toEqual(t('PAGES.PAY_HEARING_FEE.START_PAGE.YOU_MUST_PAY',{lng:'en'}));
    expect(payHearingFeeStartScreenContentActual[5].data.text).toEqual(t('PAGES.PAY_HEARING_FEE.START_PAGE.IF_YOU_DO_NOT_PAY',{lng:'en'}));
    expect(payHearingFeeStartScreenContentActual[6].data.text).toEqual('COMMON.BUTTONS.START_NOW');
  });
  it('should return all the content cy', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getHearingFeeStartPageContent(claim.id, 'cy', 1000,claim.caseProgressionHearing.hearingFeeInformation);

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual('PAGES.DASHBOARD.HEARINGS.HEARING');
    expect(payHearingFeeStartScreenContentActual[1].data.text).toEqual('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE');
    expect(payHearingFeeStartScreenContentActual[2].data.text).toEqual('COMMON.CASE_NUMBER_PARAM');
    expect(payHearingFeeStartScreenContentActual[3].data.text).toEqual('COMMON.CLAIM_AMOUNT_WITH_VALUE');
    expect(payHearingFeeStartScreenContentActual[4].data.text).toEqual(t('PAGES.PAY_HEARING_FEE.START_PAGE.YOU_MUST_PAY',{lng:'cy'}));
    expect(payHearingFeeStartScreenContentActual[5].data.text).toEqual(t('PAGES.PAY_HEARING_FEE.START_PAGE.IF_YOU_DO_NOT_PAY',{lng:'cy'}));
    expect(payHearingFeeStartScreenContentActual[6].data.text).toEqual('COMMON.BUTTONS.START_NOW');
  });
});
