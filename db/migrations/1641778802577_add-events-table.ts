/* eslint-disable camelcase */

import { MigrationBuilder } from 'node-pg-migrate';

exports.shorthands = undefined;

exports.up = (pgm: MigrationBuilder) => {
  pgm.createTable('events', {
    id: {
      type: 'uuid',
      default: pgm.func('gen_random_uuid()'),
      primaryKey: true,
    },
    type: {
      type: 'varchar',
      notNull: true,
    },
    name: {
      type: 'varchar',
      notNull: true,
    },
    path: {
      type: 'varchar',
      notNull: true,
    },
    timestamp: {
      type: 'bigint',
      notNull: true,
    },
    session_id: {
      type: 'uuid',
      notNull: true,
    },
    properties: {
      type: 'jsonb',
      notNull: true,
    },
  });
};

exports.down = (pgm: MigrationBuilder) => {
  pgm.dropTable('events');
};
