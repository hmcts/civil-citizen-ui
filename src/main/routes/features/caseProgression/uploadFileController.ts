import {Router} from 'express';
import {CP_UPLOAD_FILE} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {EvidenceUploadWitness} from 'models/document/documentType';
import {t} from 'i18next';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const uploadFileController = Router();

uploadFileController.post(CP_UPLOAD_FILE, upload.single('file'), (req, res) => {
  try {
    //const claimId = req.params.id;
    const uploadDocumentsForm = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;

    const form = new GenericForm(uploadDocumentsForm);
    form.validateSync();
    if (form.hasErrors()) {
      //await renderView(res, claimId, form);
      res.status(400).json({
        errors: form.getAllErrors().map(error => t(error.text, lang)),
      });

    } else {
      //todo: save to redis
      //todo: next page (cancel page or continue page)
      //await renderView(res, claimId, form);
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
    res.status(500).json({
      errors: 'form.errors',
    });
  }
});

export default uploadFileController;
