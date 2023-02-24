import {Claim} from 'common/models/claim';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {SupportRequiredList} from 'models/directionsQuestionnaire/supportRequired';
import {toCCDSHearingSupport} from 'services/translation/response/convertToCCDHearingSupport';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDHearingSupport, CCDSupportRequirements} from 'models/ccdResponse/ccdHearingSupport';

describe('translate hearingSupport to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  const hearingSupportMock = {
    option: YesNo.YES,
    items: [
      {
        fullName: 'abc',
        disabledAccess: {sourceName: 'disabledAccess', selected: true},
        hearingLoop: {sourceName: 'hearingLoop', selected: true},
        languageInterpreter: {sourceName: 'languageInterpreter', selected: true, content: 'French'},
        signLanguageInterpreter: {sourceName: 'signLanguageInterpreter', selected: true, content: 'French'},
        otherSupport: {sourceName: 'otherSupport', selected: true,content: 'help'},
      },
    ],
  };
  claim.directionQuestionnaire.hearing.supportRequiredList = new SupportRequiredList(hearingSupportMock.option, hearingSupportMock.items);

  it('should return undefined if items doesnt exist', () => {
    //given
    const claimEmpty = new Claim();
    claimEmpty.directionQuestionnaire = new DirectionQuestionnaire();
    claimEmpty.directionQuestionnaire.hearing = new Hearing();

    const expected: CCDHearingSupport = {
      languageToBeInterpreted: undefined,
      otherSupport: undefined,
      requirements: undefined,
      signLanguageRequired: undefined,
      supportRequirements: undefined,
      supportRequirementsAdditional: '',
    };
    //When
    const hearingSupportCCD = toCCDSHearingSupport(claimEmpty.directionQuestionnaire.hearing.supportRequiredList);
    //then
    expect(hearingSupportCCD).toEqual(expected);
  });

  it('should translate hearingSupport list  to CCD', () => {
    //given
    const hearingSupportCCD: CCDHearingSupport = {
      'languageToBeInterpreted': 'French',
      'otherSupport': 'help',
      'requirements': [
        CCDSupportRequirements.DISABLED_ACCESS,
        CCDSupportRequirements.HEARING_LOOPS,
        CCDSupportRequirements.LANGUAGE_INTERPRETER,
        CCDSupportRequirements.SIGN_INTERPRETER,
        CCDSupportRequirements.OTHER_SUPPORT,
      ],
      'signLanguageRequired': 'French',
      'supportRequirements': YesNoUpperCamelCase.YES,
      'supportRequirementsAdditional': '',
    };
    //when
    const evidenceResponseCCD = toCCDSHearingSupport(hearingSupportMock);
    //then
    expect(evidenceResponseCCD).toMatchObject(hearingSupportCCD);
  });
});
