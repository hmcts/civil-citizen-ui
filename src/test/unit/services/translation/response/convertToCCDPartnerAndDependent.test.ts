import {toCCDPartnerAndDependents} from 'services/translation/response/convertToCCDPartnerAndDependent';
import {CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';

describe('translate partner and dependents to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //input
    const output = toCCDPartnerAndDependents(undefined);
    const expected: CCDPartnerAndDependent = {
      liveWithPartnerRequired: undefined,
      partnerAgedOver: undefined,
      haveAnyChildrenRequired: undefined,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: undefined,
        numberOfElevenToFifteen: undefined,
        numberOfSixteenToNineteen: undefined,
      },
      receiveDisabilityPayments: undefined,
      supportedAnyoneFinancialRequired: undefined,
      supportPeopleNumber: undefined,
      supportPeopleDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return with data if there is empty', () => {
    //input
    const input = new StatementOfMeans();
    const output = toCCDPartnerAndDependents(input);
    const expected: CCDPartnerAndDependent = {
      liveWithPartnerRequired: undefined,
      partnerAgedOver: undefined,
      haveAnyChildrenRequired: undefined,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: undefined,
        numberOfElevenToFifteen: undefined,
        numberOfSixteenToNineteen: undefined,
      },
      receiveDisabilityPayments: undefined,
      supportedAnyoneFinancialRequired: undefined,
      supportPeopleNumber: undefined,
      supportPeopleDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return with data if there is input', () => {
    //input
    const numberOfChildren = new NumberOfChildren(1,2,3);
    const input = new StatementOfMeans();
    input.cohabiting = new GenericYesNo(YesNo.YES);
    input.partnerAge = new GenericYesNo(YesNo.YES);
    input.dependants = new Dependants(true, numberOfChildren);
    input.childrenDisability = new GenericYesNo(YesNo.YES);
    input.otherDependants = new GenericYesNo(YesNo.YES);
    input.otherDependants.numberOfPeople = Number(1);
    input.otherDependants.details = 'test';

    const expected: CCDPartnerAndDependent = {
      liveWithPartnerRequired: YesNoUpperCamelCase.YES,
      partnerAgedOver: YesNoUpperCamelCase.YES,
      haveAnyChildrenRequired: YesNoUpperCamelCase.YES,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: '1',
        numberOfElevenToFifteen: '2',
        numberOfSixteenToNineteen: '3',
      },
      receiveDisabilityPayments: YesNoUpperCamelCase.YES,
      supportedAnyoneFinancialRequired: YesNoUpperCamelCase.YES,
      supportPeopleNumber: '1',
      supportPeopleDetails: 'test',
    };
    //output
    const output = toCCDPartnerAndDependents(input);
    expect(output).toEqual(expected);
  });

  it('should return with data if there is input', () => {
    //input
    const input = new StatementOfMeans();
    input.cohabiting = new GenericYesNo(YesNo.NO);
    input.partnerAge = new GenericYesNo(YesNo.NO);
    input.dependants = new Dependants(false, undefined);
    input.childrenDisability = new GenericYesNo(YesNo.NO);
    input.otherDependants = new GenericYesNo(YesNo.NO);
    input.otherDependants.numberOfPeople = undefined;
    input.otherDependants.details = undefined;

    const expected: CCDPartnerAndDependent = {
      liveWithPartnerRequired: YesNoUpperCamelCase.NO,
      partnerAgedOver: YesNoUpperCamelCase.NO,
      haveAnyChildrenRequired: YesNoUpperCamelCase.NO,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: undefined,
        numberOfElevenToFifteen: undefined,
        numberOfSixteenToNineteen: undefined,
      },
      receiveDisabilityPayments: YesNoUpperCamelCase.NO,
      supportedAnyoneFinancialRequired: YesNoUpperCamelCase.NO,
      supportPeopleNumber: undefined,
      supportPeopleDetails: undefined,
    };
    //output
    const output = toCCDPartnerAndDependents(input);
    expect(output).toEqual(expected);
  });

  it('should return with data if there is input', () => {
    //input
    const input = new StatementOfMeans();
    input.cohabiting = new GenericYesNo(undefined);

    const expected: CCDPartnerAndDependent = {
      liveWithPartnerRequired: undefined,
      partnerAgedOver: undefined,
      haveAnyChildrenRequired: undefined,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: undefined,
        numberOfElevenToFifteen: undefined,
        numberOfSixteenToNineteen: undefined,
      },
      receiveDisabilityPayments: undefined,
      supportedAnyoneFinancialRequired: undefined,
      supportPeopleNumber: undefined,
      supportPeopleDetails: undefined,
    };
    //output
    const output = toCCDPartnerAndDependents(input);
    expect(output).toEqual(expected);
  });
});

