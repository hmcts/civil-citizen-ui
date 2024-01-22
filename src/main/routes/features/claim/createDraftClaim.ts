import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { CLAIM_CHECK_ANSWERS_URL, TESTING_SUPPORT_URL } from 'routes/urls';
import { app } from '../../../app';
import { calculateExpireTimeForDraftClaimInSeconds } from 'common/utils/dateUtils';
const checkAnswersViewPath = 'features/claim/create-draft';

const draftClaim = {
  case_data: {
    draftClaimCreatedAt: '2023-12-05T11:33:43.386Z',
    id: '',
    resolvingDispute: true,
    completingClaimConfirmed: true,
    applicant1: {
      type: 'INDIVIDUAL',
      partyDetails: {
        individualTitle: '',
        individualLastName: 'ss',
        individualFirstName: 'ss',
        provideCorrespondenceAddress: 'no',
        primaryAddress: {
          addressLine1: '1234',
          addressLine2: '',
          addressLine3: '',
          city: 'sheffield',
          postCode: 'S12eu',
        },
        correspondenceAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          city: '',
          postCode: '',
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
        individualTitle: '',
        individualLastName: 'aa',
        individualFirstName: 'aa',
        primaryAddress: {
          addressLine1: '12345',
          addressLine2: '',
          addressLine3: '',
          city: 'sheffield',
          postCode: 's71ne',
        },
      },
      emailAddress: {
        emailAddress: 'civilmoneyclaimsdemo@gmail.com',
      },
      partyPhone: {
        phone: '',
      },
    },
    totalClaimAmount: 9000,
    claimAmountBreakup: [
      {
        value: {
          claimAmount: '9000',
          claimReason: 'test',
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
        text: 'test',
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

const createDraftClaim = Router();
createDraftClaim.get(TESTING_SUPPORT_URL, (async (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.render(checkAnswersViewPath);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

createDraftClaim.post(TESTING_SUPPORT_URL, (async (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session?.user?.id;
    draftClaim.id = userId;
    draftClaim.case_data.id = userId;
    const draftStoreClient = app.locals.draftStoreClient;
    draftStoreClient.set(userId, JSON.stringify(draftClaim));
    await draftStoreClient.expireat(
      userId,
      calculateExpireTimeForDraftClaimInSeconds(new Date()),
    );
    return res.redirect(CLAIM_CHECK_ANSWERS_URL);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default createDraftClaim;
