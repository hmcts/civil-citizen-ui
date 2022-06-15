import {CorrespondenceAddress} from '../../../../../../main/common/models/correspondenceAddress';
import {Claim} from '../../../../../../main/common/models/claim';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {
  getAddress,
  getSolicitorName,
} from '../../../../../../main/services/features/response/contactThem/contactThemService';

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
    it('should return solicitors address when it exists', () => {
      //Given
      const solicitorAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const correspondenceAddress = buildAddress(CORRESPONDENCE_ADDRESS_LINE_1, CORRESPONDENCE_ADDRESS_LINE_2, CORRESPONDENCE_TOWN, CORRESPONDENCE_POSTCODE);
      const claim = buildClaimWithAddress(primaryAddress, correspondenceAddress, solicitorAddress);
      //When
      const address = getAddress(claim);
      //Then
      expect(address).toMatchObject(solicitorAddress);
    });
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
      const claim = buildClaimWithAddress(primaryAddress, {});
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


function buildClaimWithAddress(address: CorrespondenceAddress, correspondenceAddress?: CorrespondenceAddress, solicitorAddress?: CorrespondenceAddress): Claim {
  const claim = new Claim();
  const applicant = {
    partyName: 'Some Very Important Company Ltd',
    primaryAddress: address,
    type: CounterpartyType.COMPANY,
  };
  claim.applicant1 = applicant;
  if (correspondenceAddress) {
    claim.specApplicantCorrespondenceAddressdetails = correspondenceAddress;
  }
  if (solicitorAddress) {
    claim.applicantSolicitor1ServiceAddress = solicitorAddress;
  }
  return claim;
}

function buildAddress(line1: string, line2: string, postcode: string, postTown: string): CorrespondenceAddress {
  return {
    AddressLine1: line1,
    AddressLine2: line2,
    PostCode: postcode,
    PostTown: postTown,
  };
}
