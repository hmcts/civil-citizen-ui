/* eslint-disable no-unused-vars */
// in this file you can append custom step methods to 'I' object

const output = require('codeceptjs').output;

const config = require('./config.js');
const parties = require('./helpers/party.js');

const SIGNED_IN_SELECTOR = 'exui-header';
const SIGNED_OUT_SELECTOR = '#global-header';
const CASE_HEADER = 'ccd-case-header > h1';

const TEST_FILE_PATH = './e2e/fixtures/examplePDF.pdf';

const CONFIRMATION_MESSAGE = {
  online: 'Your claim has been received\nClaim number: ',
  offline: 'Your claim has been received and will progress offline',
};

let caseId, screenshotNumber, eventName, currentEventName;
let eventNumber = 0;

const getScreenshotName = () => eventNumber + '.' + screenshotNumber + '.' + eventName.split(' ').join('_') + '.png';
const conditionalSteps = (condition, steps) => condition ? steps : [];
