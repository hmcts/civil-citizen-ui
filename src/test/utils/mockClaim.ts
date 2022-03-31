import {Respondent} from '../../main/common/models/respondent';
import {Claim} from '../../main/common/models/claim';
import {CounterpartyType} from '../../main/common/models/counterpartyType';
import {PrimaryAddress} from '../../main/common/models/primaryAddress';
import {CorrespondenceAddress} from '../../main/common/models/correspondenceAddress';
import {NumberOfDays} from '../../main/common/form/models/numberOfDays';

export const buildPrimaryAddress = (): PrimaryAddress => {
  return {
    AddressLine1: 'primaryAddressLine1',
    AddressLine2: 'primaryAddressLine2',
    AddressLine3: 'primaryAddressLine3',
    PostTown: 'primaryCity',
    PostCode: 'primaryPostCode',
  };
};

export const buildCorrespondenceAddress = (): CorrespondenceAddress => {
  return {
    AddressLine1: 'correspondenceAddressLine1',
    AddressLine2: 'correspondenceAddressLine2',
    AddressLine3: 'correspondenceAddressLine3',
    PostTown: 'correspondenceCity',
    PostCode: 'correspondencePostCode',
  };
};

export const buildRespondent1 = () : Respondent =>{
  const respondent = new Respondent();
  respondent.individualTitle = 'Mrs.';
  respondent.individualLastName= 'Mary';
  respondent.individualFirstName= 'Richards';
  respondent.telephoneNumber= '0208339922';
  respondent.dateOfBirth= new Date('2022-01-24T15:59:59');
  respondent.responseType= '';
  respondent.type= CounterpartyType.INDIVIDUAL;
  respondent.primaryAddress = buildPrimaryAddress();
  respondent.correspondenceAddress = buildCorrespondenceAddress();
  return respondent;
};

export const mockClaim: Claim = {
  legacyCaseReference: '497MC585',
  applicant1:
    {
      individualTitle: 'Mrs',
      individualLastName: 'Clark',
      individualFirstName: 'Jane',
      type: CounterpartyType.INDIVIDUAL,
    },
  totalClaimAmount: 110,
  respondent1ResponseDeadline: new Date('2022-01-24T15:59:59'),
  detailsOfClaim: 'the reason i have given',
  respondent1: buildRespondent1(),
  formattedResponseDeadline: function (): string {
    throw new Error('Function not implemented.');
  },
  formattedTotalClaimAmount: function (): string {
    throw new Error('Function not implemented.');
  },
  responseInDays: function (): NumberOfDays {
    throw new Error('Function not implemented.');
  },
};
