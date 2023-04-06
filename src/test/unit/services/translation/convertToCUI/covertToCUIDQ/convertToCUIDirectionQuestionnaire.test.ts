import {
  YesNo,
  YesNoNotReceived,
  YesNoUpperCamelCase,
} from 'common/form/models/yesNo';
import {CCDDQExtraDetails} from 'common/models/ccdResponse/ccdDQExtraDetails';
import {
  CCDExpert,
  CCDExpertDetails,
  CCDExportReportSent,
} from 'common/models/ccdResponse/ccdExpert';
import {CCDLiPExpert} from 'common/models/ccdResponse/ccdLiPExpert';
import {CCDRespondentLiPResponse} from 'common/models/ccdResponse/ccdRespondentLiPResponse';
import {CCDClaim} from 'common/models/civilClaimResponse';
import {toCUIDirectionQuestionnaire} from 'services/translation/convertToCUI/convertToCUIDQ/convertToCUIDirectionQuestionnaire';

describe('Convert CCD data to CUI DirectionQuestionnaire model ', () => {
  it('should translate CCD data to CUI DirectionQuestionnaire with undefined', () => {
    // Given
    const ccdClaim: CCDClaim = undefined;
    // When
    const result = toCUIDirectionQuestionnaire(ccdClaim);
    // Then
    expect(result).toBeUndefined();
  });
  describe('Small Claim - non-common filelds', () => {
    it('should translate CCD data to CUI DirectionQuestionnaire with small claims uncommon fields', () => {
      // Given
      const ccdClaim: CCDClaim = getCCDDataForSmallClaimUncommonFields();
      // When
      const result = toCUIDirectionQuestionnaire(ccdClaim);
      // Then
      expect(result.hearing.determinationWithoutHearing.option).toBe(YesNo.YES); // no and reason
      expect(result.hearing.determinationWithoutHearing.reasonForHearing).toBeUndefined();
      expect(result.experts.expertRequired).toBe(true);
      expect(result.experts.expertReportDetails.option).toBe(YesNo.NO); // yes and details
      expect(result.experts.expertReportDetails.reportDetails).toBeUndefined();
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
  });

  describe('Fast rack - non-common filelds', () => {

    it('should translate CCD data to CUI DirectionQuestionnaire with fast track uncommon fileds', () => {
      // Given
      const ccdClaim: CCDClaim = getCCDDataForFastTrackClaimUncommonFields();
      // When
      const result = toCUIDirectionQuestionnaire(ccdClaim);
      // Then
      expect(result.hearing.determinationWithoutHearing).toBeUndefined();
      expect(result.hearing.triedToSettle.option).toBe(YesNo.YES);
      expect(result.hearing.requestExtra4weeks.option).toBe(YesNo.YES);
      expect(result.hearing.considerClaimantDocuments.option).toBe(YesNo.NO); // yes and details
      expect(result.hearing.considerClaimantDocuments.details).toBeUndefined(); // yes and details
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
  });
});

function getCCDDataForSmallClaimUncommonFields(): CCDClaim {
  return {
    totalClaimAmount: 4555,
    respondent1LiPResponse: <CCDRespondentLiPResponse>{
      respondent1DQExtraDetails: <CCDDQExtraDetails>{
        determinationWithoutHearingRequired: YesNoUpperCamelCase.YES, // no and reason
        determinationWithoutHearingReason: undefined,
        respondent1DQLiPExpert: <CCDLiPExpert>{
          caseNeedsAnExpert: YesNoUpperCamelCase.YES,
          expertReportRequired: YesNoUpperCamelCase.NO, // yes and report details
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
        considerClaimantDocuments: YesNoUpperCamelCase.NO, // yes doc details
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
