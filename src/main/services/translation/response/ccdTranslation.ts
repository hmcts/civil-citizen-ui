import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toCCDRepaymentPlan} from '../../../common/models/ccdResponse/ccdRepaymentPlan';
import {toCCDPaymentOption} from '../../../common/models/ccdResponse/ccdPaymentOption';
import {toCCDPayBySetDate} from '../../../common/models/ccdResponse/ccdPayBySetDate';
import {toAgreedMediation} from '../../../common/models/ccdResponse/ccdAgreedMediation';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {Party} from '../../../common/models/party';
import {PartyType} from '../../../common/models/partyType';
import {CCDParty} from '../../../common/models/ccdResponse/ccdParty';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  // TODO: should we include everything inside caseData
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,

    // New data translated to CCD
    respondent1: toCCDRespondent1(claim.respondent1),
    respondent1Represented: claim.respondent1.contactPerson, // TODO: contactPerson?
    respondent1ClaimResponseType: claim.respondent1.responseType,
    partialPayment: claim.partialAdmission.alreadyPaid.option.toUpperCase(),
    partialPaymentAmount: claim.partialAdmission.howMuchHaveYouPaid.amount.toString(), // should be a number?
    // x: claim.partialAdmission.howMuchHaveYouPaid.date,
    // x: claim.partialAdmission.howMuchHaveYouPaid.text,
    // x: claim.partialAdmission.whyDoYouDisagree.text,
    // x: claim.partialAdmission.timeline.rows, //  date?: string; and description?: string;
    // x: claim.partialAdmission.timeline.comment,

    // x: claim.evidence.evidenceItem, // type?: EvidenceType and description?: string
    // x: claim.evidence.comment,

    // x: claim.partialAdmission.howMuchDoYouOwe.amount,
    // x: claim.partialAdmission.paymentIntention.paymentOption // TODO: or claim.paymentOption
    // x: claim.partialAdmission.paymentIntention.paymentDate // TODO: or claim.paymentDate

    // x: claim.statementOfMeans.bankAccounts, // [Array] of {typeOfAccount, joint, balance}
    // x: claim.statementOfMeans.disability.option.toUpperCase(),
    // x: claim.statementOfMeans.severeDisability.option.toUpperCase(),
    // x: claim.statementOfMeans.residence.type, // ResidenceType
    // x: claim.statementOfMeans.residence.housingDetails, // Only if ResidenceType is other
    
    // x: claim.statementOfMeans.cohabiting.option.toUpperCase(),
    // x: claim.statementOfMeans.partnerDisability.option.toUpperCase(),
    // x: claim.statementOfMeans.partnerAge.option.toUpperCase(),
    // x: claim.statementOfMeans.partnerPension.option.toUpperCase(),
    // x: claim.statementOfMeans.partnerSevereDisability.option.toUpperCase(),

    // x: claim.statementOfMeans.dependants.declared ? 'YES' : 'NO', // saved as boolean
    // x: claim.statementOfMeans.dependants.numberOfChildren.under11, // if true, type number
    // x: claim.statementOfMeans.dependants.numberOfChildren.between11and15, // if true, type number
    // x: claim.statementOfMeans.dependants.numberOfChildren.between16and19, // if true, type number
    // x: claim.statementOfMeans.numberOfChildrenLivingWithYou, // number
    // x: claim.statementOfMeans.childrenDisability.option.toUpperCase(), // number

    // x: claim.statementOfMeans.otherDependants.option.toUpperCase(),
    // x: claim.statementOfMeans.otherDependants.numberOfPeople, // if yes, type number
    // x: claim.statementOfMeans.otherDependants.details, // if yes, type string

    // x: claim.statementOfMeans.carer.option.toUpperCase(),
    // x: claim.statementOfMeans.employment.declared ? 'YES' : 'NO', // boolean
    // x: claim.statementOfMeans.employment.employmentType, // if true, EmploymentCategory
    // x: claim.statementOfMeans.employers.rows, // if EmploymentCategory=EMPLOYED,  {employerName, jobTitle}, 
    // x: claim.statementOfMeans.selfEmployedAs.annualTurnover // if EmploymentCategory=SELF-EMPLOYED, type number
    // x: claim.statementOfMeans.selfEmployedAs.jobTitle // if EmploymentCategory=SELF-EMPLOYED, type string
    // x: claim.statementOfMeans.taxPayments.owed ? 'YES' : 'NO', // boolean
    // x: claim.statementOfMeans.taxPayments.amountOwed, // if owed true, type number
    // x: claim.statementOfMeans.taxPayments.reason, // if owed true, type string

    // x: claim.statementOfMeans.unemployment.option, // enum UnemploymentCategory ['Unemployed','Retired','Other']
    // x: claim.statementOfMeans.unemployment.unemploymentDetails.months, // if option=Unemployed, type number
    // x: claim.statementOfMeans.unemployment.unemploymentDetails.years, // if option=Unemployed, type number
    // x: claim.statementOfMeans.unemployment.otherDetails.details, // if option=Other, type string

    // x: claim.statementOfMeans.courtOrders.declared ? 'YES' : 'NO', // boolean
    // x: claim.statementOfMeans.courtOrders.rows, // if true, Array of {"instalmentAmount":200,"amount":100,"claimNumber":"ginny"}

    // TODO: coversion Debts you are behind, for each one {amount,isDeclared,name,populated,schedule}
    // x: claim.statementOfMeans.priorityDebts.councilTax
    // x: claim.statementOfMeans.priorityDebts.electricity
    // x: claim.statementOfMeans.priorityDebts.gas
    // x: claim.statementOfMeans.priorityDebts.maintenance
    // x: claim.statementOfMeans.priorityDebts.mortgage
    // x: claim.statementOfMeans.priorityDebts.rent
    // x: claim.statementOfMeans.priorityDebts.water

    // x: claim.statementOfMeans.debts.option.toUpperCase(), 
    // x: claim.statementOfMeans.debts.debtsItems, // if yes, [Array] of {"debt":"fefe","totalOwned":"100","monthlyPayments":"100"}

    // TODO: Regular expenses, for each one {declared, transactionSource}
    // x: claim.statementOfMeans.regularExpenses.councilTax
    // x: claim.statementOfMeans.regularExpenses.electricity
    // x: claim.statementOfMeans.regularExpenses.foodAndHousekeeping
    // x: claim.statementOfMeans.regularExpenses.gas
    // x: claim.statementOfMeans.regularExpenses.hirePurchase
    // x: claim.statementOfMeans.regularExpenses.maintenance
    // x: claim.statementOfMeans.regularExpenses.mobilePhone
    // x: claim.statementOfMeans.regularExpenses.mortgage
    // x: claim.statementOfMeans.regularExpenses.other // IT HAS OTHER FIELD
    // x: claim.statementOfMeans.regularExpenses.rent
    // x: claim.statementOfMeans.regularExpenses.schoolCosts
    // x: claim.statementOfMeans.regularExpenses.travel

    // TODO: Regular income
    // x: claim.statementOfMeans.regularIncome.job, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.universalCredit, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.jobseekerAllowanceIncome, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.jobseekerAllowanceContribution, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.incomeSupport, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.workingTaxCredit, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.childTaxCredit, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.childBenefit, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.councilTaxSupport, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.pension, // type Transaction,
    // x: claim.statementOfMeans.regularIncome.other, // type OtherTransaction

    // x: claim.statementOfMeans.explanation.text,

    // x: claim.repaymentPlan.paymentAmount,
    // x: claim.repaymentPlan.repaymentFrequency,
    // x: claim.repaymentPlan.firstRepaymentDate,

    // x: claim.mediation.mediationDisagreement.option, // yes or no
    // x: claim.mediation.noMediationReason.iDoNotWantMediationReason, // NoMediationReasonOptions
    // x: claim.mediation.noMediationReason.otherReason, // @ValidateIf(o => o.iDoNotWantMediationReason === NoMediationReasonOptions.OTHER)
    // x: claim.mediation.canWeUse.option,
    // x: claim.mediation.canWeUse.mediationPhoneNumber,

    // EXTRA added by me and forgot in the AC! /mediation/can-we-use-company
    // x: claim.mediation.companyTelephoneNumber.option,
    // x: claim.mediation.companyTelephoneNumber.mediationPhoneNumber,
    // x: claim.mediation.companyTelephoneNumber.mediationContactPerson,
    // x: claim.mediation.companyTelephoneNumber.mediationPhoneNumberConfirmation,

  };
};

