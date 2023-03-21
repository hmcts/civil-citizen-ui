import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';

describe('SignSettlementAgreement', () => {
  it('should create a new instance of SignSettlementAgreement with the given signed value', async () => {
    //Given
    const signedValue = 'Agreement signed';

    //When
    const signSettlementAgreement = new SignSettlmentAgreement(signedValue);

    //Then
    expect(signSettlementAgreement.signed).toEqual(signedValue);
  });

  it('should create a new instance of SignSettlementAgreement with the signed value set to undefined when no value is provided', async () => {
    //When
    const signSettlementAgreement = new SignSettlmentAgreement();

    //Then
    expect(signSettlementAgreement.signed).toBeUndefined();
  });
});
