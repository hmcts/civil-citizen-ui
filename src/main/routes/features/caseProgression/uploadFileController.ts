import {Router} from 'express';
import {CP_UPLOAD_FILE} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {EvidenceUploadWitness} from 'models/document/documentType';
import {t} from 'i18next';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadFileController');

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

uploadFileController.post(CP_UPLOAD_FILE, upload.single('file'), (req, res) => {
  logger.info('uploadFileController ' + req);

  try {
    const uploadDocumentsForm = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    logger.info('after mapToSingleFile ' + req);

    const lang = req.query.lang ? req.query.lang : req.cookies.lang;

    const form = new GenericForm(uploadDocumentsForm);
    form.validateSync();
    if (form.hasErrors()) {
      res.status(400).json({
        errors: form.getAllErrors().map(error => t(error.text, lang)),
      });

    } else {

      const document = {
        createdBy: 'test',
        documentLink: {
          document_url: 'test',
          document_filename: 'test',
          document_binary_url: 'test',
        },
        documentName: 'test',
        documentType: EvidenceUploadWitness,
        documentSize: '123',
        createdDatetime: Date.now(),
      };
      res.status(200).json({
        document: document,
      });
    }
  } catch (error) {
    logger.info('catch error ' + error);

    res.status(500).json({
      errors: error.message,
    });
  }
});

export default uploadFileController;
