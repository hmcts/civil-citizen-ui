import config from 'config';
import axios from 'axios';
import { Address, AddressInfoResponse, Point } from 'models/ordanceSurveyKey/ordanceSurveyKey';
import {AssertionError} from 'assert';

interface OSAddress {
  UPRN: string;
  UDPRN?: string;
  ADDRESS: string;
  BUILDING_NUMBER?: string | number;
  BUILDING_NAME?: string;
  SUB_BUILDING_NAME?: string;
  THOROUGHFARE_NAME?: string;
  POST_TOWN?: string;
  POSTCODE?: string;
  POSTAL_ADDRESS_CODE?: string;
  LOGICAL_STATUS_CODE?: string;
  BLPU_STATE_CODE?: string;
  COUNTRY_CODE?: string;
  ORGANISATION_NAME?: string;
  ORGANISATION?: string;
  DEPARTMENT_NAME?: string;
  PO_BOX_NUMBER?: string;
  DEPENDENT_THOROUGHFARE_NAME?: string;
  DEPENDENT_LOCALITY?: string;
  DOUBLE_DEPENDENT_LOCALITY?: string;
  TOWN_NAME?: string;
  POSTCODE_LOCATOR?: string;
  X_COORDINATE: number;
  Y_COORDINATE: number;
  PAO_START_NUMBER?: string | number;
  PAO_START_SUFFIX?: string;
  PAO_END_NUMBER?: string | number;
  PAO_END_SUFFIX?: string;
  PAO_TEXT?: string;
  SAO_TEXT?: string;
  SAO_START_NUMBER?: string | number;
  SAO_START_SUFFIX?: string;
  SAO_END_NUMBER?: string | number;
  SAO_END_SUFFIX?: string;
  STREET_DESCRIPTION?: string;
  USRN?: string;
}

interface OSResult {
  DPA?: OSAddress;
  LPI?: OSAddress;
}

const isNonPostalHistoricalOrNoLongerExisting = (source: OSAddress): boolean => {
  return !source ||
         source.POSTAL_ADDRESS_CODE === 'N' ||
         source.LOGICAL_STATUS_CODE === '8' ||
         source.BLPU_STATE_CODE === '4';
};

const getCountry = (countryCode?: string): string | null => {
  switch (countryCode?.toUpperCase()) {
    case 'E': return 'England';
    case 'W': return 'Wales';
    default: return null;
  }
};

const formatBuildingNumber = (source: OSAddress): string | undefined => {
  return (source.BUILDING_NUMBER?.toString() ?? [
    source.PAO_START_NUMBER?.toString(),
    source.PAO_START_SUFFIX?.toString(),
    source.PAO_END_NUMBER ? `-${source.PAO_END_NUMBER}` : '',
    source.PAO_END_SUFFIX?.toString(),
  ].filter(Boolean).join('')) || undefined;
};

const formatSubBuildingName = (source: OSAddress): string | undefined => {
  return (source.SUB_BUILDING_NAME ?? [
    source.SAO_TEXT?.toString(),
    source.SAO_START_NUMBER?.toString(),
    source.SAO_START_SUFFIX?.toString(),
    source.SAO_END_NUMBER ? `-${source.SAO_END_NUMBER}` : '',
    source.SAO_END_SUFFIX?.toString(),
  ].filter(Boolean).join(' ')) || undefined;
};

const mapToAddress = (source: OSAddress): Address | null => {
  if (isNonPostalHistoricalOrNoLongerExisting(source)) return null;

  const country = getCountry(source.COUNTRY_CODE);
  if (!country) return null;

  return new Address({
    uprn: source.UPRN,
    organisationName: source.ORGANISATION_NAME ?? source.ORGANISATION,
    departmentName: source.DEPARTMENT_NAME,
    poBoxNumber: source.PO_BOX_NUMBER,
    buildingName: source.BUILDING_NAME ?? source.PAO_TEXT,
    subBuildingName: formatSubBuildingName(source),
    buildingNumber: formatBuildingNumber(source),
    thoroughfareName: source.THOROUGHFARE_NAME ?? source.STREET_DESCRIPTION,
    dependentThoroughfareName: source.DEPENDENT_THOROUGHFARE_NAME,
    dependentLocality: source.DEPENDENT_LOCALITY,
    doubleDependentLocality: source.DOUBLE_DEPENDENT_LOCALITY,
    postTown: source.POST_TOWN ?? source.TOWN_NAME ?? '',
    postcode: source.POSTCODE ?? source.POSTCODE_LOCATOR ?? '',
    postcodeType: source.POSTAL_ADDRESS_CODE ?? '',
    formattedAddress: source.ADDRESS,
    point: new Point('Point', [source.X_COORDINATE, source.Y_COORDINATE]),
    udprn: source.UDPRN ?? source.UPRN,
    country,
  });
};

const prioritizeDpa = (a: OSResult, b: OSResult): number => {
  if (a.DPA && !b.DPA) return -1;
  if (!a.DPA && b.DPA) return 1;
  return 0;
};

const deduplicateByFormattedAddress = (addresses: Address[]): Address[] => {
  return addresses.filter((addr, index, self) =>
    index === self.findIndex((t) => t.formattedAddress === addr.formattedAddress),
  );
};

export async function lookupByPostcodeAndDataSet(postCode: string): Promise<AddressInfoResponse> {
  const apiKey = config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey');
  const url = config.get<string>('services.postcodeLookup.ordnanceSurveyApiUrl');

  const response = await axios.get(`${url}/search/places/v1/postcode?dataset=DPA,LPI&postcode=${encodeURIComponent(postCode)}&key=${apiKey}`);

  const results: OSResult[] = response?.data?.results ?? [];
  if (results.length === 0) {
    throw new AssertionError({
      message: 'Postcode is incorrect or no results returned',
    });
  }

  // Map results to Address objects, prioritizing DPA over LPI and deduplicating by UPRN
  const processedUprns = new Set<string>();
  const addresses = results
    .sort(prioritizeDpa)
    .map((jsonAddress: OSResult) => {
      const source = jsonAddress.DPA ?? jsonAddress.LPI;
      if (!source || processedUprns.has(source.UPRN)) return null;

      const address = mapToAddress(source);
      if (address) {
        processedUprns.add(source.UPRN);
      }
      return address;
    })
    .filter((addr): addr is Address => addr !== null);

  return new AddressInfoResponse(deduplicateByFormattedAddress(addresses), true);
}
