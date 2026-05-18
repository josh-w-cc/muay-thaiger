import {AsyncTask, SimpleIntervalJob, ToadScheduler} from 'toad-scheduler';

import charactersModel from '../data/models/characters.js';
import webhooksModel from '../data/models/webhooks.js';

const SYNC_PLAYER_STATE_JOB = 'sync-player-state';


export default async function syncPlayerState(app) {
  const characters = charactersModel(app.db);
  const webhooks = webhooksModel(app.db);
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    SYNC_PLAYER_STATE_JOB,
    () => syncActiveWebhooks({characters, webhooks}),
    (error) => app.log.error(error),
  );
  const job = new SimpleIntervalJob({minutes: 1}, task, {id: SYNC_PLAYER_STATE_JOB});
  scheduler.addSimpleIntervalJob(job);
  app.addHook('onClose', () => scheduler.stop());
}

export async function syncActiveWebhooks({characters, webhooks}, send = fetch) {
  const activeWebhooks = await webhooks.listActive();

  for(const webhook of activeWebhooks) {
    const character = await characters.findCurrentByPlayerID(webhook.player_id);
    if(!character) {
      continue;
    }
    await send(webhook.url, {
      body: JSON.stringify({character, player_id: webhook.player_id, type: 'player-state-sync'}),
      headers: {'content-type': 'application/json'},
      method: 'POST',
    });
  }
}
