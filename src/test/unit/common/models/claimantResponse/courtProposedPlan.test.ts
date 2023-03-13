import {CourtProposedPlan, CourtProposedPlanOptions} from '../../../../../../src/main/common/form/models/claimantResponse/courtProposedPlan';

describe('CourtProposedPlan constructor', () => {
  let decision: CourtProposedPlanOptions;
  
  beforeEach(() => {
    decision = CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN;
  });
  
  it('should create a new CourtProposedPlan instance with decision set to the provided value', async () => {
    //Given
    const expectedDecision = decision;
    
    //When
    const courtProposedPlan = new CourtProposedPlan(decision);
    
    //Then
    expect(courtProposedPlan).toBeDefined();
    expect(courtProposedPlan.decision).toEqual(expectedDecision);
  });
});
