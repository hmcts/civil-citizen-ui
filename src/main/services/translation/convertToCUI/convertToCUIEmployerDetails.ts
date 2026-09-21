import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {CCDEmployerDetails, CCDEmployerDetailsList} from 'models/ccdResponse/ccdEmployerDetails';
import {Employer} from 'form/models/statementOfMeans/employment/employer';

export const toCUIEmploymentDetails = (employers: CCDEmployerDetails): Employers => {
  if (employers?.employerDetails?.length) {
    const employersList =
      employers.employerDetails.map((employer: CCDEmployerDetailsList) => {
        return new Employer(
          employer.value?.employerName,
          employer.value?.jobTitle,
        );
      });
    return new Employers(employersList);
  }
};
