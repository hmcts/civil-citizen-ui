//https://tools.hmcts.net/confluence/display/CRef/Hook+Logic+-+Notifications
module.exports = {
  draftClaim: async () => {
    return {
      title: 'This claim has not been submitted',
      content: 'Your claim is saved as a draft. Continue with claim.',
    };
  },

  payClaimFee: (feeAmount) => {
    return {
      title: 'You need to pay your claim fee',
      content: `Your claim has not yet been issued, in order to proceed you must pay the claim fee of £${feeAmount}. Pay the claim fee.`,
      nextSteps: 'Pay the claim fee',
    };
  },

  claimIsSettled: (amount, date) => {
    return {
      title: 'The claim is settled',
      content: `The claimant has confirmed that you paid £${amount} on ${date}.`,
    };
  },

  //Date calculation should be based on CIV-13128 fix
  waitForDefendantToRespond: async () => {
    return {
      title: 'Wait for defendant to respond',
      content: 'to respond. They can request an extra',
    };
  },

  respondToClaim: () => {
    return {
      title: 'You haven´t responded to the claim',
      content: 'days remaining. Respond to the claim.',
      nextSteps: 'Respond to the claim',
    };
  },

  hwfSubmission:() => {
    return {
      title: 'We\'re reviewing your help with fees application',
      content: 'You\'ve applied for help with the claim fee. You\'ll receive an update in 5 to 10 working days.',
    };
  },

  hwfFullRemission: (feeAmount) => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: [`The full claim fee of £${feeAmount} will be covered by fee remission.`, 'You do not need to make a payment.'],
    };
  },

  invalidHwfNumber: () => {
    return {
      title: 'You\'ve provided an invalid help with fees reference number',
      content: ['You\'ve applied for help with the claim fee, but the reference number is invalid.',
        'You\'ve been sent an email with instructions on what to do next. If you\'ve already read the email and taken action, disregard this message.',
        'You can pay by phone by calling 0300 123 7050.'],
    };
  },

  hwfMoreInfoRequired: () => {
    return {
      title: 'Your help with fees application needs more information',
      content: ['We need more information on your application for help with the claim fee.',
        'You\'ve been sent an email with further details. If you\'ve already read the email and taken action, you can disregard this message.',
        'You can pay by phone by calling 0300 123 7050.'],
    };
  },

  hwfPartRemission: () => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: ['get help with the claim fee. £23 will be covered by fee remission.', 'You must still pay the remaining fee of £92. You can pay by phone by calling 0300 123 7050.'],
    };
  },

  hwfNoRemission: () => {
    return {
      title: 'Your help with fees application has been rejected',
      content: ['We\'ve rejected your application for help with the claim fee. See the email for further details.', 'You\'ll need to pay the full fee of <Amount> by <Deadline date>. You can pay by phone by calling 0300 123 7050.'],
    };
  },

  updateHWFNum: () => {
    return {
      title: 'Your help with fees application has been updated',
      content: 'You\'ve applied for help with the claim fee. You\'ll receive an update from us within 5 to 10 working days.',
    };
  },

  //Add deadline logic later
  defendantResponseFullAdmitPayImmediately: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      deadlineDate: deadline,
      content: [`You have offered to pay £${amount} by`, 'The payment must be received in Miss Jane Doe\'s account by then, if not they can request a county court judgment.'],
      nextSteps: 'View your response',
    };
  },

  defendantResponseFullAdmitPayInstalments: (amount, instalmentAmount, date) => {
    return {
      title: 'Response to the claim',
      content: [`You have offered to pay £${amount} in instalments of £${instalmentAmount} every month.`, `You have offered to do this starting from ${date}`,  'We will contact you when the claimant responds to your offer.'],
      nextSteps: 'View your response',
    };
  },

  defendantResponseFullAdmitPayBySetDate: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      content: `You have offered to pay £${amount} by ${deadline}. We will contact you when the claimant responds to your offer.`,
      nextSteps: 'View your response',
    };
  },

  claimantNotificationOfDefendantResponse: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      deadlineDate: deadline,
      content: ['Sir John Doe has offered to pay',  `£${amount} by`],
      nextSteps: 'View and respond',
    };
  },

  claimantNotificationCCJRequested: () => {
    return {
      title: 'You requested a County Court Judgment against Sir John Doe',
      content: ['You accepted the repayment plan.', 'When we\'ve processed the request, we\'ll post a copy of the judgment to you.'],
      nextSteps: 'Tell us it\'s paid',
      nextSteps2: 'repayment plan.',
    };
  },

  //Add deadline logic later
  claimantNotificationWithDefendantRejectMedidationWithRejectAll: () => {
    return {
      title: 'Response to the claim',
      content: ['Test Company Defendant has rejected the claim and refused mediation.', 'You need to respond by '],
      nextSteps: 'View and respond',
    };
  },

  claimStruckOut: () => {
    return {
      title: 'The claim has been struck out',
      content: 'This is because the hearing fee was not paid by 10 November 2023 as stated in the hearing notice.',
      nextSteps: 'hearing notice.',
    };
  },

  orderMade: () => {
    return {
      title: 'An order has been made',
      content: 'The judge has made an order on your claim. View the order.',
      nextSteps: 'View the order',
    };
  },

  hearingScheduled: (hearingDate) => {
    return {
      title: 'A hearing has been scheduled',
      content: `Your hearing has been scheduled for ${hearingDate} at Central London County Court. Please keep your contact details and anyone you wish to rely on in court up to date. You can update contact details by telephoning the court at 0300 123 7050. View the hearing notice.`,
      nextSteps: 'View the hearing notice',
    };
  },

  payTheHearingFeeClaimant: (amount, deadline) => {
    return {
      title: 'You must pay the hearing fee',
      content: `You must either pay the hearing fee of £${amount} or apply for help with fees. You must do this by ${deadline}. If you do not take one of these actions, your claim will be struck out.`,
      nextSteps: 'pay the hearing fee',
      nextSteps2: 'apply for help with fees',

  goToHearingPartAdmit: (amount) => {
    return {
      title: 'Wait for the court to review the case',
      content: ['Miss Jane Doe wants to proceed to court.',
        `They rejected your admission of £${amount}.`,
        'If the case goes to a hearing we will contact you with further details.'],
      nextSteps: 'View your response',
      nextSteps2: 'View the claimant\'s hearing requirements',
    };
  },

  judgmentRequestedClaimantDisagrees: () => {
    return {
      title: 'Miss Jane Doe has requested a County Court Judgment against you',
      content: ['The claimant rejected your repayment plan and an alternative plan proposed by the court based on your financial details. They asked a judge to make a new plan.',
        'When we\'ve processed the request, we\'ll post a copy of the judgment to you.',
        'If you pay the debt within one month of the date of judgment, the County Court Judgment (CCJ) is removed from the public register. You can pay £15 to apply for a certificate (opens in new tab) that confirms this.'],
      nextSteps: 'Contact Miss Jane Doe if you need their payment details.',
      nextSteps2: 'View your response',
    };
  },

  judgmentRequestedCourtAgrees: () => {
    return {
      title: 'Miss Jane Doe has requested a County Court Judgment against you',
      content: ['The claimant rejected your repayment plan and has proposed a new plan, which the court agreed with, based on the financial details you provided.',
        'When we\'ve processed the request, we\'ll post a copy of the judgment to you.',
        'If you pay the debt within one month of the date of judgment, the County Court Judgment (CCJ) is removed from the public register. You can pay £15 to apply for a certificate (opens in new tab) that confirms this.'],
      nextSteps: 'Contact Miss Jane Doe if you need their payment details.',
      nextSteps2: 'View your response',
    };
  },

  defendantRejectsSettlementDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: ['You have rejected the settlement agreement.',
        'The claimant can request a County Court Judgment (CCJ), which would order you to repay the money in line with the agreement. The court believes you can afford this.',
        'If the claimant requests a CCJ then you can ask a judge to consider changing the plan, based on your financial details.'],
    };
  },

  defendantRejectsSettlementClaimant: () => {
    return {
      title: 'Settlement agreement',
      content: ['Sir John Doe has rejected the settlement agreement.',
        'You can request a County Court Judgment'],
    };
  },

  claimantAskDefendantToSignSettlementDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: ['The claimant has accepted your plan and asked you to sign a settlement agreement. You must respond by',
        'If you do not respond by then, or reject the agreement, they can request a County Court Judgment.'],
      nextSteps: 'View the repayment plan',
      nextSteps2: 'View your response',
    };
  },

  claimantAskDefendantToSignSettlementClaimant: () => {
    return {
      title: 'Settlement agreement',
      content: ['You have accepted the Sir John Doe offer and asked them to sign a settlement agreement.',
        'The defendant must respond by ',
        'If they do not respond by then, or reject the agreement, you can request a County Court Judgment(CCJ).'],
    };
  },

  defendantAcceptsSettlementDefendant: () => {
    return {
      title: 'Settlement agreement',
      content: ['You have accepted the settlement agreement.',
        'The claimant cannot request a County Court Judgment, unless you break the terms of the agreement.'],
    };
  },

  defendantAcceptsSettlementClaimant: () => {
    return {
      title: 'Settlement agreement',
      content: ['Sir John Doe has accepted the settlement agreement.',
        'You cannot request a County Court Judgment(CCJ), unless they break the terms of the agreement.'],
      nextSteps: 'You can view the settlement agreement or tell us it\'s settled',
    };
  },
};
