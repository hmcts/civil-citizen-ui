import {
  CITIZEN_DETAILS_URL,
  CLAIM_AMOUNT_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DETAILS_URL,
  CLAIM_INTEREST_DATE_URL,
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_INTEREST_URL,
  CLAIM_INTEREST_RATE_URL,
} from 'routes/urls';
import {SummarySections} from 'models/summaryList/summarySections';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const PARTY_NAME = 'Mrs. Mary Richards';
const CLAIM_ID = 'aaa';

export function createClaimWithBasicDetails(): SummarySections {
  return {
    sections: [
      {
        title: 'Your details',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Full name',
              },
              value: {
                text: PARTY_NAME,
              },
              actions: {
                items: [
                  {
                    href: CLAIM_DETAILS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Contact person',
              },
              value: {
                text: 'Contact',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_DETAILS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Address',
              },
              value: {
                text: '54 avenue',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_DETAILS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Correspondence address',
              },
              value: {
                text: 'Same as address',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_DETAILS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Contact number (optional)',
              },
              value: {
                text: '12345',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_DETAILS_URL,
                    text: 'Change',
                  },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Their details',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Full name',
              },
              value: {
                text: PARTY_NAME,
              },
              actions: {
                items: [
                  {
                    href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Address',
              },
              value: {
                text: 'Simon street',
              },
              actions: {
                items: [
                  {
                    href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Email',
              },
              value: {
                text: 'contact@gmail.com',
              },
              actions: {
                items: [
                  {
                    href: constructResponseUrlWithIdParams(CLAIM_ID, CLAIM_DEFENDANT_EMAIL_URL),
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Contact number (optional)',
              },
              value: {
                text: '98765',
              },
              actions: {
                items: [
                  {
                    href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                    text: 'Change',
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

export function createClaimWithClaimAmount(): SummarySections {
  return {
    sections: [
      {
        title: 'Claim amount',
        summaryList: {
          rows: [
            {
              key: {
                text: 'Claim amount breakdown',
              },
              value: {
                text: '',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_AMOUNT_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Claim Interest',
              },
              value: {
                text: 'yes',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'How do you want to claim interest?',
              },
              value: {
                text: 'SAME_RATE_INTEREST',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_TYPE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'What annual rate of interest do you want to claim?',
              },
              value: {
                text: 'SAME_RATE_INTEREST_8_PC',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_RATE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'When are you claiming interest from?',
              },
              value: {
                text: 'FROM_CLAIM_SUBMIT_DATE',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_DATE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

export function claimAmountParticularDate(): SummarySections {
  return {
    sections: [
      {
        title: 'Claim amount',
        summaryList: {
          rows: [
            {
              key: {
                text: 'What annual rate of interest do you want to claim?',
              },
              value: {
                text: 'SAME_RATE_INTEREST_DIFFERENT_RATE',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_RATE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Why you\'re claiming this rate',
              },
              value: {
                text: 'Reason',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_RATE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'When are you claiming interest from?',
              },
              value: {
                text: 'FROM_A_SPECIFIC_DATE',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_DATE_URL,
                    text: 'change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Date interest applied from',
              },
              value: {
                text: '1985-02-01',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_DATE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Explain why you\'re claiming for this date',
              },
              value: {
                text: 'Reason',
              },
            },
            {
              key: {
                text: 'When do you want to stop claiming interest?',
              },
              value: {
                text: 'UNTIL_SETTLED_OR_JUDGEMENT_MADE',
              },
              actions: {
                items: [
                  {
                    href: CLAIM_INTEREST_DATE_URL,
                    text: 'Change',
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
}
