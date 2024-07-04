import {Response, NextFunction} from 'express';
import {trackHistory} from 'routes/guards/trackHistory';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Track History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do not save url when url is undefined', async () => {
    //When
    await trackHistory(undefined, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });

  it('should track history when url is given', async () => {
    //Given
    const MOCK_REQUEST = {
      originalUrl: '/test/test',
      session: {
        history: [],
      },
    }as unknown as AppRequest;

    //When
    await trackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_REQUEST.session.history).toEqual(Array.of('/test/test'));
  });

  it('should do not store history when the url is the same of /back', async () => {
    //Given
    const MOCK_REQUEST = {
      originalUrl: '/back',
      session: {
        history: [],
      },
    }as unknown as AppRequest;

    //When
    await trackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_REQUEST.session.history.length).toEqual(0);
  });

  it('should create a new array when session is undefined', async () => {
    //Given
    const MOCK_REQUEST = {
      originalUrl: '/test/test',
      session: {},
    }as unknown as AppRequest;

    //When
    await trackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_REQUEST.session.history).toEqual(Array.of('/test/test'));
  });

  it('should remove the question mark with lang is set on url ', async () => {
    //Given
    const MOCK_REQUEST = {
      originalUrl: '/test/test?lang=en',
      session: {},
    }as unknown as AppRequest;

    //When
    await trackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_REQUEST.session.history).toEqual(Array.of('/test/test?lang=en'));
  });

});
