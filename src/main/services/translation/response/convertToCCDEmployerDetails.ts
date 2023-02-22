import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {
  CCDEmployerDetails,
} from 'models/ccdResponse/ccdEmployerDetails';
import {Employer} from 'form/models/statementOfMeans/employment/employer';

export const toCCDEmploymentDetails = (employers: Employers): CCDEmployerDetails => {
  if (!employers?.rows) return undefined;
  const ccdEmployerDetailsList =
    employers.rows.map((employersItem: Employer) => {
      return {
        value: {
          employerName: employersItem.employerName,
          jobTitle: employersItem.jobTitle,
        },
      };
    });

  return {
    employerDetails: ccdEmployerDetailsList,
  };
};
