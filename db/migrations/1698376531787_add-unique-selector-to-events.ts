/* eslint-disable camelcase */

import { MigrationBuilder } from 'node-pg-migrate';

exports.shorthands = undefined;

exports.up = (pgm: MigrationBuilder) => {
  pgm.addColumn('events', {
    unique_selector: {
      type: 'varchar',
    },
  });
};

exports.down = (pgm: MigrationBuilder) => {
  pgm.dropColumn('events', 'unique_selector');
};
