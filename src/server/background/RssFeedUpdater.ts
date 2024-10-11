import { PrismaClient } from '@prisma/client';
import { RssFeedService } from '@/services/RssFeedService';

export class RssFeedUpdater {
  private db: PrismaClient;
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating: boolean = false;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  start(intervalMinutes: number = 30) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    const intervalMs = intervalMinutes * 60 * 1000;
    this.updateInterval = setInterval(() => this.updateAllFeeds(), intervalMs);
    console.log(`RSS Feed Updater started, will update every ${intervalMinutes} minutes`);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('RSS Feed Updater stopped');
    }
  }

  private async updateAllFeeds() {
    if (this.isUpdating) {
      console.log('Update already in progress, skipping this cycle');
      return;
    }
    this.isUpdating = true;
    console.log('Starting update of all RSS feeds');
    try {
      await RssFeedService.updateAllFeeds({ db: this.db });
      console.log('All RSS feeds updated successfully');
    } catch (error) {
      console.error('Error updating RSS feeds:', error);
    } finally {
      this.isUpdating = false;
    }
  }
}