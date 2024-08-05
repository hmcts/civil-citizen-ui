const restHelper = require('./restHelper');
const {url} = require('../../../config');

const wireMockUrl = `${url.wiremockService}/__admin/mappings`;
const wireMockResetUrl = `${url.wiremockServiceE2e}/__admin/scenarios/reset`;
const headers = {
  'Content-Type': 'application/json',
};

const getStubs = async () => {
  return restHelper.request(
    wireMockUrl, null, null, 'GET', 200)
    .then(async response => {
      const content = await response.json();
      return content.mappings;
    });
};

const getStubByRequestUrl = async (stubRequestUrl) => {
  const allStubs = await getStubs();
  const targetStub = allStubs.find(stub => stub.request.urlPath == stubRequestUrl);
  if (targetStub == null) {
    throw new Error(`Could not locate stub for: ${stubRequestUrl} request url`);
  }
  return targetStub;
};

const updateStubById = async (stubId, mappingContent) => {
  return restHelper.request(
    `${wireMockUrl}/${stubId}`, headers, mappingContent, 'PUT', 200)
    .then(response => {
      response.json();
    });
};

const updateStubResponseFileByRequestUrl = async (stubRequestUrl, bodyFileName) => {
  return getStubByRequestUrl(stubRequestUrl)
    .then(stub => updateStubById(stub.id, {
      ...stub,
      response: {
        ...stub.response,
        bodyFileName,
      },
    }),
    );
};

const resetScenarios = async () => {
  return restHelper.request(
    wireMockResetUrl, headers, {}, 'POST', 200)
    .then(response => {
      response.json();
    });
};

module.exports = {
  getStubs,
  getStubByRequestUrl,
  updateStubById,
  updateStubResponseFileByRequestUrl,
  resetScenarios,
};
