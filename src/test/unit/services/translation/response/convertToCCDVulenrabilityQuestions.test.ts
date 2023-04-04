import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {CCDVulnerability} from 'models/ccdResponse/ccdVulnerability';
import {
  VulnerabilityQuestions,
} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {toCCDVulnerability} from 'services/translation/response/convertToCCDVulenrabilityQuestions';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate Welsh Language requirement to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDVulnerability = {
      vulnerabilityAdjustmentsRequired: undefined,
      vulnerabilityAdjustments: undefined,
    };
    //When
    const vulnerabilityQuestionsCCD = toCCDVulnerability( claim.directionQuestionnaire.vulnerabilityQuestions);
    //then
    expect(vulnerabilityQuestionsCCD).toEqual(expected);
  });

  it('should return vulnerability details if it exist', () => {
    //given
    claim.directionQuestionnaire.vulnerabilityQuestions = {
      vulnerability :{
        option: YesNo.YES,
        vulnerabilityDetails: 'test',
      },
    };
    const expected: CCDVulnerability = {
      vulnerabilityAdjustmentsRequired: YesNoUpperCamelCase.YES,
      vulnerabilityAdjustments: 'test',
    };
    //When
    const vulnerabilityQuestionsCCD = toCCDVulnerability( claim.directionQuestionnaire.vulnerabilityQuestions);
    //then
    expect(vulnerabilityQuestionsCCD).toEqual(expected);
  });
});
