module.exports = {
  judgementSumSelectedYesAssignToSmallClaimsYes: () => {
    return {
      event: 'CREATE_SDO',
      caseData: {
        drawDirectionsOrderRequired: 'Yes',
        drawDirectionsOrder: {
          judgementSum: '10.0',
        },
        claimsTrack: null,
        drawDirectionsOrderSmallClaims: 'Yes',
        drawDirectionsOrderSmallClaimsAdditionalDirections: [

        ],
        smallClaims: [

        ],
        fastClaims: [

        ],
        setSmallClaimsFlag: null,
        smallClaimsOrderAndHearingDetails: null,
        smallClaimsJudgesRecital: {
          input: 'Upon considering the statements of case and the information provided by the parties',
        },
        smallClaimsAllocation: null,
        smallClaimsJudgementDeductionStatement: null,
        smallClaimsJudgementDeductionValue: {
          value: '10.0%',
        },
        smallClaimsHearingToggle: [
          'SHOW',
        ],
        smallClaimsHearing: {
          dateFrom: '2025-09-09',
          dateTo: null,
          time: 'THIRTY_MINUTES',
          otherHours: null,
          otherMinutes: null,
          input2: 'The claimant must by no later than 4 weeks before the hearing date, pay the court the required hearing fee or submit a fully completed application for Help with Fees. \nIf the claimant fails to pay the fee or obtain a fee exemption by that time the claim will be struck without further order.',
          input1: 'The hearing of the claim will be on a date to be notified to you by a separate notification. The hearing will have a time estimate of',
        },
        smallClaimsMethodToggle: [
          'SHOW',
        ],
        smallClaimsMethod: 'smallClaimsMethodInPerson',
        sdoHearingNotes: {
          input: 'hearing notes',
        },
        smallClaimsNotes: {
          input: 'This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 5 July 2023',
          date: null,
        },
        smallClaimsDocumentsToggle: [
          'SHOW',
        ],
        smallClaimsDocuments: {
          input1: 'Each party must upload to the Digital Portal copies of all documents which they wish the court to consider when reaching its decision not less than 14 days before the hearing.',
          input2: 'The court may refuse to consider any document which has not been uploaded to the Digital Portal by the above date.',
        },
        smallClaimsWitnessStatementToggle: [
          'SHOW',
        ],
        smallClaimsWitnessStatement: {
          input1: 'Each party must upload to the Digital Portal copies of all witness statements of the witnesses upon whose evidence they intend to rely at the hearing not less than 14 days before the hearing.',
          input2: '2',
          input3: '2',
          input4: 'For this limitation, a party is counted as a witness.',
          text: 'A witness statement must',
          smallClaimsNumberOfWitnessesToggle: [
            'SHOW',
          ],
        },
        smallClaimsCreditHire: null,
        smallClaimsRoadTrafficAccident: null,
        smallClaimsAddNewDirections: [
          {
            value: {
              directionComment: 'new direction',
            },
            id: 'ce85c060-23ce-4858-be42-9243e98977d5',
          },
        ],
        smallClaimsMethodInPerson: {
          value: { code: '192280'},
        },
      },
    };
  },

  judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing: () => {
    return {
      event: 'CREATE_SDO',
      caseData: {
        drawDirectionsOrderRequired: 'Yes',
        claimsTrack: null,
        drawDirectionsOrderSmallClaims: 'No',
        drawDirectionsOrder: {
          judgementSum: '10.0',
        },
        drawDirectionsOrderSmallClaimsAdditionalDirections: [

        ],
        smallClaims: [

        ],
        fastClaims: [

        ],
        orderType: 'DISPOSAL',
        orderTypeTrialAdditionalDirections: [

        ],
        disposalHearingOrderAndHearingDetails: null,
        disposalHearingJudgesRecital: {
          input: 'Upon considering the claim form, particulars of claim, statements of case and Directions questionnaires',
        },
        disposalHearingJudgementDeductionStatement: null,
        disposalHearingJudgementDeductionValue: {
          value: '10.0%',
        },
        disposalHearingDisclosureOfDocumentsToggle: [
          'SHOW',
        ],
        disposalHearingDisclosureOfDocuments: {
          input1: 'The parties shall serve on each other copies of the documents upon which reliance is to be placed at the disposal hearing by 4pm on',
          date1: '2023-09-06',
          input2: 'The parties must upload to the Digital Portal copies of those documents which they wish the court to consider when deciding the amount of damages, by 4pm on',
          date2: '2023-09-06',
        },
        disposalHearingWitnessOfFactToggle: [
          'SHOW',
        ],
        disposalHearingWitnessOfFact: {
          input3: 'The claimant must upload to the Digital Portal copies of the witness statements of all witnesses of fact on whose evidence reliance is to be placed by 4pm on',
          date2: '2023-07-26',
          input4: 'The provisions of CPR 32.6 apply to such evidence.',
          input5: 'Any application by the defendant in relation to CPR 32.7 must be made by 4pm on',
          date3: '2023-08-09',
          input6: 'and must be accompanied by proposed directions for allocation and listing for trial on quantum. This is because cross-examination will cause the hearing to exceed the 30-minute maximum time estimate for a disposal hearing.',
          input1: null,
          date1: null,
          input2: null,
        },
        disposalHearingMedicalEvidenceToggle: [
          'SHOW',
        ],
        disposalHearingMedicalEvidence: {
          input: 'The claimant has permission to rely upon the written expert evidence already uploaded to the Digital Portal with the particulars of claim and in addition has permission to rely upon any associated correspondence or updating report which is uploaded to the Digital Portal by 4pm on',
          date: '2023-07-26',
        },
        disposalHearingQuestionsToExpertsToggle: [
          'SHOW',
        ],
        disposalHearingQuestionsToExperts: {
          date: '2023-08-09',
        },
        disposalHearingSchedulesOfLossToggle: [
          'SHOW',
        ],
        disposalHearingSchedulesOfLoss: {
          input2: 'If there is a claim for ongoing or future loss in the original schedule of losses, the claimant must upload to the Digital Portal an up-to-date schedule of loss by 4pm on',
          date2: '2023-09-06',
          input3: 'If the defendant wants to challenge this claim, they must send an up-to-date counter-schedule of loss to the claimant by 4pm on',
          date3: '2023-09-20',
          input4: 'If the defendant want to challenge the sums claimed in the schedule of loss they must upload to the Digital Portal an updated counter schedule of loss by 4pm on',
          date4: '2023-09-20',
          input1: null,
          date1: null,
        },
        disposalHearingFinalDisposalHearingToggle: [
          'SHOW',
        ],
        disposalHearingHearingTime: {
          input: 'This claim will be listed for final disposal before a judge on the first available date after',
          dateFrom: '2023-09-09',
          dateTo: '2023-10-18',
          time: 'THIRTY_MINUTES',
        },
        disposalHearingMethodToggle: [
          'SHOW',
        ],
        disposalHearingMethod: 'disposalHearingMethodInPerson',
        disposalHearingMethodInPerson: null,
        disposalHearingMethodVideoConferenceHearing: null,
        disposalHearingMethodTelephoneHearing: null,
        disposalHearingBundleToggle: [
          'SHOW',
        ],
        disposalHearingBundle: {
          input: 'At least 7 days before the disposal hearing, the claimant must file and serve',
          type: [
            'DOCUMENTS',
          ],
        },
        disposalHearingClaimSettlingToggle: [
          'SHOW',
        ],
        disposalHearingClaimSettling: null,
        disposalHearingCostsToggle: [
          'SHOW',
        ],
        disposalHearingCosts: null,
        disposalHearingAddNewDirections: [
          {
            value: {
              directionComment: 'new direction',
            },
            id: '4bf8af18-6d4c-4f46-b5ab-9a587edca743',
          },
        ],
        disposalHearingHearingNotes: 'hearing notes',
        disposalOrderWithoutHearing: {
          input: 'This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 05 July 2023.',
        },
        disposalHearingNotes: null,
        disposalHearingFinalDisposalHearing: null,
      },
    };
  },
};
