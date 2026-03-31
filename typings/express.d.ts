import 'express';
import { Request } from 'express';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
    
    // Extend Request to include locals for compatibility
    interface Request {
      locals?: {
        env?: string;
        lang?: string;
        [key: string]: any;
      };
    }
  }
}

// Override Express 5 types to maintain backward compatibility with Express 4 behavior
// In Express 5, req.params and req.query return string | string[], but this codebase
// was written for Express 4 where they returned string
declare module 'express-serve-static-core' {
  interface ParamsDictionary {
    [key: string]: string;
  }
  
  interface Query {
    [key: string]: string | undefined;
  }
}
