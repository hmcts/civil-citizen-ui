import * as express from 'express';
import { AddressInfoResponse, OSPlacesClient } from '@hmcts/os-places-client';
import { POSTCODE_LOOKUP_URL } from '../../../urls';
import config from 'config';

const { Logger } = require('@hmcts/nodejs-logging');

const postcodeLookupApiKey = config.get<string>('secrets.cmc.os-postcode-lookup-api-key');
const osPlacesClient = new OSPlacesClient(postcodeLookupApiKey);
const logger = Logger.getLogger('postcode-lookup');

export default express.Router()
  .get(POSTCODE_LOOKUP_URL, (req, res) => {
    if (!req.query.postcode || !req.query.postcode.toString().trim()) {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Postcode not provided',
        },
      });
    }
    osPlacesClient.lookupByPostcodeAndDataSet(req.query.postcode as string, 'DPA,LPI')
      .then((addressInfoResponse: AddressInfoResponse) => {
        addressInfoResponse.addresses
          = addressInfoResponse.addresses.filter((addresses, index, self) =>
            index === self.findIndex((t) =>
              (t.formattedAddress === addresses.formattedAddress),
            ),
          );
        res.json(addressInfoResponse);
      })
      .catch((err:Error) => {
        if (err.message === 'Authentication failed') {
          console.log('Ordnance Survey keys stopped working', { error: err });
        }
        logger.error(err.stack);
        res.status(500).json({
          error: {
            status: 500,
            message: err.message,
          },
        });
      });
  });
