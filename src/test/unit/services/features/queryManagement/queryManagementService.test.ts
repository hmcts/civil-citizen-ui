import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  deleteQueryManagement,
  getCancelUrl,
  getCaption,
  getQueryManagement, removeSelectedDocument,
  saveQueryManagement, updateQueryManagementDashboardItems, uploadSelectedFile,
} from 'services/features/queryManagement/queryManagementService';
import { QueryManagement, WhatDoYouWantToDo, WhatToDoTypeOption } from 'form/models/queryManagement/queryManagement';
import express from 'express';
import * as utilityService from 'modules/utilityService';
import { Claim } from 'models/claim';
import { DashboardTaskList } from 'models/dashboard/taskList/dashboardTaskList';
import { Dashboard } from 'models/dashboard/dashboard';
import { CaseRole } from 'form/models/caseRoles';
import { DashboardTask } from 'models/dashboard/taskList/dashboardTask';
import { AppRequest } from 'models/AppRequest';
import { CaseDocument } from 'models/document/caseDocument';
import { CivilServiceClient } from 'client/civilServiceClient';
import { TypeOfDocumentSectionMapper } from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import { CreateQuery, UploadQMAdditionalFile } from 'models/queryManagement/createQuery';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');

const mockExpectedDashboardInfo =
  [{
    'categoryEn': 'Hearing',
    'categoryCy': 'Hearing Welsh',
    tasks: [{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }, {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }],
  }, {
    'categoryEn': 'Applications',
    'categoryCy': 'Applications Welsh',
    tasks: [{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'Contact the court to request a change to my case',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    },
    {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'task_name_en2',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    }] as DashboardTask[],
  }] as DashboardTaskList[];
const req = { params: { id: '123' } } as unknown as express.Request;
const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('dashboard items update', () => {
  const exclusionTask = new DashboardTaskList('Applications', 'Applications', []);
  const dashboard = new Dashboard(mockExpectedDashboardInfo);
  const claim = new Claim();

  it('should update the header when exclusion matches', () => {
    claim.caseRole = CaseRole.CLAIMANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[0].categoryEn).toEqual('Hearing');
    expect(dashboard.items[1].categoryEn).toEqual('COMMON.QUERY_MANAGEMENT_DASHBOARD.APPLICATION_HEADING');
  });

  it('should update the tasks for GA and messages', () => {
    claim.caseRole = CaseRole.CLAIMANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[1].tasks[0].taskNameEn).toEqual('COMMON.QUERY_MANAGEMENT_DASHBOARD.APPLICATIONS_TASK');
    expect(dashboard.items[1].tasks[1].taskNameEn).toEqual('COMMON.QUERY_MANAGEMENT_DASHBOARD.VIEW_MESSAGES_TASK');
  });

  it('should update the task status if no queries exist for claimant', () => {
    claim.caseRole = CaseRole.CLAIMANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[1].tasks[1].statusEn).toEqual('PAGES.TASK_LIST.NOT_AVAILABLE_YET');
  });

  it('should update the task status if no queries exist for defendant', () => {
    claim.caseRole = CaseRole.DEFENDANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[1].tasks[1].statusEn).toEqual('PAGES.TASK_LIST.NOT_AVAILABLE_YET');
  });
});
describe('save queryManagement data', () => {
  it('should save data successfully when query management not exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('123');
    mockGetClaimById.mockImplementation(async () => {
      return new Claim();
    });
    //when
    await saveQueryManagement('1', new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE), 'whatDoYouWantToDo', req);
    //then
    expect(spySave).toBeCalledWith('123', claimExpected);

  });

  it('should save data successfully when query management exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('1234');
    mockGetClaimById.mockImplementation(async () => {
      return claimExpected;
    });
    //when
    await saveQueryManagement('1', new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE), 'whatDoYouWantToDo', req);
    //then
    expect(spySave).toBeCalledWith('1234', claimExpected);

  });

  it('should remove data successfully when query management exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    const spyDelete = jest.spyOn(draftStoreService, 'deleteFieldDraftClaimFromStore');
    mockGetClaimById.mockImplementation(async () => {
      return claimExpected;
    });
    //when
    await deleteQueryManagement('1', req);
    //then
    expect(spyDelete).toBeCalledTimes(1);

  });
});

describe('get queryManagement', () => {
  it('should get data successfully when query management not exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    mockGetClaimById.mockImplementation(async () => {
      return new Claim();
    });
    //when
    const result = await getQueryManagement('1', req);
    //then
    expect(result).toEqual(new QueryManagement());

  });

  it('should get data successfully when query management exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    mockGetClaimById.mockImplementation(async () => {
      return claimExpected;
    });
    //when
    const result = await getQueryManagement('1', req);
    //then
    expect(result).toEqual(claimExpected.queryManagement);

  });

});

