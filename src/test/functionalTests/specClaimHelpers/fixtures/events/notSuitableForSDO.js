module.exports = {
  caseNotSuitableForSDO: () => {
    return {
      event: 'NotSuitable_SDO',
      caseData: {
        reasonNotSuitableSDO: {
          input: 'not suitable for sdo',
        },
      },
    };  
  },
};