import { ilw } from '../src'

const logger = ilw({
  onLog(level, messages, { meta, persist, report, type }) {
    console[level]({ meta, persist, report, type }, ...messages);
  },
});

logger.persist.info()
logger.meta({ key: 'value' }).error()
logger.report.info()
logger.report.event.info('name', {})

const persistLogger = logger.persist
persistLogger.info()