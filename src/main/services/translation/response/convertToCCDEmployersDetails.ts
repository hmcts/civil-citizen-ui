import { CCDEmployerDetails } from '../../../common/models/ccdResponse/ccdEmployerDetails';
import { Employer } from '../../../common/form/models/statementOfMeans/employment/employer';

export const toCCDEmployerDetails = (employers: Employer[]): CCDEmployerDetails[] => {
  let ccdEmployers: CCDEmployerDetails[] = [];
  employers.forEach((employer, index) => {
    ccdEmployers.push({ id: index.toString(), value: employer })
  });
  return ccdEmployers;
};
