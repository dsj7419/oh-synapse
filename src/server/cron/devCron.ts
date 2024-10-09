import cron from 'node-cron';
import { executeCronJob } from './rssFeedCron';

export function startDevCron() {
  console.log('Starting development cron job scheduler');
  
  // Schedule the job to run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running cron job in development mode');
    await executeCronJob();
  });
}