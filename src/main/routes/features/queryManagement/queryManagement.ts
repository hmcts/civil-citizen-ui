import {NextFunction, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimUpdate} from 'models/events/eventDto';
import {CaseMessage, CaseQueries, FormDocument} from 'models/queryManagement/caseQueries';
import {Claim} from 'models/claim';
import {v4 as uuidv4} from 'uuid';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {CaseDocument} from 'models/document/caseDocument';

const queryManagementController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const multer = require('multer');
const fileSize = Infinity;

const storage = multer.memoryStorage({
  limits: {
    fileSize: fileSize,
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSize,
  },
});

queryManagementController.get('/:claimId/create-query', (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.claimId;
  res.render('features/queryManagement/createQuery', {claimId});
}));

queryManagementController.post('/:claimId/create-query', upload.single('queryFileUpload'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.claimId;
  const body = req.body;
  const date = new Date();
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  let queryObj = {} as unknown as CaseQueries;
  let fileObject = {} as unknown as FormDocument;
  if (req.file) {
    fileObject = await handleFileUpload(req);
  }
  if (isClaimant(claim)) {
    if (claim.qmApplicantCitizenQueries) {
      queryObj = claim.qmApplicantCitizenQueries;
    } else {
      queryObj.roleOnCase = 'leader';
      queryObj.partyName = 'bob smith';
      queryObj.caseMessages = [];
    }
  } else {
    if (claim.qmRespondentCitizenQueries) {
      queryObj = claim.qmRespondentCitizenQueries;
    } else {
      queryObj.roleOnCase = 'leader';
      queryObj.partyName = 'bob smith';
      queryObj.caseMessages = [];
    }
  }

  queryObj.caseMessages.push({
    id: uuidv4().toString(), value: {
      id: uuidv4().toString(),
      subject: body['query-subject-input-name'],
      name: 'Bob',
      body: body['query-details-input-name'],
      isHearingRelated: YesNoUpperCamelCase.NO,
      createdOn: date.toISOString(),
      createdBy: uuidv4().toString(),
      attachments: [fileObject],
    },
  });
  let data = {};
  if (isClaimant(claim)) {
    data = {'qmApplicantCitizenQueries': {...queryObj}};
  } else {
    data = {'qmRespondentCitizenQueries': {...queryObj}};
  }
  await civilServiceClient.submitQueryManagementRaiseQuery(claimId, data as ClaimUpdate, req);
  res.redirect('/dashboard');
}));

queryManagementController.get('/:claimId/view-queries', (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.claimId;
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);

  let queries: CaseQueries;
  if (isClaimant(claim)) {
    queries = claim.qmApplicantCitizenQueries;
  } else {
    queries = claim.qmRespondentCitizenQueries;
  }

  const ogQueries: QueryThread[] = [];

  for (const caseMessage of queries.caseMessages) {
    if (!caseMessage.value.parentId) {
      const entry: QueryThread = {
        parentQuery: caseMessage.value,
        responses: [],
        hasBeenResponded: false,
      };
      ogQueries.push(entry);
    }
  }
  for (const caseMessage of queries.caseMessages) {
    if (caseMessage.value.parentId) {
      ogQueries.find((item) => {
        if (item.parentQuery.id === caseMessage.value.parentId) {
          item.responses.push(caseMessage.value);
        }
      });
    }
  }

  ogQueries.forEach((entry: QueryThread) => {
    entry.hasBeenResponded = hasBeenRespondedTo(entry);
  });

  res.render('features/queryManagement/viewQueries', {claimId, ogQueries});
}));

queryManagementController.get('/:claimId/view-queries/:queryId', (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.claimId;
  const queryId = req.params.queryId;
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);

  let queries: CaseQueries;
  if (isClaimant(claim)) {
    queries = claim.qmApplicantCitizenQueries;
  } else {
    queries = claim.qmRespondentCitizenQueries;
  }

  const ogQueries: QueryThread[] = [];

  for (const caseMessage of queries.caseMessages) {
    if (!caseMessage.value.parentId) {
      const entry: QueryThread = {
        parentQuery: caseMessage.value,
        responses: [],
        hasBeenResponded: false,
      };
      ogQueries.push(entry);
    }
  }
  for (const caseMessage of queries.caseMessages) {
    if (caseMessage.value.parentId) {
      ogQueries.find((item) => {
        if (item.parentQuery.id === caseMessage.value.parentId) {
          item.responses.push(caseMessage.value);
        }
      });
    }
  }

  const query = ogQueries.find((item) => item.parentQuery.id === queryId);

  res.render('features/queryManagement/viewQueryThread', {claimId, query});
}));

const isClaimant = (claim: Claim): boolean => {
  return claim.caseRole.includes('CLAIMANT');
};

class QueryThread {
  parentQuery: CaseMessage;
  responses: CaseMessage[];
  hasBeenResponded = false;
}

const hasBeenRespondedTo = (query: QueryThread) => {
  if (query.responses.length === 0) {
    return false;
  }

  let latestDate = query.responses[0];

  for (const item of query.responses) {
    if (new Date(item.createdOn) > new Date(latestDate.createdOn)) {
      latestDate = item;
    }
  }

  return latestDate.name !== query.parentQuery.name;
};

const handleFileUpload = (async (req: AppRequest): Promise<FormDocument> => {
  const uploadDocumentForm = TypeOfDocumentSectionMapper.mapToSingleFile(req);
  const returnedDoc: CaseDocument = await civilServiceClient.uploadDocument(req, uploadDocumentForm);

  return {
    id: uuidv4(),
    value: returnedDoc.documentLink,
  };
});

export default queryManagementController;
