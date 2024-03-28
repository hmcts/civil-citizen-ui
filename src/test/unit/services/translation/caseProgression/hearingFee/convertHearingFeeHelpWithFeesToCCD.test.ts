import {
  convertHearingFeeHelpWithFeesToCCD,
} from 'services/translation/caseProgression/hearingFee/convertHearingFeeHelpWithFeesToCCD';
import {Claim} from 'models/claim';
import {CCDHelpWithFees} from 'form/models/claimDetails';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaim} from 'models/civilClaimResponse';

describe( 'Convert hearing HwF to CCD', () => {

  it('When HwF option is yes with reference number', () => {
    //given
    const claim = new Claim();
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.helpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, '12341234123');
    //when
    const actualTranslation = convertHearingFeeHelpWithFeesToCCD(claim);
    //then
    const expectedTranslation = {hearingFeeHelpWithFees: {helpWithFee: YesNoUpperCamelCase.YES, helpWithFeesReferenceNumber: '12341234123'} as CCDHelpWithFees};
    expect(actualTranslation).toEqual(expectedTranslation);
  });

  it('When HwF option is no without reference number', () => {
    //given
    const claim = new Claim();
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.helpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.NO);
    //when
    const actualTranslation = convertHearingFeeHelpWithFeesToCCD(claim);
    //then
    const expectedTranslation = {hearingFeeHelpWithFees: {helpWithFee: YesNoUpperCamelCase.NO} as CCDHelpWithFees};
    expect(actualTranslation).toEqual(expectedTranslation);
  });

  it('When HwF option is undefined', () => {
    //given
    const claim = new Claim();
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.helpFeeReferenceNumberForm = undefined;
    //when
    const actualTranslation = convertHearingFeeHelpWithFeesToCCD(claim);
    //then
    const expectedTranslation = {hearingFeeHelpWithFees: undefined} as CCDClaim;
    expect(actualTranslation).toEqual(expectedTranslation);
  });
});
