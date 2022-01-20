import * as express from 'express';
// import { Claim } from 'app/claims/models/claim';
// import { Draft } from '@hmcts/draft-store-client';
// import { PartyDetails } from 'app/forms/models/partyDetails';
import * as path from 'path';

//import { AuthorizationMiddleware } from '../../app/idam/authorizationMiddleware';
import { FullAdmissionPaths, PartAdmissionPaths, StatementOfMeansPaths } from './path';
import { RouterFinder } from '../../common/router/routerFinder';
import { ResponseType } from '../../app/claims/models/response/responseType';
import { DefenceType } from '../../app/claims/models/response/defenceType';
import { PaymentOption } from '../../app/claims/models/paymentOption';
import { PaymentSchedule } from '../../app/claims/models/response/core/paymentSchedule';
import { FreeMediationOption } from '../../app/forms/models/freeMediation';
// import { ResponseGuard } from '../../features/response/guards/responseGuard';
// import { ClaimMiddleware } from 'app/claims/claimMiddleware';
// import { DraftMiddleware } from '@hmcts/cmc-draft-store-middleware';
// import { DraftService } from 'services/draftService';
// import { ResponseDraft } from '../../features/response/draft/responseDraft';
// import { CountyCourtJudgmentRequestedGuard } from 'features/response/guards/countyCourtJudgmentRequestedGuard';
// import { OnlyClaimantLinkedToClaimCanDoIt } from '../../app/guards/onlyClaimantLinkedToClaimCanDoIt';
// import { OnlyDefendantLinkedToClaimCanDoIt } from '../../app/guards/onlyDefendantLinkedToClaimCanDoIt';
//import { OAuthHelper } from '../../app/idam/oAuthHelper';
// import { MediationDraft } from '../../features/mediation/draft/mediationDraft';
// import { DirectionsQuestionnaireDraft } from 'features/directions-questionnaire/draft/directionsQuestionnaireDraft';
// import { PartyType } from '../../app/common/partyType';
// import { IndividualDetails } from '../../app/forms/models/individualDetails';
// import { SoleTraderDetails } from '../../app/forms/models/soleTraderDetails';
// import { CompanyDetails } from '../../app/forms/models/companyDetails';
// import { OrganisationDetails } from '../../app/forms/models/organisationDetails';
// import { AlreadyPaidInFullGuard } from '../../app/guards/alreadyPaidInFullGuard';
import { ResponseMethod } from '../../app/claims/models/response/responseMethod';

// function defendantResponseRequestHandler (): express.RequestHandler {
//   function accessDeniedCallback (req: express.Request, res: express.Response): void {
//     res.redirect(OAuthHelper.forLogin(req, res));
//   }

//   const requiredRoles = [
//     'citizen',
//   ];
//   const unprotectedPaths:[] = [];
//   return AuthorizationMiddleware.requestHandler(requiredRoles, accessDeniedCallback, unprotectedPaths);
// }

// function deserializeFn (value: any): PartyDetails {
//   switch (value.type) {
//     case PartyType.INDIVIDUAL.value:
//       return IndividualDetails.fromObject(value);
//     case PartyType.SOLE_TRADER_OR_SELF_EMPLOYED.value:
//       return SoleTraderDetails.fromObject(value);
//     case PartyType.COMPANY.value:
//       return CompanyDetails.fromObject(value);
//     case PartyType.ORGANISATION.value:
//       return OrganisationDetails.fromObject(value);
//     default:
//       throw new Error(`Unknown party type: ${value.type}`);
//   }
// }

// function initiatePartyFromClaimHandler (req: express.Request, res: express.Response, next: express.NextFunction) {
//   const draft: Draft<ResponseDraft> = res.locals.responseDraft;
//   if (!draft.document.defendantDetails.partyDetails) {
//     const claim: Claim = res.locals.claim;
//     draft.document.defendantDetails.partyDetails = deserializeFn(claim.claimData.defendant);
//   }
//   next();
// }

export class Feature {
  enableFor (app: express.Express) {
    if (app.settings.nunjucksEnv && app.settings.nunjucksEnv.globals) {
      app.settings.nunjucksEnv.globals.FullAdmissionPaths = FullAdmissionPaths;
      app.settings.nunjucksEnv.globals.PartAdmissionPaths = PartAdmissionPaths;
      app.settings.nunjucksEnv.globals.StatementOfMeansPaths = StatementOfMeansPaths;
      app.settings.nunjucksEnv.globals.DefenceType = DefenceType;
      app.settings.nunjucksEnv.globals.FreeMediationOption = FreeMediationOption;
      app.settings.nunjucksEnv.globals.domain = {
        ResponseType: ResponseType,
        ResponseMethod: ResponseMethod,
        PaymentOption: PaymentOption,
        PaymentSchedule: PaymentSchedule,
      };
    }

    const allResponseRoutes = '/case/*/response/*';

    app.all(allResponseRoutes); // defendantResponseRequestHandler()
    //app.all(allResponseRoutes, ClaimMiddleware.retrieveByExternalId);
    app.all(/^\/case\/.+\/response\/(?!receipt|summary|claim-details|scanned-response-form).*$/); // , OnlyDefendantLinkedToClaimCanDoIt.check()
    // app.all(allResponseRoutes, AlreadyPaidInFullGuard.requestHandler);
    // app.all(
    //   /^\/case\/.+\/response\/(?!confirmation|counter-claim|receipt|summary|claim-details|scanned-response-form).*$/,
    //   ResponseGuard.checkResponseDoesNotExist(),
    // );
    // app.all('/case/*/response/summary', OnlyClaimantLinkedToClaimCanDoIt.check(), ResponseGuard.checkResponseExists());
    // app.all(/^\/case\/.*\/response\/(?!claim-details|receipt).*$/, CountyCourtJudgmentRequestedGuard.requestHandler);
    // app.all(/^\/case\/.+\/response\/(?!confirmation|receipt|summary).*$/,
    //   DraftMiddleware.requestHandler(new DraftService(), 'response', 100, (value: any): ResponseDraft => {
    //     return new ResponseDraft().deserialize(value);
    //   }),
    //   (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //     res.locals.draft = res.locals.responseDraft;
    //     next();
    //   },
    //   initiatePartyFromClaimHandler,
    // );
    // app.all(/^\/case\/.+\/response\/(?!confirmation|receipt|summary).*$/,
    //   DraftMiddleware.requestHandler(new DraftService(), 'mediation', 100, (value: any): MediationDraft => {
    //     return new MediationDraft().deserialize(value);
    //   }));
    // app.all(/^\/case\/.+\/response\/task-list|check-and-send|incomplete-submission.*$/,
    //   DraftMiddleware.requestHandler(new DraftService(), 'directionsQuestionnaire', 100, (value: any): DirectionsQuestionnaireDraft => {
    //     return new DirectionsQuestionnaireDraft().deserialize(value);
    //   }));
    app.use('/', RouterFinder.findAll(path.join(__dirname, 'routes')));
  }
}
