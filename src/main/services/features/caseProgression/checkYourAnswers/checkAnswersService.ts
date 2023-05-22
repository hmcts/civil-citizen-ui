import {Claim} from 'models/claim';

import {
  buildWitnessEvidenceSection,
} from 'services/features/caseProgression/checkYourAnswers/buildWitnessEvidenceSection';
import {documentUploadSections} from 'models/caseProgression/documentUploadSections';
import {
  buildExpertEvidenceSection,
} from 'services/features/caseProgression/checkYourAnswers/buildExpertEvidenceSection';
import {buildDisclosureSection} from 'services/features/caseProgression/checkYourAnswers/buildDisclosureSection';
import {buildTrialDocumentsSection} from 'services/features/caseProgression/checkYourAnswers/buildTrialDocumentsSection';

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): documentUploadSections => {

  return {
    witnessEvidenceSection: buildWitnessEvidenceSection(claim, claimId, lang),
    disclosureSection: buildDisclosureSection(claim, claimId, lang),
    expertEvidenceSection: buildExpertEvidenceSection(claim, claimId, lang),
    trialDocuments: buildTrialDocumentsSection(claim, claimId, lang),
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): documentUploadSections => {
  return buildSummarySections(claim, claimId, lang);
};

// const saveDocuments = async (req: AppRequest): Promise<void> => {
//   try {
//     const userId: string = req.session.user.id;
//     const claim: any = await getCaseDataFromStore(req.session.user.id);
//
//     //TODO: There will need to be an addition to check for
//
//     // if(findUserRole(userId) === 'applicant') {
//     //
//     // } else if (findUserRole(userId) === 'claimant') {
//     //
//     // }
//
//     //TODO: documents will need a location on the claim first, then it will be possible to save.
//
//     await saveDraftClaim(claimId, claim);
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// };
