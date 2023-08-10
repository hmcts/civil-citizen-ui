import {CaseState} from 'form/models/claimDetails';
import {getIsCaseReady} from 'services/features/caseProgression/trialArrangements/isCaseReady';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';

describe('isCaseReady', () => {
  let mockClaim;
  let claimContent: { case_data: { caseProgression: { isCaseReady: YesNo; }; }; };

  beforeEach(() => {
    mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    claimContent = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          isCaseReady: 'yes',
        },
      },
    };
  });

  it('should return all the content', () => {
    //Given
    claimContent.case_data.caseProgression.isCaseReady = YesNo.YES;
    const claim =  Object.assign(new Claim(), claimContent);

    //when
    const actualIsCaseReadyContent = getIsCaseReady(claim.id.toString(), claim);

    //Then
    expect(actualIsCaseReadyContent[0].data.text).toEqual('PAGES.IS_CASE_READY.PAGE_TITLE');
    expect(actualIsCaseReadyContent[1].data.text).toEqual('PAGES.IS_CASE_READY.CLAIM_NUMBER');
    expect(actualIsCaseReadyContent[2].data.text).toEqual('PAGES.IS_CASE_READY.PARTIES');
    expect(actualIsCaseReadyContent[3].data.text).toEqual('PAGES.IS_CASE_READY.IS_CASE_READY');
    expect(actualIsCaseReadyContent[4].data.text).toEqual('PAGES.IS_CASE_READY.YOU_ARE_REMINDED');
  });
});
