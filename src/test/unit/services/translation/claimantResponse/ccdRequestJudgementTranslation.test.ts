import { CaseState } from "common/form/models/claimDetails";
import { YesNo } from "common/form/models/yesNo";
import { Claim } from "common/models/claim";
import { ClaimantResponse } from "common/models/claimantResponse";
import { translateClaimantResponseRequestDefaultJudgementToCCD } from "services/translation/claimantResponse/ccdRequestJudgementTranslation";

describe('Translate claimant ccd request  to ccd version', () => {
    let claim: Claim;
    beforeEach(() => {
        claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
    })

    it('should translate ccj request for judgment admission into the CCD response', () => {
        claim.claimantResponse.ccjRequest = {
            paidAmount: {
                option: YesNo.YES,
                amount: 50
            }
        }
        const ccdResponse = translateClaimantResponseRequestDefaultJudgementToCCD(claim, 300)
        expect(ccdResponse).toEqual({
            "ccjJudgmentAmountClaimFee": "300",
            "ccjJudgmentLipInterest": "0",
            "ccjPaymentPaidSomeAmount": "5000",
            "ccjPaymentPaidSomeOption": "Yes",
        })
    })
})