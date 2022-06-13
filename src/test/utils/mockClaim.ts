import {Respondent} from '../../main/common/models/respondent';
import {Claim} from '../../main/common/models/claim';
import {CounterpartyType} from '../../main/common/models/counterpartyType';
import {PrimaryAddress} from '../../main/common/models/primaryAddress';
import {CorrespondenceAddress} from '../../main/common/models/correspondenceAddress';
import {NumberOfDays} from '../../main/common/form/models/numberOfDays';
import {YesNo} from '../../main/common/form/models/yesNo';
import {InterestClaimFromType, InterestClaimOptions, InterestClaimUntilType, SameRateInterestType} from '../../main/common/form/models/claimDetails';
import {ResponseType} from '../../main/common/form/models/responseType';

export const buildPrimaryAddress = (): PrimaryAddress => {
  return {
    AddressLine1: 'primaryAddressLine1',
    AddressLine2: 'primaryAddressLine2',
    AddressLine3: 'primaryAddressLine3',
    PostTown: 'primaryCity',
    PostCode: 'primaryPostCode',
  };
};

export const buildCorrespondenceAddress = (): CorrespondenceAddress => {
  return {
    AddressLine1: 'correspondenceAddressLine1',
    AddressLine2: 'correspondenceAddressLine2',
    AddressLine3: 'correspondenceAddressLine3',
    PostTown: 'correspondenceCity',
    PostCode: 'correspondencePostCode',
  };
};

export const buildRespondent1 = (): Respondent => {
  const respondent = new Respondent();
  respondent.individualTitle = 'Mrs.';
  respondent.individualLastName = 'Mary';
  respondent.individualFirstName = 'Richards';
  respondent.telephoneNumber = '0208339922';
  respondent.dateOfBirth = new Date('2022-01-24T15:59:59');
  respondent.responseType = '';
  respondent.type = CounterpartyType.INDIVIDUAL;
  respondent.primaryAddress = buildPrimaryAddress();
  respondent.correspondenceAddress = buildCorrespondenceAddress();
  return respondent;
};

export const mockClaim: Claim = {
  isPaymentOptionPayImmediately(): boolean {
    return false;
  },
  legacyCaseReference: '497MC585',
  applicant1:
  {
    individualTitle: 'Mrs',
    individualLastName: 'Clark',
    individualFirstName: 'Jane',
    type: CounterpartyType.INDIVIDUAL,
  },
  statementOfMeans:
  {
    childrenDisability: {
      option: 'yes',
    },
  },
  partialAdmission: {
    howMuchHaveYouPaid: {
      amount: 20,
      totalClaimAmount: 110,
      day: 1,
      month: 1,
      year: 2040,
      text: 'text',
    },
  },
  totalClaimAmount: 110,
  respondent1ResponseDeadline: new Date('2022-01-24T15:59:59'),
  detailsOfClaim: 'the reason i have given',
  respondent1: buildRespondent1(),
  timelineOfEvents: [
    {
      id: 'a08e42f4-6d7a-4f5c-b33d-85e4ef42ad9e',
      value: {
        timelineDate: '2022-01-01',
        timelineDescription: 'I noticed a leak on the landing and told Mr Smith about this.',
      },
    },
  ],
  claimFee: {
    calculatedAmountInPence: '11500',
  },
  claimInterest: YesNo.YES,
  interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE,
  claimAmountBreakup: [
    {
      value: {
        claimAmount: '2000',
        claimReason: 'House repair',
      },
    },
  ],
  interestClaimUntil: InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE,
  interestFromSpecificDate: new Date('2022-05-20'),
  interestClaimOptions: InterestClaimOptions.SAME_RATE_INTEREST,
  sameRateInterestSelection: {
    sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
  },
  breakDownInterestTotal: 500,
  submittedDate: new Date('2022-05-23T17:02:02.38407'),
  totalInterest: 15,
  paymentDate: new Date('2022-06-01T00:00:00'),

  formattedResponseDeadline: function (): string {
    throw new Error('Function not implemented.');
  },
  formattedTotalClaimAmount: function (): string {
    throw new Error('Function not implemented.');
  },
  responseInDays: function (): NumberOfDays {
    throw new Error('Function not implemented.');
  },
  getRemainingDays: function (): number {
    throw new Error('Function not implemented.');
  },
  isDeadLinePassed: function (): boolean {
    throw new Error('Function not implemented.');
  },
  isEmpty(): boolean {
    return !this.applicant1;
  },
  isPaymentOptionBySetDate(): boolean {
    return false;
  },
  isInterestClaimUntilSubmitDate(): boolean {
    return this?.interestClaimUntil === InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
  },
  isInterestFromClaimSubmitDate(): boolean {
    return this?.interestClaimFrom === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
  },
  isInterestFromASpecificDate(): boolean {
    return this?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE;
  },
  isInterestClaimOptionsSameRateInterest(): boolean {
    return this?.interestClaimOptions === InterestClaimOptions.SAME_RATE_INTEREST;
  },
  isSameRateTypeEightPercent(): boolean {
    return this?.sameRateInterestSelection?.sameRateInterestType !== SameRateInterestType.SAME_RATE_INTEREST_8_PC;
  },
  isDefendantDisabled(): boolean {
    return this.statementOfMeans?.disability?.option === YesNo.YES;
  },
  isDefendantSeverlyDisabled(): boolean {
    return this.statementOfMeans?.severeDisability?.option === YesNo.YES;
  },
  isDefendantDisabledAndSeverlyDiabled(): boolean {
    return this.isDefendantDisabled() && this.isDefendantSeverlyDisabled();
  },
  isPartnerDisabled(): boolean {
    return this.statementOfMeans?.cohabiting?.option === YesNo.YES &&
      this.statementOfMeans?.partnerDisability?.option === YesNo.YES;
  },
  isChildrenDisabled(): boolean {
    return this.statementOfMeans?.dependants?.declared === true &&
      this.statementOfMeans?.childrenDisability?.option === YesNo.YES;
  },
  isDefendantSeverelyDisabledOrDependentsDisabled(): boolean {
    return this.isChildrenDisabled() || this.isPartnerDisabled() || this.isDefendantDisabledAndSeverlyDiabled();
  },
  isFullAdmission(): boolean {
    return this?.respondent1?.responseType === ResponseType.FULL_ADMISSION;
  },
  isPartialAdmission(): boolean {
    return this?.respondent1?.responseType === ResponseType.PART_ADMISSION;
  },
  isFullAdmissionPaymentOptionExists(): boolean {
    return this?.paymentOption?.length > 0;
  },
  isPartialAdmissionPaymentOptionExists(): boolean {
    return this?.partialAdmission?.paymentOption?.length > 0;
  },
  partialAdmissionPaymentAmount(): number {
    return this?.partialAdmission?.howMuchDoYouOwe?.amount;
  },
};
