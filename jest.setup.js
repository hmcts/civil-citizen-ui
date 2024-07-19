// jest.setup.js
afterEach(() => {
  if (global.gc) {
    global.gc();
  } else {
    console.warn('Garbage collection is not exposed. Run the test with `node --expose-gc`.');
  }
});
