/**
 * Sets up a spy on the given service function call and automatically resets the mock, clearing any previously configured
 * returns and clears any previous call history.
 *
 * @param service the service to be mocked
 * @param methodName the name of the method to be mocked
 */
export const configureSpy = (service: any, methodName: string) => jest.spyOn(service, methodName).mockReset();
