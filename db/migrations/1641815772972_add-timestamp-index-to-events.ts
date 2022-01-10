/* eslint-disable camelcase */

import { MigrationBuilder } from 'node-pg-migrate';

exports.shorthands = undefined;

exports.up = (pgm: MigrationBuilder) => {
  pgm.createIndex('events', 'timestamp');
};

exports.down = (pgm: MigrationBuilder) => {
  pgm.dropIndex('events', 'timestamp');
};
