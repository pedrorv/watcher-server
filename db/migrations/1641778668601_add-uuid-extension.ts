/* eslint-disable camelcase */
import { MigrationBuilder } from 'node-pg-migrate';

exports.shorthands = undefined;

exports.up = (pgm: MigrationBuilder) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });
};

exports.down = (pgm: MigrationBuilder) => {
  pgm.dropExtension('pgcrypto', { ifExists: true });
};
