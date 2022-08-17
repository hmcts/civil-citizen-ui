import {ClaimSummarySection, ClaimSummaryType} from '../../../../../../common/form/models/claimSummarySection';
import {SummaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {Claim} from '../../../../../../common/models/claim';

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 *
 * The logic on this file is not the real business logic.
 * This code is only a concept of what we should do.
 *
 */

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

export const getFourthConditionalContentContent = (claim: Claim): ClaimSummarySection[] => { //NOSONAR
  return [
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
  ];
};

export const getFifthConditionalContentContent = (claim: Claim): ClaimSummarySection[] => { //NOSONAR
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE',
      },
    },
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE',
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
  ];
};

