import { Address } from 'common/form/models/address';

const addressValues = {
  addressLine1: ['Primary line 1', 'Correspondence line 1'],
  addressLine2: ['Primary line 2', 'Correspondence line 2'],
  addressLine3: ['Primary line 3', 'Correspondence line 3'],
  city: ['Primary city', 'Correspondence city'],
  postCode: ['SW1A 1AA', 'EC1A 1BB'],
} as unknown as Record<string, string>;

describe(('For Address Model'), () => {
  describe('fromObject', () => {
    it('should map values at the given index to an Address', () => {
      //Given
      const index = 1;
      //When
      const result = Address.fromObject(addressValues, index);
      //Then
      expect(result).toEqual(new Address('Correspondence line 1', 'Correspondence line 2', 'Correspondence line 3', 'Correspondence city', 'EC1A 1BB'));
    });

    it('should return an empty Address when input is not provided', () => {
      //Given
      const index = 0;
      //When
      const result = Address.fromObject(undefined, index);
      //Then
      expect(result).toEqual(new Address());
    });

    it('should return an empty Address when index is not provided', () => {
      //Given
      const index: number | undefined = undefined;
      //When
      const result = Address.fromObject(addressValues, index);
      //Then
      expect(result).toEqual(new Address());
    });
  });
});
