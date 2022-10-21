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
  return {
    respondent1ClaimResponseTypeForSpec: claim.respondent1?.responseType,
    defenceAdmitPartPaymentTimeRouteRequired: toCCDPaymentOption(claim.paymentOption),
    respondent1RepaymentPlan: toCCDRepaymentPlan(claim.repaymentPlan),
    respondToClaimAdmitPartLRspec: toCCDPayBySetDate(claim.paymentDate),
    responseClaimMediationSpecRequired: toAgreedMediation(claim.mediation),
    specAoSApplicantCorrespondenceAddressRequired: addressHasChange ? YesNoUpperCamelCase.NO : YesNoUpperCamelCase.YES,
    totalClaimAmount: claim.totalClaimAmount,
    respondent1: toCCDRespondent1(claim.respondent1),
    respondent1Represented: claim.respondent1.contactPerson, // TODO: contactPerson?
    respondent1ClaimResponseType: claim.respondent1.responseType,

    // whyDoYouDisagree?: WhyDoYouDisagree;
    // howMuchDoYouOwe?: HowMuchDoYouOwe;
    // alreadyPaid?: GenericYesNo;
    // timeline?: DefendantTimeline;
    // paymentIntention?: PaymentIntention;
    // howMuchHaveYouPaid?: HowMuchHaveYouPaid;
    //
    // amount?: number;
    // totalClaimAmount?: number;
    // date?: Date;
    // day: number;
    // month: number;
    // year: number;
    // text?: string;

    // a: claim.partialAdmission.howMuchHaveYouPaid.totalClaimAmount,
    // a: claim.partialAdmission.howMuchHaveYouPaid.date,
    // a: claim.partialAdmission.howMuchHaveYouPaid.text,
    
    partialPayment: claim.partialAdmission.alreadyPaid.option.toUpperCase(),
    partialPaymentAmount: claim.partialAdmission.howMuchHaveYouPaid.amount.toString(), // should be a number?

  // "orderType": "DISPOSAL",
  // "partAdmittedByEitherRespondents": "YES",
  // "partialPayment": "YES",
  // "partialPaymentAmount": "string",
  // "paymentConfirmationDecisionSpec": "YES",
  // "paymentReference": "string",
  // "paymentSetDate": "string",
  // "paymentSuccessfulDate": "2022-10-21T13:53:30.562Z",
  // "paymentTypeSelection": "IMMEDIATELY",
  // "personalInjuryType": "ROAD_ACCIDENT",
  // "personalInjuryTypeOther": "string",
  // "reasonNotSuitableSDO": {
  //   "input": "string"
  // },
  // "repaymentDate": "string",
  // "repaymentDue": "string",
  // "repaymentFrequency": "ONCE_ONE_WEEK",
  // "repaymentSuggestion": "string",
  // "repaymentSummaryObject": "string",
  // "requestedCourt": {
  //   "caseLocation": {
  //     "baseLocation": "string",
  //     "region": "string",
  //     "siteName": "string"
  //   },
  //   "reasonForHearingAtSpecificCourt": "string",
  //   "requestHearingAtSpecificCourt": "YES",
  //   "responseCourtCode": "string",
  // },
  };
};

  // CUI Party:
  // individualTitle?: string;
  // individualLastName?: string;
  // individualFirstName?: string;
  // soleTraderTitle?: string;
  // soleTraderFirstName?: string;
  // soleTraderLastName?: string;
  // soleTraderTradingAs?: string;
  // partyName?: string;
  // type?: PartyType;
  // primaryAddress?: PrimaryAddress;
  // postToThisAddress?: string;
  // phoneNumber?: string;
  // provideCorrespondenceAddress?: string;
  // correspondenceAddress?: CorrespondenceAddress;
  // dateOfBirth?: Date;
  // responseType?: string;
  // contactPerson?: string;
  // emailAddress?: string;

  // CIVIL-SERVICE PARTY
  // type: Type;
  // individualTitle: String;
  // individualFirstName: String;
  // individualLastName: String;
  // individualDateOfBirth: LocalDate;
  // companyName: String;
  // organisationName: String;
  // soleTraderTitle: String;
  // soleTraderFirstName: String;
  // soleTraderLastName: String;
  // soleTraderTradingAs: String;
  // soleTraderDateOfBirth: LocalDate;
  // primaryAddress: Address;
  // partyName: String;
  // partyTypeDisplayValue: String;
  // partyEmail: String;

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
    soleTraderFirstName: respondent1.soleTraderFirstName,
    soleTraderLastName: respondent1.soleTraderLastName,
    soleTraderTitle: respondent1.soleTraderTitle,
    soleTraderTradingAs: respondent1.soleTraderTradingAs,
    type: respondent1.type
  };
};

// const generateDisplayValueByPartyType = (partyType: PartyType) => {
//   const result = partyType.toLowerCase().charAt(0).toUpperCase() + partyType.slice(1);
//   result.replace('_', ' ');
//   return result;
// };
