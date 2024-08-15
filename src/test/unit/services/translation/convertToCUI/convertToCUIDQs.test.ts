import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIDQs} from 'services/translation/convertToCUI/convertToCUIDQs';
import {YesNo, YesNoNotReceived, YesNoUpperCamelCase} from 'form/models/yesNo';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from 'form/models/genericYesNo';
import {CCDRespondentLiPResponse} from 'common/models/ccdResponse/ccdRespondentLiPResponse';
import {CCDDQExtraDetails} from 'common/models/ccdResponse/ccdDQExtraDetails';
import {CCDLiPExpert} from 'common/models/ccdResponse/ccdLiPExpert';
import {CCDExpert, CCDExpertDetails, CCDExportReportSent} from 'common/models/ccdResponse/ccdExpert';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {
  CCDComplexityBand,
  CCDFixedRecoverableCostsIntermediate,
} from 'models/ccdResponse/ccdFixedRecoverableCostsIntermediate';
import {CCDDisclosureOfElectronicDocuments} from 'models/ccdResponse/ccdDisclosureOfElectronicDocuments';
import {CCDDisclosureOfNonElectronicDocuments} from 'models/ccdResponse/ccdDisclosureOfNonElectronicDocuments';
import {CCDDocumentsToBeConsidered} from 'models/ccdResponse/ccdDocumentsToBeConsidered';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';
import {TypeOfDisclosureDocument} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';

