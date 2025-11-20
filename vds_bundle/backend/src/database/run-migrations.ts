import dataSource from './typeorm.config';

async function runMigrations() {
  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    // eslint-disable-next-line no-console
    console.log('Migrations executed successfully');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed', error);
    process.exit(1);
  }
}

runMigrations();


