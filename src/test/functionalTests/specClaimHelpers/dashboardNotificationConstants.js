//https://tools.hmcts.net/confluence/display/CRef/Hook+Logic+-+Notifications
module.exports = {
  //Notice.AAA6.ClaimIssue.ClaimSubmit.Required
  draftClaim: () => {
    return {
      title: 'This claim has not been submitted',
      content: 'Your claim is saved as a draft. Continue with claim',
    };
  },

  //Notice.AAA6.ClaimIssue.ClaimFee.Required
  payClaimFee: (feeAmount) => {
    return {
      title: 'You need to pay your claim fee',
      content: `Your claim has not yet been issued, in order to proceed you must pay the claim fee of £${feeAmount}. Pay the claim fee.`,
      nextSteps: 'Pay the claim fee',
    };
  },

  //Notice.AAA6.ClaimantIntent.ClaimSettled.Claimant
  claimIsSettledClaimant: (amount, date) => {
    return {
      title: 'The claim is settled',
      content: `You have confirmed that Sir John Doe paid £${amount} on ${date}.`,
    };
  },

  //Notice.AAA6.ClaimantIntent.ClaimSettled.Defendant
  claimIsSettledDefendant: (amount, date) => {
    return {
      title: 'The claim is settled',
      content: `Miss Jane Doe has confirmed that you paid £${amount} on ${date}.`,
    };
  },

  //Date calculation should be based on CIV-13128 fix
  //Notice.AAA6.ClaimIssue.Response.Await
  waitForDefendantToRespond: async () => {
    return {
      title: 'Wait for defendant to respond',
      content: 'to respond. They can request an extra',
    };
  },

  //Notice.AAA6.ClaimIssue.Response.Required
  respondToClaim: () => {
    return {
      title: 'You haven\'t responded to the claim',
      content: 'days remaining.',
      nextSteps: 'Respond to the claim',
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.Requested
  hwfSubmission: () => {
    return {
      title: 'We\'re reviewing your help with fees application',
      content: 'You\'ve applied for help with the claim fee. You\'ll receive an update in 5 to 10 working days.',
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.FullRemission
  hwfFullRemission: (feeAmount) => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: [`The full claim fee of £${feeAmount} will be covered by fee remission.`, 'You do not need to make a payment.'],
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.InvalidRef
  invalidHwfNumber: () => {
    return {
      title: 'You\'ve provided an invalid help with fees reference number',
      content: ['You\'ve applied for help with the claim fee, but the reference number is invalid.',
        'You\'ve been sent an email with instructions on what to do next. If you\'ve already read the email and taken action, disregard this message.',
        'You can pay by phone by calling 0300 123 7050.'],
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.InfoRequired
  hwfMoreInfoRequired: () => {
    return {
      title: 'Your help with fees application needs more information',
      content: ['We need more information on your application for help with the claim fee.',
        'You\'ve been sent an email with further details. If you\'ve already read the email and taken action, you can disregard this message.',
        'You can pay by phone by calling 0300 123 7050.'],
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.PartRemission
  hwfPartRemission: () => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: ['get help with the claim fee. £23 will be covered by fee remission.', 'You must still pay the remaining fee of £92. You can pay by phone by calling 0300 123 7050.'],
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.Rejected
  hwfNoRemission: () => {
    return {
      title: 'Your help with fees application has been rejected',
      content: ['We\'ve rejected your application for help with the claim fee. See the email for further details.', 'You\'ll need to pay the full fee of <Amount> by <Deadline date>. You can pay by phone by calling 0300 123 7050.'],
    };
  },

  //Notice.AAA6.ClaimIssue.HWF.Updated
  updateHWFNum: () => {
    return {
      title: 'Your help with fees application has been updated',
      content: 'You\'ve applied for help with the claim fee. You\'ll receive an update from us within 5 to 10 working days.',
    };
  },

  //Add deadline logic later
  //Notice.AAA6.DefResponse.FullOrPartAdmit.PayImmediately.Defendant
  defendantResponseFullAdmitPayImmediately: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      deadlineDate: deadline,
      content: [`You have offered to pay £${amount} by`, 'The payment must be received in Miss Jane Doe\'s account by then, if not they can request a county court judgment.'],
      nextSteps: 'View your response',
    };
  },

  //Notice.AAA6.ClaimantIntent.FullAdmit.Claimant
  //Not currently in use
  // defendantResponseFullAdmitPayImmediatelyClaimant: (amount, deadline) => {
  //   return {
  //     title: 'Immediate payment',
  //   };
  // },

  //Notice.AAA6.DefResponse.FullOrPartAdmit.PayByInstalments.Defendant
  defendantResponseFullAdmitPayInstalments: (amount, instalmentAmount, date) => {
    return {
      title: 'Response to the claim',
      content: [`You have offered to pay £${amount} in instalments of £${instalmentAmount} every month.`, `You have offered to do this starting from ${date}`, 'We will contact you when the claimant responds to your offer.'],
      nextSteps: 'View your response',
    };
  },

  //Notice.AAA6.DefResponse.FullOrPartAdmit.PayByInstalments.Claimant
  defendantResponseFullAdmitPayInstalmentsClaimant: (amount, instalmentAmount, date) => {
    return {
      title: 'Response to the claim',
      content: `Sir John Doe has offered to pay you £${amount} in instalments of £${instalmentAmount} every month. They are offering to do this starting from ${date}.`,
      nextSteps: 'View and respond',
    };
  },

  //Notice.AAA6.DefResponse.FullOrPartAdmit.PayBySetDate.Defendant
  defendantResponseFullAdmitPayBySetDateDefendant: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      content: `You have offered to pay £${amount} by ${deadline}. We will contact you when the claimant responds to your offer.`,
      nextSteps: 'View your response',
    };
  },

  //Notice.AAA6.DefResponse.FullOrPartAdmit.PayBySetDate.Claimant
  //This might not be strictly correct ^
  //Deadline logic needs adding
  defendantResponseFullAdmitPayBySetDateClaimant: (amount) => {
    return {
      title: 'Response to the claim',
      content: ['Sir John Doe has offered to pay', `£${amount} by`],
      nextSteps: 'View and respond',
    };
  },

  //CIV-13035
  //Notice.AAA6.ClaimantIntent.RequestedCCJ.Claimant
  claimantNotificationCCJRequested: () => {
    return {
      title: 'You requested a County Court Judgment against Sir John Doe',
      content: 'You accepted the repayment plan. When we\'ve processed the request, we\'ll post a copy of the judgment to you.',
      nextSteps: 'Tell us it\'s paid',
      nextSteps2: 'repayment plan',
      //Nextsteps might be wrong?
    };
  },

  //Add deadline logic later
  //Notice.AAA6.DefResponse.FullDefence.FullDispute.RefusedMediation.Claimant
  claimantNotificationWithDefendantRejectMedidationWithRejectAll: () => {
    return {
      title: 'Response to the claim',
      content: ['Test Company Defendant has rejected the claim and refused mediation.', 'You need to respond by '],
      nextSteps: 'View and respond',
    };
  },

  //Notice.AAA6.CP.StrikeOut.HearingFeeUnpaid.TrialReady.Claimant
  claimStruckOut: () => {
    return {
      title: 'The claim has been struck out',
      content: 'This is because the hearing fee was not paid by 10 November 2023 as stated in the hearing notice.',
      nextSteps: 'hearing notice',
    };
  },

  //Notice.AAA6.CP.OrderMade.Claimant
  orderMade: () => {
    return {
      title: 'An order has been made',
      content: 'The judge has made an order on your claim.',
      nextSteps: 'View the order',
    };
  },

  //Notice.AAA6.CP.Hearing.Scheduled.Claimant
  hearingScheduled: (hearingDate) => {
    return {
      title: 'A hearing has been scheduled',
      content: `Your hearing has been scheduled for ${hearingDate} at Central London County Court. Please keep your contact details and anyone you wish to rely on in court up to date. You can update contact details by telephoning the court at 0300 123 7050.`,
      nextSteps: 'View the hearing notice',
    };
  },

  //Notice.AAA6.CP.HearingFee.Required.Claimant
  payTheHearingFeeClaimant: (amount, deadline) => {
    return {
      title: 'You must pay the hearing fee',
      content: `You must either pay the hearing fee of £${amount} or apply for help with fees. You must do this by ${deadline}. If you do not take one of these actions, your claim will be struck out.`,
      nextSteps: 'pay the hearing fee',
      nextSteps2: 'apply for help with fees',
    };
  },

  //Notice.AAA6.CP.HearingFee.Paid.Claimant
  hearingFeePaidFull: () => {
    return {
      title: 'The hearing fee has been paid',
      content: 'The hearing fee has been paid in full.',
    };
  },

  //Notice.AAA6.ClaimantIntent.GoToHearing.Claimant
  goToHearingClaimant: () => {
    return {
      title: 'Wait for the court to review the case',
      content: 'You have rejected Sir John Doe\'s response. The case will be referred to a judge who will decide what should happen next.',
      nextSteps: 'View the defendant\'s response',
    };
  },

  //Notice.AAA6.ClaimantIntent.GoToHearing.DefPartAdmit.Defendant
  goToHearingPartAdmitDefendant: (amount) => {
    return {
      title: 'Wait for the court to review the case',
      content: ['Miss Jane Doe wants to proceed with the claim.',
        `They rejected your admission of £${amount}.`],
      nextSteps: 'View your response',
      nextSteps2: 'View the claimant\'s hearing requirements',
    };
  },

  //Notice.AAA6.ClaimantIntent.RequestCCJ.ClaimantRejectsDefPlan.ClaimantDisagreesCourtPlan.Defendant
  judgmentRequestedClaimantDisagrees: () => {
    return {
      title: 'Miss Jane Doe has requested a County Court Judgment against you',
      content: ['Miss Jane Doe rejected your repayment plan and an alternative plan proposed by the court based on your financial details. They asked a judge to make a new plan.',
        'When we\'ve processed the request, we\'ll post a copy of the judgment to you.',
        'If you pay the debt within one month of the date of judgment, the County Court Judgment (CCJ) is removed from the public register. You can pay £15 to apply for a certificate (opens in new tab) that confirms this.'],
      nextSteps: 'Contact Miss Jane Doe',
      nextSteps2: 'View your response',
    };
  },

  //Notice.AAA6.ClaimantIntent.RequestCCJ.ClaimantRejectsDefPlan.CourtAgreesWithClaimant.Defendant
  judgmentRequestedCourtAgrees: () => {
    return {
      title: 'Miss Jane Doe has requested a County Court Judgment against you',
      content: ['Miss Jane Doe rejected your repayment plan and has proposed a new plan, which the court agreed with, based on the financial details you provided.',
        'When we\'ve processed the request, we\'ll post a copy of the judgment to you.',
        'If you pay the debt within one month of the date of judgment, the County Court Judgment (CCJ) is removed from the public register. You can pay £15 to apply for a certificate (opens in new tab) that confirms this.'],
      nextSteps: 'Contact Miss Jane Doe',
      nextSteps2: 'View your response',
    };
  },

  //Notice.AAA6.ClaimantIntent.SettlementAgreement.ClaimantAcceptsPlan.Defendant
  claimantAskDefendantToSignSettlementDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: ['Miss Jane Doe has accepted your offer and asked you to sign a settlement agreement. You must respond by',
        'If you do not respond by then, or reject the agreement, they can request a County Court Judgment (CCJ).'],
      nextSteps: 'View the repayment plan',
      nextSteps2: 'View your response',
    };
  },

  //Notice.AAA6.ClaimantIntent.SettlementAgreement.ClaimantRejectsPlan.CourtAgreesWithDefendant.Defendant
  claimantAskDefendantToSignSettlementCourtPlanDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: ['Miss Jane Doe has rejected your offer and asked you to sign a settlement agreement.',
        'Miss Jane Doe proposed a repayment plan, and the court then responded with an alternative plan that was accepted.',
        'If you do not respond by then, or reject the agreement, they can request a County Court Judgment (CCJ).'],
      nextSteps: 'View the repayment plan',
      nextSteps2: 'View your response',
    };
  },

  //Notice.AAA6.ClaimantIntent.SettlementAgreement.AcceptOrRejectDefPlan.Claimant
  claimantAskDefendantToSignSettlementClaimant: () => {
    return {
      title: 'Settlement agreement',
      content: ['You have accepted the Sir John Doe offer and asked them to sign a settlement agreement.',
        'The defendant must respond by ',
        'If they do not respond by then, or reject the agreement, you can request a County Court Judgment(CCJ).'],
    };
  },

  //Notice.AAA6.ClaimantIntent.SettlementAgreement.DefendantAccepted.Defendant
  defendantAcceptsSettlementDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: ['You have accepted the settlement agreement (opens in a new tab).',
        'The claimant cannot request a County Court Judgment (CCJ), unless you break the terms of the agreement.'],
    };
  },

  //Notice.AAA6.ClaimantIntent.Settlement.DefendantResponseAccepts.Claimant
  defendantAcceptsSettlementClaimant: () => {
    return {
      title: 'Settlement agreement',
      content: ['Sir John Doe has accepted the settlement agreement.',
        'You cannot request a County Court Judgment(CCJ), unless they break the terms of the agreement.'],
      nextSteps: 'You can view the settlement agreement or tell us it\'s settled',
    };
  },

  //Notice.AAA6.ClaimantIntent.SettlementAgreement.DefendantRejected.Defendant
  defendantRejectsSettlementDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: [
        'Miss Jane Doe can request a County Court Judgment (CCJ), which would order you to repay the money in line with the agreement. The court believes you can afford this.',
        'If the claimant requests a CCJ then you can ask a judge to consider changing the plan, based on your financial details.'],
    };
  },

  //Notice.AAA6.ClaimantIntent.SettlementAgreement.DefendantRejected.Claimant
  defendantRejectsSettlementClaimant: () => {
    return {
      title: 'Settlement agreement',
      content: ['Sir John Doe has rejected the settlement agreement.',
        'You can request a County Court Judgment'],
    };
  },

  //CIV-13483
  //Notice.AAA6.ClaimantIntent.RequestJudgePlan.RequestedCCJ.Claimant
  claimantRejectPlanJudgeNewPlan: () => {
    return {
      title: 'You requested a County Court Judgment against Sir John Doe',
      content: ['You rejected the repayment plan.',
        'When a judge has made a decision, we’ll post a copy of the judgment to you.'],
    };
  },

  // Notice.AAA6.MediationUnsuccessful.Claimant1NonAttendance.CARM.Claimant
  // CIV-13157
  mediationUnsuccessfulClaimant1NonAttendance: () => {
    return {
      title: 'You did not attend mediation',
      content: ['You did not attend your mediation appointment, and the judge may issue a penalty against you.',
        'Your case will not be reviewed by the court.'],
      nextSteps: 'Explain why you did not attend your appointment',
    };
  },

  // CIV-11625
  // Notice.AAA6.ClaimantIntent.Mediation.CARM.Claimant
  mediationCARMClaimantDefendant: () => {
    return {
      title: 'Your claim is now going to mediation',
      content: ['Your claim is now going to mediation. You will be contacted within 28 days with details of your appointment.',
        'If you do not attend your mediation appointment, the judge may issue a penalty.'],
    };
  },

  // CIV-13154 and 13155
  // Notice.AAA6.MediationUnsuccessful.NOTClaimant1NonContactable.CARM.Claimant
  mediationUnsuccessfulNOTClaimant1NonContactable: () => {
    return {
      title: 'Mediation appointment unsuccessful',
      content: ['You were not able to resolve this claim using mediation.',
        'This case will now be reviewed by the court.'],
    };
  },

  // CIV-13149 and 13152
  // Notice.AAA6.MediationSuccessful.CARM.Claimant
  mediationSuccessful: () => {
    return {
      title: 'Mediation appointment successful',
      content: ['Both parties attended mediation and an agreement was reached.',
        'This case is now settled and no further action is needed.',
        'You can view your mediation agreement here.'],
    };
  },
};
