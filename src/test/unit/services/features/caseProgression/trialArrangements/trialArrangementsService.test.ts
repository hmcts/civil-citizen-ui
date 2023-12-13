import {
  getClaimWithClaimantTrialArrangements,
  getClaimWithDefendantTrialArrangements,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CaseRole} from 'form/models/caseRoles';
import {
  getHasAnythingChangedForm,
  getIsCaseReadyForm, getOtherInformationForm, getNameTrialArrangements,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsService';
import {Claim} from 'models/claim';
import {IsCaseReadyForm} from 'models/caseProgression/trialArrangements/isCaseReadyForm';
import {YesNo} from 'form/models/yesNo';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {OtherTrialInformation} from 'form/models/caseProgression/trialArrangements/otherTrialInformation';

describe('trialArrangementsService', () => {

  //given
  const claimForClaimant = {...getClaimWithClaimantTrialArrangements(), caseRole: CaseRole.CLAIMANT} as Claim;
  const claimForDefendant = {...getClaimWithDefendantTrialArrangements(), caseRole: CaseRole.DEFENDANT} as Claim;

  it('returns isCaseReady for claimant', () => {
    //when
    const formContents = getIsCaseReadyForm(claimForClaimant);

    //Then
    expect(formContents).toEqual(new IsCaseReadyForm(YesNo.YES));
  });

  it('returns isCaseReady for defendant', () => {
    //when
    const formContents = getIsCaseReadyForm(claimForDefendant);

    //Then
    expect(formContents).toEqual(new IsCaseReadyForm(YesNo.YES));
  });

  it('returns hasAnythingChanged for claimant', () => {
    //when
    const formContents = getHasAnythingChangedForm(claimForClaimant);

    //then
    expect(formContents).toEqual(new HasAnythingChangedForm(YesNo.YES, 'Changed'));

  });

  it('returns hasAnythingChanged for defendant', () => {
    //when
    const formContents = getHasAnythingChangedForm(claimForDefendant);

    //then
    expect(formContents).toEqual(new HasAnythingChangedForm(YesNo.YES, 'Changed'));

  });

  it('returns otherTrialInformation for claimant', () => {
    //when
    const formContents = getOtherInformationForm(claimForClaimant);

    //then
    expect(formContents).toEqual(new OtherTrialInformation('Other Information'));
  });

  it('returns otherTrialInformation for defendant', () => {
    //when
    const formContents = getOtherInformationForm(claimForDefendant);

    //then
    expect(formContents).toEqual(new OtherTrialInformation('Other Information'));
  });

  it('returns name of trial arrangements field for claimant', () => {
    //when
    const name = getNameTrialArrangements(claimForClaimant);

    //then
    expect(name).toEqual('claimantTrialArrangements');

  });

  it('returns name of trial arrangements field for defendant', () => {
    //when
    const name = getNameTrialArrangements(claimForDefendant);

    //then
    expect(name).toEqual('defendantTrialArrangements');

  });
});
