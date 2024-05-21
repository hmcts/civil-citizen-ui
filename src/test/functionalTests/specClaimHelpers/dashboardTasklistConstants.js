module.exports = {
  uploadHearingDocuments: () => {
    return {
      locatorFastTrack: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[9]/ol/li[3]',
      locatorSmallClaim: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[7]/ol/li[2]',
      title: 'Upload hearing documents',
    };
  },

  viewHearings: () => {
    return {
      locatorFastTrack: '//*[@id="main-content"]/div/div[1]/div[7]/ol/li[1]',
      locatorSmallClaim: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[7]/ol/li[3]',
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
      locatorFastTrack: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[9]/ol/li[4]',
      locatorSmallClaim: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[7]/ol/li[3]',
      title: 'Add the trial arrangements',
    };
  },

  ordersAndNotices: () => {
    return {
      locatorFastTrack: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[8]/ol/li',
      locatorSmallClaim: '//*[@id="main-content"]/div/main/div[2]/div[1]/div[7]/ol/li',
      title: 'View orders and notices',
    };
  },
};

