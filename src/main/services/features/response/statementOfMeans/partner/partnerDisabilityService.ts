import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerDisabilityService');

export class PartnerDisabilityService {

  public async getPartnerDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans?.partnerDisability) {
        const partnerDisability = new GenericForm(new GenericYesNo());
        partnerDisability.model.option = case_data.statementOfMeans.partnerDisability.option;
        return partnerDisability;
      }
      return new GenericForm(new GenericYesNo);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerDisability(claimId: string, partnerDisability: GenericForm<GenericYesNo>) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.partnerDisability = partnerDisability.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerDisability = partnerDisability.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
