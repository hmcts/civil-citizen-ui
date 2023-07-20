import {CaseState} from 'form/models/claimDetails';
import {getHasAnythingChanged} from 'services/features/caseProgression/trialArrangements/hasAnythingChanged';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';

describe('hasAnythingChanged', () => {
  let mockClaim;
  let claimContent: { case_data: { caseProgression: { hasAnythingChanged: YesNo; }; }; };

  beforeEach(() => {
    mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    claimContent = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          hasAnythingChanged: 'yes',
        },
      },
    };
  });

  it('should return all the content', () => {
    //Given
    claimContent.case_data.caseProgression.hasAnythingChanged = YesNo.YES;
    const claim =  Object.assign(new Claim(), claimContent);

    //when
    const actualIsCaseReadyContent = getHasAnythingChanged(claim.id.toString(), claim);

    //Then
    expect(actualIsCaseReadyContent[0].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.FINALISE');
    expect(actualIsCaseReadyContent[1].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.CLAIM_NUMBER');
    expect(actualIsCaseReadyContent[2].data.text).toEqual('COMMON.PARTIES');
    expect(actualIsCaseReadyContent[3].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.HAS_ANYTHING');
    expect(actualIsCaseReadyContent[4].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.DIRECTIONS');
    expect(actualIsCaseReadyContent[4].data.textBefore).toEqual('PAGES.HAS_ANYTHING_CHANGED.YOU_CAN');
  });
});
