import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../common/models/claim';
import {Evidence} from '../../../../common/form/models/evidence/evidence';
import {EvidenceItem} from '../../../../common/form/models/evidence/evidenceItem';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getEvidence = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.evidence) {
      const evidence = claim.evidence;
      claim.evidence.evidenceItem = claim.evidence.evidenceItem.map(item => new EvidenceItem(item.type, item.description));
      return new Evidence(evidence.comment, evidence.evidenceItem);
    }
    return new Evidence();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveEvidence = async (claimId: string, form: Evidence) => {
  try {
    const claim = await getClaim(claimId);
    claim.evidence = form;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.evidence) {
    claim.evidence = {
      comment: '',
      evidenceItem: [],
    };
  }
  return claim;
};


export {
  getEvidence,
  saveEvidence,
};
