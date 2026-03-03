import config from 'config';
import axios from 'axios';
import { Address, AddressInfoResponse, Point } from 'models/ordanceSurveyKey/ordanceSurveyKey';
import {AssertionError} from 'assert';

export async function lookupByPostcodeAndDataSet(postCode: string): Promise<AddressInfoResponse> {
  const apiKey = config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey');
  const url = config.get<string>('services.postcodeLookup.ordnanceSurveyApiUrl');

  // Fixed URL string
  const response = await axios.get(`${url}/search/places/v1/postcode?dataset=DPA,LPI&postcode=${postCode}&key=${apiKey}`);

  const results = response?.data?.results ?? [];
  if (results.length === 0) {
    throw new AssertionError({
      message: 'Postcode is incorrect or no results returned',
    });
  }

  // Map results to Address objects using options object
  let addresses = results.map((jsonAddress: any) => {
    const source = jsonAddress.DPA ?? jsonAddress.LPI;

    return new Address({
      uprn: source.UPRN,
      organisationName: source.ORGANISATION_NAME ?? source.ORGANISATION,
      departmentName: source.DEPARTMENT_NAME,
      poBoxNumber: source.PO_BOX_NUMBER,
      buildingName: source.BUILDING_NAME ?? source.PAO_TEXT,
      subBuildingName: source.SUB_BUILDING_NAME ?? source.SAO_TEXT,
      buildingNumber: source.BUILDING_NUMBER,
      thoroughfareName: source.THOROUGHFARE_NAME ?? source.STREET_DESCRIPTION,
      dependentThoroughfareName: source.DEPENDENT_THOROUGHFARE_NAME,
      dependentLocality: source.DEPENDENT_LOCALITY,
      doubleDependentLocality: source.DOUBLE_DEPENDENT_LOCALITY,
      postTown: source.POST_TOWN ?? source.TOWN_NAME,
      postcode: source.POSTCODE ?? source.POSTCODE_LOCATOR,
      postcodeType: source.POSTAL_ADDRESS_CODE,
      formattedAddress: source.ADDRESS,
      point: new Point('Point', [source.X_COORDINATE, source.Y_COORDINATE]),
      udprn: source.UDPRN ?? source.USRN,
      country: jsonAddress.country ?? 'England', // fallback
    });
  });

  // Remove duplicates based on formattedAddress
  addresses = addresses.filter((addr: Address, index: number, self: Address[]) =>
    index === self.findIndex((t: Address) => t.formattedAddress === addr.formattedAddress),
  );

  return new AddressInfoResponse(addresses, true);
}