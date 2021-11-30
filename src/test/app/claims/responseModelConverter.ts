import { expect } from 'chai'

import { ResponseModelConverter } from 'claims/responseModelConverter'

import { ResponseDraft } from 'response/draft/responseDraft'
import {
  defenceWithAmountClaimedAlreadyPaidDraft,
  defenceWithDisputeDraft,
  fullAdmissionWithImmediatePaymentDraft,
  fullAdmissionWithPaymentByInstalmentsDraft,
  fullAdmissionWithPaymentBySetDateDraft,
  partialAdmissionAlreadyPaidDraft,
  partialAdmissionWithImmediatePaymentDraft,
  partialAdmissionWithPaymentByInstalmentsDraft,
  partialAdmissionWithPaymentBySetDateDraft,
  statementOfMeansWithAllFieldsDraft,
  statementOfMeansWithMandatoryFieldsDraft
} from 'test/data/draft/responseDraft'
import { companyDetails, individualDetails, organisationDetails, soleTraderDetails, soleTraderDetailsWithSeparatedName, individualSplitNameDetails } from 'test/data/draft/partyDetails'

import { Response } from 'claims/models/response'
import {
  defenceWithDisputeData,
  fullAdmissionWithImmediatePaymentData,
  fullAdmissionWithPaymentByInstalmentsData,
  fullAdmissionWithPaymentBySetDateData,
  partialAdmissionAlreadyPaidData,
  partialAdmissionFromStatesPaidDefence,
  partialAdmissionWithImmediatePaymentData,
  partialAdmissionWithPaymentByInstalmentsData,
  partialAdmissionWithPaymentBySetDateData,
  statementOfMeansWithAllFieldsData,
  statementOfMeansWithMandatoryFieldsOnlyData
} from 'test/data/entity/responseData'
import { company, individual, organisation, soleTrader, individualDefendant, soleTraderWithSeparatedName } from 'test/data/entity/party'
import { DefendantTimeline } from 'response/form/models/defendantTimeline'
import { Claim } from 'claims/models/claim'
import { CohabitingOption } from 'response/form/models/statement-of-means/cohabiting'
import * as claimStoreMock from 'test/http-mocks/claim-store'
import { MediationDraft } from 'mediation/draft/mediationDraft'
import {
  sampleDirectionsQuestionnaireDraftObj,
  sampleMediationDraftObj
} from 'test/http-mocks/draft-store'
import { FeatureToggles } from 'utils/featureToggles'
import { FreeMediationOption } from 'forms/models/freeMediation'
import { DirectionsQuestionnaireDraft } from 'directions-questionnaire/draft/directionsQuestionnaireDraft'
import { YesNoOption } from 'claims/models/response/core/yesNoOption'
import { CourtLocationType } from 'claims/models/directions-questionnaire/hearingLocation'

function prepareResponseDraft (draftTemplate: any, partyDetails: object): ResponseDraft {
  return new ResponseDraft().deserialize({
    ...draftTemplate,
    defendantDetails: { ...draftTemplate.defendantDetails, partyDetails: partyDetails },
    timeline: DefendantTimeline.fromObject({ rows: [], comment: 'I do not agree' })
  })
}

function prepareResponseData (template, party: object): Response {
  return Response.deserialize({
    ...template,
    defendant: { ...party, email: 'user@example.com', phone: '0700000000' },
    timeline: { rows: [], comment: 'I do not agree' }
  })
}

function preparePartialResponseData (template, party: object): Response {
  return Response.deserialize({
    ...template,
    defendant: { ...party, email: 'user@example.com', phone: '0700000000' },
    timeline: template.timeline
  })
}

function convertObjectLiteralToJSON (value: object): object {
  return JSON.parse(JSON.stringify(value))
}

