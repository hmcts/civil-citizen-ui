import {PartnerSevereDisability} from '../../../common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');

export class PartnerSevereDisabilityService {

  public async getPartnerSevereDisability(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.partnerSevereDisability) {
        return civilClaimResponse.case_data.statementOfMeans.partnerSevereDisability;
      }
      return new PartnerSevereDisability('');
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }

  public async savePartnerSevereDisability(claimId: string, partnerSevereDisability: PartnerSevereDisability) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.partnerSevereDisability = partnerSevereDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerSevereDisability = partnerSevereDisability;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }
}
