import {Router} from 'express';
import config from 'config';
import {CP_UPLOAD_FILE} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {t} from 'i18next';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'models/document/caseDocument';
import {AppRequest} from 'models/AppRequest';

const multer = require('multer');
const fileSize = Infinity;

const storage = multer.memoryStorage({
  limits: {
    fileSize: fileSize,
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSize,
  },
});

const uploadFileController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

const UNKNOWN_ERROR = 'unknown error';

uploadFileController.post(CP_UPLOAD_FILE, upload.single('file'), (req, res) => {
  (async () => {
    try {
      const uploadDocumentsForm = TypeOfDocumentSectionMapper.mapToSingleFile(req);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;

      const form = new GenericForm(uploadDocumentsForm);
      form.validateSync();
      if (form.hasErrors()) {
        res.status(400).json({
          errors: form.getAllErrors().map(error => t(error.text, lang)),
        });

      } else {
        const document: CaseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, uploadDocumentsForm);
        res.status(200).json(document);
      }
    } catch (error) {
      if (error.response) {
        let errorMessage = Buffer.from(error.response.data).toString('utf-8');
        errorMessage = errorMessage === '' ? UNKNOWN_ERROR : errorMessage;
        res.status(error.response.status).json({
          errors: [errorMessage],
        });
      } else {
        res.status(500).json({
          errors: [error.message],
        });
      }
    }
  })();
});

export default uploadFileController;
