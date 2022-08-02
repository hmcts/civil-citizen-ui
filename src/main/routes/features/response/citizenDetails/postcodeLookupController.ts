import * as express from 'express';
import { AddressInfoResponse, OSPlacesClient } from '@hmcts/os-places-client';
import { POSTCODE_LOOKUP_URL } from '../../../urls';
import config from 'config';

const postcodeLookupApiKey = config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey');
const osPlacesClient = new OSPlacesClient(postcodeLookupApiKey);

export default express.Router()
  .get(POSTCODE_LOOKUP_URL, (req, res, next: express.NextFunction) => {
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
        if(!addressInfoResponse.isValid){
          throw new Error('Invalid post code');
        }

        addressInfoResponse.addresses
          = addressInfoResponse.addresses.filter((addresses, index, self) =>
            index === self.findIndex((t) =>
              (t.formattedAddress === addresses.formattedAddress),
            ));
        res.json(addressInfoResponse);
      })
      .catch((err:Error) => {
        next(err);
      });
  });
