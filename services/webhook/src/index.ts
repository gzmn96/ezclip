import express from 'express';
import bodyParser from 'body-parser';
import { createHmac } from 'node:crypto';
import { parseStringPromise } from 'xml2js';
import { QUEUES, createLogger, createQueue, loadConfig, IngestJob, assertRequiredEnv } from '@ezclip/common';

const config = loadConfig();
assertRequiredEnv('REDIS_URL', config.redisUrl);
assertRequiredEnv('GCS_BUCKET', config.gcsBucket);
if (config.environment === 'prod') {
  assertRequiredEnv('YT_HUB_SECRET', config.ytHubSecret);
}
const logger = createLogger('webhook');
const ingestQueue = createQueue<IngestJob>(QUEUES.ingest);

const app = express();
app.use('/webhook/youtube', bodyParser.text({ type: '*/*' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/webhook/youtube', (req, res) => {
  const challenge = req.query['hub.challenge'];
  if (!challenge) {
    res.status(400).send('missing challenge');
    return;
  }
  res.send(String(challenge));
});

app.post('/webhook/youtube', async (req, res) => {
  const signature = req.get('x-hub-signature');
  if (!config.ytHubSecret) {
    logger.error('YT_HUB_SECRET not configured');
    res.status(500).json({ error: 'server not configured' });
    return;
  }

  if (!signature) {
    res.status(400).json({ error: 'missing signature' });
    return;
  }

  const hmac = createHmac('sha1', config.ytHubSecret);
  hmac.update(req.body ?? '');
  const expected = `sha1=${hmac.digest('hex')}`;
  if (signature !== expected) {
    logger.warn({ signature }, 'invalid signature');
    res.status(403).json({ error: 'invalid signature' });
    return;
  }

  const payload = await parseStringPromise(req.body);
  const videoId = payload?.feed?.['entry']?.[0]?.['yt:videoId']?.[0];
  if (!videoId) {
    res.status(400).json({ error: 'missing videoId' });
    return;
  }

  const job: IngestJob = { videoId };
  await ingestQueue.add('new-video', job, { jobId: `${videoId}:0` });
  logger.info({ videoId }, 'enqueued ingest job');
  res.status(202).json({ ok: true });
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  logger.info({ port }, 'webhook listening');
});
