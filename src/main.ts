import express from 'express';
import cors from 'cors';
import { PgClient } from './pg-client';
import { WatcherEvent } from './types';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/sessions', async (_, res) => {
  try {
    const sessionIds = await PgClient.query(`select distinct(session_id) from events`);
    res.json(sessionIds.map(({ session_id }) => session_id));
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

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const gracefulShutdown = () => {
  const timeout: NodeJS.Timeout = setTimeout(() => process.exit(1), 10000);

  server.close(() => {
    clearTimeout(timeout);
    process.exit(0);
  });
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
