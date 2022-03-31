import {
  getCaseDataFromStore,
  // saveDraftClaim
} from '../../draft-store/draftStoreService';
// import {Claim} from '../../../common/models/claim';
// import {StatementOfMeans} from '../../../common/models/statementOfMeans';
// import {EmployerForm} from '../../../common/form/models/statementOfMeans/employment/employerForm';
// import { Employer } from 'common/models/employer';
import { Employers } from '../../../common/form/models/statementOfMeans/employment/employers';

// import {convertFromForm, convertToForm} from './employmentConverter';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmployers = async (claimId: string): Promise<Employers> => {
  try {
    console.log("GETTING EMPLOYERS SERVICE");

    const claim = await getCaseDataFromStore(claimId);
    console.log("GETTING EMPLOYERS SERVICE CLAIM: ", claim);

    if (claim?.statementOfMeans?.employers) {
      console.log("CLAIM HAS EMPLOYERS!: ", claim.statementOfMeans.employers);

      return claim.statementOfMeans.employers;
    }
    console.log("CLAIM DOESNT HAS EMPLOYERS: creating new Employers...");

    return new Employers();
  } catch (error) {
    logger.error(error);
  }
};



// export const saveEmployerData = async (claimId: string, form: EmployerForm) => {
//   try {
//     const claim = await getCaseDataFromStore(claimId);
//     updateEmployer(claim, form);
//     await saveDraftClaim(claimId, claim);
//   } catch (error) {
//     logger.error(error);
//   }
// };

// const updateEmployer = (claim: Claim, form: EmployerForm) => {
//   if (claim === undefined || claim === null) {
//     claim = new Claim();
//     claim.statementOfMeans = new StatementOfMeans();
//   }
//   if (claim.statementOfMeans === undefined) {
//     claim.statementOfMeans = new StatementOfMeans();
//   }
//   claim.statementOfMeans.employment = convertFromForm(form);
// };
