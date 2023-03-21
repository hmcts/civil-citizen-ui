import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {CCDEmployerDetails, CCDEmployerDetailsList} from 'models/ccdResponse/ccdEmployerDetails';

export const toCUIEmploymentDetails = (employers: CCDEmployerDetails): Employers => {
  if (!employers || !employers.employerDetails?.length) return undefined;
  const employersList =
    employers?.employerDetails?.map((employer: CCDEmployerDetailsList) => {
      return {
        employerName: employer?.value?.employerName,
        jobTitle: employer?.value?.jobTitle,
      };
    });
  return new Employers(employersList);
};
