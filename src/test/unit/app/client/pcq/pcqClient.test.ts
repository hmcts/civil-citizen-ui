import axios from 'axios';
import config from 'config';
import {
  isPcqElegible,
  isPcqHealthy,
  generatePcqUrl,
} from 'client/pcq/pcqClient';
import {PartyType} from 'common/models/partyType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

describe('PCQ Client', () => {

  describe('Check PCQ health', () => {

    jest.mock('axios');

    it('should return true on PCQ health check', async () => {
      //Given
      axios.get = jest.fn().mockResolvedValue({ data: { status: 'UP' } });
      //When
      const health = await isPcqHealthy();
      //Then
      expect(health).toBe(true);
    });
    it('should return false on PCQ health check', async () => {
      //Given
      axios.get = jest.fn().mockResolvedValue({ data: {} });
      //When
      const health = await isPcqHealthy();
      //Then
      expect(health).toBe(false);
    });
    it('should throw an error on PCQ health check', async () => {
      //Given
      axios.get = jest.fn().mockResolvedValue(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //When
      const health = await isPcqHealthy();
      //Then
      expect(health).toBe(false);
    });
  });

  describe('Check PCQ elegible', () => {
    it('should be elegible if individual', async () => {
      //Given
      const type = PartyType.INDIVIDUAL;
      //When
      const health = isPcqElegible(type);
      //Then
      expect(health).toBe(true);
    });
    it('should be elegible if sole trader', async () => {
      //Given
      const type = PartyType.SOLE_TRADER;
      //When
      const health = isPcqElegible(type);
      //Then
      expect(health).toBe(true);
    });
    it('should NOT be elegible if other', async () => {
      //Given
      const type = PartyType.ORGANISATION;
      //When
      const health = isPcqElegible(type);
      //Then
      expect(health).toBe(false);
    });
  });

  describe('Generate PCQ url', () => {
    it('should generate PCQ url', async () => {
      //Given
      const pcqId = 'abc';
      const actor = 'respondent';
      const ccdCaseId = '123';
      const partyId = 'test@test.com';
      const returnUrl = 'test';
      const language = 'en';
      const pcqBaseUrl: string = config.get('services.pcq.url');
      const result = `${pcqBaseUrl}/service-endpoint?pcqId=abc&serviceId=civil-citizen-ui&actor=respondent&partyId=test@test.com&returnUrl=test&language=en&ccdCaseId=123&token=`;
      //When
      const pcqUrl = generatePcqUrl(
        pcqId,
        actor,
        partyId,
        returnUrl,
        language,
        ccdCaseId,
      );
      //Then
      expect(pcqUrl).toContain(result);
    });
  });
});