describe('get CancelUrl', () => {
  it('get cancel url', async () => {
    //when
    const result = getCancelUrl('1');
    //then
    expect(result).toEqual('/case/1/queryManagement/cancel');

  });

});

describe('get Caption', () => {
  it('get caption GET_UPDATE', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.GET_UPDATE);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.GET_UPDATE');

  });

  it('get caption SEND_UPDATE', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.SEND_UPDATE);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.SEND_UPDATE');

  });

  it('get caption SEND_DOCUMENTS', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.SEND_DOCUMENTS);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.SEND_DOCUMENTS');

  });

  it('get caption SOLVE_PROBLEM', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.SOLVE_PROBLEM);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.SOLVE_PROBLEM');

  });

  it('get caption MANAGE_HEARING', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.MANAGE_HEARING);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.MANAGE_HEARING');

  });
});

describe('Uploading files', () => {
  const mockKey = 'testKey';
  const appRequest: AppRequest = {
    params: { id: '1', appId: '89' },
  } as unknown as AppRequest;

  const returnedFile: CaseDocument = {
    createdBy: 'test',
    documentLink: { 'document_binary_url': '', 'document_filename': '', 'document_url': '' },
    documentName: 'name',
    documentType: null,
    documentSize: 12345,
    createdDatetime: '2025-03-27T17:02:09.858Z' as unknown as Date,
  };
  const draftStoreGetFilesMock = jest.spyOn(draftStoreService, 'getQueryFilesFromRedis');
  beforeEach(() => {
    jest.resetAllMocks();
    const fileToUpload = {
      fieldname: 'test',
      originalname: 'test',
      mimetype: 'text/plain',
      size: 123,
      buffer: Buffer.from('test'),
    };
    jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(returnedFile);
    jest.spyOn(draftStoreService, 'generateRedisKeyForFile').mockReturnValue(mockKey);
    draftStoreGetFilesMock.mockResolvedValue([]);
    jest.spyOn(TypeOfDocumentSectionMapper, 'mapToSingleFile').mockReturnValue(fileToUpload);
  });

  it('should return the form with updated summary rows and call save doc to redis', async () => {
    const createQuery = new CreateQuery();
    const saveSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('123');

    mockGetClaimById.mockImplementation(async () => {
      return new Claim();
    });
    await uploadSelectedFile(appRequest, createQuery);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should return the form and not save doc if file has errors', async () => {
    const createQuery = new CreateQuery();
    const appRequest: AppRequest = {
      params: { id: '1', appId: '89' },
      session: {
        fileUpload: undefined,
      },
    } as unknown as AppRequest;
    jest.spyOn(TypeOfDocumentSectionMapper, 'mapToSingleFile').mockReturnValue(undefined);
    mockGetClaimById.mockImplementation(async () => {
      return new Claim();
    });
    const saveSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('123');
    await uploadSelectedFile(appRequest, createQuery);
    expect(saveSpy).toBeCalled();
    expect(appRequest.session.fileUpload).toBeDefined();
  });

  it('should remove selected file and save the new list to redis', async () => {
    const claim = new Claim();
    claim.queryManagement = new QueryManagement();
    claim.queryManagement.createQuery = new CreateQuery();
    claim.queryManagement.createQuery.uploadedFiles = [{
      'caseDocument': {
        'createdBy': 'test',
        'createdDatetime': '2025-03-27T17:02:09.858Z',
        'documentLink': {
          'document_binary_url': '',
          'document_filename': '',
          'document_url': '',
        },
        'documentName': 'name',
        'documentSize': 12345,
        'documentType': null,
      },
      'fileUpload': {
        'buffer': {
          'data': [
            116,
            101,
            115,
            116,
          ],
          'type': 'Buffer',
        },
        'fieldname': 'test',
        'mimetype': 'text/plain',
        'originalname': 'test',
        'size': 123,
      },
    } as unknown as UploadQMAdditionalFile];
    mockGetClaimById.mockImplementation(async () => {
      return claim;
    });
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('1234');
    const saveSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');
    const appRequest: AppRequest = {
      params: { id: '1234', appId: '896' },
      session: {
        fileUpload: undefined,
      },
    } as unknown as AppRequest;
    await removeSelectedDocument(appRequest, 0);
    expect(claim.queryManagement.createQuery.uploadedFiles.length).toBe(0);
    expect(saveSpy).toBeCalledWith('1234', claim);
  });
});

