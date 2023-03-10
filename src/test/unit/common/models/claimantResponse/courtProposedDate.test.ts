import {CourtProposedDate, CourtProposedDateOptions} from '../../../../../../src/main/common/form/models/claimantResponse/courtProposedDate';

describe('CourtProposedDate constructor', () => {
  it('should create a new CourtProposedDate instance with the provided decision', async () => {
    //Given
    const decision = CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE;

    //When
    const courtProposedDate = new CourtProposedDate(decision);

    //Then
    expect(courtProposedDate.decision).toBe(decision);
  });

  it('should create a new CourtProposedDate instance with undefined decision when no decision is provided', async () => {
    //When
    const courtProposedDate = new CourtProposedDate();

    //Then
    expect(courtProposedDate.decision).toBeUndefined();
  });
});
