import {convertToPence, convertToPenceFromString} from 'services/translation/claim/moneyConversation';

describe('translate draft claim to ccd version', () => {
  it.each([[8330.38, 833038], [312.90, 31290], [308.71, 30871], [281.78, 28178], [281.22, 28122]])('should convert money to pence', (amountInPounds, expectedAmount)=>{
    //Given
    //When
    const amount = convertToPence(amountInPounds);
    //Then
    expect(amount).toBe(expectedAmount);
  });

  it.each([[8330.38, 833038], [312.90, 31290], [270.72, 27072], [35.41, 3541], [283.84, 28384]])('should convert money to pence from string value', (amountInPounds, expectedAmount)=>{
    //Given
    //When
    const amount = convertToPenceFromString(amountInPounds.toString());
    //Then
    expect(amount).toBe(expectedAmount);
  });
});
