import {CITIZEN_DETAILS_URL, CLAIM_DEFENDANT_EMAIL_URL, CLAIM_DETAILS_URL} from '../../../main/routes/urls';
import {SummarySections} from '../../../main/common/models/summaryList/summarySections';
import {constructResponseUrlWithIdParams} from '../../../main/common/utils/urlFormatter';

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
