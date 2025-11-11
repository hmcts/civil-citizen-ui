import {
  YesNo,
  YesNoNotReceived,
  YesNoUpperCamelCase,
} from 'common/form/models/yesNo';
import {
  CCDExpertDetails,
  CCDExpertDetailsItem,
  CCDExportReportSent,
} from 'common/models/ccdResponse/ccdExpert';
import {CCDLiPExpert, CCDReportDetail} from 'common/models/ccdResponse/ccdLiPExpert';
import {
  toCUISentExpertReports,
  toCUIExpertDetails,
  toCUIExpertReportDetails,
} from 'services/translation/convertToCUI/convertToCUIExperts';
import {CaseRole} from 'form/models/caseRoles';

describe('translate CCD data to CUI DQ Experts model', () => {
  describe('toCUISentExpertReports', () => {
    it('should translate CCD data to CUI SentExpertReports model with empty ccdExportReportSent field', () => {
      // Given
      const ccdExportReportSent: CCDExportReportSent = undefined;
      // When
      const result = toCUISentExpertReports(ccdExportReportSent);
      // Then
      expect(result).toBeUndefined();
    });

    it('should translate CCD data to CUI SentExpertReports model with `YES`', () => {
      // Given
      const ccdExportReportSent = CCDExportReportSent.YES;
      // When
      const result = toCUISentExpertReports(ccdExportReportSent);
      // Then
      expect(result.option).toBe(YesNoNotReceived.YES);
    });

    it('should translate CCD data to CUI SentExpertReports model with `NO`', () => {
      // Given
      const ccdExportReportSent = CCDExportReportSent.NO;
      // When
      const result = toCUISentExpertReports(ccdExportReportSent);
      // Then
      expect(result.option).toBe(YesNoNotReceived.NO);
    });

    it('should translate CCD data to CUI SentExpertReports model with `NOT_OBTAINED`', () => {
      // Given
      const ccdExportReportSent = CCDExportReportSent.NOT_OBTAINED;
      // When
      const result = toCUISentExpertReports(ccdExportReportSent);
      // Then
      expect(result.option).toBe(YesNoNotReceived.NOT_RECEIVED);
    });
  });

  describe('toCUIExpertDetails', () => {
    it('should translate CCD data to CUI ExpertDetailsList with undefined', () => {
      // Given
      const ccdExpertDetailsList: CCDExpertDetails[] = undefined;
      // When
      const result = toCUIExpertDetails(ccdExpertDetailsList);
      // Then
      expect(result.items).toBeUndefined();
    });

    it('should translate CCD data to CUI ExpertDetailsList with mandatory fields', () => {
      // Given
      const ccdExpertDetailsList: CCDExpertDetails[] = [
        <CCDExpertDetails>{
          value: <CCDExpertDetailsItem>{
            whyRequired: 'Test Reason',
            fieldOfExpertise: 'Construction',
          },
        },
      ];
      // When
      const result = toCUIExpertDetails(ccdExpertDetailsList);
      // Then
      expect(result.items.length).toBe(1);
      expect(result.items[0].firstName).toBeUndefined();
      expect(result.items[0].lastName).toBeUndefined();
      expect(result.items[0].phoneNumber).toBeUndefined();
      expect(result.items[0].emailAddress).toBeUndefined();
      expect(result.items[0].whyNeedExpert).toBe('Test Reason');
      expect(result.items[0].fieldOfExpertise).toBe('Construction');
      expect(result.items[0].estimatedCost).toBeUndefined();
    });

    it('should translate CCD data to CUI ExpertDetailsList with all fields', () => {
      // Given
      const ccdExpertDetailsList: CCDExpertDetails[] = [
        <CCDExpertDetails>{
          value: <CCDExpertDetailsItem>{
            name: 'Mike Brown',
            firstName: 'Mike',
            lastName: 'Brown',
            phoneNumber: '121',
            emailAddress: 'abc@test.com',
            whyRequired: 'Test Reason',
            fieldOfExpertise: 'Construction',
            estimatedCost: 10000,
          },
        },
      ];
      // When
      const result = toCUIExpertDetails(ccdExpertDetailsList);
      // Then
      expect(result.items.length).toBe(1);
      expect(result.items[0].firstName).toBe('Mike');
      expect(result.items[0].lastName).toBe('Brown');
      expect(result.items[0].phoneNumber).toBe(121);
      expect(result.items[0].emailAddress).toBe('abc@test.com');
      expect(result.items[0].whyNeedExpert).toBe('Test Reason');
      expect(result.items[0].fieldOfExpertise).toBe('Construction');
      expect(result.items[0].estimatedCost).toBe(100);
    });

    it('should handle floating point rounding for estimatedCost in CCD to CUI ExpertDetailsList conversion', () => {
      // Given
      const ccdExpertDetailsList: CCDExpertDetails[] = [
        <CCDExpertDetails>{
          value: <CCDExpertDetailsItem>{
            name: 'Mike Brown',
            firstName: 'Mike',
            lastName: 'Brown',
            phoneNumber: '121',
            emailAddress: 'abc@test.com',
            whyRequired: 'Test Reason',
            fieldOfExpertise: 'Construction',
            estimatedCost: 28,
          },
        },
      ];
      // When
      const result = toCUIExpertDetails(ccdExpertDetailsList);
      // Then
      expect(result.items.length).toBe(1);
      expect(result.items[0].firstName).toBe('Mike');
      expect(result.items[0].lastName).toBe('Brown');
      expect(result.items[0].phoneNumber).toBe(121);
      expect(result.items[0].emailAddress).toBe('abc@test.com');
      expect(result.items[0].whyNeedExpert).toBe('Test Reason');
      expect(result.items[0].fieldOfExpertise).toBe('Construction');
      expect(result.items[0].estimatedCost).toBe(0.28);
    });
  });

  describe('toCUIExpertReportDetails', () => {
    it('should translate CCD data to CUI ExpertReportDetails with undefined', () => {
      // Given
      const ccdLipExpert: CCDLiPExpert = undefined;
      // When
      const result = toCUIExpertReportDetails({caseRole: CaseRole.CLAIMANT}, ccdLipExpert);
      // Then
      expect(result.isClaimant).toBe(true);
      expect(result.option).toBeUndefined();
      expect(result.reportDetails).toBeUndefined();
    });

    it('should translate CCD data to CUI ExpertReportDetails with option `No`', () => {
      // Given
      const ccdLipExpert: CCDLiPExpert = {
        expertReportRequired: YesNoUpperCamelCase.NO,
        details: undefined,
      };
      // When
      const result = toCUIExpertReportDetails({caseRole: CaseRole.DEFENDANT}, ccdLipExpert);
      // Then
      expect(result.isClaimant).toBe(false);
      expect(result.option).toBe(YesNo.NO);
      expect(result.reportDetails).toBeUndefined();
    });

    it('should translate CCD data to CUI ExpertReportDetails with option `Yes`', () => {
      // Given
      const ccdLipExpert: CCDLiPExpert = {
        expertReportRequired: YesNoUpperCamelCase.YES,
        details: [
          <CCDReportDetail>{
            value: <CCDExpertDetailsItem>{
              expertName: 'Mike Brown',
              reportDate: '2022-11-11T00:00:00.000Z',
            },
          },
        ],
      } as CCDLiPExpert;
      // When
      const result = toCUIExpertReportDetails({caseRole: CaseRole.CREATOR}, ccdLipExpert);
      // Then
      expect(result.option).toBe(YesNo.YES);
      expect(result.reportDetails[0].expertName).toBe('Mike Brown');
      expect(result.reportDetails[0].reportDate).toBe('2022-11-11T00:00:00.000Z');
    });
  });
});
