const defaultMockedBehaviour = {
  connect: jest.fn(async () => ''),
  ping: jest.fn(async () => 'PONG'),
  on: jest.fn(async () => ''),
};

export function mockCreateClient(importedCreateClientFunction: (...args: unknown[]) => unknown, mockedBehaviour: object = defaultMockedBehaviour): void {
  const mockedCreateClient = importedCreateClientFunction as jest.MockedFunction<(...args: unknown[]) => unknown>;
  if (mockedBehaviour) {
    mockedCreateClient.mockReturnValue(mockedBehaviour);
  } else {
    mockedCreateClient.mockReturnValue(defaultMockedBehaviour);
  }
}
