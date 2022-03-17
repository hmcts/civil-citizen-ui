import {PartnerDisability} from '../../../common/form/models/statementOfMeans/partner/partnerDisability';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerDisabilityService');

export class PartnerDisabilityService {

  public async getPartnerDisability(claimId: string) {
    try {

      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.partnerDisability) {
        return civilClaimResponse.case_data.statementOfMeans.partnerDisability;
      }
      return new PartnerDisability('');
    } catch (err) {
      logger.error(`${err.stack || err}`);
    }
  }

  public async savePartnerDisability(claimId: string, partnerDisability: PartnerDisability) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.partnerDisability = partnerDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        civilClaimResponse.case_data = new Claim();
        statementOfMeans.partnerDisability = partnerDisability;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err) {
      logger.error(`${err.stack || err}`);
    }
  }
}
