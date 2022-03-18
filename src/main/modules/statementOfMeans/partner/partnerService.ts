import {PartnerAge} from '../../../common/form/models/statementOfMeans/partner/partnerAge';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerService');

export class PartnerService {

  public async getPartnerAge(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.partner) {
        return civilClaimResponse.case_data.statementOfMeans.partnerAge;
      }
      return new PartnerAge('');
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }

  public async savePartnerAge(claimId: string, partner: PartnerAge) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.partnerAge = partner;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerAge = partner;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }
}
