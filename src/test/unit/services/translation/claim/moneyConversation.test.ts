import {
  convertToPence,
  convertToPenceFromString,
  formatAmountTwoDecimalPlaces,
} from 'services/translation/claim/moneyConversation';

describe('translate draft claim to ccd version', () => {
  it.each([[100, 10000], [1, 100], [123, 12300], [8330.38, 833038], [312.90, 31290], [308.71, 30871], [281.78, 28178], [281.22, 28122]])('should convert money to pence', (amountInPounds, expectedAmount)=>{
    //Given
    //When
    const amount = convertToPence(amountInPounds);
    //Then
    expect(amount).toBe(expectedAmount);
  });

  it.each([[100, 10000], [1, 100], [123, 12300], [8330.38, 833038], [312.90, 31290], [270.72, 27072], [35.41, 3541], [283.84, 28384]])('should convert money to pence from string value', (amountInPounds, expectedAmount)=>{
    //Given
    //When
    const amount = convertToPenceFromString(amountInPounds.toString());
    //Then
    expect(amount).toBe(expectedAmount);
  });

  it.each([[0, undefined],[3162.5, '3162.50'],[50.50, '50.50'],[100.05, '100.05'],[50.59, '50.59'],[100, '100.00'], [1, '1.00'], [123, '123.00'], [8330.380, '8330.38'], [312.9, '312.90'], [270.725, '270.73'], [270000.7250000, '270000.73']])('should format amount value with two decimal places', (amountInPounds, expectedAmount)=>{
    //Given
    //When
    const amount = formatAmountTwoDecimalPlaces(amountInPounds);
    //Then
    expect(amount).toBe(expectedAmount);
  });
});
