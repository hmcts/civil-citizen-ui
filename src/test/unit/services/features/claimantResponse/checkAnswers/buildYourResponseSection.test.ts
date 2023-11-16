import { GenericYesNo } from 'common/form/models/genericYesNo';
import { ResponseType } from 'common/form/models/responseType';
import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { PartialAdmission } from 'common/models/partialAdmission';
import { Party } from 'common/models/party';
import { RejectionReason } from 'common/form/models/claimantResponse/rejectionReason';
import { t } from 'i18next';
import {buildYourResponseSection} from 'services/features/claimantResponse/responseSection/buildYourResponseSection';
import { ChooseHowProceed } from 'common/models/chooseHowProceed';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Your response Section', () => {

  const claimId = '123';
  const lng = 'en';
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo();
  claim.claimantResponse.fullAdmitSetDateAcceptPayment.option = YesNo.NO;
  it('should return Your response sections when FA', async () => {
    //Given
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}));
    expect(yourResponseSection.summaryList.rows.length).toBe(0);
  });

  it('should return Your response sections when PA and paid', async () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.YES);
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.YES);
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}));
    expect(yourResponseSection.summaryList.rows.length).toBe(2);
  });

  it('should return 3 sections wen payment accepted', async () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse = new ClaimantResponse();

    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.NO);
    claim.claimantResponse.rejectionReason = new RejectionReason('test');
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}));
    expect(yourResponseSection.summaryList.rows.length).toBe(3);
  });

  it('should return Your response sections when accepted and settled', async () => {
    //Given

    claim.claimantResponse.fullAdmitSetDateAcceptPayment.option = YesNo.YES;
    claim.claimantResponse.chooseHowToProceed = {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT};
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}));
    expect(yourResponseSection.summaryList.rows.length).toBe(1);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('PAGES.CHECK_YOUR_ANSWER.SIGN_SETTLEMENT', {lng}));
  });

  it('should return Your response sections when accepted and issue a CCJ', async () => {
    //Given

    claim.claimantResponse.fullAdmitSetDateAcceptPayment.option = YesNo.YES;
    claim.claimantResponse.chooseHowToProceed = {option: ChooseHowProceed.REQUEST_A_CCJ};
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}));
    expect(yourResponseSection.summaryList.rows.length).toBe(1);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('PAGES.CHECK_YOUR_ANSWER.REQUEST_A_CCJ', {lng}));
  });

});
