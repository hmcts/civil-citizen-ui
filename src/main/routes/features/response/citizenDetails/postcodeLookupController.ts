import { Router } from 'express';
import { POSTCODE_LOOKUP_URL } from 'routes/urls';
import { AddressInfoResponse } from 'models/ordnanceSurveyKey/ordnanceSurveyKey';
import {
  getOsErrorStatus,
  isOsAuthError,
  lookupByPostcodeAndDataSet,
} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('postcodeLookupController');

export default Router().get(POSTCODE_LOOKUP_URL, async (req, res) => {
  try {
    const raw = req.query?.postcode;
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return res.status(400).json({
        error: { status: 400, message: 'Postcode not provided' },
      });
    }

    const postcode = raw.trim();
    const response: AddressInfoResponse = await lookupByPostcodeAndDataSet(postcode);

    if (!response?.addresses || response.addresses.length === 0) {
      return res.status(404).json({
        error: { status: 404, message: 'Postcode not found' },
      });
    }

    res.status(200).json(response);
  } catch (error: unknown) {
    const status = getOsErrorStatus(error);
    const statusCode = isOsAuthError(error)
      ? 502
      : status && status >= 400 && status < 500
        ? status
        : 500;
    logger.warn(`Ordnance Survey postcode lookup failed with status ${status ?? 'none'} and was returned as ${statusCode}`);
    res.status(statusCode).json({
      error: {
        status: statusCode,
        message: statusCode === 400 ? 'Invalid postcode' : 'Postcode lookup failed',
      },
    });
  }
});
