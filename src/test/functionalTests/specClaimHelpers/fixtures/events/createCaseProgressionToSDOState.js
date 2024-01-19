module.exports = {
  createCaseProgressionToSDOState: (claimType) => {
    const judgeToSDOData = {
      event: 'CREATE_SDO',
      caseDataUpdate: {
        drawDirectionsOrderRequired: 'No',
        drawDirectionsOrder: null,
        drawDirectionsOrderSmallClaims: null,
        claimsTrack: claimType,
        smallClaims: [],
        drawDirectionsOrderSmallClaimsAdditionalDirections: [],
        fastClaims: [],
        setSmallClaimsFlag: null,
        smallClaimsOrderAndHearingDetails: null,
        smallClaimsJudgesRecital: {
          input: 'Upon considering the statements of case and the information provided by the parties,',
        },
        smallClaimsAllocation: null,
        smallClaimsJudgementDeductionStatement: null,
        smallClaimsJudgementDeductionValue: null,
        smallClaimsHearingToggle: [
          'SHOW',
        ],
        smallClaimsHearing: {
          dateFrom: '2023-07-01',
          dateTo: null,
          time: 'TWO_HOURS',
          otherHours: null,
          otherMinutes: null,
          input2: 'The claimant must by no later than 4 weeks before the hearing date, pay the court the required hearing fee or submit a fully completed application for Help with Fees. \nIf the claimant fails to pay the fee or obtain a fee exemption by that time the claim will be struck without further order.',
          input1: 'The hearing of the claim will be on a date to be notified to you by a separate notification. The hearing will have a time estimate of',
        },
        smallClaimsMethodToggle: [
          'SHOW',
        ],
        smallClaimsMethod: 'smallClaimsMethodInPerson',
        sdoHearingNotes: null,
        smallClaimsNotes: {
          input: 'This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 26 June 2023',
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
          input2: '4',
          input3: '-1',
          input4: 'For this limitation, a party is counted as a witness.',
          text: 'A witness statement must: \na) Start with the name of the case and the claim number;\nb) State the full name and address of the witness; \nc) Set out the witness\'s evidence clearly in numbered paragraphs on numbered pages;\nd) End with this paragraph: \'I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth\'.\ne) be signed by the witness and dated.\nf) If a witness is unable to read the statement there must be a certificate that it has been read or interpreted to the witness by a suitably qualified person and at the final hearing there must be an independent interpreter who will not be provided by the Court.\n\nThe judge may refuse to allow a witness to give evidence or consider any statement of any witness whose statement has not been uploaded to the Digital Portal in accordance with the paragraphs above.\n\nA witness whose statement has been uploaded in accordance with the above must attend the hearing. If they do not attend, it will be for the court to decide how much reliance, if any, to place on their evidence.',
        },
        smallClaimsCreditHire: null,
        smallClaimsRoadTrafficAccident: null,
        smallClaimsAddNewDirections: [],
        sdoOrderDocument: {
          documentLink: {
            document_url: 'http://dm-store-aat.service.core-compute-aat.internal/documents/0a431a33-6d04-4b06-b36b-5672d6be7ac3',
            document_binary_url: 'http://dm-store-aat.service.core-compute-aat.internal/documents/0a431a33-6d04-4b06-b36b-5672d6be7ac3/binary',
            document_filename: 'fast_track_sdo_000MC014.pdf',
            document_hash: 'a21b91dc459a911bd311af0c130f24b7032e9f358b362efe7ec6380664bd5005',
            category_id: 'sdo',
          },
          documentName: 'fast_track_sdo_000MC014.pdf',
          documentType: 'SDO_ORDER',
          documentSize: '68814',
          createdDatetime: '2023-09-20T10:08:24',
          createdBy: 'Civil',
        },
        smallClaimsMethodInPerson: {
          value: { code: '192280'},
        },
      },
    };
    return judgeToSDOData;
  },
};
