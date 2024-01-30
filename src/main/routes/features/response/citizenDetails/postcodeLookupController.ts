import {NextFunction, Router} from 'express';
import { AddressInfoResponse } from '@hmcts/os-places-client';
import {POSTCODE_LOOKUP_URL} from '../../../urls';
import { getOSPlacesClientInstance } from 'modules/ordance-survey-key/ordanceSurveyKey';

export default Router()
  .get(POSTCODE_LOOKUP_URL, (req, res, next: NextFunction) => {
    const postcode = <string>req.query?.postcode;
    if (!postcode || postcode.length===0) {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Postcode not provided',
        },
      });
    }
    const osPlacesClient = getOSPlacesClientInstance();
    osPlacesClient.lookupByPostcodeAndDataSet(req.query.postcode as string, 'DPA,LPI')
      .then((addressInfoResponse: AddressInfoResponse) => {
        if (!addressInfoResponse.isValid) {
          throw new Error('Invalid post code');
        }

        addressInfoResponse.addresses
          = addressInfoResponse.addresses.filter((addresses, index, self) =>
            index === self.findIndex((t) =>
              (t.formattedAddress === addresses.formattedAddress),
            ));
          res.json(addressInfoResponse);
        })
        .catch((err: Error) => {
          next(err);
        });
    }
  )
    ;
