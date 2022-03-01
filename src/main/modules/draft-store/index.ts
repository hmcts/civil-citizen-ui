import config from 'config';
import {createClient} from 'redis';
import {Application} from 'express';
import {LoggerInstance} from 'winston';


export class DraftStoreClient {

  constructor(private readonly logger: LoggerInstance) {}

  public enableFor(app: Application): void {
    const client = createClient({
      socket: {
        host: config.get('services.draftStore.redis.host'),
        port: config.get('services.draftStore.redis.port'),
        connectTimeout: 15000,
      },
      password: config.get('services.draftStore.redis.key'),
    });
    app.locals.draftStoreClient = client;

    client.connect()
      .then(() => {
        this.logger.info('Connected to Redis instance successfully');
      })
      .catch((error: Error) => {
        this.logger.error('Error connecting to Redis instance', error);
      });
  }

  setData(app: Application): void {
    const draftStoreClient = app.locals.draftStoreClient;
    this.logger.info('Mocking data on redis');
    const claimData = {
      'id': 1645882162449409,
      'jurisdiction': 'CIVIL',
      'case_type_id': 'CIVIL',
      'created_date': '2022-03-01T13:29:22.447',
      'last_modified': '2022-03-01T13:29:24.971',
      'state': 'PENDING_CASE_ISSUED',
      'security_classification': 'PUBLIC',
      'case_data': {
        'claimFee': {
          'code': 'FEE0204',
          'version': '4',
          'calculatedAmountInPence': '7000',
        },
        'issueDate': '2022-01-08',
        'applicant1': {
          'type': 'ORGANISATION',
          'partyName': 'Example applicant1 organisation',
          'primaryAddress': {
            'County': 'Kent',
            'Country': 'United Kingdom',
            'PostCode': 'RG4 7AA',
            'PostTown': 'Reading',
            'AddressLine1': 'Flat 2',
            'AddressLine2': 'Caversham House 15-17',
            'AddressLine3': 'Church Road',
          },
          'organisationName': 'Example applicant1 organisation',
          'partyTypeDisplayValue': 'Organisation',
        },
        'respondent1': {
          'type': 'ORGANISATION',
          'partyName': 'Example respondent1 organisation',
          'primaryAddress': {
            'County': 'Kent',
            'Country': 'United Kingdom',
            'PostCode': 'RG4 7AA',
            'PostTown': 'Reading',
            'AddressLine1': 'Flat 2',
            'AddressLine2': 'Caversham House 15-17',
            'AddressLine3': 'Church Road',
          },
          'organisationName': 'Example respondent1 organisation',
          'partyTypeDisplayValue': 'Organisation',
        },
        'claimInterest': 'Yes',
        'submittedDate': '2022-03-01T11:57:10.592492',
        'totalInterest': 0,
        'detailsOfClaim': 'Test details of claim',
        'superClaimType': 'SPEC_CLAIM',
        'businessProcess': {
          'status': 'FINISHED',
          'camundaEvent': 'CREATE_CLAIM_SPEC',
        },
        'timelineOfEvents': [
          {
            'id': '97e59389-1e6a-49bf-8957-f7fccb86e838',
            'value': {
              'timelineDate': '2021-01-01',
              'timelineDescription': 'Test details of claim',
            },
          },
        ],
        'totalClaimAmount': 1000,
        'interestClaimFrom': 'FROM_CLAIM_SUBMIT_DATE',
        'calculatedInterest': '| Description | Amount | \n |---|---| \n | Claim amount | £ 1000 | \n | Interest amount | £ 0.00 | \n | Total amount | £ 1000.00 |',
        'claimAmountBreakup': [
          {
            'id': 'da31f19f-157f-4c2d-8a31-2225ecf155fa',
            'value': {
              'claimAmount': '100000',
              'claimReason': 'Test claim item details',
            },
          },
        ],
        'interestClaimUntil': 'UNTIL_SETTLED_OR_JUDGEMENT_MADE',
        'legacyCaseReference': '000MC009',
        'solicitorReferences': {
          'applicantSolicitor1Reference': 'Applicant Reference',
          'respondentSolicitor1Reference': 'Respondent Reference',
        },
        'interestClaimOptions': 'SAME_RATE_INTEREST',
        'claimNotificationDate': '2022-03-01T11:57:10.592492',
        'paymentSuccessfulDate': '2022-03-01T11:57:10.592492',
        'respondent1Represented': 'Yes',
        'respondent1OrgRegistered': 'Yes',
        'speclistYourEvidenceList': [
          {
            'id': '339536de-eeb8-4b74-968d-4b9d02c00ef7',
            'value': {
              'evidenceType': 'OTHER',
              'otherEvidence': 'evidence',
            },
          },
        ],
        'claimIssuedPaymentDetails': {
          'status': 'SUCCESS',
          'reference': 'RC-1234-1234-1234-1234',
          'customerReference': 'abcdefg',
        },
        'claimNotificationDeadline': '2022-03-01T23:59:59',
        'sameRateInterestSelection': {
          'sameRateInterestType': 'SAME_RATE_INTEREST_8_PC',
        },
        'specRespondent1Represented': 'Yes',
        'respondent1ResponseDeadline': '2022-03-01T15:59:59',
        'applicant1OrganisationPolicy': {
          'Organisation': {
            'OrganisationID': 'Q1KOKP2',
          },
          'OrgPolicyReference': 'Claimant policy reference',
          'OrgPolicyCaseAssignedRole': '[APPLICANTSOLICITORONE]',
        },
        'respondent1OrganisationPolicy': {
          'Organisation': {
            'OrganisationID': 'Q1KOKP2',
          },
          'OrgPolicyReference': 'Defendant policy reference',
          'OrgPolicyCaseAssignedRole': '[RESPONDENTSOLICITORONE]',
        },
        'applicantSolicitor1PbaAccounts': {
          'value': {
            'code': '399990cf-7706-4591-bea6-2769da11ec1f',
            'label': 'PBA0088192',
          },
          'list_items': [
            {
              'code': '399990cf-7706-4591-bea6-2769da11ec1f',
              'label': 'PBA0088192',
            },
            {
              'code': '3c2e91e9-d1dd-421c-8b9c-0a5268a99d8d',
              'label': 'PBA0078095',
            },
          ],
        },
        'applicantSolicitor1UserDetails': {
          'email': 'hmcts.civil+organisation.1.solicitor.1@gmail.com',
        },
        'claimAmountBreakupSummaryObject': '| Description | Amount | \n |---|---| \n | Test claim item details | £ 1000.00 |\n  | **Total** | £ 1000.00 |',
        'respondentSolicitor1EmailAddress': 'civilmoneyclaimsdemo@gmail.com',
        'applicantSolicitor1ClaimStatementOfTruth': {
          'name': 'John Smith',
          'role': 'Solicitor',
        },
        'specApplicantCorrespondenceAddressdetails': {
          'Country': 'United Kingdom',
          'PostCode': 'RG4 7AD',
          'PostTown': 'Berkshire',
          'AddressLine1': 'Claimant House',
          'AddressLine2': '20',
          'AddressLine3': 'Church Road',
        },
        'specApplicantCorrespondenceAddressRequired': 'Yes',
        'specRespondentCorrespondenceAddressdetails': {
          'Country': 'United Kingdom',
          'PostCode': 'RG4 7AD',
          'PostTown': 'Berkshire',
          'AddressLine1': 'Defendant House',
          'AddressLine2': '21',
          'AddressLine3': 'Church Road',
        },
        'specRespondentCorrespondenceAddressRequired': 'Yes',
      },
    };
    draftStoreClient.set('claim', JSON.stringify(claimData,  null, 4));
  }

}
