import { Router, RequestHandler } from 'express';
import { CLAIM_CHECK_ANSWERS_URL } from 'routes/urls';

interface ClaimData {
    draftClaimCreatedAt: string;
    id: string;
    resolvingDispute: boolean;
    completingClaimConfirmed: boolean;
    applicant1: {
      type: string;
      partyDetails: {
        individualTitle: string;
        individualLastName: string;
        individualFirstName: string;
        provideCorrespondenceAddress: string;
        primaryAddress: any;
        correspondenceAddress: any;
        carmEnabled: boolean;
      };
      dateOfBirth: { date: string; year: number; month: number; day: number };
      partyPhone: { phone: string };
    };
    respondent1: {
      type: string;
      partyDetails: {
        individualTitle: string;
        individualLastName: string;
        individualFirstName: string;
        primaryAddress: any;
      };
      emailAddress: { emailAddress: string };
      partyPhone: { phone: string };
    };
    totalClaimAmount: number;
    claimAmountBreakup: {
      value: any;
    }[];
    claimInterest: string;
    interest: any;
    claimDetails: {
      helpWithFees: { option: string; referenceNumber: string };
      reason: { text: string };
      timeline: {
        rows: any[];
      };
      evidence: { comment: string; evidenceItem: any[] };
    };
    claimFee: {
      calculatedAmountInPence: string;
      code: string;
      version: string;
    };
    pcqId: string;
}

const liPvLiPClaimPath = 'features/dashboard/dashboardController';
const liPvLiPClaimCreationController = Router();

liPvLiPClaimCreationController.post(CLAIM_CHECK_ANSWERS_URL, (async (req: any, res: any, next) => {
  const data: ClaimData = {
    draftClaimCreatedAt: '2024-01-10T15:17:19.576Z',
    id: 'd07aa471-8c94-4d66-bbd9-3d5dc1574a70',
    resolvingDispute: true,
    completingClaimConfirmed: true,
    applicant1: {
      type: 'INDIVIDUAL',
      partyDetails: {
        individualTitle: 'Mr',
        individualLastName: 'McTest',
        individualFirstName: 'Test',
        provideCorrespondenceAddress: 'no',
        primaryAddress: {},
        correspondenceAddress: {},
        carmEnabled: false,
      },
      dateOfBirth: {
        date: '1996-11-04T00:00:00.000Z',
        year: 1996,
        month: 11,
        day: 4,
      },
      partyPhone: {
        phone: '00000000000',
      },
    },
    respondent1: {
      type: 'INDIVIDUAL',
      partyDetails: {
        individualTitle: 'Mr',
        individualLastName: 'McNotreal',
        individualFirstName: 'Notreal',
        primaryAddress: {},
      },
      emailAddress: {
        emailAddress: 'civilmoneyclaimsdemo@gmail.com',
      },
      partyPhone: {
        phone: '',
      },
    },
    totalClaimAmount: 4567,
    claimAmountBreakup: [
      {
        value: {},
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
        text: 'dhgrhb',
      },
      timeline: {
        rows: [Array],
      },
      evidence: {
        comment: '',
        evidenceItem: [Array],
      },
    },
    claimFee: {
      calculatedAmountInPence: '20500',
      code: 'FEE0207',
      version: '4',
    },
    pcqId: 'c173e04f-4a70-4624-9fc2-6db717b7eb0e',
  };

  try {
    if (data) {
      res.render(liPvLiPClaimPath, {
        data: data,
      });
    }
  } catch (e) {
    console.error(`Error = ${e}`);
    next(e);
  }
}) as RequestHandler);

export default liPvLiPClaimCreationController;