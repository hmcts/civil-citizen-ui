import { Address } from "common/form/models/address";
import { PartyDetails } from "common/form/models/partyDetails";
import { YesNo } from "common/form/models/yesNo";

describe("PartyDetails", () => {
  it("should build an instance of a new PartyDetails", () => {
    //Given
    const values = {
      title: "Mr.",
      lastName: "Doe",
      firstName: "Joe",
      soleTraderTradingAs: "Test",
      partyName: "V1",
      contactPerson: "Ginny",
      postToThisAddress: YesNo.YES,
      provideCorrespondenceAddress: YesNo.NO,
      addressLine1: "test",
      addressLine2: "test",
      addressLine3: "test",
      city: "test",
      postCode: "test",
    };
    const partyDetails: PartyDetails = new PartyDetails(values, false);
    const primaryAddress = new Address("test", "test", "test", "test", "test");
    //When
    const result = { ...values, primaryAddress, carmEnabled: false };
    //Then
    expect(result).toMatchObject(partyDetails);
  });
});
