import {SupportRequired, SupportRequiredList} from '../../../../../../../main/common/models/directionsQuestionnaire/supportRequired';
import {generateSupportDetails} from 'services/features/common/addSupportRequiredList';
import {addSupportRequiredList} from 'services/features/claimantResponse/checkAnswers/hearing/addSupportRequiredList';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CaseState} from 'form/models/claimDetails';
import {YesNo} from 'form/models/yesNo';
import {summarySection} from 'models/summaryList/summarySections';

jest.mock('../../../../../../../main/modules/i18n');

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

jest.retryTimes(0);

describe('generateSupportDetails', () => {
  let item: SupportRequired;
  const lng = 'en';
  beforeEach(() => {
    item = new SupportRequired();
  });
  it('should return disabled access', () => {
    // Given
    item.disabledAccess = {selected: true};
    //When
    const result = generateSupportDetails(item, lng);
    //Then
    expect(result).toContain('PAGES.SUPPORT_REQUIRED.DISABLE');
  });
  it('should return hearing loop', () => {
    //Given
    item.hearingLoop = {selected: true};
    //When
    const result = generateSupportDetails(item, lng);
    //Then
    expect(result).toContain('PAGES.SUPPORT_REQUIRED.HEARING');
  });
  it('should return signlanguage interpreter', () => {
    //Given
    item.signLanguageInterpreter = {
      selected: true,
      content: 'BSL',
    };
    //When
    const result = generateSupportDetails(item, lng);
    //Then
    expect(result).toContain('BSL');
    expect(result).toContain('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER');
  });
  it('should return language interpreter', () => {
    //Given
    item.languageInterpreter = {
      selected: true,
      content: 'Spanish',
    };
    //When
    const result = generateSupportDetails(item, lng);
    //Then
    expect(result).toContain('Spanish');
    expect(result).toContain('PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER');
  });
  it('should returnother support', () => {
    //Given
    item.otherSupport = {
      selected: true,
      content: 'test',
    };
    //When
    const result = generateSupportDetails(item, lng);
    //Then
    expect(result).toContain('test');
    expect(result).toContain('AGES.CHECK_YOUR_ANSWER.EVIDENCE_OTHER');
  });
});

describe('claimant hearing support ownership', () => {
  const questionnaire = (name: string, option = YesNo.YES): DirectionQuestionnaire => {
    const dq = new DirectionQuestionnaire();
    dq.hearing = new Hearing();
    dq.hearing.supportRequiredList = new SupportRequiredList(option, [new SupportRequired({
      fullName: name, languageInterpreter: {selected: true, content: `${name} language`},
    })]);
    return dq;
  };

  it.each([
    [CaseState.AWAITING_APPLICANT_INTENTION, 'Claimant person', 'Defendant person'],
    [CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT, 'Defendant person', 'Claimant person'],
  ])('selects the correct questionnaire in %s', (state, expected, other) => {
    const claim = new Claim();
    claim.ccdState = state as CaseState;
    claim.directionQuestionnaire = questionnaire('Defendant person');
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = questionnaire('Claimant person');
    const section = summarySection({title: 'Hearing', summaryRows: []});

    addSupportRequiredList(claim, section, '1234', 'en');

    const values = section.summaryList.rows.map(row => row.value?.html);
    expect(values).toContain(expected);
    expect(values).toContain(`${expected} language PAGES.CHECK_YOUR_ANSWER.SUPPORT_REQUIRED_INTERPRETER`);
    expect(values).not.toContain(other);
    expect(section.summaryList.rows[0].value.html).toBe('COMMON.VARIATION_3.YES');
  });

  it('does not borrow defendant support when the claimant selected no support', () => {
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.directionQuestionnaire = questionnaire('Defendant person');
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = questionnaire('Claimant person', YesNo.NO);
    const section = summarySection({title: 'Hearing', summaryRows: []});

    addSupportRequiredList(claim, section, '1234', 'en');

    expect(section.summaryList.rows.map(row => row.value.html)).toEqual(['COMMON.VARIATION_3.NO']);
  });
});
