import {app} from '../../app';
import {calculateExpireTimeForDraftClaimInSeconds} from 'common/utils/dateUtils';

const draftClaim = {
  case_data: {
    draftClaimCreatedAt: '',
    id: '',
    resolvingDispute: true,
    completingClaimConfirmed: true,
    applicant1: {
      type: 'INDIVIDUAL',
      partyDetails: {
        individualTitle: 'Mr',
        individualLastName: 'Claim',
        individualFirstName: 'Claimant',
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
        date: '1995-01-01T00:00:00.000Z',
        year: 1995,
        month: 1,
        day: 1,
      },
      partyPhone: {},
      emailAddress: {
        emailAddress: 'citizen.user1@gmail.com',
      },
    },
    respondent1: {
      type: 'INDIVIDUAL',
      partyDetails: {
        individualTitle: 'Mr',
        individualLastName: 'Defend',
        individualFirstName: 'Defendant',
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
  },
  id: '',
};

const saveDraftClaimToCache = async (userId: string) => {
  draftClaim.id = userId;
  draftClaim.case_data.id = userId;
  draftClaim.case_data.claimFee.calculatedAmountInPence = '45500';
  draftClaim.case_data.draftClaimCreatedAt = new Date().toISOString();

  await app.locals.draftStoreClient.set(userId, JSON.stringify(draftClaim));
  await app.locals.draftStoreClient.expireat(
    userId,
    calculateExpireTimeForDraftClaimInSeconds(new Date()),
  );
};

export { saveDraftClaimToCache, draftClaim, };