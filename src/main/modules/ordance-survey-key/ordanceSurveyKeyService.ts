import config from 'config';
import axios from 'axios';
import {Address, AddressInfoResponse, Point} from 'models/ordanceSurveyKey/ordanceSurveyKey';

export async function lookupByPostcodeAndDataSet(postCode: string): Promise<AddressInfoResponse> {
  const apiKey = config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey');
  const url = config.get<string>('services.postcodeLookup.ordnanceSurveyApiUrl');
  const response = await axios.get(`${url}/search/places/v1/postcode?dataset=DPA,LPI&postcode=${postCode}"&key=` + apiKey);
  console.log(response.data.results);
  let addresses = response.data.results.map((jsonAddress: any) => {
    if (!jsonAddress.DPA) {
      return new Address(jsonAddress.LPI.UPRN, jsonAddress.LPI.ORGANISATION, jsonAddress.LPI.DEPARTMENT_NAME, jsonAddress.LPI.PO_BOX_NUMBER, jsonAddress.LPI.PAO_TEXT, jsonAddress.LPI.SAO_TEXT, jsonAddress.LPI.BUILDING_NUMBER, jsonAddress.LPI.STREET_DESCRIPTION, jsonAddress.LPI.DEPENDENT_THOROUGHFARE_NAME, jsonAddress.LPI.DEPENDENT_LOCALITY, jsonAddress.LPI.DOUBLE_DEPENDENT_LOCALITY, jsonAddress.LPI.TOWN_NAME, jsonAddress.LPI.POSTCODE_LOCATOR, jsonAddress.LPI.POSTAL_ADDRESS_CODE, jsonAddress.LPI.ADDRESS, new Point('Point', [jsonAddress.LPI.X_COORDINATE, jsonAddress.LPI.Y_COORDINATE]), jsonAddress.LPI.USRN);
    }
    else {
      return new Address(jsonAddress.DPA.UPRN, jsonAddress.DPA.ORGANISATION_NAME, jsonAddress.DPA.DEPARTMENT_NAME, jsonAddress.DPA.PO_BOX_NUMBER, jsonAddress.DPA.BUILDING_NAME, jsonAddress.DPA.SUB_BUILDING_NAME, jsonAddress.DPA.BUILDING_NUMBER, jsonAddress.DPA.THOROUGHFARE_NAME, jsonAddress.DPA.DEPENDENT_THOROUGHFARE_NAME, jsonAddress.DPA.DEPENDENT_LOCALITY, jsonAddress.DPA.DOUBLE_DEPENDENT_LOCALITY, jsonAddress.DPA.POST_TOWN, jsonAddress.DPA.POSTCODE, jsonAddress.DPA.POSTAL_ADDRESS_CODE, jsonAddress.DPA.ADDRESS, new Point('Point', [jsonAddress.DPA.X_COORDINATE, jsonAddress.DPA.Y_COORDINATE]), jsonAddress.DPA.UDPRN);
    }
  });
  addresses  = addresses.filter((addresses: any, index: any, self: any[]) =>
    index === self.findIndex((t:any) =>
      (t.formattedAddress === addresses.formattedAddress),
    ));
  return new AddressInfoResponse(addresses, true);
}
