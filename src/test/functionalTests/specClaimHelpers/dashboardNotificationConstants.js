module.exports = {
  payClaimFee: (feeAmount) => {
    return {
      title: 'You need to pay your claim fee',
      content: `Your claim has not yet been issued, in order to proceed you must pay the claim fee of £${feeAmount}. Pay the claim fee.`, 
      nextSteps: 'Pay the claim fee',   
    };
  },

  hwfSubmission:() => {
    return {
      title: 'We’re reviewing your help with fees application',
      content: 'You’ve applied for help with the claim fee. You’ll receive an update in 5 to 10 working days.',
    };
  },

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
};