module.exports = {
  enterBreathingSpace: () => {
    return {
      event: 'ENTER_BREATHING_SPACE_SPEC',
      caseData: {
        enterBreathing: {
          reference: 'Reference',
          start: '2023-06-22',
          type: 'STANDARD',
          expectedEnd: null,
          event: 'Summary',
          eventDescription: 'Description',
        },
      },
    };  
  },
};