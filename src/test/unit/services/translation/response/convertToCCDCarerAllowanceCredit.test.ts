import {toCCDCarerAllowanceCredit} from 'services/translation/response/convertToCCDCarerAllowanceCredit';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate carer allowance credit to CCD model', () => {
  it('should return undefined if it is empty', () => {
    //Given
    const input = new Claim();
    //When
    const output = toCCDCarerAllowanceCredit(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if it is undefined', () => {
    //Given
    const input = new Claim();
    input.respondent1 = undefined;
    //When
    const output = toCCDCarerAllowanceCredit(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return value if it is same Response Type', () => {
    //Given
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.carer = new GenericYesNo((YesNo.YES));
    //When
    const output = toCCDCarerAllowanceCredit(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(YesNoUpperCamelCase.YES);
  });

  it('should return undefined if it is different Response Type', () => {
    //Given
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.carer = new GenericYesNo((YesNo.YES));
    //When
    const output = toCCDCarerAllowanceCredit(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if it is undefined carer allowance', () => {
    //Given
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.carer = undefined;
    //When
    const output = toCCDCarerAllowanceCredit(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if it is undefined carer allowance option', () => {
    //Given
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.carer = new GenericYesNo(undefined);
    //When
    const output = toCCDCarerAllowanceCredit(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });
});
