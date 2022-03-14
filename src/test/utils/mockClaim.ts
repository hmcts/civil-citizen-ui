import {Respondent} from '../../main/common/models/respondent';
import {Claim} from '../../main/common/models/claim';
import {CounterpartyType} from '../../main/common/models/counterpartyType';

const respondent1: Respondent = {
  primaryAddress: {
    County: 'Greater London',
    Country: 'UK',
    PostCode: 'SW1H 9AJ',
    PostTown: 'London',
    AddressLine1: 'Flat 3A Middle Road',
    AddressLine2: '',
    AddressLine3: '',
  },
  correspondenceAddress: {
    County: '',
    Country: '',
    PostCode: '',
    PostTown: '',
    AddressLine1: '',
    AddressLine2: '',
    AddressLine3: '',
  },
  individualTitle: 'Mrs.',
  individualLastName: 'Mary',
  individualFirstName: 'Richards',
  telephoneNumber: '0208339922',
  dateOfBirth: new Date('2022-01-24T15:59:59'),
  responseType: '',
  type: CounterpartyType.individual,
};

export const mockClaim: Claim = {
  legacyCaseReference: '497MC585',
  applicant1:
    {
      individualTitle: 'Mrs',
      individualLastName: 'Clark',
      individualFirstName: 'Jane',
      type: CounterpartyType.individual,
    },
  totalClaimAmount: 110,
  respondent1ResponseDeadline: new Date('2022-01-24T15:59:59'),
  detailsOfClaim: 'the reason i have given',
  respondent1: respondent1,
  formattedResponseDeadline: function (): string {
    throw new Error('Function not implemented.');
  },
  formattedTotalClaimAmount: function (): string {
    throw new Error('Function not implemented.');
  },
};
