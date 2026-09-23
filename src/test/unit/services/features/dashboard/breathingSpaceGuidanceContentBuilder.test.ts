import {getBSGuidanceContent} from 'services/dashboard/breathingSpaceGuidanceContentBuilder';
jest.mock('i18next', () => ({
  use: jest.fn(),
  t: (i: string | unknown) => i,
}));

describe('breathing space guidance page content builder', () => {

  it('should get the content for the page without QM Lip information', () => {
    const pageContent = getBSGuidanceContent('en', 'qmLink');
    const sectionTexts = pageContent.map((section) => section.data?.text);

    expect(sectionTexts).toContain('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS');
    expect(sectionTexts).toContain('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHEN_BS_ENDS');
    expect(sectionTexts).toContain('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO');
    expect(pageContent.some((section) =>
      section.type === 'button' &&
      section.data?.text === 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.ENTER_BREATHING_SPACE_DETAILS',
    )).toBe(true);
  });

  it('should get the content for the page with QM Lip information', () => {
    const pageContent = getBSGuidanceContent('en', 'qmLink', true);
    expect(pageContent.some((section) => section.data?.text === 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHEN_BS_ENDS')).toBe(true);
  });

});