describe('translate CCDDQ to CUI DQ model', () => {
  it('should return undefined if ccdClaim doesnt exist', () => {
    //Given
    const input: CCDClaim = undefined;
    //When
    const output = toCUIDQs(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if ccdClaim has data', () => {
    //Given
    const input: CCDClaim = {
      respondent1LiPResponse: {
        respondent1DQExtraDetails: {
          giveEvidenceYourSelf: YesNoUpperCamelCase.YES,
        },
      },
    };
    //When
    const output = toCUIDQs(input);
    const expected : DirectionQuestionnaire = new DirectionQuestionnaire(new GenericYesNo(YesNo.YES), new Hearing(), undefined, new Experts());
    //Then
    expect(output).toEqual(expected);
  });
  it('should translate CCD data to CUI DirectionQuestionnaire with small claims uncommon fields', () => {
    // Given
    const ccdClaim: CCDClaim = getCCDDataForSmallClaimUncommonFields();
    // When
    const result = toCUIDQs(ccdClaim);
    // Then
    expect(result.hearing.determinationWithoutHearing.option).toBe(YesNo.YES);
    expect(result.hearing.determinationWithoutHearing.reasonForHearing).toBeUndefined();
    expect(result.experts.expertRequired).toBe(true);
    expect(result.experts.expertReportDetails.option).toBe(YesNo.NO);
    expect(result.experts.permissionForExpert.option).toBe(YesNo.YES);
    expect(result.experts.expertCanStillExamine.option).toBe(YesNo.NO);
    expect(result.experts.expertCanStillExamine.details).toBe('Examine details');
    expect(result.experts.expertDetailsList.items.length).toBe(1);
    expect(result.experts.expertDetailsList.items[0].firstName).toBe('Expert1');
    expect(result.experts.expertDetailsList.items[0].lastName).toBe('Lastname');
    expect(result.experts.expertDetailsList.items[0].emailAddress).toBe('abc@gmail.com');
    expect(result.experts.expertDetailsList.items[0].phoneNumber).toBe(1225653765);
    expect(result.experts.expertDetailsList.items[0].whyNeedExpert).toBe('reaosan1');
    expect(result.experts.expertDetailsList.items[0].fieldOfExpertise).toBe('Field1');
    expect(result.experts.expertDetailsList.items[0].estimatedCost).toBe(2345);
    expect(result.hearing.triedToSettle).toBeUndefined();
  });
  it('should translate CCD data to CUI DirectionQuestionnaire with fast track uncommon fileds', () => {
    // Given
    const ccdClaim: CCDClaim = getCCDDataForFastTrackClaimUncommonFields();
    // When
    const result = toCUIDQs(ccdClaim);
    // Then
    expect(result.hearing.determinationWithoutHearing).toBeUndefined();
    expect(result.hearing.triedToSettle.option).toBe(YesNo.YES);
    expect(result.hearing.requestExtra4weeks.option).toBe(YesNo.YES);
    expect(result.hearing.considerClaimantDocuments.option).toBe(YesNo.NO);
    expect(result.hearing.considerClaimantDocuments.details).toBeUndefined();
    expect(result.experts.expertEvidence.option).toBe(YesNo.YES);
    expect(result.experts.sentExpertReports.option).toBe(YesNoNotReceived.NOT_RECEIVED);
    expect(result.experts.sharedExpert.option).toBe(YesNo.YES);
    expect(result.experts.expertDetailsList.items.length).toBe(1);
    expect(result.experts.expertDetailsList.items[0].firstName).toBe('Expert1');
    expect(result.experts.expertDetailsList.items[0].lastName).toBe('Lastname');
    expect(result.experts.expertDetailsList.items[0].emailAddress).toBe('abc@gmail.com');
    expect(result.experts.expertDetailsList.items[0].phoneNumber).toBe(1225653765);
    expect(result.experts.expertDetailsList.items[0].whyNeedExpert).toBe('reaosan1');
    expect(result.experts.expertDetailsList.items[0].fieldOfExpertise).toBe('Field1');
    expect(result.experts.expertDetailsList.items[0].estimatedCost).toBe(2345);
  });
  it('should translate CCD data to CUI DirectionQuestionnaire with int track uncommon fileds', () => {
    // Given
    const ccdClaim: CCDClaim = getCCDDataForIntTrackClaimUncommonFields();
    // When
    const result = toCUIDQs(ccdClaim);
    // Then
    expect(result.hearing.determinationWithoutHearing).toBeUndefined();
    expect(result.hearing.triedToSettle.option).toBe(YesNo.YES);
    expect(result.hearing.requestExtra4weeks.option).toBe(YesNo.YES);
    expect(result.hearing.considerClaimantDocuments).toBeUndefined();
    expect(result.experts.expertEvidence.option).toBe(YesNo.YES);
    expect(result.experts.sentExpertReports.option).toBe(YesNoNotReceived.NOT_RECEIVED);
    expect(result.experts.sharedExpert.option).toBe(YesNo.YES);
    expect(result.experts.expertDetailsList.items.length).toBe(1);
    expect(result.experts.expertDetailsList.items[0].firstName).toBe('Expert1');
    expect(result.experts.expertDetailsList.items[0].lastName).toBe('Lastname');
    expect(result.experts.expertDetailsList.items[0].emailAddress).toBe('abc@gmail.com');
    expect(result.experts.expertDetailsList.items[0].phoneNumber).toBe(1225653765);
    expect(result.experts.expertDetailsList.items[0].whyNeedExpert).toBe('reaosan1');
    expect(result.experts.expertDetailsList.items[0].fieldOfExpertise).toBe('Field1');
    expect(result.experts.expertDetailsList.items[0].estimatedCost).toBe(2345);

    expect(result.fixedRecoverableCosts.subjectToFrc.option).toBe(YesNo.YES);
    expect(result.fixedRecoverableCosts.frcBandAgreed.option).toBe(YesNo.YES);
    expect(result.fixedRecoverableCosts.complexityBand).toBe(ComplexityBandOptions.BAND_2);
    expect(result.fixedRecoverableCosts.reasonsForBandSelection).toBe('band reasons');

    expect(result.hearing.disclosureOfDocuments.documentsTypeChosen.length).toBe(2);
    expect(result.hearing.disclosureOfDocuments.documentsTypeChosen[0]).toBe(TypeOfDisclosureDocument.ELECTRONIC);
    expect(result.hearing.disclosureOfDocuments.documentsTypeChosen[1]).toBe(TypeOfDisclosureDocument.NON_ELECTRONIC);
    expect(result.hearing.hasAnAgreementBeenReached).toBe(HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY);
    expect(result.hearing.disclosureOfElectronicDocumentsIssues).toBe('electronic');
    expect(result.hearing.disclosureNonElectronicDocument).toBe('non-electronic');

    expect(result.hearing.hasDocumentsToBeConsidered.option).toBe(YesNo.YES);
    expect(result.hearing.documentsConsideredDetails).toBe('details');
  });
  it('should translate CCD data to CUI DirectionQuestionnaire with multi track uncommon fileds', () => {
    // Given
    const ccdClaim: CCDClaim = getCCDDataFoMultiTrackClaimUncommonFields();
    // When
    const result = toCUIDQs(ccdClaim);
    // Then
    expect(result.hearing.determinationWithoutHearing).toBeUndefined();
    expect(result.hearing.triedToSettle.option).toBe(YesNo.YES);
    expect(result.hearing.requestExtra4weeks.option).toBe(YesNo.YES);
    expect(result.hearing.considerClaimantDocuments).toBeUndefined();
    expect(result.experts.expertEvidence.option).toBe(YesNo.YES);
    expect(result.experts.sentExpertReports.option).toBe(YesNoNotReceived.NOT_RECEIVED);
    expect(result.experts.sharedExpert.option).toBe(YesNo.YES);
    expect(result.experts.expertDetailsList.items.length).toBe(1);
    expect(result.experts.expertDetailsList.items[0].firstName).toBe('Expert1');
    expect(result.experts.expertDetailsList.items[0].lastName).toBe('Lastname');
    expect(result.experts.expertDetailsList.items[0].emailAddress).toBe('abc@gmail.com');
    expect(result.experts.expertDetailsList.items[0].phoneNumber).toBe(1225653765);
    expect(result.experts.expertDetailsList.items[0].whyNeedExpert).toBe('reaosan1');
    expect(result.experts.expertDetailsList.items[0].fieldOfExpertise).toBe('Field1');
    expect(result.experts.expertDetailsList.items[0].estimatedCost).toBe(2345);

    expect(result.fixedRecoverableCosts).toBeUndefined();

    expect(result.hearing.disclosureOfDocuments.documentsTypeChosen.length).toBe(1);
    expect(result.hearing.disclosureOfDocuments.documentsTypeChosen[0]).toBe(TypeOfDisclosureDocument.ELECTRONIC);
    expect(result.hearing.hasAnAgreementBeenReached).toBe(HasAnAgreementBeenReachedOptions.NO);
    expect(result.hearing.disclosureOfElectronicDocumentsIssues).toBe('electronic');
    expect(result.hearing.disclosureNonElectronicDocument).toBeUndefined();

    expect(result.hearing.hasDocumentsToBeConsidered.option).toBe(YesNo.YES);
    expect(result.hearing.documentsConsideredDetails).toBe('details');
  });
});

function getCCDDataForSmallClaimUncommonFields(): CCDClaim {
  return {
    totalClaimAmount: 4555,
    responseClaimTrack: 'SMALL_CLAIM',
    respondent1LiPResponse: <CCDRespondentLiPResponse>{
      respondent1DQExtraDetails: <CCDDQExtraDetails>{
        determinationWithoutHearingRequired: YesNoUpperCamelCase.YES,
        determinationWithoutHearingReason: undefined,
        respondent1DQLiPExpert: <CCDLiPExpert>{
          caseNeedsAnExpert: YesNoUpperCamelCase.YES,
          expertReportRequired: YesNoUpperCamelCase.NO,
          expertCanStillExamineDetails: 'Examine details',
        },
      },
    },
    responseClaimExpertSpecRequired: YesNoUpperCamelCase.YES,
    respondent1DQExperts: <CCDExpert>{
      expertRequired: YesNoUpperCamelCase.NO,
      details: <CCDExpertDetails>[
        {
          id: '26825a6e-1d1e-465e-88e6-d4d6b2ce2f66',
          value: {
            name: 'Expert1 Lastname',
            firstName: 'Expert1',
            lastName: 'Lastname',
            phoneNumber: '1225653765',
            whyRequired: 'reaosan1',
            emailAddress: 'abc@gmail.com',
            estimatedCost: '234500',
            fieldOfExpertise: 'Field1',
          },
        },
      ],
    },
  } as CCDClaim;
}

function getCCDDataForFastTrackClaimUncommonFields(): CCDClaim {
  return {
    totalClaimAmount: 15000,
    respondent1LiPResponse: <CCDRespondentLiPResponse>{
      respondent1DQExtraDetails: <CCDDQExtraDetails>{
        triedToSettle: YesNoUpperCamelCase.YES,
        requestExtra4weeks: YesNoUpperCamelCase.YES,
        considerClaimantDocuments: YesNoUpperCamelCase.NO,
        considerClaimantDocumentsDetails: undefined,
        respondent1DQLiPExpert: <CCDLiPExpert>{
        },
      },
    },
    respondent1DQExperts: <CCDExpert>{
      expertRequired: YesNoUpperCamelCase.YES,
      jointExpertSuitable: YesNoUpperCamelCase.YES,
      expertReportsSent: CCDExportReportSent.NOT_OBTAINED,
      details: <CCDExpertDetails>[
        {
          id: '26825a6e-1d1e-465e-88e6-d4d6b2ce2f66',
          value: {
            name: 'Expert1 Lastname',
            firstName: 'Expert1',
            lastName: 'Lastname',
            phoneNumber: '1225653765',
            whyRequired: 'reaosan1',
            emailAddress: 'abc@gmail.com',
            estimatedCost: '234500',
            fieldOfExpertise: 'Field1',
          },
        },
      ],
    },
  } as CCDClaim;
}

function getCCDDataForIntTrackClaimUncommonFields(): CCDClaim {
  return {
    totalClaimAmount: 15000,
    respondent1LiPResponse: <CCDRespondentLiPResponse>{
      respondent1DQExtraDetails: <CCDDQExtraDetails>{
        triedToSettle: YesNoUpperCamelCase.YES,
        requestExtra4weeks: YesNoUpperCamelCase.YES,
        respondent1DQLiPExpert: <CCDLiPExpert>{
        },
      },
    },
    respondent1DQExperts: <CCDExpert>{
      expertRequired: YesNoUpperCamelCase.YES,
      jointExpertSuitable: YesNoUpperCamelCase.YES,
      expertReportsSent: CCDExportReportSent.NOT_OBTAINED,
      details: <CCDExpertDetails>[
        {
          id: '26825a6e-1d1e-465e-88e6-d4d6b2ce2f66',
          value: {
            name: 'Expert1 Lastname',
            firstName: 'Expert1',
            lastName: 'Lastname',
            phoneNumber: '1225653765',
            whyRequired: 'reaosan1',
            emailAddress: 'abc@gmail.com',
            estimatedCost: '234500',
            fieldOfExpertise: 'Field1',
          },
        },
      ],
    },
    respondent1DQFixedRecoverableCostsIntermediate: <CCDFixedRecoverableCostsIntermediate> {
      isSubjectToFixedRecoverableCostRegime: YesNoUpperCamelCase.YES,
      band: CCDComplexityBand.BAND_2,
      complexityBandingAgreed: YesNoUpperCamelCase.YES,
      reasons: 'band reasons',
    },
    specRespondent1DQDisclosureOfElectronicDocuments: <CCDDisclosureOfElectronicDocuments> {
      reachedAgreement: YesNoUpperCamelCase.NO,
      agreementLikely: YesNoUpperCamelCase.YES,
      reasonForNoAgreement: 'electronic',
    },
    specRespondent1DQDisclosureOfNonElectronicDocuments: <CCDDisclosureOfNonElectronicDocuments> {
      bespokeDirections: 'non-electronic',
    },
    respondent1DQClaimantDocumentsToBeConsidered: <CCDDocumentsToBeConsidered> {
      hasDocumentsToBeConsidered: YesNoUpperCamelCase.YES,
      details: 'details',
    },
  } as CCDClaim;
}

function getCCDDataFoMultiTrackClaimUncommonFields(): CCDClaim {
  return {
    totalClaimAmount: 15000,
    respondent1LiPResponse: <CCDRespondentLiPResponse>{
      respondent1DQExtraDetails: <CCDDQExtraDetails>{
        triedToSettle: YesNoUpperCamelCase.YES,
        requestExtra4weeks: YesNoUpperCamelCase.YES,
        respondent1DQLiPExpert: <CCDLiPExpert>{
        },
      },
    },
    respondent1DQExperts: <CCDExpert>{
      expertRequired: YesNoUpperCamelCase.YES,
      jointExpertSuitable: YesNoUpperCamelCase.YES,
      expertReportsSent: CCDExportReportSent.NOT_OBTAINED,
      details: <CCDExpertDetails>[
        {
          id: '26825a6e-1d1e-465e-88e6-d4d6b2ce2f66',
          value: {
            name: 'Expert1 Lastname',
            firstName: 'Expert1',
            lastName: 'Lastname',
            phoneNumber: '1225653765',
            whyRequired: 'reaosan1',
            emailAddress: 'abc@gmail.com',
            estimatedCost: '234500',
            fieldOfExpertise: 'Field1',
          },
        },
      ],
    },
    specRespondent1DQDisclosureOfElectronicDocuments: <CCDDisclosureOfElectronicDocuments> {
      reachedAgreement: YesNoUpperCamelCase.NO,
      agreementLikely: YesNoUpperCamelCase.NO,
      reasonForNoAgreement: 'electronic',
    },
    respondent1DQClaimantDocumentsToBeConsidered: <CCDDocumentsToBeConsidered> {
      hasDocumentsToBeConsidered: YesNoUpperCamelCase.YES,
      details: 'details',
    },
  } as CCDClaim;
}
