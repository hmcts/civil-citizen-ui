import {Claim} from '../../../../../../main/common/models/claim';
import {
  getLatestUpdateContent, getLatestUpdateContentForClaimant,
} from '../../../../../../main/services/features/dashboard/claimSummary/latestUpdateService';
import {
  buildResponseToClaimSection, buildResponseToClaimSectionForClaimant,
} from '../../../../../../main/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';

describe('Latest Update Content service', () => {
  const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  const lng = 'en';
  const caseData = Object.assign(claim, mockClaim.case_data);
  const actualLatestUpdateContent = getLatestUpdateContent(mockClaimId, caseData, lng);
  const respondentPaymentDeadline = new Date('2023-11-13');
  it('should return response to claim section latest update content', () => {
    //when
    const responseToClaimSection = buildResponseToClaimSection(caseData, mockClaimId, lng);
    const latestUpdateContent = [responseToClaimSection];
    const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
    const formattedLatestUpdateContent = filteredLatestUpdateContent.map((sectionContent, index) => {
      return ({
        contentSections: sectionContent,
        hasDivider: index < filteredLatestUpdateContent.length - 1,
      });
    });
    //Then
    expect(actualLatestUpdateContent).toMatchObject(formattedLatestUpdateContent);
    expect(actualLatestUpdateContent[0].contentSections).toEqual(filteredLatestUpdateContent[0]);
    expect(actualLatestUpdateContent[0].contentSections.length).toEqual(filteredLatestUpdateContent[0].length);
  });
  it('should return response to claim section latest update content', () => {
    //when
    const responseToClaimSection = buildResponseToClaimSection(caseData, mockClaimId, lng, respondentPaymentDeadline);
    const latestUpdateContent = [responseToClaimSection];
    const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
    const formattedLatestUpdateContent = filteredLatestUpdateContent.map((sectionContent, index) => {
      return ({
        contentSections: sectionContent,
        hasDivider: index < filteredLatestUpdateContent.length - 1,
      });
    });
    //Then
    expect(actualLatestUpdateContent).toMatchObject(formattedLatestUpdateContent);
    expect(actualLatestUpdateContent[0].contentSections).toEqual(filteredLatestUpdateContent[0]);
    expect(actualLatestUpdateContent[0].contentSections.length).toEqual(filteredLatestUpdateContent[0].length);
  });
  describe('test getLatestUpdateContentForClaimant', () => {
    const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    const claim = new Claim();
    const mockClaimId = '5129';
    const lng = 'en';
    const caseData = Object.assign(claim, mockClaim.case_data);
    caseData.ccdState = 'AWAITING_APPLICANT_INTENTION';
    caseData.respondent1 = {responseType: 'PART_ADMISSION'};
    caseData.partialAdmission.paymentIntention.paymentOption = 'BY_SET_DATE';
    const actualLatestUpdateContent = getLatestUpdateContentForClaimant(mockClaimId, caseData, lng);
    it('should return response to claim section latest update content for claimant', () => {
      //when
      const claimantResponseToClaimSection = buildResponseToClaimSectionForClaimant(caseData, mockClaimId, lng);
      const latestUpdateContent = [claimantResponseToClaimSection];
      const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
      const formattedLatestUpdateContent = filteredLatestUpdateContent.map((sectionContent, index) => {
        return ({
          contentSections: sectionContent,
          hasDivider: index < filteredLatestUpdateContent.length - 1,
        });
      });
      //Then
      expect(actualLatestUpdateContent).toMatchObject(formattedLatestUpdateContent);
      expect(actualLatestUpdateContent[0].contentSections).toEqual(filteredLatestUpdateContent[0]);
      expect(actualLatestUpdateContent[0].contentSections.length).toEqual(filteredLatestUpdateContent[0].length);
    });
  });
});
