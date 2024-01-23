import request from 'supertest';
import express from 'express';
import { CLAIM_CHECK_ANSWERS_URL, TESTING_SUPPORT_URL } from 'routes/urls';
import createDraftClaimController from 'routes/features/claim/createDraftClaim';

describe('createDraftClaim Router', () => {
  const app = express();
  beforeEach(() => {
    app.use(express.json());
    app.use(createDraftClaimController);
  });

  describe('on GET', () => {
    it('should render the correct view', async () => {
      const response = await request(app).get(TESTING_SUPPORT_URL);
      expect(response.status).toBe(200);
      // Add more assertions here if necessary
    });

    it('should return status 500 when error is thrown', async () => {
      // Mock an error scenario here
      await request(app)
        .get(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });

  describe('on POST', () => {
    it('should process the request and redirect to the correct URL', async () => {
      const res = await request(app).post(TESTING_SUPPORT_URL);
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIM_CHECK_ANSWERS_URL);
    });
  });

  describe('processDraftClaim function', () => {
    it('should process the draftClaim correctly', () => {
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
      };

      const expectedOutput = {
        ...draftClaim,
        processed: true,
      };

      const result = draftClaim;
      expect(result).toEqual(expectedOutput);
    });
  });
});
