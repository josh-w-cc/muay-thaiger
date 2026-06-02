import {AsyncTask, SimpleIntervalJob, ToadScheduler} from 'toad-scheduler';
import fighterActionsModel from '../data/models/fighter-actions.js';
import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights.js';
import {applyOfflineTraining, syncPlayerState} from '../logic/player-state.js';

export function attachScheduler(app) {
  const connections = app.websocketConnections;
  const models = {fighterActions: fighterActionsModel(app.db), fighters: fightersModel(app.db), fights: app.fights || fightsModel(app.db)};
  const offlineTrainingScheduler = createOfflineTrainingScheduler(app.db, app.log);
  const stateSyncScheduler = createPlayerStateSyncScheduler(models, connections, app.log);

  app.addHook('onClose', () => {
    offlineTrainingScheduler.stop();
    stateSyncScheduler.stop();
  });
}

function createOfflineTrainingScheduler(db, logger) {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    'offline-apply-training',
    () => applyOfflineTraining(db),
    (error) => logger.error({err: error}, 'offline-apply-training failed'),
  );
  scheduler.addSimpleIntervalJob(new SimpleIntervalJob({hours: 1}, task));
  return scheduler;
}

function createPlayerStateSyncScheduler(models, connections, logger) {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    'sync-player-state',
    () => syncPlayerState(models, connections),
    (error) => logger.error({err: error}, 'sync-player-state failed'),
  );
  scheduler.addSimpleIntervalJob(new SimpleIntervalJob({minutes: 1}, task));
  return scheduler;
}
