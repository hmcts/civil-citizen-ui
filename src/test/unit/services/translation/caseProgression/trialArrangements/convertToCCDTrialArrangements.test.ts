import {
  translateDraftTrialArrangementsToCCD,
} from 'services/translation/caseProgression/trialArrangements/convertToCCDTrialArrangements';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {
  CCDTrialArrangementDefendent,
} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';

describe('toCCDTrialArrangements', () => {
  function createCUIClaim() : Claim {
    const claim = new Claim();
    const caseProgression = new CaseProgression();
    const defendantTrialArrangement = new TrialArrangements();
    defendantTrialArrangement.hasAnythingChanged = new HasAnythingChangedForm(YesNo.YES, 'Changed'),
    defendantTrialArrangement.isCaseReady = YesNo.YES,
    defendantTrialArrangement.otherTrialInformation = 'Other information';
    caseProgression.defendantTrialArrangements = defendantTrialArrangement;
    claim.caseProgression = caseProgression;
    return claim;
  }

  function createCCDClaim() : CCDTrialArrangementDefendent {
    return {
      trialReadyRespondent1 : YesNoUpperCamelCase.YES,
      respondent1RevisedHearingRequirements: {revisedHearingRequirements:YesNoUpperCamelCase.YES, revisedHearingComments:'Changed'},
      respondent1HearingOtherComments: {hearingOtherComments:'Other information'},
    };
  }

  function getCCDOutoutForUndefinedCaseProgression(): CCDTrialArrangementDefendent {
    return {
      trialReadyRespondent1 : undefined,
      respondent1RevisedHearingRequirements: undefined,
      respondent1HearingOtherComments: undefined,
    };
  }

  it('should convert CaseProgression trialArrangements to CCDClaim', () => {

    const cuiClaim = createCUIClaim();
    const actualOutput = translateDraftTrialArrangementsToCCD(cuiClaim);
    expect(actualOutput).toEqual(createCCDClaim());
  });

  it('should return undefined ', () => {
    const cuiClaim: Claim = new Claim();
    cuiClaim.caseProgression = undefined;
    const actualOutput = translateDraftTrialArrangementsToCCD(cuiClaim);
    expect(actualOutput).toEqual(getCCDOutoutForUndefinedCaseProgression());
  });
});