const toCCDRespondent1 = (respondent1: Party): CCDParty => {
  return {
    companyName: respondent1.type === PartyType.COMPANY ? respondent1.partyName : '',
    individualDateOfBirth: respondent1.type === PartyType.INDIVIDUAL ? respondent1.dateOfBirth.toDateString() : '',
    individualFirstName: respondent1.individualFirstName,
    individualLastName: respondent1.individualLastName,
    individualTitle: respondent1.individualTitle,
    organisationName: respondent1.type === PartyType.ORGANISATION ? respondent1.partyName : '',
    partyEmail: respondent1.emailAddress,
    partyName: respondent1.partyName, // TODO: delete? civil-service call getPartyName() but we use it as organisation name
    partyPhone: respondent1.phoneNumber,
    // partyTypeDisplayValue: generateDisplayValueByPartyType(respondent1.type),
    primaryAddress: {
      AddressLine1: respondent1.primaryAddress.AddressLine1,
      AddressLine2: respondent1.primaryAddress.AddressLine2,
      AddressLine3: respondent1.primaryAddress.AddressLine3,
      Country: respondent1.primaryAddress.Country,
      County: respondent1.primaryAddress.County,
      PostCode: respondent1.primaryAddress.PostCode,
      PostTown: respondent1.primaryAddress.PostTown
    },
    soleTraderDateOfBirth: respondent1.type === PartyType.SOLE_TRADER ? respondent1.dateOfBirth.toDateString() : '',
    soleTraderFirstName: respondent1.soleTraderFirstName, // TODO: soleTraderFirstName is not used, use individual
    soleTraderLastName: respondent1.soleTraderLastName, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTitle: respondent1.soleTraderTitle, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTradingAs: respondent1.soleTraderTradingAs,
    type: respondent1.type
  };
};
