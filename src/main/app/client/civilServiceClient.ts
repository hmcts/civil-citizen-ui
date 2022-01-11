const axios = require('axios').default;
export const civilServiceApiBaseUrl = 'http://localhost:8765/cases';
// axios.defaults.baseURL = civilServiceApiBaseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';

export class CivilServiceClient {

  retrieveByDefendantId(): object[] {

    axios.get(civilServiceApiBaseUrl)
      .then((response: any) => console.log(response.data));
    return [{}];
  }
}
