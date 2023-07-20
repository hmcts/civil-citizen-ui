module.exports = {
  enterBreathingSpacePayload: () => {
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

  liftBreathingSpacePayload: () => {
    return {
      event: 'LIFT_BREATHING_SPACE_SPEC',
      caseData: {
        liftBreathing: {
          expectedEnd: '2023-06-23',
          event: 'Summary',
          eventDescription: 'Description',
        },
      },
    };  
  },
};