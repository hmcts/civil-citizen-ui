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

    // /response/your-details
    // /response/your-dob
    // /response/your-phone
    respondent1: toCCDRespondent1(claim.respondent1),
    respondent1Represented: claim.respondent1.contactPerson, // TODO: contactPerson?

    // /response/response-type
    respondent1ClaimResponseType: claim.respondent1.responseType,

    // /response/partial-admission/already-paid
    partialPayment: claim.partialAdmission.alreadyPaid.option.toUpperCase(),

    // /response/partial-admission/how-much-have-you-paid
    partialPaymentAmount: claim.partialAdmission.howMuchHaveYouPaid.amount.toString(), // should be a number?
    // x: claim.partialAdmission.howMuchHaveYouPaid.date,
    // x: claim.partialAdmission.howMuchHaveYouPaid.text,

    // /response/partial-admission/why-do-you-disagree
    // x: claim.partialAdmission.whyDoYouDisagree.text,

    // /response/timeline
    // x: claim.partialAdmission.timeline.rows, //  date?: string; and description?: string;
    // x: claim.partialAdmission.timeline.comment,

    // /response/evidence
    // x: claim.evidence.evidenceItem, // type?: EvidenceType and description?: string
    // x: claim.evidence.comment,

    // /response/partial-admission/how-much-do-you-owe
    // x: claim.partialAdmission.howMuchDoYouOwe.amount,

    // /response/partial-admission/payment-option
    // x: claim.partialAdmission.paymentIntention.paymentOption // TODO: or claim.paymentOption
    
    // /response/partial-admission/payment-date
    // x: claim.partialAdmission.paymentIntention.paymentDate // TODO: or claim.paymentDate


    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TONS OF PAGES !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // /response/statement-of-means/intro (see attached screen flow diagram)
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! TONS OF PAGES !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // /response/partial-admission/payment-plan
    // x: claim.repaymentPlan.paymentAmount,
    // x: claim.repaymentPlan.repaymentFrequency,
    // x: claim.repaymentPlan.firstRepaymentDate,


    // /mediation/free-telephone-mediation
    // NOTHING SAVED
    
    // /mediation/mediation-disagreement
    // x: claim.mediation.mediationDisagreement.option, // yes or no

    // /mediation/i-dont-want-free-mediation
    // x: claim.mediation.noMediationReason.iDoNotWantMediationReason, // NoMediationReasonOptions
    // x: claim.mediation.noMediationReason.otherReason, // @ValidateIf(o => o.iDoNotWantMediationReason === NoMediationReasonOptions.OTHER)

    // /mediation/can-we-use
    // x: claim.mediation.canWeUse.option,
    // x: claim.mediation.canWeUse.mediationPhoneNumber,

    // EXTRA! /mediation/can-we-use-company
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
