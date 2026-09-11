import {Address} from 'form/models/address';

/**
 * Formats an Address object into a string with lines separated by <br> tags.
 * Includes addressLine1, addressLine2, addressLine3, city, and postCode.
 * Filters out any empty or undefined lines.
 *
 * @param address The Address object to format
 * @returns A string representing the address with <br> separators
 */
export const addressToString = (address: Address): string => {
  return [
    address?.addressLine1,
    address?.addressLine2,
    address?.addressLine3,
    address?.city,
    address?.postCode,
  ].filter(line => line?.trim()?.length > 0).join('<br>');
};
