
afterEach(() => {
  jest.resetModules();
  jest.clearAllTimers();
  jest.clearAllTimers();
});

afterAll(() => {
  if (global.gc) {
    global.gc();
  }
});
