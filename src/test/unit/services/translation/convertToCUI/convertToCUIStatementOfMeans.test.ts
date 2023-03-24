import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaim} from 'models/civilClaimResponse';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';

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
    const expected = new StatementOfMeans();
    expected.bankAccounts = undefined;
    expected.disability = new GenericYesNo(YesNo.YES);
    expected.severeDisability = undefined;
    expected.residence = undefined;
    expected.cohabiting = undefined;
    expected.partnerAge = undefined;
    expected.partnerPension = undefined;
    expected.partnerDisability = undefined;
    expected.partnerSevereDisability = undefined;
    expected.dependants = undefined;
    expected.childrenDisability = undefined;
    expected.numberOfChildrenLivingWithYou = undefined;
    expected.otherDependants = undefined;
    expected.employment = undefined;
    expected.employers = undefined;
    expected.selfEmployedAs = undefined;
    expected.taxPayments = undefined;
    expected.unemployment = undefined;
    expected.courtOrders = undefined;
    expected.debts = undefined;
    expected.explanation = undefined;
    expected.carer = undefined;
    expected.priorityDebts = undefined;
    expected.regularIncome = undefined;
    expected.regularExpenses = undefined;
    expect(output).toEqual(expected);
  });
});
