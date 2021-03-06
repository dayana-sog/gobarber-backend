import 'dotenv/config';

import express from 'express';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import sentryConfig from './config/sentry';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig); // Inicializar o sentry.

    this.middleware();
    this.routes();
    this.exceptionHandler();
  }

  middleware() {
    this.server.use(Sentry.Handlers.requestHandler()); // Utilizado antes dos middlewares(SENTRY)
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    ); // Serve para servir arquivos estáticos como imagens.
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler()); // Utilizado após as rotas (SENTRY)
  }

  exceptionHandler() {
    // Middleware de tratamento de erros.
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV) {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
