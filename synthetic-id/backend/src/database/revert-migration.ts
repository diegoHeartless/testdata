import dataSource from './typeorm.config';

async function revertMigration() {
  try {
    await dataSource.initialize();
    await dataSource.undoLastMigration();
    // eslint-disable-next-line no-console
    console.log('Last migration reverted');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Revert failed', error);
    process.exit(1);
  }
}

revertMigration();


