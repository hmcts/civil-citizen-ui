import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaim} from 'models/civilClaimResponse';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Explanation} from 'form/models/statementOfMeans/explanation';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {OtherDependants} from 'form/models/statementOfMeans/otherDependants';

describe('translate Statement Of Means to CUI model', () => {
  it('should return undefined if Statement Of Means doesnt exist', () => {
    //Given
    //When
    const output = toCUIStatementOfMeans(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Statement Of Means exist', () => {
    //Given
    const input : CCDClaim = {
      disabilityPremiumPayments: YesNoUpperCamelCase.YES,
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.disability = new GenericYesNo(YesNo.YES);
    expect(output).toEqual(expected);
  });

  it('should return undefined if partner and dependents is undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: undefined,
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expect(output).toEqual(expected);
  });

  it('should return data if live with partner is exist', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: {
        liveWithPartnerRequired: YesNoUpperCamelCase.YES,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.cohabiting = new GenericYesNo(YesNo.YES);
    expected.dependants = new Dependants(undefined, undefined);
    expected.otherDependants = new OtherDependants(undefined, NaN, undefined);
    expect(output).toEqual(expected);
  });

  it('should return undefined if live with partner undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: {
        liveWithPartnerRequired: undefined,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.dependants = new Dependants(undefined, undefined);
    expected.otherDependants = new OtherDependants(undefined, NaN, undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if partner aged over 18 is exist', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: {
        partnerAgedOver: YesNoUpperCamelCase.YES,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.partnerAge = new GenericYesNo(YesNo.YES);
    expected.dependants = new Dependants(undefined, undefined);
    expected.otherDependants = new OtherDependants(undefined, NaN, undefined);
    expect(output).toEqual(expected);
  });

  it('should return undefined if partner aged over 18 undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: {
        partnerAgedOver: undefined,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.dependants = new Dependants(undefined, undefined);
    expected.otherDependants = new OtherDependants(undefined, NaN, undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if children disability is exist', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: {
        receiveDisabilityPayments: YesNoUpperCamelCase.YES,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.childrenDisability = new GenericYesNo(YesNo.YES);
    expected.dependants = new Dependants(undefined, undefined);
    expected.otherDependants = new OtherDependants(undefined, NaN, undefined);
    expect(output).toEqual(expected);
  });

  it('should return undefined if children disability undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1PartnerAndDependent: {
        receiveDisabilityPayments: undefined,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.dependants = new Dependants(undefined, undefined);
    expected.otherDependants = new OtherDependants(undefined, NaN, undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if field respondent1LiPResponse is undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expect(output).toEqual(expected);
  });

  it('should return data if field children study has value', () => {
    //Given
    const input : CCDClaim = {
      respondent1LiPFinancialDetails : {
        childrenEducationLiP : '1',
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.numberOfChildrenLivingWithYou = 1;
    expect(output).toEqual(expected);
  });

  it('should return undefined if field children study is undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1LiPFinancialDetails : {
        childrenEducationLiP : undefined,
      },
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expect(output).toEqual(expected);
  });

  it('should return undefined if field financial details is undefined', () => {
    //Given
    const input : CCDClaim = {
      respondent1LiPFinancialDetails : undefined,
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expect(output).toEqual(expected);
  });

  it('should return data if explanation has data', () => {
    //Given
    const input : CCDClaim = {
      responseToClaimAdmitPartWhyNotPayLRspec: 'test',
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expected.explanation = new Explanation('test');
    expect(output).toEqual(expected);
  });

  it('should return undefined if explanation is undefined', () => {
    //Given
    const input : CCDClaim = {
      responseToClaimAdmitPartWhyNotPayLRspec: undefined,
    };
    //When
    const output = toCUIStatementOfMeans(input);
    //Then
    const expected = setUpDefaultData();
    expect(output).toEqual(expected);
  });
});

const setUpDefaultData = () : StatementOfMeans => {
  const data = new StatementOfMeans();
  data.bankAccounts = undefined;
  data.disability = undefined;
  data.severeDisability = undefined;
  data.residence = undefined;
  data.cohabiting = undefined;
  data.partnerAge = undefined;
  data.partnerPension = undefined;
  data.partnerDisability = undefined;
  data.partnerSevereDisability = undefined;
  data.dependants = undefined;
  data.childrenDisability = undefined;
  data.numberOfChildrenLivingWithYou = undefined;
  data.otherDependants = undefined;
  data.employment = undefined;
  data.employers = undefined;
  data.selfEmployedAs = undefined;
  data.taxPayments = undefined;
  data.unemployment = undefined;
  data.courtOrders = undefined;
  data.debts = undefined;
  data.explanation = undefined;
  data.carer = undefined;
  data.priorityDebts = undefined;
  data.regularIncome = undefined;
  data.regularExpenses = undefined;
  return data;
};
