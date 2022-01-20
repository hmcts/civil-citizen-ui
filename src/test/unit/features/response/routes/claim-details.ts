import * as claimStoreServiceMock from '../../../../http-mocks/claim-store';

describe('Claim Details', () => {
  it('retrieve number', () => {
    const externalId = '400f4c57-9684-49c0-adb4-4cf46579d6dc';
    expect(externalId).toEqual(claimStoreServiceMock.sampleClaimObj.externalId);
  });
  it('retrieve amount', () => {
    const amount = 2500;
    expect(amount).toEqual(claimStoreServiceMock.sampleClaimObj.claim.payment.amount);
  });
});
