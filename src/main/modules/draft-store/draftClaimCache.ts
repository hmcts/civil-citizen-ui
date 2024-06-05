import {app} from '../../app';
import {calculateExpireTimeForDraftClaimInSeconds} from 'common/utils/dateUtils';

const draftClaim: { id: string, case_data?: CaseData } = {
  id: '',
  case_data: {},
};

export interface CaseData {
  id?: string;
  draftClaimCreatedAt?: string;
}

const case_data = {
  draftClaimCreatedAt: '',
  id: '',
  resolvingDispute: true,
  completingClaimConfirmed: true,
  applicant1: {
    type: 'INDIVIDUAL',
    partyDetails: {
      title: 'Mr',
      lastName: 'person',
      firstName: 'Claimant',
      provideCorrespondenceAddress: 'no',
      primaryAddress: {
        addressLine1: '123',
        addressLine2: 'Fake Street',
        addressLine3: '',
        city: 'sheffield',
        postCode: 'S12eu',
      },
      correspondenceAddress: {
        addressLine1: '123',
        addressLine2: 'Test Street',
        addressLine3: '',
        city: 'Liverpool',
        postCode: 'L7 2pz',
      },
      carmEnabled: false,
    },
    dateOfBirth: {
      date: '1993-08-27T23:00:00.000Z',
      year: 1993,
      month: 8,
      day: 28,
    },
    partyPhone: {},
    emailAddress: {
      emailAddress: 'civilmoneyclaimsdemo@gmail.com',
    },
  },
  respondent1: {
    type: 'INDIVIDUAL',
    partyDetails: {
      title: 'mr',
      lastName: 'person',
      firstName: 'defendant',
      primaryAddress: {
        addressLine1: '123',
        addressLine2: 'Claim Road',
        addressLine3: '',
        city: 'Liverpool',
        postCode: 'L7 2PZ',
      },
    },
    emailAddress: {
      emailAddress: 'civilmoneyclaimsdemo@gmail.com',
    },
    partyPhone: {
      phone: '07800000000',
    },
  },
  totalClaimAmount: 9000,
  claimAmountBreakup: [
    {
      value: {
        claimAmount: '9000',
        claimReason: 'Injury',
      },
    },
  ],
  claimInterest: 'no',
  interest: {},
  claimDetails: {
    helpWithFees: {
      option: 'no',
      referenceNumber: '',
    },
    reason: {
      text: 'Injury',
    },
    timeline: {
      rows: [
        {
          date: '2000-01-01T00:00:00.000Z',
          description: 'test',
          year: '2000',
          month: '01',
          day: '01',
        },
      ],
    },
    evidence: {
      comment: '',
      evidenceItem: '',
    },
    statementOfTruth: {
      isFullAmountRejected: false,
      type: 'basic',
      signed: 'true',
      acceptNoChangesAllowed: 'true',
    },
  },
  claimFee: {
    calculatedAmountInPence: '45500',
    code: 'FEE0208',
    version: '3',
  },
  pcqId: '4c10fec5-1278-45f3-89f0-d3d016d47f95',
};

const saveDraftClaimToCache = async (userId: string, apiData = case_data, isCarmEnabled = false) => {
  if (isCarmEnabled) {
    apiData.applicant1.partyPhone = {
      phone: '07800000000',
    };
  }
  const claimToSave = draftClaim;
  claimToSave.case_data = apiData;
  claimToSave.id = userId;
  claimToSave.case_data.id = userId;
  claimToSave.case_data.draftClaimCreatedAt = new Date().toISOString();

  await app.locals.draftStoreClient.set(userId, JSON.stringify(claimToSave));
  await app.locals.draftStoreClient.expireat(
    userId,
    calculateExpireTimeForDraftClaimInSeconds(new Date()),
  );
};

export { saveDraftClaimToCache, draftClaim };
