import {getStringStatus} from 'services/features/claimantResponse/defendantResponse/defendantResponseStatusService';
import {Claim} from 'models/claim';
import {DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {DefendantResponseStatus} from 'models/defendantResponseStatus';

describe('Defendant status service', () =>{
  it('should return proper status for NO_RESPONSE due today', () => {
    class MockClaim extends Claim {
      getRemainingDays(): number {
        return 0;
      }
    }

    const claim = new MockClaim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.NO_RESPONSE;

    const result = getStringStatus(item, claim);

    expect(result).toContain('Response to claim. Due today.');
  });

  it('should return proper status for NO_RESPONSE 1 day remaining', () => {
    class MockClaim extends Claim {
      getRemainingDays(): number {
        return 1;
      }
    }
    const claim = new MockClaim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.NO_RESPONSE;

    const result = getStringStatus(item, claim);

    expect(result).toContain('Response to claim. 1 days remaining.');
  });

  it('should return proper status for NO_RESPONSE 1 day overdue', () => {
    class MockClaim extends Claim {
      getRemainingDays(): number {
        return -1;
      }
    }
    const claim = new MockClaim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.NO_RESPONSE;

    const result = getStringStatus(item, claim);

    expect(result).toContain('Response to claim. 1 days overdue.');
  });
});
