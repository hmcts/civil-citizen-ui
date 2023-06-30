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
const storage = multer.memoryStorage({
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

const uploadFileController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

uploadFileController.post(CP_UPLOAD_FILE, upload.single('file'), async (req, res) => {
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
    res.status(500).json({
      errors: error.message,
    });
  }
});

export default uploadFileController;
