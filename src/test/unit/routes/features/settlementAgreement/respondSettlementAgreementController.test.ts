import config from "config";
import { t } from "i18next";
import nock from "nock";
import request from "supertest";
import { app } from "../../../../../main/app";
import { DEFENDANT_SIGN_SETTLEMENT_AGREEMENT } from "../../../../../main/routes/urls";
import {
  mockCivilClaim,
  mockRedisFailure,
} from "../../../../utils/mockDraftStore";
import { TestMessages } from "../../../../utils/errorMessageTestConstants";
import { ResponseType } from "common/form/models/responseType";
import { TransactionSchedule } from "common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule";
import { formatDateToFullDate } from "common/utils/dateUtils";
import * as draftStoreService from "modules/draft-store/draftStoreService";
import { CIVIL_SERVICE_SUBMIT_EVENT } from "client/civilServiceUrls";
import { Claim } from "common/models/claim";
import { GenericYesNo } from "common/form/models/genericYesNo";

jest.mock("../../../../../main/modules/oidc");
jest.mock("../../../../../main/modules/draft-store");

describe("Respond To Settlement Agreement", () => {
  const citizenRoleToken: string = config.get("citizenRoleToken");
  const idamUrl: string = config.get("idamUrl");

  beforeAll(() => {
    nock(idamUrl).post("/o/token").reply(200, { id_token: citizenRoleToken });
    nock("http://localhost:4000")
      .post(
        CIVIL_SERVICE_SUBMIT_EVENT.replace(":submitterId", "undefined").replace(
          ":caseId",
          ":id",
        ),
      )
      .reply(200, {});
  });

  describe("on GET", () => {
    const date = new Date(Date.now());
    it("should return respond to settlement agreement page", async () => {
      const civilClaimResponseMock = {
        case_data: {
          respondent1: {
            responseType: ResponseType.PART_ADMISSION,
          },
          partialAdmission: {
            alreadyPaid: {
              option: "yes",
            },
            howMuchDoYouOwe: {
              amount: 200,
              totalAmount: 1000,
            },
            paymentIntention: {
              repaymentPlan: {
                paymentAmount: 50,
                repaymentFrequency: TransactionSchedule.WEEK,
                firstRepaymentDate: date,
              },
            },
          },
        },
      };
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() =>
          Promise.resolve(JSON.stringify(civilClaimResponseMock)),
        ),
      };

      await request(app)
        .get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(
            t("PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE"),
          );
          expect(res.text).toContain(
            t(
              "PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN",
              {
                defendant: "",
                amount: "200",
                paymentAmount: "50",
                theAgreementRepaymentFrequency: "week",
                firstRepaymentDate: formatDateToFullDate(date),
              },
            ),
          );
        });
    });

    it("should return status 500 when error thrown", async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe("on POST", () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it("should return error on empty post", async () => {
      await request(app)
        .post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(
            t(
              "PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION",
            ),
          );
        });
    });

    it("should redirect to the confirmation if sign agreement checkbox is selected", async () => {
      const spySaveDraftClaimMock = jest.spyOn(
        draftStoreService,
        "saveDraftClaim",
      );
      const respondentSignSettlementAgreement = new GenericYesNo(
        "yes",
        "PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION",
      );
      jest
        .spyOn(draftStoreService, "generateRedisKey")
        .mockReturnValueOnce("1");
      jest
        .spyOn(draftStoreService, "getCaseDataFromStore")
        .mockResolvedValueOnce({} as Claim);

      await request(app)
        .post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .send({ option: "yes" })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(spySaveDraftClaimMock).toHaveBeenCalledWith(
            "1",
            { respondentSignSettlementAgreement },
            true,
          );

          //TODO: Check header location with confirmation page url
          //expect(res.header.location).toBe(SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
        });
    });

    it("should return status 500 when error thrown", async () => {
      app.locals.draftStoreClient = mockRedisFailure;

      await request(app)
        .post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .send({ option: "yes" })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
