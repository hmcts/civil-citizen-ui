jest.mock('webpack', () => jest.fn(() => ({name: 'compiler'})));
jest.mock('webpack-dev-middleware', () => jest.fn(() => 'dev-middleware'));
jest.mock('../../../webpack.config.js', () => ({mode: 'development'}));

import webpack from 'webpack';
import webpackDev from 'webpack-dev-middleware';

const {setupDev} = require('../../main/development');

describe('setupDev', () => {
  it('leaves the app unchanged outside development mode', () => {
    const app = {use: jest.fn()};

    setupDev(app, false);

    expect(app.use).not.toHaveBeenCalled();
  });

  it('mounts webpack dev middleware in development mode', () => {
    const app = {use: jest.fn()};

    setupDev(app, true);

    expect(webpack).toHaveBeenCalledWith({mode: 'development'});
    expect(webpackDev).toHaveBeenCalledWith({name: 'compiler'}, {publicPath: '/'});
    expect(app.use).toHaveBeenCalledWith('dev-middleware');
  });
});
