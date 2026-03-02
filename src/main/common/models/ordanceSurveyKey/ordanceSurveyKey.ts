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
  readonly country: string;

  constructor(uprn: string, organisationName: string | undefined, departmentName: string | undefined, poBoxNumber: string | undefined, buildingName: string | undefined, subBuildingName: string | undefined, buildingNumber: number | undefined, thoroughfareName: string | undefined, dependentThoroughfareName: string | undefined, dependentLocality: string | undefined, doubleDependentLocality: string | undefined, postTown: string, postcode: string, postcodeType: string, formattedAddress: string, point: Point, udprn: string | undefined, country: string) {
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
    this.country = country;
  }
}

export class AddressInfoResponse {
  addresses: Address[];
  valid: boolean;
  country?: string;

  constructor(addresses: Address[], valid: boolean) {
    this.addresses = addresses;
    this.valid = valid;
  }
}
