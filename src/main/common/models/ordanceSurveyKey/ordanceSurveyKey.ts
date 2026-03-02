export class Point {
  type: string;
  coordinates: number[];

  constructor(type: string, coordinates: number[]) {
    this.type = type;
    this.coordinates = coordinates;
  }
}

export interface AddressOptions {
  uprn: string;
  organisationName?: string;
  departmentName?: string;
  poBoxNumber?: string;
  buildingName?: string;
  subBuildingName?: string;
  buildingNumber?: number;
  thoroughfareName?: string;
  dependentThoroughfareName?: string;
  dependentLocality?: string;
  doubleDependentLocality?: string;
  postTown: string;
  postcode: string;
  postcodeType: string;
  formattedAddress: string;
  point: Point;
  udprn?: string;
  country: string;
}

export class Address {
  readonly uprn: string;
  readonly organisationName?: string;
  readonly departmentName?: string;
  readonly poBoxNumber?: string;
  readonly buildingName?: string;
  readonly subBuildingName?: string;
  readonly buildingNumber?: number;
  readonly thoroughfareName?: string;
  readonly dependentThoroughfareName?: string;
  readonly dependentLocality?: string;
  readonly doubleDependentLocality?: string;
  readonly postTown: string;
  readonly postcode: string;
  readonly postcodeType: string;
  readonly formattedAddress: string;
  readonly point: Point;
  readonly udprn?: string;
  readonly country: string;

  constructor(options: AddressOptions) {
    this.uprn = options.uprn;
    this.organisationName = options.organisationName;
    this.departmentName = options.departmentName;
    this.poBoxNumber = options.poBoxNumber;
    this.buildingName = options.buildingName;
    this.subBuildingName = options.subBuildingName;
    this.buildingNumber = options.buildingNumber;
    this.thoroughfareName = options.thoroughfareName;
    this.dependentThoroughfareName = options.dependentThoroughfareName;
    this.dependentLocality = options.dependentLocality;
    this.doubleDependentLocality = options.doubleDependentLocality;
    this.postTown = options.postTown;
    this.postcode = options.postcode;
    this.postcodeType = options.postcodeType;
    this.formattedAddress = options.formattedAddress;
    this.point = options.point;
    this.udprn = options.udprn;
    this.country = options.country;
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