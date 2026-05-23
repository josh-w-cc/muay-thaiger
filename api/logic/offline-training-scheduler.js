import {AsyncTask, SimpleIntervalJob, ToadScheduler} from 'toad-scheduler';
import {applyOfflineTraining} from './player-state.js';

export function createOfflineTrainingScheduler(models, logger) {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    'offline-apply-training',
    () => applyOfflineTraining(models),
    (error) => logger.error({err: error}, 'offline-apply-training failed'),
  );
  scheduler.addSimpleIntervalJob(new SimpleIntervalJob({hours: 1}, task));
  return scheduler;
}
