import {Respondent} from '../../main/common/models/respondent';
import { Claim } from '../../main/common/models/claim';

const respondent1: Respondent = {
  primaryAddress: {
    county: 'Greater London',
    country: 'UK',
    postCode: 'SW1H 9AJ',
    postTown: 'London',
    addressLine1: 'Flat 3A Middle Road',
    addressLine2: '',
    addressLine3: '',
  },
  correspondenceAddress: {
    county: '',
    country: '',
    postCode: '',
    postTown: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
  },
  individualTitle: 'Mrs.',
  individualLastName: 'Mary',
  individualFirstName: 'Richards',
  telephoneNumber: '0208339922',
  dateOfBirth: new Date('2022-01-24T15:59:59'),
  responseType: '',
};

export const mockClaim: Claim = {
  legacyCaseReference: '497MC585',
  applicant1:
    {
      individualTitle: 'Mrs',
      individualLastName: 'Clark',
      individualFirstName: 'Jane',
    },
  totalClaimAmount: 110,
  respondent1ResponseDeadline: new Date('2022-01-24T15:59:59'),
  detailsOfClaim: 'the reason i have given',
  respondent1: respondent1,
  individualTitle: 'string',
  individualLastName: 'string',
  individualFirstName: 'string',
  formattedResponseDeadline: function (): string {
    throw new Error('Function not implemented.');
  },
  formattedTotalClaimAmount: function (): string {
    throw new Error('Function not implemented.');
  },
};
