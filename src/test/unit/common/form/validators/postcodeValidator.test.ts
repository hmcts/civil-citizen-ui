import { PostcodeValidator } from 'common/form/validators/postcodeValidator';

describe('PostcodeValidator', () => {
  const validator = new PostcodeValidator();

  describe('validate', () => {
    it('should return true for a valid postcode in England', async () => {
      const result = await validator.validate('SW1H 9AJ');
      expect(result).toEqual(true);
    });
    it('should return true for a valid postcode in England, ', async () => {
      const result = await validator.validate('GL50 1JZ');
      expect(result).toEqual(true);
    });
    it('should return true for a valid postcode in Wales', async () => {
      const result = await validator.validate('CF10 3NQ');
      expect(result).toEqual(true);
    });
    it('should return false for a valid postcode in Northern Ireland', async () => {
      const result = await validator.validate('BT1 1AA');
      expect(result).toEqual(false);
    });
    it('should return false for a valid postcode in Scotland', async () => {
      const result = await validator.validate('KW1 5BA');
      expect(result).toEqual(false);
    });
    it('should return false for an invalid postcode', async () => {
      const result = await validator.validate('ABC123');
      expect(result).toEqual(false);
    });

    describe('is Judgment online Live', () => {
      it('should return true for a postCode 8 chars long and flag ON', async () => {
        //When
        const result = await validator.validate('EC1A 1BB');
        //Then
        expect(result).toEqual(true);
      });
      it('should return false for a postCode more than 8 chars long and flag ON', async () => {
        //When
        const result = await validator.validate('EC1A 1BBD');
        const defaultMessage = await validator.defaultMessage();
        //Then
        expect(result).toEqual(false);
        expect(defaultMessage).toEqual('ERRORS.TEXT_TOO_MANY');
      });
    });
  });
});
