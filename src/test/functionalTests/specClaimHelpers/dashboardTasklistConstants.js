module.exports = {
  uploadHearingDocuments: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'Upload hearing documents\')]]',
      title: 'Upload hearing documents',
    };
  },

  viewHearings: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'View the hearing\')]]',
      title: 'View the hearing',
    };
  },

  payTheHearingFee: (deadline) => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'Pay the hearing fee\')]]',
      title: 'Pay the hearing fee',
      deadline: `Deadline is 12am on ${deadline}`,
    };
  },

  addTrialArrangements: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'Add the trial arrangements\')]]',
      title: 'Add the trial arrangements',
    };
  },

  ordersAndNotices: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'View orders and notices\')]]',
      title: 'View orders and notices',
    };
  },

  uploadMediationDocuments: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'Upload mediation documents\')]]',
      title: 'Upload mediation documents',
    };
  },

  viewMediationDocuments: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'View mediation documents\')]]',
      title: 'View mediation documents',
    };
  },

  viewMediationSettlementAgreement: () => {
    return {
      locator: '//li[contains(@class, \'app-task-list__item\') and .//a[contains(text(), \'View mediation settlement agreement\')]]',
      title: 'View mediation settlement agreement',
    };
  },
};

