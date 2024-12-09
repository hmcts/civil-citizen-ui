module.exports = {
  caseman: () => {
    return {
      event: 'CASE_PROCEEDS_IN_CASEMAN',
      caseDataUpdate: {
        claimProceedsInCasemanLR: {
          date: '2024-01-01',
          reason: 'APPLICATION',
          other: null,
        },
        CaseAccessCategory: 'SPEC_CLAIM',
      },
    };
  },
};
