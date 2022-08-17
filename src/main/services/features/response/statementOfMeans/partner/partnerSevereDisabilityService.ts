import {
  PartnerSevereDisability,
} from '../../../../../common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Claim} from '../../../../../common/models/claim';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');

export class PartnerSevereDisabilityService {

  public async getPartnerSevereDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans?.partnerSevereDisability) {
        const partnerSevereDisability = new GenericForm(new PartnerSevereDisability());
        partnerSevereDisability.model.option = case_data.statementOfMeans.partnerSevereDisability.option;
        return partnerSevereDisability;
      }
      return new GenericForm(new PartnerSevereDisability());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerSevereDisability(claimId: string, partnerSevereDisability: GenericForm<PartnerSevereDisability>) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.partnerSevereDisability = partnerSevereDisability.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerSevereDisability = partnerSevereDisability.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
