import {
  translateDraftTrialArrangementsToCCD,
} from 'services/translation/caseProgression/trialArrangements/convertToCCDTrialArrangements';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseRole} from 'form/models/caseRoles';
import {
  CCDTrialArrangementClaimant,
  CCDTrialArrangementDefendent,
} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';

describe('toCCDTrialArrangements', () => {
  function createCUIClaim() : Claim {
    const claim = new Claim();
    const caseProgression = new CaseProgression();

    const trialArrangement = new TrialArrangements();
    trialArrangement.hasAnythingChanged = new HasAnythingChangedForm(YesNo.YES, 'Changed');
    trialArrangement.isCaseReady = YesNo.YES;
    trialArrangement.otherTrialInformation = 'Other information';
    caseProgression.claimantTrialArrangements = trialArrangement;
    caseProgression.defendantTrialArrangements = trialArrangement;
    claim.caseProgression = caseProgression;

    return claim;
  }

  function createCCDClaim(isClaimant: boolean) : CCDTrialArrangementClaimant | CCDTrialArrangementDefendent {

    if(isClaimant){
      return {
        trialReadyApplicant : YesNoUpperCamelCase.YES,
        applicantRevisedHearingRequirements: {revisedHearingRequirements:YesNoUpperCamelCase.YES, revisedHearingComments:'Changed'},
        applicantHearingOtherComments: {hearingOtherComments:'Other information'},
      };
    } else {
      return {
        trialReadyRespondent1 : YesNoUpperCamelCase.YES,
        respondent1RevisedHearingRequirements: {revisedHearingRequirements:YesNoUpperCamelCase.YES, revisedHearingComments:'Changed'},
        respondent1HearingOtherComments: {hearingOtherComments:'Other information'},
      };
    }
  }

  function getCCDOutForUndefinedCaseProgression(): CCDClaim {
    return {
      trialReadyApplicant : undefined,
      applicantRevisedHearingRequirements: undefined,
      applicantHearingOtherComments: undefined,
      trialReadyRespondent1 : undefined,
      respondent1RevisedHearingRequirements: undefined,
      respondent1HearingOtherComments: undefined,
    };
  }

  it('should convert CaseProgression claimant trialArrangements to CCDClaim', () => {

    const cuiClaim = createCUIClaim();
    cuiClaim.caseRole = CaseRole.CLAIMANT;
    const actualOutput = translateDraftTrialArrangementsToCCD(cuiClaim);
    expect(actualOutput).toEqual(createCCDClaim(true));
  });

  it('should convert CaseProgression defendant trialArrangements to CCDClaim', () => {

    const cuiClaim = createCUIClaim();
    cuiClaim.caseRole = CaseRole.DEFENDANT;
    const actualOutput = translateDraftTrialArrangementsToCCD(cuiClaim);
    expect(actualOutput).toEqual(createCCDClaim(false));
  });

  it('should return undefined ', () => {
    const cuiClaim: Claim = new Claim();
    cuiClaim.caseProgression = undefined;
    const actualOutput = translateDraftTrialArrangementsToCCD(cuiClaim);
    expect(actualOutput).toEqual(getCCDOutForUndefinedCaseProgression());
  });
});
