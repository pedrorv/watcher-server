import express from 'express';
import cors from 'cors';
import { PgClient } from './pg-client';
import { WatcherEvent } from './types';
import { isAuthorized } from './auth';
import { gzip } from './gzip';

const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(gzip);

app.get('/healthcheck', (_, res) => res.send('OK'));

app.get('/authorized', isAuthorized, (_, res) => res.send('OK'));

app.get('/sessions/:appId', isAuthorized, async (req, res) => {
  try {
    const sessions = await PgClient.query(
      `
        select session_id, timestamp
        from (
          select session_id, max(timestamp) as timestamp
          from events
          where app_id = $1
          group by session_id
        ) as subquery
        order by timestamp desc
      `,
      [req.params.appId],
    );
    res.json(sessions.map((s: any) => ({ id: s.session_id, lastEventTimestamp: +s.timestamp })));
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

app.get('/events/:sessionId', async (req, res) => {
  try {
    const events = await PgClient.query(
      `select * from events where session_id = $1 order by timestamp`,
      [req.params.sessionId],
    );
    res.json(events.map((e: WatcherEvent) => ({ ...e, timestamp: +e.timestamp })));
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

app.post('/events', async (req, res) => {
  try {
    const events = (Array.isArray(req.body) ? req.body : [req.body]) as WatcherEvent[];
    const insertQueries = events.map(
      ({ type, name, path, uniqueSelector, timestamp, sessionId, properties, appId }) => ({
        query: `insert into events (type, name, path, unique_selector, timestamp, session_id, properties, app_id) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        args: [type, name, path, uniqueSelector, timestamp, sessionId, properties, appId],
      }),
    );
    await PgClient.transaction(insertQueries);
    res.json({ error: false, message: 'Events inserted' });
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

app.delete('/events/:sessionId', isAuthorized, async (req, res) => {
  try {
    await PgClient.query(`delete from events where session_id = $1 `, [req.params.sessionId]);
    res.json({ error: false, message: 'Events deleted' });
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

export { app };
