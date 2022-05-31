// import * as config from 'config';
// import {Blob} from 'buffer';
// const pdfParser = require('pdf-parse');
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ciivilServiceClient');

// const dmStoreBaseUrl = config.get('services.dmStore.url');
const dmStoreBaseUrl = 'http://localhost:4506';

export class DmStoreClient {
  client: AxiosInstance;

  constructor(baseURL = `${dmStoreBaseUrl}/documents`) {
    this.client = Axios.create({
      baseURL,
     
      responseType: 'blob', // or 'stream'
      // responseType: 'arraybuffer',
    });
  }

  getConfig(req: AppRequest) {
    // TODO : update here
    const serviceauth = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ4dWlfd2ViYXBwIiwiZXhwIjoxNjUzOTk2MzU0fQ.VMYiTk2CCRhSz5nrmWQijoFC7IAn0cIRYtx47ZWTICQztU9IU2Ju44FQv9H83gyQ3Z7DnhBJnXUawDRF8VUkHg';
    return {
      headers: {
        'Content-Type': 'application/pdf',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'serviceauthorization': `Bearer ${serviceauth}`,
        'user-id':'hmcts.civil+organisation.1.solicitor.1@gmail.com',
        // 'Authorization': `Bearer ${req.session?.user?.accessToken}`,
        'classification': 'PUBLIC',
        'user-roles': 'caseworker',
        
      },
      encoding: '',
    };
  }

  async retrieveDocumentByDocumentId(documentId: string, req: AppRequest): Promise<Blob> {
    const options = this.getConfig(req);
    debugger;
    try {
      const response: AxiosResponse<any> = await this.client.get(`http://localhost:4506/documents/${documentId}/binary`, options);// nosonar
      debugger;
      if (!response.data) {
        throw new AssertionError({message: 'Document is not available.'});
      }

      // pdfParser(response.data).then(function (data:any) {

        // number of pages
        // console.log(data.numpages);
        // number of rendered pages
        // console.log(data.numrender);
        // PDF info
        // console.log(data.info);
        // PDF metadata
        // console.log(data.metadata);
        // PDF.js version
        // check https://mozilla.github.io/pdf.js/getting_started/
        // console.log(data.version);
        // PDF text
        // console.log(data.text);

      // }).catch((err: any) => console.log('parser  err----', err));
      
      // const parsedPf = await pdfParser(response.data);
      // return parsedPf.text;


      // TODO : check what is return as response.data
      return response.data;
    } catch (err: unknown) {
      logger.error(err);
    }
  }

}

