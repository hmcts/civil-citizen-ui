import {caseNumberPrettify, documentIdExtractor, removeWhiteSpacesIfNoText} from 'common/utils/stringUtils';

describe('case number formatter', () => {
  it('should return case id string spaced after every 4 characters', () => {
    //When
    const result = caseNumberPrettify('1111222233334444');
    //Then
    expect(result).toEqual('1111 2222 3333 4444');
  });

  it('should return document id', () => {
    //When
    const result = documentIdExtractor('documents/testId/binary');
    //Then
    expect(result).toEqual('testId');
  });
});
describe('removeWhiteSpacesIfNoText', () => {
  it('should return text if present', () => {
    //When
    const result = removeWhiteSpacesIfNoText('  text');
    //Then
    expect(result).toEqual('  text');
  });

  it('should return empty string if only spaces present', () => {
    //When
    const result = removeWhiteSpacesIfNoText('     ');
    //Then
    expect(result).toEqual('');
  });
});
