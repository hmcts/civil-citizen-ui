import {HtmlConverter} from '../../../../main/common/utils/htmlFormConverter';

describe('Html converter', ()=>{
  it('should convert from html to property successfully', () => {
    //Given
    const htmlInput = 'foo[bar]';
    //When
    const result = HtmlConverter.asProperty(htmlInput);
    //Then
    const expectedResult = 'foo.bar';
    expect(result).toBe(expectedResult);
  });
  it('should convert from property to html successfully', () => {
    //Given
    const propertyInput = 'foo.bar';
    //When
    const result = HtmlConverter.asFieldName(propertyInput);
    //Then
    const expectedResult = 'foo[bar]';
    expect(result).toBe(expectedResult);
  });
});
