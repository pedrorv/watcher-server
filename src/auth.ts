import express from 'express';

export const isAuthorized = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): Promise<void> => {
  if (req.headers['auth-token'] === process.env.AUTH_TOKEN) next();
  else res.status(403).send('Unauthorized');
};
