const {url} = require('../../config');
const restHelper = require('../../functionalTests/specClaimHelpers/api/restHelper');

const headers = {
  'Content-Type': 'application/json',
};

const buildMapping = (postcode) => ({
  request: {
    method: 'GET',
    urlPath: '/search/places/v1/postcode',
  },
  response: {
    status: 200,
    jsonBody: {
      results: [
        {
          DPA: {
            COUNTRY_CODE: 'E',
            POSTCODE: postcode,
            POSTAL_ADDRESS_CODE: 'D',
            ADDRESS: 'Mock address',
            X_COORDINATE: 0,
            Y_COORDINATE: 0,
            UPRN: 'MOCK',
            POST_TOWN: 'Test Town',
          },
        },
      ],
    },
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

const stubPostcodeLookup = async (postcode = 'W1J 7NT') => {
  if (!process.env.CI) {
    return;
  }
  const wiremockBaseUrl = process.env.WIREMOCK_E2E_URL || url.wiremockServiceE2e;
  if (!wiremockBaseUrl) {
    return;
  }
  const wiremockAdminUrl = `${wiremockBaseUrl}/__admin/mappings`;
  try {
    await restHelper.request(wiremockAdminUrl, headers, buildMapping(postcode), 'POST');
  } catch (error) {
    // Avoid breaking local runs if wiremock isn't available.
    console.warn('Postcode mock setup failed', error?.message || error);
  }
};

module.exports = {stubPostcodeLookup};
