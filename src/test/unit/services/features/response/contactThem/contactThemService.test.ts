import {Claim} from '../../../../../../main/common/models/claim';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {
  getAddress,
  getSolicitorName,
} from '../../../../../../main/services/features/response/contactThem/contactThemService';
import {Party} from '../../../../../../main/common/models/party';
import {PartyDetails} from '../../../../../../main/common/form/models/partyDetails';
import {Address} from '../../../../../../main/common/form/models/address';

describe('contact them service', () => {
  describe('getAddress', () => {
    const PRIMARY_ADDRESS_LINE_1 = 'Berry House';
    const PRIMARY_ADDRESS_LINE_2 = '12 Berry street';
    const PRIMARY_ADDRESS_TOWN = 'London';
    const PRIMARY_ADDRESS_POSTCODE = 'E1 6AN';
    const CORRESPONDENCE_ADDRESS_LINE_1 = 'PO Box';
    const CORRESPONDENCE_ADDRESS_LINE_2 = 'Dean close';
    const CORRESPONDENCE_TOWN = 'Bristol';
    const CORRESPONDENCE_POSTCODE = 'BS1 4HK';

    it('should return correspondence address when it exists', () => {
      //Given
      const primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const correspondenceAddress = buildAddress(CORRESPONDENCE_ADDRESS_LINE_1, CORRESPONDENCE_ADDRESS_LINE_2, CORRESPONDENCE_TOWN, CORRESPONDENCE_POSTCODE);
      const claim = buildClaimWithAddress(primaryAddress, correspondenceAddress);
      //When
      const address = getAddress(claim);
      //Then
      expect(address).toMatchObject(correspondenceAddress);
    });
    it('should return primary address when no correspondence address exists', () => {
      //Given
      const primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const claim = buildClaimWithAddress(primaryAddress);
      //When
      const address = getAddress(claim);
      //Then
      expect(address).toMatchObject(primaryAddress);
    });
    it('should return primary address when correspondence address is empty', () => {
      //Given
      const primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const claim = buildClaimWithAddress(primaryAddress, new Address());
      //When
      const address = getAddress(claim);
      //Then
      expect(address).toMatchObject(primaryAddress);
    });
  });
  describe('getSolicitorName', () => {
    it('should return solicitor name when solicitor statement of truth exists', () => {
      //Given
      const claim = new Claim();
      const statementOfTruth = {name: 'John Smith', role: 'Solicitor'};
      claim.applicantSolicitor1ClaimStatementOfTruth = statementOfTruth;
      //When
      const name = getSolicitorName(claim);
      //Then
      expect(name).toBe(statementOfTruth.name);
    });
    it('should return undefined when solicitor statement of truth does not exist', () => {
      //Given
      const claim = new Claim();
      //When
      const name = getSolicitorName(claim);
      //Then
      expect(name).toBeUndefined();
    });
  });
});

function buildClaimWithAddress(address: Address, correspondenceAddress?: Address, solicitorAddress?: Address): Claim {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({});
  claim.applicant1.partyDetails.partyName = 'Some Very Important Company Ltd';
  claim.applicant1.partyDetails.primaryAddress = address;
  claim.applicant1.type = PartyType.COMPANY;

  if (correspondenceAddress) {
    claim.applicant1.partyDetails.correspondenceAddress = correspondenceAddress;
  }
  if (solicitorAddress) {
    claim.applicant1.partyDetails.primaryAddress = solicitorAddress;
  }
  return claim;
}

function buildAddress(line1: string, line2: string, postcode: string, postTown: string): Address {
  return new Address(line1, line2, '', postcode, postTown);
}
