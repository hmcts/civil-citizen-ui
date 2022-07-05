import {ClaimSummaryContent, ClaimSummaryType} from '../../../common/form/models/claimSummarySection';
import { t } from 'i18next';
import { getLng } from '../../../common/utils/languageToggleUtils';
import { SummaryRow } from '../../../common/models/summaryList/summaryList';

/**
 * Mock service
 */

const claimantName = 'Mary Richards';

const rows: SummaryRow[] = [
  {
    key: {
      text: 'Name',
    },
    value: {
      text: 'Sarah Philips',
    },
    actions: {
      items: [
        {
          href: '#',
          text: 'Change',
          visuallyHiddenText: 'name',
        },
      ],
    },
  },
  {
    key: {
      text: 'Date of birth',
    },
    value: {
      text: '5 January 1978',
    },
    actions: {
      items: [
        {
          href: '#',
          text: 'Change',
          visuallyHiddenText: 'date of birth',
        },
      ],
    },
  },
  {
    key: {
      text: 'Address',
    },
    value: {
      html: '72 Guild Street<br>London<br>SE23 6FH',
    },
    actions: {
      items: [
        {
          href: '#',
          text: 'Change',
          visuallyHiddenText: 'address',
        },
      ],
    },
  },
  {
    key: {
      text: 'Contact details',
    },
    value: {
      html: '<p class="govuk-body">07700 900457</p><p class="govuk-body">sarah.phillips@example.com</p>',
    },
    actions: {
      items: [
        {
          href: '#',
          text: 'Change',
          visuallyHiddenText: 'contact details',
        },
      ],
    },
  },
];

function getLatestUpdateContent(lang: string): ClaimSummaryContent[] {
  return [
    {
      contentSections: [
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: 'You can request a County Court Judgment',
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: `${claimantName} has not responded to your claim by the deadline. You can request a County Court Judgment (CCJ) against them.`,
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: 'The court will order them to pay the money. It doesn´t guarantee that they´ll pay it.',
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: `${claimantName} can still respond to the claim until you request a CCJ.`,
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            text: 'Request a CCJ',
            href: '/test',
          },
        },
      ],
      hasDivider: true,
    },
    {
      contentSections: [
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: 'Tell us you´ve ended the claim',
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: 'If you´ve been paid or you´ve made another agreement with the defendant, you need to tell us.',
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            text: 'Tell us you´ve settled',
            href: '/test',
            classes: 'govuk-button--secondary',
          },
        },
      ],
      hasDivider: true,
    },
    {
      contentSections: [
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: 'Notify us about the debt respite scheme (breathing space)',
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: 'Do you need to notify us that the defendant has entered the debt respite scheme (breathing space)?',
          },
        },
        {
          type: ClaimSummaryType.LINK,
          data: {
            text: 'debt respite scheme (opens in new tab)',
            href: '/test',
            textBefore: 'More information about the',
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            text: 'Notify us about the debt respite scheme',
            href: '/test',
            classes: 'govuk-button--secondary',
          },
        },
      ],
      hasDivider: true,
    },
    {
      contentSections: [
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: 'View the responses to the order',
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            href: '/test',
            text: 'See the details you sent to the court',
            classes: 'govuk-button--secondary',
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            href: '/test',
            text: 'See the details the defendant sent to the court',
            classes: 'govuk-button--secondary',
          },
        },
      ],
      hasDivider: true,
    },
    {
      contentSections: [
        {
          type: ClaimSummaryType.TITLE,
          data: {
            text: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', { lng: getLng(lang) }),
          },
        },
        {
          type: ClaimSummaryType.SUBTITLE,
          data: {
            text: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', { lng: getLng(lang) }),
          },
        },
        {
          type: ClaimSummaryType.HTML,
          data: {
            html: '<p class="govuk-body">You can buy:</p><ul class="govuk-list govuk-list--bullet"><li>apples</li><li>oranges</li><li>pears</li></ul>',
          },
        },
        {
          type: ClaimSummaryType.PARAGRAPH,
          data: {
            text: 'Hello',
          },
        },
        {
          type: ClaimSummaryType.INSET_TEXT,
          data: {
            text: 'Hello',
          },
        },
        {
          type: ClaimSummaryType.INSET_TEXT,
          data: {
            html: '<p>This is HTML content inside insetText component</p>',
          },
        },
        {
          type: ClaimSummaryType.SUMMARY,
          data: {
            rows: rows,
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            href: '/test',
            text: 'My primary button',
          },
        },
        {
          type: ClaimSummaryType.BUTTON,
          data: {
            href: '/test',
            text: 'My secondary button',
            classes: 'govuk-button--secondary',
          },
        },
      ],
    },
  ];
}

function getDocumentsContent(lang?: string): ClaimSummaryContent[] {
  return [{
    contentSections: [
      {
        type: ClaimSummaryType.LINK,
        data: {
          href: '/test',
          text: t('PAGES.CLAIM_SUMMARY.DOWNLOAD_JUDGMENT_ORDER', { lng: getLng(lang) }),
          textAfter: '(PDF)',
          subtitle: 'Created: 27 May 2022',
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          href: '/test',
          text: 'Download the new order',
          textAfter: '(PDF)',
          subtitle: 'Created: 25 April 2022',
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          href: '/test',
          text: 'Download the original order',
          textAfter: '(PDF), which is now cancelled.',
          subtitle: 'Created: 5 April 2022',
        },
      },
    ],
  }];
}

export { getLatestUpdateContent, getDocumentsContent };
