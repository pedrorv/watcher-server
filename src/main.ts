import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.send('OK'));

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
