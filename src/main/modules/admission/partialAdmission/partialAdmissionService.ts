import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AlreadyPaid} from 'common/form/models/admission/partialAdmission/alreadyPaid';
import {GenericForm} from 'common/form/models/genericForm';
import {Validator} from 'class-validator';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');
const validator = new Validator();

export class PartialAdmissionService {
  public async getClaimAlreadyPaid(claimId: string) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return claim?.claimAlreadyPaid;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public validateAlreadyPaid(alreadyPaid: AlreadyPaid): GenericForm<AlreadyPaid> {
    const form: GenericForm<AlreadyPaid> = new GenericForm(alreadyPaid);
    form.errors = validator.validateSync(form.model);
    return form;
  }

  public async saveClaimAlreadyPaid(claimId: string, alreadyPaid: boolean): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId) || new Claim();
      claim.claimAlreadyPaid = alreadyPaid;
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
