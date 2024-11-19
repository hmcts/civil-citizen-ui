const LATEST_WINDOWS = 'Windows 11';

const supportedBrowsers = {
  chrome: {
    chrome_mac_latest: {
      browserName: 'chrome',
      platformName: 'macOS 12',
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil CUI Tests: MAC_CHROME_LATEST',
        extendedDebugging: true,
      },
    },
  },
  edge: {
    edge_win_latest: {
      browserName: 'MicrosoftEdge',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil CUI Tests: WIN_EDGE_LATEST',
      },
    },
  },
  firefox: {
    firefox_win_latest: {
      browserName: 'firefox',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'Civil CUI Tests: WIN_FF_LATEST',
        extendedDebugging: true,
      },
    },
  },
  safari: {
    safari: {
      browserName: 'safari',
      browserVersion: 'latest',
      platformName: 'macOS 13',
      'sauce:options': {
        name: 'Civil CUI Tests: MAC_SAFARI',
        seleniumVersion: '3.141.59',
      },
    },
  },
};

module.exports = supportedBrowsers;
