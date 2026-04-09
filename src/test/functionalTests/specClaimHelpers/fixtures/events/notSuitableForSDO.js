module.exports = {
  caseNotSuitableForSDO: () => {
    return {
      event: 'NOT_SUITABLE_SDO',
      caseData: {
        reasonNotSuitableSDO: {
          input: 'not suitable for sdo',
        },
      },
    };  
  },
};