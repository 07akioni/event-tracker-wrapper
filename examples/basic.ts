import { ilw } from '../src'

type Events = {
  aaa: { value: number },
  bbb: { value: string }
}

const logger = ilw<unknown, Events>({
  onLog(level, messages, { meta, persist, report, type }) {
    console[level]({ meta, persist, report, type }, ...messages);
  },
});

logger.persist.info()
logger.meta({ key: 'value' }).error()
logger.report.info()
logger.report.event.info('aaa', { value: 123 })

const persistLogger = logger.persist
persistLogger.info()
