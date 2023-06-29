import config from 'config';
import {Application} from 'express';
import {LoggerInstance} from 'winston';
import RedisStore from 'connect-redis';
import session from 'express-session';

const Redis = require('ioredis');
const cookieMaxAge = 21 * (60 * 1000); // 21 minutes
export class SessionStoreClient {
  public static ADD_SESSION_CONFIUGRATION_SUCCESFULY = 'Session configuration added successfully';
  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application, productionMode:boolean): void {
    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const connectionString = `${protocol}:${config.get('services.draftStore.redis.key')}@${config.get('services.session.redis.host')}:${config.get('services.session.redis.port')}`;
    const redisStore = new RedisStore({
      client: new Redis(connectionString),
      prefix: 'citizen-ui-session:',
      ttl: 86400, //prune expired entries every 24h
    });

    this.logger.info('Adding session configuration');

    app.use(session({
      name: 'citizen-ui-session',
      store: redisStore,
      secret: 'local',
      resave: false,
      saveUninitialized: false,
      cookie : {
        secure: productionMode,
        maxAge: cookieMaxAge,
        sameSite: 'lax',
      },
    }));
    this.logger.info(SessionStoreClient.ADD_SESSION_CONFIUGRATION_SUCCESFULY);
  }
}
