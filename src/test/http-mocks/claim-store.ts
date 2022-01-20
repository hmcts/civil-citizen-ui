export const sampleClaimObj = {
  id: 1,
  ccdCaseId: 1,
  submitterId: '1',
  submitterEmail: 'claimant@example.com',
  externalId: '400f4c57-9684-49c0-adb4-4cf46579d6dc',
  defendantId: '123',
  referenceNumber: '000MC000',
  //createdAt: MomentFactory.currentDateTime(),
  issuedOn: '2019-09-25',
  totalAmountTillToday: 200,
  totalAmountTillDateOfIssue: 200,
  moreTimeRequested: false,
  claim: {
    claimants: [
      {
        type: 'individual',
        name: 'John Smith',
        address: {
          line1: 'line1',
          line2: 'line2',
          city: 'city',
          postcode: 'bb127nq',
        },
        dateOfBirth: '1990-02-17',
      },
    ],
    defendants: [
      {
        type: 'individual',
        name: 'John Doe',
        email: 'johndoe@example.com',
        address: {
          line1: 'line1',
          line2: 'line2',
          city: 'city',
          postcode: 'bb127nq',
        },
      },
    ],
    payment: {
      id: '12',
      amount: 2500,
      state: { status: 'failed' },
    },
    amount: {
      type: 'breakdown',
      rows: [{ reason: 'Reason', amount: 200 }],
    },
    // interest: {
    //   type: ClaimInterestType.STANDARD,
    //   rate: 10,
    //   reason: 'Special case',
    //   interestDate: {
    //     type: InterestDateType.SUBMISSION,
    //     endDateType: InterestEndDateOption.SETTLED_OR_JUDGMENT
    //   } as InterestDate
    // } as Interest,
    reason: 'Because I can',
    feeAmountInPennies: 2500,
    timeline: { rows: [{ date: 'a', description: 'b' }] },
  },
  responseDeadline: '2017-08-08',
  countyCourtJudgment: {
    defendantDateOfBirth: '1990-11-01',
    paidAmount: 2,
    paymentOption: 'IMMEDIATELY',
  },
  // settlement: {
  //   partyStatements: [
  //     {
  //       type: StatementType.OFFER.value,
  //       madeBy: MadeBy.DEFENDANT.value,
  //       offer: { content: 'offer text', completionDate: '2017-08-08' }
  //     }
  //   ]
  // },
  //intentionToProceedDeadline: MomentFactory.currentDateTime().add(33, 'days'),
  //features: [],
};
