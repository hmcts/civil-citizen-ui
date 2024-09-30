import {Claim} from 'models/claim';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {t} from 'i18next';
import {
  getPaymentSuccessfulBodyContent, getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/paymentSuccessfulContents';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import { Hearing } from 'common/models/caseProgression/hearing';
import {PaymentInformation} from 'models/feePayment/paymentInformation';

describe('getPaymentSuccessfulContent en', () => {
  it('should return getPaymentSuccessfulBodyContent english', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getPaymentSuccessfulBodyContent(claim, '1000','en');

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.CONFIRMATION',{lng:'en'}));
    expect(payHearingFeeStartScreenContentActual[1].data.text).toEqual(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.PAYMENT_SUMMARY',{lng:'en'}));

  });
  it('should return getPaymentSuccessfulBodyContent welsh', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getPaymentSuccessfulBodyContent(claim, '1000','cy');

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.CONFIRMATION',{lng:'cy'}));
    expect(payHearingFeeStartScreenContentActual[1].data.text).toEqual(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.PAYMENT_SUMMARY',{lng:'cy'}));

  });
  it('should return getPaymentSuccessfulPanelContent english', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.hearing = new Hearing();
    claim.caseProgression.hearing.paymentInformation = new PaymentInformation();
    claim.caseProgression.hearing.paymentInformation.paymentReference = '1111';
    //When
    const payHearingFeeStartScreenContentActual = getPaymentSuccessfulPanelContent(claim,'en');

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual(t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE',{lng:'en'}));
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual(t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_IS',{lng:'en'}));

  });
  it('should return getPaymentSuccessfulPanelContent welsh', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.hearing = new Hearing();
    claim.caseProgression.hearing.paymentInformation = new PaymentInformation();
    claim.caseProgression.hearing.paymentInformation.paymentReference = '1111';
    //When
    const payHearingFeeStartScreenContentActual = getPaymentSuccessfulPanelContent(claim,'cy');

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual(t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE',{lng:'cy'}));
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual(t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_IS',{lng:'cy'}));
  });
  it('should return getPaymentSuccessfulButtonContent english', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getPaymentSuccessfulButtonContent('url');

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual('COMMON.BUTTONS.GO_TO_ACCOUNT');

  });
  it('should return getPaymentSuccessfulButtonContent welsh', () => {
    //Given
    const claim = new Claim();
    claim.id = '1234567890';
    claim.caseProgressionHearing = new CaseProgressionHearing(null, null,null,null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
    //When
    const payHearingFeeStartScreenContentActual = getPaymentSuccessfulButtonContent('url');

    //Then
    expect(payHearingFeeStartScreenContentActual[0].data.text).toEqual('COMMON.BUTTONS.GO_TO_ACCOUNT');
  });
});
