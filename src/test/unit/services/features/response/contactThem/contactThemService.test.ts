import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {
  getAddress, getRespondentSolicitorAddress,
  getSolicitorName,
} from 'services/features/response/contactThem/contactThemService';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {Address} from 'form/models/address';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

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
      const address = getAddress(claim.applicant1);
      //Then
      expect(address).toMatchObject(correspondenceAddress);
    });
    it('should return primary address when no correspondence address exists', () => {
      //Given
      const primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const claim = buildClaimWithAddress(primaryAddress);
      //When
      const address = getAddress(claim.applicant1);
      //Then
      expect(address).toMatchObject(primaryAddress);
    });
    it('should return primary address when correspondence address is empty', () => {
      //Given
      const primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
      const claim = buildClaimWithAddress(primaryAddress);
      //When
      const address = getAddress(claim.applicant1);
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
  describe('getSolicitore Address after NOC ', () => {
    it('should return solicitor address', () => {
      //Given
      const claim = new Claim();
      claim.respondentSolicitorDetails= {
        'address': {
          'PostCode': 'NN3 9SS',
          'PostTown': 'NORTHAMPTON',
          'AddressLine1': '29, SEATON DRIVE',
        },
        'orgName': 'Civil - Organisation 3',
      };
      //When
      const address = getRespondentSolicitorAddress(claim);
      //Then
      expect(address.addressLine1).toBe(claim.respondentSolDetails.address.AddressLine1);
      expect(address.city).toBe(claim.respondentSolDetails.address.PostTown);
      expect(address.postCode).toBe(claim.respondentSolDetails.address.PostCode);
    });
    it('should return solicitor correspondence address', () => {
      //Given
      const claim = new Claim();
      claim.specRespondentCorrespondenceAddressRequired = YesNoUpperCamelCase.YES;
      claim.specRespondentCorrespondenceAddressdetails= {
        'PostCode': 'NN3 9SS',
        'PostTown': 'NORTHAMPTON',
        'AddressLine1': '29, SEATON DRIVE',
      };
      //When
      const address = getRespondentSolicitorAddress(claim);
      //Then
      expect(address.addressLine1).toBe(claim.specRespondentCorrespondenceAddressdetails.AddressLine1);
      expect(address.city).toBe(claim.specRespondentCorrespondenceAddressdetails.PostTown);
      expect(address.postCode).toBe(claim.specRespondentCorrespondenceAddressdetails.PostCode);
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