describe('ResponseModelConverter', () => {
  const mediationDraft = new MediationDraft().deserialize(sampleMediationDraftObj)
  const directionsQuestionnaireDraft = new DirectionsQuestionnaireDraft().deserialize(sampleDirectionsQuestionnaireDraftObj)

  const directionsQuestionnaireResponseData = {
    directionsQuestionnaire: {
      witness: {
        noOfOtherWitness: 1,
        selfWitness: YesNoOption.YES
      },
      requireSupport: {
        languageInterpreter: 'Klingon',
        signLanguageInterpreter: 'Makaton',
        hearingLoop: YesNoOption.YES,
        disabledAccess: YesNoOption.YES,
        otherSupport: 'Life advice'
      },
      hearingLocation: {
        courtName: 'Little Whinging, Surrey',
        locationOption: CourtLocationType.SUGGESTED_COURT,
        exceptionalCircumstancesReason: 'Poorly pet owl',
        hearingLocationSlug: undefined,
        courtAddress: undefined
      },
      unavailableDates: [
        {
          unavailableDate: '2020-01-04'
        },
        {
          unavailableDate: '2020-02-08'
        }
      ],
      expertReports: [
        {
          expertName: 'Prof. McGonagall',
          expertReportDate: '2018-01-10'
        },
        {
          expertName: 'Mr Rubeus Hagrid',
          expertReportDate: '2019-02-27'
        }
      ],
      expertRequired: 'yes',
      permissionForExpert: 'yes',
      expertRequest: {
        expertEvidenceToExamine: 'Photographs',
        reasonForExpertAdvice: 'for expert opinion'
      }
    }
  }

  if (FeatureToggles.isEnabled('directionsQuestionnaire')) {
    const mediationResponseData = {
      freeMediation: 'yes',
      mediationPhoneNumber: '07777777777',
      mediationContactPerson: 'Mary Richards',
      noMediationReason: undefined
    }
    context('full defence conversion', () => {
      [
        [individualDetails, individual],
        [soleTraderDetailsWithSeparatedName, soleTraderWithSeparatedName],
        [companyDetails, company],
        [organisationDetails, organisation]
      ].forEach(([partyDetails, party]) => {

        it(`should convert defence with dispute submitted by ${partyDetails.type}`, async () => {
          const responseDraft = prepareResponseDraft({
            ...defenceWithDisputeDraft,
            ...sampleMediationDraftObj
          }, partyDetails)
          const responseData = prepareResponseData({
            ...defenceWithDisputeData,
            ...mediationResponseData,
            ...directionsQuestionnaireResponseData
          }, party)
          const claim: Claim = new Claim().deserialize({
            ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
          })
          expect(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)).to.deep.equal(responseData)
        })

        it(`should convert defence with amount claimed already paid submitted by ${partyDetails.type} to partial admission`, async () => {
          const responseDraft = prepareResponseDraft({
            ...defenceWithAmountClaimedAlreadyPaidDraft,
            ...sampleMediationDraftObj
          }, partyDetails)
          const responseData = preparePartialResponseData({
            ...partialAdmissionFromStatesPaidDefence,
            ...mediationResponseData,
            ...directionsQuestionnaireResponseData
          }, party)
          const claim: Claim = new Claim().deserialize({
            ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
          })

          expect(Response.deserialize(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
            .to.deep.equal(Response.deserialize(responseData))
        })
      })

      it(`should convert company who says YES to mediation and confirm number`, async () => {
        const mediationDraft = new MediationDraft().deserialize({
          willYouTryMediation: {
            option: FreeMediationOption.YES
          },
          youCanOnlyUseMediation: {
            option: FreeMediationOption.YES
          },
          canWeUseCompany: {
            option: FreeMediationOption.YES,
            mediationPhoneNumberConfirmation: '07777777788',
            mediationContactPerson: 'Mary Richards',
            noMediationReason: undefined
          }
        })
        const responseDraft = prepareResponseDraft({
          ...defenceWithAmountClaimedAlreadyPaidDraft
        }, companyDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionFromStatesPaidDefence,
          ...{
            freeMediation: 'yes',
            mediationPhoneNumber: '07777777788',
            mediationContactPerson: 'Company Smith',
            noMediationReason: undefined
          },
          ...directionsQuestionnaireResponseData
        }, company)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(Response.deserialize(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(Response.deserialize(responseData))
      })

      it('should not convert payment declaration for defence with dispute', async () => {
        const responseDraft = prepareResponseDraft({
          ...defenceWithDisputeDraft,
          ...sampleMediationDraftObj,
          whenDidYouPay: {
            date: {
              year: 2017,
              month: 12,
              day: 31
            },
            text: 'I paid in cash'
          }
        }, individualDetails)
        const responseData = prepareResponseData({
          ...defenceWithDisputeData,
          ...mediationResponseData,
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)).to.deep.equal(responseData)
      })
    })

    context('full admission conversion', () => {
      it('should convert full admission paid immediately', async () => {
        const responseDraft = prepareResponseDraft(
          {
            ...fullAdmissionWithImmediatePaymentDraft,
            ...sampleMediationDraftObj
          }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithImmediatePaymentData(),
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid immediately with title, firstName and lastName', async () => {
        const responseDraft = prepareResponseDraft(
          {
            ...fullAdmissionWithImmediatePaymentDraft,
            ...sampleMediationDraftObj
          }, individualSplitNameDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithImmediatePaymentData(),
          ...mediationResponseData
        }, individualDefendant)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by set date', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentBySetDateDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentBySetDateData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by set date with mandatory SoM only', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentBySetDateDraft,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsDraft },
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentBySetDateData,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsOnlyData },
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by instalments', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by instalments with complete SoM', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithAllFieldsDraft }
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData,
          statementOfMeans: { ...statementOfMeansWithAllFieldsData }
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })
    })

    context('partial admission conversion', () => {

      it('should convert already paid partial admission', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionAlreadyPaidDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionAlreadyPaidData,
          ...mediationResponseData,
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid immediately', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithImmediatePaymentDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithImmediatePaymentData(),
          ...mediationResponseData,
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by set date', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentBySetDateDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentBySetDateData,
          ...mediationResponseData,
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by set date with mandatory SoM only', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentBySetDateDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsDraft }
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentBySetDateData,
          ...mediationResponseData,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsOnlyData },
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by set date with cohibition option', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithAllFieldsDraft }
        }, individualDetails)
        responseDraft.statementOfMeans.cohabiting.option = CohabitingOption.YES
        responseDraft.statementOfMeans.disability.option = YesNoOption.YES
        responseDraft.statementOfMeans.severeDisability.option = YesNoOption.NO

        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })
        const converted = await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)
        expect(converted.statementOfTruth).to.equals(undefined)
      })

      it('should convert partial admission paid by instalments', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData,
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by instalments with complete SoM', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithAllFieldsDraft }
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData,
          statementOfMeans: { ...statementOfMeansWithAllFieldsData },
          ...directionsQuestionnaireResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission with Mediation canWeUse FreeMediation to NO', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...{
            freeMediation: 'no',
            mediationPhoneNumber: '07777777799'
          },
          ...directionsQuestionnaireResponseData
        }, individual)
        const mediationDraft = new MediationDraft().deserialize({
          canWeUse: {
            option: FreeMediationOption.NO,
            mediationPhoneNumber: '07777777799'
          }
        })

        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission with Mediation canWeUse FreeMediation to YES and response not submitted', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...{
            freeMediation: 'no',
            mediationContactPerson: undefined,
            mediationPhoneNumber: '0700000000'
          },
          ...directionsQuestionnaireResponseData
        }, individual)
        const mediationDraft = new MediationDraft().deserialize({
          canWeUse: {
            option: FreeMediationOption.YES
          }
        })

        const claim: Claim = new Claim().deserialize({
          ...claimStoreMock.sampleClaimObj, ...{ features: ['directionsQuestionnaire'] }
        })

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })
    })
  }

  if (!FeatureToggles.isEnabled('directionsQuestionnaire')) {
    const mediationResponseData = {
      freeMediation: 'yes',
      mediationPhoneNumber: '07777777777',
      mediationContactPerson: 'Mary Richards',
      noMediationReason: undefined
    }
    context('full defence conversion', () => {
      [
        [individualDetails, individual],
        [soleTraderDetails, soleTrader],
        [companyDetails, company],
        [organisationDetails, organisation]
      ].forEach(([partyDetails, party]) => {

        it(`should convert defence with dispute submitted by ${partyDetails.type}`, async () => {
          const responseDraft = prepareResponseDraft({
            ...defenceWithDisputeDraft,
            ...sampleMediationDraftObj
          }, partyDetails)
          const responseData = prepareResponseData({
            ...defenceWithDisputeData,
            ...mediationResponseData
          }, party)
          const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

          expect(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)).to.deep.equal(responseData)
        })

        it(`should convert defence with amount claimed already paid submitted by ${partyDetails.type} to partial admission`, async () => {
          const responseDraft = prepareResponseDraft({
            ...defenceWithAmountClaimedAlreadyPaidDraft,
            ...sampleMediationDraftObj
          }, partyDetails)
          const responseData = preparePartialResponseData({
            ...partialAdmissionFromStatesPaidDefence,
            ...mediationResponseData
          }, party)
          const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

          expect(Response.deserialize(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
            .to.deep.equal(Response.deserialize(responseData))
        })
      })

      it(`should convert company who says YES to mediation and confirm number`, async () => {
        const mediationDraft = new MediationDraft().deserialize({
          youCanOnlyUseMediation: {
            option: FreeMediationOption.YES
          },
          canWeUseCompany: {
            option: FreeMediationOption.YES,
            mediationPhoneNumberConfirmation: '07777777788',
            mediationContactPerson: 'Mary Richards',
            noMediationReason: undefined
          }
        })
        const responseDraft = prepareResponseDraft({
          ...defenceWithAmountClaimedAlreadyPaidDraft
        }, companyDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionFromStatesPaidDefence,
          ...{
            freeMediation: 'yes',
            mediationPhoneNumber: '07777777788',
            mediationContactPerson: 'Company Smith',
            noMediationReason: undefined
          }
        }, company)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(Response.deserialize(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(Response.deserialize(responseData))
      })

      it('should not convert payment declaration for defence with dispute', async () => {
        const responseDraft = prepareResponseDraft({
          ...defenceWithDisputeDraft,
          ...sampleMediationDraftObj,
          whenDidYouPay: {
            date: {
              year: 2017,
              month: 12,
              day: 31
            },
            text: 'I paid in cash'
          }
        }, individualDetails)
        const responseData = prepareResponseData({
          ...defenceWithDisputeData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)).to.deep.equal(responseData)
      })
    })

    context('full admission conversion', () => {
      it('should convert full admission paid immediately', async () => {
        const responseDraft = prepareResponseDraft(
          {
            ...fullAdmissionWithImmediatePaymentDraft,
            ...sampleMediationDraftObj
          }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithImmediatePaymentData(),
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission with title, firstName and lastName', async () => {
        const responseDraft = prepareResponseDraft(
          {
            ...fullAdmissionWithImmediatePaymentDraft,
            ...sampleMediationDraftObj
          }, individualSplitNameDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithImmediatePaymentData(),
          ...mediationResponseData
        }, individualDefendant)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by set date', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentBySetDateDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentBySetDateData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by set date with mandatory SoM only', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentBySetDateDraft,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsDraft },
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentBySetDateData,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsOnlyData },
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by instalments', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert full admission paid by instalments with complete SoM', async () => {
        const responseDraft = prepareResponseDraft({
          ...fullAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithAllFieldsDraft }
        }, individualDetails)
        const responseData = prepareResponseData({
          ...fullAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData,
          statementOfMeans: { ...statementOfMeansWithAllFieldsData }
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })
    })

    context('partial admission conversion', () => {
      it('should convert already paid partial admission', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionAlreadyPaidDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionAlreadyPaidData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid immediately', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithImmediatePaymentDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithImmediatePaymentData(),
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by set date', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentBySetDateDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentBySetDateData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by set date with mandatory SoM only', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentBySetDateDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsDraft }
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentBySetDateData,
          ...mediationResponseData,
          statementOfMeans: { ...statementOfMeansWithMandatoryFieldsOnlyData }
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by instalments', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission paid by instalments with complete SoM', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft,
          ...sampleMediationDraftObj,
          statementOfMeans: { ...statementOfMeansWithAllFieldsDraft }
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...mediationResponseData,
          statementOfMeans: { ...statementOfMeansWithAllFieldsData }
        }, individual)
        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission with Mediation canWeUse FreeMediation to NO', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...{
            freeMediation: 'no',
            mediationPhoneNumber: '07777777799'
          }
        }, individual)
        const mediationDraft = new MediationDraft().deserialize({
          canWeUse: {
            option: FreeMediationOption.NO,
            mediationPhoneNumber: '07777777799'
          }
        })

        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })

      it('should convert partial admission with Mediation canWeUse FreeMediation to YES and response not submitted', async () => {
        const responseDraft = prepareResponseDraft({
          ...partialAdmissionWithPaymentByInstalmentsDraft
        }, individualDetails)
        const responseData = preparePartialResponseData({
          ...partialAdmissionWithPaymentByInstalmentsData,
          ...{
            freeMediation: 'no',
            mediationContactPerson: undefined,
            mediationPhoneNumber: '0700000000',
            noMediationReason: undefined
          }
        }, individual)
        const mediationDraft = new MediationDraft().deserialize({
          canWeUse: {
            option: FreeMediationOption.YES
          }
        })

        const claim: Claim = new Claim().deserialize(claimStoreMock.sampleClaimObj)

        expect(convertObjectLiteralToJSON(await ResponseModelConverter.convert(responseDraft, mediationDraft, directionsQuestionnaireDraft, claim)))
          .to.deep.equal(convertObjectLiteralToJSON(responseData))
      })
    })
  }
})
