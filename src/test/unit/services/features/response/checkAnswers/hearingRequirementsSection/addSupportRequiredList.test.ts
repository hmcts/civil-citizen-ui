import {SupportRequired} from 'models/directionsQuestionnaire/supportRequired';
import {generateSupportDetails} from 'services/features/common/addSupportRequiredList';

jest.mock('../../../../../../../main/modules/i18n');

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('generateSupportDetails', () => {
  const item = new SupportRequired();
  const lng = 'en';
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
