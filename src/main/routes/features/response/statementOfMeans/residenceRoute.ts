import express from 'express';
import assert from 'assert';
import {Residence} from '../../../../common/form/models/statementOfMeans/residence';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ValidationError, Validator} from 'class-validator';
import {ResidenceType} from '../../../../common/form/models/statementOfMeans/residenceType';
import {getDraftClaimFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CivilClaimResponse} from '../../../../common/models/civilClaimResponse';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('residenceRoute');
const residenceViewPath = 'features/response/statement-of-means/residence';

const residenceRoute = express.Router();
residenceRoute
  .get(
    CITIZEN_RESIDENCE_URL,
    (req: express.Request, res: express.Response) => {
      getDraftClaimFromStore(req.params.id).then((draftResponse: CivilClaimResponse) => {
        assert(draftResponse);

        res.render(residenceViewPath, {
          form: new GenericForm(draftResponse.case_data.statementOfMeans.residence),
        });
      });
    })
  .post(
    CITIZEN_RESIDENCE_URL,
    (req: express.Request, res: express.Response) => {
      const residence = new Residence(ResidenceType.valueOf(req.body.type), req.body.housingDetails);
      if (residence.type !== ResidenceType.OTHER) {
        residence.housingDetails = '';
      }
      const form: GenericForm<Residence> = new GenericForm(residence);
      const validator = new Validator();
      const errors: ValidationError[] = validator.validateSync(form.model);
      if (errors && errors.length > 0) {
        form.errors = errors;
        res.render(residenceViewPath, {
          form: form,
        });
      } else {
        saveResidence(req.params.id, residence).then(() => {
          res.redirect(CITIZEN_PARTNER_URL.replace(':id', req.params.id));
        });
      }
    });

const saveResidence = async (claimId: string, residence: Residence): Promise<void> => {
  try {
    const civilClaimResponse = await getDraftClaimFromStore(claimId);
    if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
      civilClaimResponse.case_data.statementOfMeans.residence = residence;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.residence = residence;
      civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
    }
    await saveDraftClaim(claimId, civilClaimResponse.case_data);
  } catch (err: unknown) {
    logger.error(`${(err as Error).stack || err}`);
  }
};

export default residenceRoute;
