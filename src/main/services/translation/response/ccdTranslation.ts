import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/ccdResponse';
import {toAgreedMediation} from './convertToCCDAgreedMediation';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {toCCDParty} from './convertToCCDParty';
import {toCCDRepaymentPlan} from './convertToCCDRepaymentPlan';
import {toCCDPaymentOption} from './convertToCCDPaymentOption';
import {toCCDPayBySetDate} from './convertToCCDPayBySetDate';
import {toCCDHomeType} from './convertToCCDHomeType';
import {toCCDBankAccount} from './convertToCCDBankAccount';
import {toCCDTimeline} from './convertToCCDTimeLine';
import {toCCDEmploymentType} from './convertToCCDEmploymentType';
import {toCCDEmployerDetails} from './convertToCCDEmployersDetails';
import {convertToCCDCourtOrderDetails} from './convertToCCDCourtOrderDetails';
import {convertToCCDLoanCreditDetails} from './convertToCCDLoanCreditDetails';

export const translateDraftResponseToCCD = (claim: Claim, addressHasChange: boolean): CCDResponse => {
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.partialAdmission.paymentIntention.paymentOption), // defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.partialAdmission.paymentIntention.paymentDate), // respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    // ------------- START TASK A ------------- 
    // YOUR DETAILS
    respondent1: toCCDParty(claim.respondent1),
    // respondent1Represented: claim.respondent1.contactPerson, // TODO: where is contactPerson in CCD?
    // RESPONSE DEADLINE
    // x: claim.responseDeadline.option, //  enum [ALREADY_AGREED, NO, REQUEST_REFUSED, YES]
    // x: claim.responseDeadline.additionalTime, // enum [MORE_THAN_28_DAYS, UP_TO_28_DAYS]
    // x: claim.responseDeadline.calculatedResponseDeadline, // date
    respondentSolicitor1AgreedDeadlineExtension: claim.responseDeadline.calculatedResponseDeadline, // date, TODO: sure is calculated and no agreed?
    respondent1ResponseDeadline: claim.respondent1ResponseDeadline.toDateString(), // date
    // ------------- END TASK A ------------- 
    specDefenceAdmittedRequired: claim.partialAdmission.alreadyPaid.option.toUpperCase(),
    respondToAdmittedClaim: {
      howMuchWasPaid: claim.partialAdmission.howMuchHaveYouPaid.amount.toString(),
      whenWasThisAmountPaid: claim.partialAdmission.howMuchHaveYouPaid.date.toDateString(), // CCD: respondToAdmittedClaim.whenWasThisAmountPaid
      howWasThisAmountPaidOther: claim.partialAdmission.howMuchHaveYouPaid.text, // CCD: respondToAdmittedClaim.howWasThisAmountPaidOther and need to set respondToAdmittedClaim.howWasThisAmountPaid as null
    },
    detailsOfWhyDoesYouDisputeTheClaim: claim.partialAdmission.whyDoYouDisagree.text, // CCD: detailsOfWhyDoesYouDisputeTheClaim
    specResponseTimelineOfEvents: toCCDTimeline(claim.partialAdmission.timeline),
    // x: claim.partialAdmission.timeline.comment // not used in CCD???
    respondToAdmittedClaimOwingAmount: claim.partialAdmission.howMuchDoYouOwe.amount, // CCD: respondToAdmittedClaimOwingAmount
    defenceAdmitPartEmploymentTypeRequired: claim.statementOfMeans.employment.declared ? 'YES' : 'NO', // boolean
    respondToClaimAdmitPartEmploymentTypeLRspec: toCCDEmploymentType(claim.statementOfMeans.employment.employmentType),
    responseClaimAdmitPartEmployer: {
      employerDetails: toCCDEmployerDetails(claim.statementOfMeans.employers.rows)
    },
    respondent1CourtOrderPaymentOption: claim.statementOfMeans.courtOrders.declared ? 'YES' : 'NO', // boolean
    respondent1CourtOrderDetails: convertToCCDCourtOrderDetails(claim.statementOfMeans.courtOrders.rows),
    respondent1LoanCreditOption: claim.statementOfMeans.debts.option.toUpperCase(),
    respondent1LoanCreditDetails: convertToCCDLoanCreditDetails(claim.statementOfMeans.debts.debtsItems),
    responseToClaimAdmitPartWhyNotPayLRspec: claim.statementOfMeans.explanation.text,
    respondent1DQ: {
      respondent1DQCarerAllowanceCredit: claim.statementOfMeans.carer.option.toUpperCase(),
      respondent1BankAccountList: toCCDBankAccount(claim.statementOfMeans.bankAccounts),
      respondent1DQHomeDetails: {
        type: toCCDHomeType(claim.statementOfMeans.residence.type), // ResidenceType to CCDHomeType 
        typeOtherDetails: claim.statementOfMeans.residence.housingDetails // Only if ResidenceType is OTHER
      },
    },
    disabilityPremiumPayments: claim.statementOfMeans.disability.option.toUpperCase(),
    severeDisabilityPremiumPayments: claim.statementOfMeans.severeDisability.option.toUpperCase(),
    respondent1PartnerAndDependent: {
      haveAnyChildrenRequired: claim.statementOfMeans.dependants.declared ? 'YES' : 'NO',
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: claim.statementOfMeans.dependants.numberOfChildren.under11.toString(),
        numberOfElevenToFifteen: claim.statementOfMeans.dependants.numberOfChildren.between11and15.toString(),
        numberOfSixteenToNineteen: claim.statementOfMeans.dependants.numberOfChildren.between16and19.toString(),
      },
      liveWithPartnerRequired: claim.statementOfMeans.cohabiting.option.toUpperCase(), // TODO: YES or NO
      partnerAgedOver: claim.statementOfMeans.partnerAge.option.toUpperCase(), // TODO: YES or NO
      receiveDisabilityPayments: claim.statementOfMeans.childrenDisability.option.toUpperCase(), // TODO: YES or NO
      supportPeopleDetails: claim.statementOfMeans.otherDependants.details,
      supportPeopleNumber: claim.statementOfMeans.otherDependants.numberOfPeople.toString(),
      supportedAnyoneFinancialRequired: claim.statementOfMeans.otherDependants.option.toUpperCase(), // TODO: YES or NO
    },
    specDefendant1SelfEmploymentDetails: {
      annualTurnover: claim.statementOfMeans.selfEmployedAs.annualTurnover.toString(),
      jobTitle: claim.statementOfMeans.selfEmployedAs.jobTitle,
      isBehindOnTaxPayment: claim.statementOfMeans.taxPayments.owed ? 'YES' : 'NO',
      amountOwed: claim.statementOfMeans.taxPayments.amountOwed.toString(),
      reason: claim.statementOfMeans.taxPayments.reason,
    },
    respondToClaimAdmitPartUnemployedLRspec: {
      unemployedComplexTypeRequired: claim.statementOfMeans.unemployment.option, // CUI has enum UnemploymentCategory ['Unemployed','Retired','Other'], ccd expect a string
      lengthOfUnemployment: {
        numberOfMonthsInUnemployment: claim.statementOfMeans.unemployment.unemploymentDetails.months.toString(),
        numberOfYearsInUnemployment: claim.statementOfMeans.unemployment.unemploymentDetails.years.toString(),
      },
      otherUnemployment: claim.statementOfMeans.unemployment.otherDetails.details,
    },

    // KENNETH INFO

    // TODO: coversion Debts you are behind, for each one {amount,isDeclared,name,populated,schedule}
    // x: claim.statementOfMeans.priorityDebts.councilTax
    // x: claim.statementOfMeans.priorityDebts.electricity
    // x: claim.statementOfMeans.priorityDebts.gas
    // x: claim.statementOfMeans.priorityDebts.maintenance
    // x: claim.statementOfMeans.priorityDebts.mortgage
    // x: claim.statementOfMeans.priorityDebts.rent
    // x: claim.statementOfMeans.priorityDebts.water
    // CCD: specDefendant1Debts.debtDetails it is a list contains debtType (e.g. water, counciltax, electricity etc.), paymentAmount, paymentFrequency

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
    // CCD: respondent1DQ.respondent1DQRecurringExpenses it is a list contains type (e.g. gas, councilTax **need to translate**), amount, frequency, typeOtherDetails (use when choosing other)

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
    // CCD: respondent1DQ.respondent1DQRecurringIncome it is a list contains type (e.g. job, universalCredit **need to translate**), amount, frequency, typeOtherDetails (use when choosing other)




    // CUI
    // x: claim.partialAdmission.timeline.rows, //  date?: string; and description?: string;
    // x: claim.partialAdmission.timeline.comment,

    // x: claim.evidence.evidenceItem, // type?: EvidenceType and description?: string
    // x: claim.evidence.comment,

    // x: claim.statementOfMeans.residence.type, // ResidenceType
    // x: claim.statementOfMeans.residence.housingDetails, // Only if ResidenceType is other

    // x: claim.statementOfMeans.partnerDisability.option.toUpperCase(),
    // x: claim.statementOfMeans.partnerPension.option.toUpperCase(),
    // x: claim.statementOfMeans.partnerSevereDisability.option.toUpperCase(),

    // x: claim.statementOfMeans.numberOfChildrenLivingWithYou, // number

    // TODO: coversion Debts you are behind, for each one {amount,isDeclared,name,populated,schedule}
    // x: claim.statementOfMeans.priorityDebts.councilTax
    // x: claim.statementOfMeans.priorityDebts.electricity
    // x: claim.statementOfMeans.priorityDebts.gas
    // x: claim.statementOfMeans.priorityDebts.maintenance
    // x: claim.statementOfMeans.priorityDebts.mortgage
    // x: claim.statementOfMeans.priorityDebts.rent
    // x: claim.statementOfMeans.priorityDebts.water

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
