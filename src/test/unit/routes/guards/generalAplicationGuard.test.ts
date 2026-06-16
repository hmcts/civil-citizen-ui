import {Request, Response} from 'express';
import {isGAForLiPEnabled} from 'routes/guards/generalAplicationGuard';

describe('GAFlagGuard', () => {
  it('should call next', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn();

    await isGAForLiPEnabled(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
