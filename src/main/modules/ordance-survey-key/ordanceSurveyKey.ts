import config from 'config';
import axios from 'axios';

export class Point {
  type: string;
  coordinates: number[];

  constructor(type: string, coordinates: number[]) {
    this.type = type;
    this.coordinates = coordinates;
  }
}

export class Address {
  readonly uprn: string;
  readonly organisationName: string | undefined;
  readonly departmentName: string | undefined;
  readonly poBoxNumber: string | undefined;
  readonly buildingName: string | undefined;
  readonly subBuildingName: string | undefined;
  readonly buildingNumber: number | undefined;
  readonly thoroughfareName: string | undefined;
  readonly dependentThoroughfareName: string | undefined;
  readonly dependentLocality: string | undefined;
  readonly doubleDependentLocality: string | undefined;
  readonly postTown: string;
  readonly postcode: string;
  readonly postcodeType: string;
  readonly formattedAddress: string;
  readonly point: Point;
  readonly udprn: string | undefined;

  constructor(uprn: string, organisationName: string | undefined, departmentName: string | undefined, poBoxNumber: string | undefined, buildingName: string | undefined, subBuildingName: string | undefined, buildingNumber: number | undefined, thoroughfareName: string | undefined, dependentThoroughfareName: string | undefined, dependentLocality: string | undefined, doubleDependentLocality: string | undefined, postTown: string, postcode: string, postcodeType: string, formattedAddress: string, point: Point, udprn: string | undefined) {
    this.uprn = uprn;
    this.organisationName = organisationName;
    this.departmentName = departmentName;
    this.poBoxNumber = poBoxNumber;
    this.buildingName = buildingName;
    this.subBuildingName = subBuildingName;
    this.buildingNumber = buildingNumber;
    this.thoroughfareName = thoroughfareName;
    this.dependentThoroughfareName = dependentThoroughfareName;
    this.dependentLocality = dependentLocality;
    this.doubleDependentLocality = doubleDependentLocality;
    this.postTown = postTown;
    this.postcode = postcode;
    this.postcodeType = postcodeType;
    this.formattedAddress = formattedAddress;
    this.point = point;
    this.udprn = udprn;
  }
}

export async function lookupByPostcodeAndDataSet(postCode: string): Promise<any> {
  console.log(config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey'));
  const apiKey = config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey');
  const response = await axios.get(`https://api.os.uk/search/places/v1/postcode?dataset=DPA,LPI&postcode=${postCode}"&key=` + apiKey);
  const addreses = response.data.results.map((jsonAddress: any) => {
    if (!jsonAddress.DPA) {
      return new Address(jsonAddress.LPI.UPRN, jsonAddress.LPI.ORGANISATION, jsonAddress.LPI.DEPARTMENT_NAME, jsonAddress.LPI.PO_BOX_NUMBER, jsonAddress.LPI.PAO_TEXT, jsonAddress.LPI.SAO_TEXT, jsonAddress.LPI.BUILDING_NUMBER, jsonAddress.LPI.STREET_DESCRIPTION, jsonAddress.LPI.DEPENDENT_THOROUGHFARE_NAME, jsonAddress.LPI.DEPENDENT_LOCALITY, jsonAddress.LPI.DOUBLE_DEPENDENT_LOCALITY, jsonAddress.LPI.TOWN_NAME, jsonAddress.LPI.POSTCODE_LOCATOR, jsonAddress.LPI.POSTAL_ADDRESS_CODE, jsonAddress.LPI.ADDRESS, new Point('Point', [jsonAddress.LPI.X_COORDINATE, jsonAddress.LPI.Y_COORDINATE]), jsonAddress.LPI.USRN);
    }
    else {
      return new Address(jsonAddress.DPA.UPRN, jsonAddress.DPA.ORGANISATION_NAME, jsonAddress.DPA.DEPARTMENT_NAME, jsonAddress.DPA.PO_BOX_NUMBER, jsonAddress.DPA.BUILDING_NAME, jsonAddress.DPA.SUB_BUILDING_NAME, jsonAddress.DPA.BUILDING_NUMBER, jsonAddress.DPA.THOROUGHFARE_NAME, jsonAddress.DPA.DEPENDENT_THOROUGHFARE_NAME, jsonAddress.DPA.DEPENDENT_LOCALITY, jsonAddress.DPA.DOUBLE_DEPENDENT_LOCALITY, jsonAddress.DPA.POST_TOWN, jsonAddress.DPA.POSTCODE, jsonAddress.DPA.POSTAL_ADDRESS_CODE, jsonAddress.DPA.ADDRESS, new Point('Point', [jsonAddress.DPA.X_COORDINATE, jsonAddress.DPA.Y_COORDINATE]), jsonAddress.DPA.UDPRN);
    }
  });
  return addreses;
}
