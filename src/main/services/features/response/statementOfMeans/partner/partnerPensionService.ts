import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Claim} from '../../../../../common/models/claim';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerPensionService');

export class PartnerPensionService {

  public async getPartnerPension(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans?.partnerPension) {
        const partnerPension = new GenericForm(new GenericYesNo());
        partnerPension.model.option = case_data.statementOfMeans.partnerPension.option;
        return partnerPension;
      }
      return new GenericForm(new GenericYesNo());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerPension(claimId: string, partnerPension: GenericForm<GenericYesNo>) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.partnerPension = partnerPension.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerPension = partnerPension.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
