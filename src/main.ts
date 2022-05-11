import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { PgClient } from './pg-client';
import { WatcherEvent } from './types';
import { isAuthorized } from './auth';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => res.send('OK'));

app.get('/sessions', isAuthorized, async (_, res) => {
  try {
    const sessionIds = await PgClient.query(`select distinct(session_id) from events`);
    res.json(sessionIds.map(({ session_id }) => session_id));
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

app.get('/events/:sessionId', isAuthorized, async (req, res) => {
  try {
    const events = await PgClient.query(
      `select * from events where session_id = $1 order by timestamp`,
      [req.params.sessionId],
    );
    res.json(events);
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

app.post('/events', async (req, res) => {
  try {
    const events = req.body as WatcherEvent[];
    const insertQueries = events.map(({ type, name, path, timestamp, sessionId, properties }) => ({
      query: `insert into events (type, name, path, timestamp, session_id, properties) values ($1, $2, $3, $4, $5, $6)`,
      args: [type, name, path, timestamp, sessionId, properties],
    }));
    await PgClient.transaction(insertQueries);
    res.json({ error: false, message: 'Events inserted' });
  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  module.exports.handler = serverless(app);
} else {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}
