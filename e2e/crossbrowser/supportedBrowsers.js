const LATEST_WINDOWS = 'Windows 11';

const supportedBrowsers = {
  safari: {
    safari_mac_latest: {
      browserName: 'safari',
      platformName: 'macOS 12',
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil: MAC_SAFARI',
        seleniumVersion: '3.141.59',
        screenResolution: '1376x1032',
      },
    },
  },
  chrome: {
    chrome_win_latest: {
      browserName: 'chrome',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil: WIN_CHROME_LATEST',
      },
    },
  },
  edge: {
    edge_win_latest: {
      browserName: 'MicrosoftEdge',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil: WIN_EDGE_LATEST',
      },
    },
  },
  firefox: {
    firefox_win_latest: {
      browserName: 'firefox',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil: WIN_FIREFOX_LATEST',
      },
    },
  },
};

module.exports = supportedBrowsers;
