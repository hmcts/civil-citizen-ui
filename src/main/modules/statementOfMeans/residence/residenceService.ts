import {getDraftClaimFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Residence} from '../../../common/form/models/statementOfMeans/residence';
import {ResidenceType} from '../../../common/form/models/statementOfMeans/residenceType';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Validator} from 'class-validator';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('residenceService');
const validator = new Validator();

class ResidenceService {

  public async getResidence(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.residence) {
        return civilClaimResponse.case_data.statementOfMeans.residence;
      }
      return new Residence();
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public async saveResidence(claimId: string, residence: Residence) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.disability = residence;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.residence = residence;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public buildResidence(type: ResidenceType, housingDetails: string): Residence {
    const residence = new Residence(type, housingDetails);
    if (residence.type !== ResidenceType.OTHER) {
      residence.housingDetails = '';
    }
    return residence;
  }

  public validateResidence(residence: Residence): GenericForm<Residence> {
    const form: GenericForm<Residence> = new GenericForm(residence);
    form.errors = validator.validateSync(form.model);
    return form;
  }
}

const residenceService = new ResidenceService();
export default residenceService;
