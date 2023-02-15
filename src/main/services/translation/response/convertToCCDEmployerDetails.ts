import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {
  CCDEmployerDetails,
  CCDEmployerDetailsList,
} from 'models/ccdResponse/ccdEmployerDetails';

export const toCCDEmploymentDetails = (employers: Employers): CCDEmployerDetails => {
  if (!employers?.rows) return undefined;
  const ccdEmployerDetailsList: CCDEmployerDetailsList[] = [];

  employers.rows.forEach((employersItem, index) => {
    const ccdEmployerDetails: CCDEmployerDetailsList = {
      value: {
        employerName: employersItem.employerName,
        jobTitle: employersItem.jobTitle,
      },
    };
    ccdEmployerDetailsList.push(ccdEmployerDetails);
  });

  return {
    employerDetails: ccdEmployerDetailsList,
  };
};
