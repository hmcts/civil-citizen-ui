import {Claim} from 'common/models/claim';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {SupportRequiredList} from 'models/directionsQuestionnaire/supportRequired';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {
  CCDHearingSupport,
  CCDSupportRequirement,
} from 'models/ccdResponse/ccdHearingSupport';

describe('translate hearingSupportrequirments to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  const hearingSupportMock = {
    option: YesNo.YES,
    items: [
      {
        fullName: 'jane smith',
        disabledAccess: {sourceName: 'disabledAccess', selected: true},
        hearingLoop: {sourceName: 'hearingLoop', selected: true},
        languageInterpreter: {sourceName: 'languageInterpreter', selected: true, content: 'French'},
        signLanguageInterpreter: {sourceName: 'signLanguageInterpreter', selected: true, content: 'French'},
        otherSupport: {sourceName: 'otherSupport', selected: true,content: 'help'},
      },
      {
        fullName: 'john',
        disabledAccess: {sourceName: 'disabledAccess', selected: false},
        hearingLoop: {sourceName: 'hearingLoop', selected: true},
        languageInterpreter: {sourceName: 'languageInterpreter', selected: true, content: 'French'},
        signLanguageInterpreter: {sourceName: 'signLanguageInterpreter', selected: false},
        otherSupport: {sourceName: 'otherSupport', selected: false},
      },
    ],
  };
  claim.directionQuestionnaire.hearing.supportRequiredList = new SupportRequiredList(hearingSupportMock.option, hearingSupportMock.items);

  it('should return undefined if data doesnt exist', () => {
    //given
    const claimEmpty = new Claim();
    claimEmpty.directionQuestionnaire = new DirectionQuestionnaire();
    claimEmpty.directionQuestionnaire.hearing = new Hearing();

    const expected: CCDHearingSupport = {
      supportRequirementLip: undefined,
      requirementsLip: undefined,
    };
    //When
    const hearingSupportCCD = toCCDSHearingSupport(claimEmpty.directionQuestionnaire.hearing.supportRequiredList);
    //then
    expect(hearingSupportCCD).toEqual(expected);
  });

  it('should translate hearingSupport list  to CCD', () => {
    //given
    const hearingSupportCCD: CCDHearingSupport = {
      'supportRequirementLip': YesNoUpperCamelCase.YES,
      'requirementsLip' : [{
        value: {
          'name': 'jane smith',
          'languageToBeInterpreted': 'French',
          'otherSupport': 'help',
          'requirements': [
            CCDSupportRequirement.DISABLED_ACCESS,
            CCDSupportRequirement.HEARING_LOOPS,
            CCDSupportRequirement.LANGUAGE_INTERPRETER,
            CCDSupportRequirement.SIGN_INTERPRETER,
            CCDSupportRequirement.OTHER_SUPPORT,
          ],
          'signLanguageRequired': 'French',
        }},{
        value: {
          'name': 'john',
          'languageToBeInterpreted': 'French',
          'otherSupport': undefined,
          'requirements': [
            CCDSupportRequirement.HEARING_LOOPS,
            CCDSupportRequirement.LANGUAGE_INTERPRETER,
          ],
          'signLanguageRequired': undefined,
        },
      }],
    };
    //when
    const evidenceResponseCCD = toCCDSHearingSupport(hearingSupportMock);
    //then
    expect(evidenceResponseCCD).toMatchObject(hearingSupportCCD);
  });
});
