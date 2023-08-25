import {
  getCaseInfoContents,
  getSummarySections,
} from 'services/features/caseProgression/trialArrangements/checkAnswersService';
import {getClaimWithDefendantTrialArrangements} from '../../../../../utils/mockClaimForCheckAnswers';
import {HAS_ANYTHING_CHANGED_URL, IS_CASE_READY_URL, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';

const HAS_ANYTHING_CHANGED_HTML = '<p>COMMON.YES</p><hr class="govuk-section-break--visible--l" ><p>Changed</p>';
const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
describe('check your answers trial ready', () => {
  it('should return all the summary sections', () => {
    //Given
    const claimTrialA = getClaimWithDefendantTrialArrangements();
    //when
    const summarySections = getSummarySections(claim.id, claimTrialA, 'en');

    //Then
    expect(summarySections.sections[0].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[0].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[0].summaryList.rows[0].actions?.items[0].href).toBe(IS_CASE_READY_URL.replace(':id', claim.id));
    expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe(HAS_ANYTHING_CHANGED_HTML);
    expect(summarySections.sections[0].summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.sections[0].summaryList.rows[1].actions?.items[0].href).toBe(HAS_ANYTHING_CHANGED_URL.replace(':id', claim.id));
    expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe('Other Information');
    expect(summarySections.sections[0].summaryList.rows[2].actions?.items[0].href).toBe(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', claim.id));
  });

  it('should return the caseInfoContents correctly', () => {
    //Given
    // const claim = getClaimWithDefendantTrialArrangements();
    // claim.id = '111';
    // claim. = 'Mark';
    // claim.respondent1.partyDetails.partyName = 'John';
    //when
    const caseInfoContents = getCaseInfoContents (claim.id, claim, 'en');
    jest.mock('../../../../../main/common/utils/stringUtils', () => ({
      caseNumberPrettify: jest.fn().mockReturnValue('1645 8821 6244 9409'),
    }));

    //Then
    expect(caseInfoContents[0]).toStrictEqual(caseReferenceObject);
    expect(caseInfoContents[1]).toStrictEqual(casePartiesObject);
  });
});

const caseReferenceObject =
  {data:
      {classes: 'govuk-!-margin-bottom-1',
        text: 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CASE_REFERENCE',
        variables:
          {claimId: '111'},
      },
  type: 'leadParagraph',
  };

const casePartiesObject =
{data:
    {classes: '',
      text: 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.PARTIES',
      'variables':
        {claimantName: 'Mark',
          defendantName: 'John',
        },
    },
type: 'leadParagraph',
};
