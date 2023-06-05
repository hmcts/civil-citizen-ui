import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildAnswersToQuestionsSection,
  buildExpertReportSection,
  buildJointStatementSection, buildQuestionsForOtherSection
} from 'services/features/caseProgression/expertContentBuilder';

export const getExpertContent = (claim: Claim): ClaimSummaryContent[] => {
  const sectionContent = [];
  const selectItems= ['claimant 1 name','claimant 2 name'];
  // TODO check for logged user and send only the other party/parties name/s
  selectItems.push(claim.applicant1.partyDetails.partyName);
  selectItems.push(claim.respondent1.partyDetails.partyName);

  if(claim.caseProgression?.defendantUploadDocuments?.expert[0]?.selected){
    sectionContent.push([buildExpertReportSection()]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.expert[1]?.selected){
    sectionContent.push([buildJointStatementSection()]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.expert[1]?.selected){
    sectionContent.push([buildQuestionsForOtherSection(selectItems)]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.expert[1]?.selected){
    sectionContent.push([buildAnswersToQuestionsSection(selectItems)]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
