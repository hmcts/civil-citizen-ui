import {PartnerSevereDisability} from '../../../common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');
const partnerSevereDisability = new PartnerSevereDisability();

export class PartnerSevereDisabilityService {

  public async getPartnerSevereDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.partnerSevereDisability) {
        partnerSevereDisability.option = case_data.statementOfMeans.partnerSevereDisability.option;
        return partnerSevereDisability;
      }
      return new PartnerSevereDisability();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerSevereDisability(claimId: string, partnerSevereDisability: PartnerSevereDisability) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.partnerSevereDisability = partnerSevereDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerSevereDisability = partnerSevereDisability;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
