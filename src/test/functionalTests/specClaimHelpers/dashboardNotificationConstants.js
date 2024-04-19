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

  //Date calculation should be based on CIV-13128 fix
  waitForDefendantToRespond: async () => {
    return {
      title: 'Wait for defendant to respond',
      content: 'to respond. They can request an extra.',
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
      content: `The full claim fee of £${feeAmount} will be covered. You do not need to make a payment.`,
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
        'You\'ve been sent an email with further details. If you\'ve already read the email and taken action, disregard this message.',
        'You can pay by phone by calling 0300 123 7050.'],
    };
  },

  hwfPartRemission: () => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: ['You\'ll get help with the claim fee. You\'ll receive £23 towards it.', 'You must still pay the remaining fee of £92. You can pay by phone by calling 0300 123 7050.'],
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

  defendantResponseFullAdmitPayImmediately: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      content: `You have offered to pay £${amount} by ${deadline}. The payment must clear the account by then, if not the claimant can request a county court judgment.`,
      nextSteps: 'View your response',
    };
  },

  defendantResponseFullAdmitPayInstalments: (amount, instalmentAmount, date) => {
    return {
      title: 'Response to the claim',
      content: [`You have offered to pay £${amount} in instalments of £${instalmentAmount} every month starting ${date}.`, 'The court will contact you when they respond.'],
      nextSteps: 'View your response',
    };
  },

  defendantResponseFullAdmitPayBySetDate: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      content: `You have offered to pay £${amount} by ${deadline}. The court will contact you when they respond.`,
      nextSteps: 'View your response',
    };
  },

  claimantNotificationOfDefendantResponse: (amount, deadline) => {
    return {
      title: 'Response to the claim',
      content: `The defendant has offered to pay £${amount} by ${deadline}`,
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
};
