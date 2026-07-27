module.exports = {
  extendResponseDeadlinePayload: () => {
    return {
      event: 'EXTEND_RESPONSE_DEADLINE',
      caseData: {
        respondentSolicitor1AgreedDeadlineExtension: '2026-06-26',
      },
    };  
  },
};