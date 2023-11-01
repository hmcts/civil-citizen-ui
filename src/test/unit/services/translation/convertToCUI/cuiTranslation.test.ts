import {CCDClaim} from 'common/models/civilClaimResponse';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {TimeLineDocument, Document} from 'common/models/document/document';
import { InterestClaimFromType, InterestEndDateType } from 'common/form/models/claimDetails';
import { CCDInterestType } from 'common/models/ccdResponse/ccdInterestType';
import { CCDSameRateInterestSelection, CCDSameRateInterestType } from 'common/models/ccdResponse/ccdSameRateInterestSelection';
import {CCDAddress} from 'common/models/ccdResponse/ccdAddress';
import {CCDParty} from 'common/models/ccdResponse/ccdParty';
import {PartyType} from 'common/models/partyType';
import { YesNo, YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { CCDDJPaymentOption } from 'common/models/ccdResponse/ccdDJPaymentOption';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { CCDPaymentOption } from 'common/models/ccdResponse/ccdPaymentOption';

const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const emailCCD = 'test@test.com';

const addressCCD: CCDAddress = {
  AddressLine1: 'Street test',
  AddressLine2: '1',
  AddressLine3: '1A',
  PostTown: 'test',
  PostCode: 'sl11gf',
  Country: 'test',
  County: 'test',
};

const getPartyIndividualCCD = (): CCDParty => {
  return {
    companyName: undefined,
    individualDateOfBirth: new Date('Wed Oct 10 1990 01:00:00 GMT+0100'),
    individualTitle: title,
    individualFirstName: firstName,
    individualLastName: lastName,
    organisationName: undefined,
    partyEmail: emailCCD,
    partyPhone: phoneCCD,
    primaryAddress: addressCCD,
    soleTraderDateOfBirth: undefined,
    soleTraderTitle: undefined,
    soleTraderFirstName: undefined,
    soleTraderLastName: undefined,
    soleTraderTradingAs: undefined,
    type: PartyType.INDIVIDUAL,
  };
};

describe("translateCCDCaseDataToCUIModel", () => {
  it("should return undefined if ccdClaim", () => {
    //Given
    const input: CCDClaim = undefined;
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.specClaimTemplateDocumentFiles).toBe(undefined);
  });

  it("should return undefined if witness appear is undefined", () => {
    //Given
    const input: CCDClaim = {
      servedDocumentFiles: {
        timelineEventUpload: [
          <TimeLineDocument>{
            id: "6f5daf35-e492-4f89-891c-bbd948263653",
            value: <Document>{
              category_id: "detailsOfClaim",
              document_url:
                "http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c",
              document_filename: "timeline-event-summary.pdf",
              document_binary_url:
                "http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary",
            },
          },
        ],
      },
    };
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.specClaimTemplateDocumentFiles.category_id).toBe(
      "detailsOfClaim"
    );
    expect(output.specClaimTemplateDocumentFiles.document_binary_url).toBe(
      "http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary"
    );
    expect(output.specClaimTemplateDocumentFiles.document_filename).toBe(
      "timeline-event-summary.pdf"
    );
    expect(output.specClaimTemplateDocumentFiles.document_url).toBe(
      "http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c"
    );
  });

  it("should return interest values to cui fromm ccd", () => {
    const input: CCDClaim = {
      interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE,
      interestClaimOptions: CCDInterestType.SAME_RATE_INTEREST,
      interestClaimUntil: InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE,
      interestFromSpecificDate: "2023-01-01",
      interestFromSpecificDateDescription: "ss",
      sameRateInterestSelection: {
        sameRateInterestType: CCDSameRateInterestType.SAME_RATE_INTEREST_8_PC,
      } as CCDSameRateInterestSelection,
    };
    //When
    const output = translateCCDCaseDataToCUIModel(input);
    //Then
    expect(output.interest).toBeDefined();
    expect(output.interest.interestEndDate).toEqual(
      InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE
    );
    expect(output.interest.interestClaimFrom).toEqual(
      InterestClaimFromType.FROM_A_SPECIFIC_DATE
    );
    expect(output.interest.interestClaimOptions).toEqual(
      CCDInterestType.SAME_RATE_INTEREST
    );
    expect(output.interest.sameRateInterestSelection).toEqual({
      sameRateInterestType: CCDSameRateInterestType.SAME_RATE_INTEREST_8_PC,
      differentRate: undefined,
      reason: undefined,
    });
  });

  it("should translate full defence fields to CUI model", () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: "FULL_DEFENCE",
      applicant1ProceedWithClaim: YesNoUpperCamelCase.YES,
    };

    //When
    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.intentionToProceed).toEqual(
      new GenericYesNo(YesNo.YES)
    );
  });

  it("should translate partial admission field to CUI model", () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: "PART_ADMISSION",
      applicant1AcceptPartAdmitPaymentPlanSpec: YesNoUpperCamelCase.YES,
      applicant1PartAdmitIntentionToSettleClaimSpec: YesNoUpperCamelCase.YES,
      specDefenceAdmittedRequired: YesNoUpperCamelCase.YES,
    };

    //When
    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.partialAdmission.alreadyPaid).toEqual(
      new GenericYesNo(YesNo.YES)
    );
    expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toEqual(
      new GenericYesNo(YesNo.YES)
    );
    expect(claim.claimantResponse.hasPartAdmittedBeenAccepted).toEqual(
      new GenericYesNo(YesNo.YES)
    );
  });

  it("should translate full admission field to CUI model", () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: "FULL_ADMISSION",
      defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY,
      applicant1AcceptFullAdmitPaymentPlanSpec: YesNoUpperCamelCase.YES,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.fullAdmission.paymentIntention.paymentOption).toEqual(
      PaymentOptionType.IMMEDIATELY
    );
    expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toEqual(
      new GenericYesNo(YesNo.YES)
    );
  });

  it("should translate full admission field to CUI model", () => {
    //Given
    const input: CCDClaim = {
      respondent1: getPartyIndividualCCD(),
      respondent1ClaimResponseTypeForSpec: "FULL_ADMISSION",
      defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY,
      applicant1AcceptFullAdmitPaymentPlanSpec: YesNoUpperCamelCase.YES,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.fullAdmission.paymentIntention.paymentOption).toEqual(
      PaymentOptionType.IMMEDIATELY
    );
    expect(claim.claimantResponse.fullAdmitSetDateAcceptPayment).toEqual(
      new GenericYesNo(YesNo.YES)
    );
  });

  it("should translate partial payment to CUI model", () => {
    //Given
    const input: CCDClaim = {
      partialPayment: YesNoUpperCamelCase.YES,
      partialPaymentAmount: "IMMEDIATELY",
      paymentTypeSelection: CCDDJPaymentOption.IMMEDIATELY,
    };

    const claim = translateCCDCaseDataToCUIModel(input);

    //Then
    expect(claim.claimantResponse.ccjRequest.ccjPaymentOption.type).toEqual(
      PaymentOptionType.IMMEDIATELY
    );
  });
});
