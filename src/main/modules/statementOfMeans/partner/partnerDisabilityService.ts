import {PartnerDisability} from '../../../common/form/models/statementOfMeans/partner/partnerDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerDisabilityService');

export class PartnerDisabilityService {

  public async getPartnerDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.partnerDisability) {
        const partnerDisability = new PartnerDisability();
        partnerDisability.option = case_data.statementOfMeans.partnerDisability.option;
        return partnerDisability;
      }
      return new PartnerDisability();
    } catch (error) {
      logger.error(error);
      throw error;

    }
  }

  public async savePartnerDisability(claimId: string, partnerDisability: PartnerDisability) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.partnerDisability = partnerDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerDisability = partnerDisability;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
