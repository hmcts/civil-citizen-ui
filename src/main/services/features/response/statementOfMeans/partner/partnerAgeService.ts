import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerAgeService');

export class PartnerAgeService {

  public async getPartnerAge(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      return (case_data?.statementOfMeans?.partnerAge)
        ? new GenericForm(new GenericYesNo(case_data.statementOfMeans.partnerAge.option))
        : new GenericForm(new GenericYesNo());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerAge(claimId: string, partner: GenericForm<GenericYesNo>) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.partnerAge = partner.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerAge = partner.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
