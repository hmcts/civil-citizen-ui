const config = require('../../../config');
const restHelper = require('./restHelper');
const NodeCache = require('node-cache');
//Idam access token expires for every 8 hrs
const idamTokenCache = new NodeCache({stdTTL: 25200, checkperiod: 1800});
const idamUsersCreated = new Set();

const loginEndpoint = config.idamStub.enabled ? 'oauth2/token' : 'loginUser';
const idamUrl = config.idamStub.enabled ? config.idamStub.url : config.url.idamApi;
const idamTestSupportUrl = config.idamStub.enabled ? config.idamStub.url : 'https://idam-testing-support-api.aat.platform.hmcts.net';
const adminUser = config.idamStub.enabled ? config.idamStub.url : config.ctscAdmin;

async function getAccessTokenFromIdam(user) {
  return restHelper.retriedRequest(
    `${idamUrl}/${loginEndpoint}?username=${encodeURIComponent(user.email)}&password=${user.password}`, {'Content-Type': 'application/x-www-form-urlencoded'})
    .then(response => response.json()).then(data => data.access_token);
}

async function getAccessTokenToCreateUser() {
  return restHelper.retriedRequest(
    `${idamUrl}/${loginEndpoint}?username=${encodeURIComponent(adminUser.email)}&password=${adminUser.password}`, {'Content-Type': 'application/x-www-form-urlencoded'})
    .then(response => response.json()).then(data => data.access_token);
}

async function accessToken(user) {
  console.log('User logged in', user.email);
  if (idamTokenCache.get(user.email) != null) {
    console.log('User access token coming from cache', user.email);
    return idamTokenCache.get(user.email);
  } else {
    if (user.email && user.password) {
      const accessToken = await getAccessTokenFromIdam(user);
      idamTokenCache.set(user.email, accessToken);
      console.log('user access token coming from idam', user.email);
      return accessToken;
    } else {
      console.log('*******Missing user details. Cannot get access token******');
    }
  }
}

async function addIdamUserToBeDeletedList(userEmail) {
  console.log('Adding user {} to the to be deleted list', userEmail);
  idamUsersCreated.add(userEmail);
}

async function createAccount(email, password) {
  try {
    const token = await getAccessTokenToCreateUser();
    let body = {'password': password, 'user': {'email': email, 'forename': 'forename', 'surname': 'surname', 'displayName': 'displayName', 'roleNames': ['citizen']}};
    await restHelper.request(`${idamTestSupportUrl}/test/idam/users`, {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, body);

    addIdamUserToBeDeletedList(email);
    console.log('Account created: ', email);

  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

async function deleteAccount(email) {
  try {
    const token = await getAccessTokenToCreateUser();
    let method = 'DELETE';
    await restHelper.request(`${idamTestSupportUrl}/test/idam/users/${email}`, {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}, undefined, method);

    console.log('Account deleted: ' + email);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

async function deleteAllIdamTestUsers() {
  console.log('Deleting all the idam users', idamUsersCreated);
  for (const idamUserEmail of idamUsersCreated) {
    console.log('Delete idamUserEmail...', idamUserEmail);
    await deleteAccount(idamUserEmail);
  }
}

async function userId(authToken) {
  return restHelper.retriedRequest(
    `${idamUrl}/o/userinfo`, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${authToken}`,
    })
    .then(response => response.json()).then(data => data.uid);
}

module.exports = {
  accessToken,
  userId,
  createAccount,
  deleteAccount,
  deleteAllIdamTestUsers,
};
