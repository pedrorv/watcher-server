/* eslint-disable camelcase */

import { MigrationBuilder } from 'node-pg-migrate';

exports.shorthands = undefined;

exports.up = (pgm: MigrationBuilder) => {
  pgm.createIndex('events', 'app_id');
};

exports.down = (pgm: MigrationBuilder) => {
  pgm.dropIndex('events', 'app_id');
};
