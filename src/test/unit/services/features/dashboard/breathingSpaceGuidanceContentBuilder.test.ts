import {getBSGuidanceContent} from 'services/dashboard/breathingSpaceGuidanceContentBuilder';
jest.mock('i18next', () => ({
  use: jest.fn(),
  t: (i: string | unknown) => i,
}));

describe('breathing space guidance page content builder', () => {

  it('should get the content for the page', () => {

    const pageContent = getBSGuidanceContent('en');
    expect(pageContent).toMatchObject([
      {
        type: 'title',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.PAGE_TITLE',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.SUMMARY',
        },
      },
      {
        type: 'title',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_1',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_2',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_3',
        },
      },
      {
        type: 'html',
        data: {
          html: '<ul class="govuk-list govuk-list--bullet">\n' +
            '              <li>PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_1</li>\n' +
            '              <li>PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_2</li>\n' +
            '              <li>PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_3</li>\n' +
            '              <li>PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_4</li>\n' +
            '            </ul>',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_4',
        },
      },
      {
        type: 'title',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.HOW_TO_CONTACT',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.HOW_TO_CONTACT_PARA1',
        },
      },
      {
        type: 'link',
        data: {
          text: 'PAGES.LATEST_UPDATE_CONTENT.EMAIL_ID',
          href: 'mailto:contactocmc@justice.gov.uk',
          textBefore: 'PAGES.LATEST_UPDATE_CONTENT.EMAIL',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.POST',
        },
      },
      {
        type: 'html',
        data: {
          html: '<p class="govuk-body">PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.HOW_TO_CONTACT_PARA3</p>',
        },
      },
      {
        type: 'title',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS_PARA1',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS_PARA2',
        },
      },
      {
        type: 'title',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO_PARA1',
        },
      },
      {
        type: 'html',
        data: {
          html: '<p class="govuk-body">PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO_PARA2</p>',
        },
      },
    ]);
  });
});
