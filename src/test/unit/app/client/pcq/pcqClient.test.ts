import axios from "axios";
import config from "config";
import { 
  isPcqElegible,
  isPcqHealthy,
  generatePcqUrl,
} from "client/pcq/pcqClient";
import {PartyType} from "common/models/partyType";

describe("PCQ Client", () => {

  describe("Check PCQ health", () => {

    jest.mock("axios");
    
    it("should return true on PCQ health check", async () => {
      //Given
      axios.get = jest.fn().mockResolvedValue({ data: { status: "UP" } });
      //When
      const health = await isPcqHealthy();
      //Then
      expect(health).toBe(true);
    });
    it("should return false on PCQ health check", async () => {
      //Given
      axios.get = jest.fn().mockResolvedValue({ data: null });
      //When
      const health = await isPcqHealthy();
      //Then
      expect(health).toBe(false);
    });
  });

  describe("Check PCQ elegible", () => {
    it("should be elegible if individual", async () => {
      //Given
      const type = PartyType.INDIVIDUAL;
      //When
      const health = isPcqElegible(type);
      //Then
      expect(health).toBe(true);
    });
    it("should be elegible if sole trader", async () => {
      //Given
      const type = PartyType.SOLE_TRADER;
      //When
      const health = isPcqElegible(type);
      //Then
      expect(health).toBe(true);
    });
    it("should NOT be elegible if other", async () => {
      //Given
      const type = PartyType.ORGANISATION;
      //When
      const health = isPcqElegible(type);
      //Then
      expect(health).toBe(false);
    });
  });

  describe("Generate PCQ url", () => {
    it("should generate PCQ url", async () => {
      //Given
      const pcqId = 'abc';
      const actor = 'respondent';
      const ccdCaseId = '123';
      const partyId = 'test@test.com';
      const returnUrl = 'test';
      const language = 'en';
      const pcqBaseUrl: string = config.get('services.pcq.url');
      const result = `${pcqBaseUrl}/service-endpoint?pcqId=abc&serviceId=civil-citizen-ui&actor=respondent&ccdCaseId=123&partyId=test@test.com&returnUrl=test&language=en&token=`;
      //When
      const pcqUrl = generatePcqUrl(
        pcqId,
        actor,
        ccdCaseId,
        partyId,
        returnUrl,
        language
      );
      //Then
      expect(pcqUrl).toContain(result);
    });
  });
});
