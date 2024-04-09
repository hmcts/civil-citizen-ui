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

  respondToClaim: async () => {
    return {
      title: 'You haven´t responded to the claim',
      content: 'days remaining. Respond to the claim.',
      nextSteps: 'Respond to the claim',   
    };
  },

  hwfSubmission:() => {
    return {
      title: 'We’re reviewing your help with fees application',
      content: 'You’ve applied for help with the claim fee. You’ll receive an update in 5 to 10 working days.',
    };
  },

  hwfFullRemission: () => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: 'The full {Type of fee} fee of {Amount} will be covered. You do not need to make a payment.',
      content2: 'You do not need to make a payment.',
    };
  },

  invalidHwfNumber: () => {
    return {
      title: 'You’ve provided an invalid help with fees reference number',
      content: 'You’ve applied for help with the <Type of fee> fee, but the reference number is invalid.',
      content2: 'You’ve been sent an email with instructions on what to do next. If you’ve already read the email and taken action, disregard this message.',
      content3: 'You can pay by phone by calling 0300 123 7050.',
    };
  },

  hwfMoreInfoRequired: () => {
    return {
      title: 'You’ve provided an invalid help with fees reference number',
      content: 'You’ve applied for help with the <Type of fee> fee, but the reference number is invalid.',
      content2: 'You’ve been sent an email with instructions on what to do next. If you’ve already read the email and taken action, disregard this message.',
      content3: 'You can pay by phone by calling 0300 123 7050.',
    };
  },

  hwfPartRemission: () => {
    return {
      title: 'Your help with fees application has been reviewed',
      content: 'You’ll get help with the <Type of fee> fee. You’ll receive <Amount> towards it.',
      content2: 'You’ll need to pay the full fee of <Amount> by <Deadline date>. You can pay by phone by calling 0300 123 7050.',
    };
  },

  hwfNoRemission: () => {
    return {
      title: 'Your help with fees application has been rejected',
      content: 'We’ve rejected your application for help with the <Type of fee> fee. See the email for further details.',
      content2: 'You’ll need to pay the full fee of <Amount> by <Deadline date>. You can pay by phone by calling 0300 123 7050.',
    };
  },

  updateHWFNo: () => {
    return {
      title: 'Your help with fees application has been updated',
      content: 'You’ve applied for help with the {Type of fee} fee. You’ll receive an update from us within 5 to 10 working days.',
    };
  },
};