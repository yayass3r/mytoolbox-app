import { Client, Databases } from 'appwrite';

/**
 * Appwrite Database Setup Script
 * Run with: npx tsx scripts/setup-appwrite.ts
 * 
 * This script creates:
 * - Database: MyToolBox DB
 * - Collections: tools, ads, analytics, settings
 * - Attributes for each collection
 */

const API_KEY = process.env.APPWRITE_API_KEY || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';

if (!API_KEY || !PROJECT_ID) {
  console.error('Missing APPWRITE_API_KEY or NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env file');
  console.error('Please add these to your .env file and try again.');
  process.exit(1);
}

const client = new Client();
client.setEndpoint(ENDPOINT);
client.setProject(PROJECT_ID);
client.setDevKey(API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'mytoolbox-db';
const COLLECTIONS = {
  tools: 'tools',
  ads: 'ads',
  analytics: 'analytics',
  settings: 'settings',
};

async function createStringAttr(collectionId: string, key: string, size: number, required: boolean, defaultValue?: string) {
  try {
    await databases.createAttribute(DATABASE_ID, collectionId, key, 'string', required, {
      size,
      default: defaultValue,
    });
    console.log(`    Created attribute: ${key}`);
  } catch (e: any) {
    console.log(`    Attribute ${key}: ${e.message || 'already exists'}`);
  }
}

async function createBooleanAttr(collectionId: string, key: string, required: boolean, defaultValue?: boolean) {
  try {
    await databases.createAttribute(DATABASE_ID, collectionId, key, 'boolean', required, {
      default: defaultValue,
    });
    console.log(`    Created attribute: ${key}`);
  } catch (e: any) {
    console.log(`    Attribute ${key}: ${e.message || 'already exists'}`);
  }
}

async function createIntegerAttr(collectionId: string, key: string, required: boolean, defaultValue?: number) {
  try {
    await databases.createAttribute(DATABASE_ID, collectionId, key, 'integer', required, {
      default: defaultValue,
    });
    console.log(`    Created attribute: ${key}`);
  } catch (e: any) {
    console.log(`    Attribute ${key}: ${e.message || 'already exists'}`);
  }
}

async function setup() {
  console.log('Setting up Appwrite database...\n');

  try {
    // Create database
    console.log('Creating database...');
    try {
      await databases.get(DATABASE_ID);
      console.log('  Database already exists');
    } catch {
      await databases.create(DATABASE_ID, 'MyToolBox DB', 'Database for MyToolBox app');
      console.log('  Database created (ID: ' + DATABASE_ID + ')');
    }

    // Create tools collection
    console.log('\nCreating tools collection...');
    try {
      await databases.getCollection(DATABASE_ID, COLLECTIONS.tools);
      console.log('  Tools collection already exists');
    } catch {
      await databases.createCollection(DATABASE_ID, COLLECTIONS.tools, 'Tools', 'App tools and utilities');
      console.log('  Tools collection created');

      await createStringAttr(COLLECTIONS.tools, 'name', 255, true);
      await createStringAttr(COLLECTIONS.tools, 'nameAr', 255, true);
      await createStringAttr(COLLECTIONS.tools, 'description', 500, false);
      await createStringAttr(COLLECTIONS.tools, 'descriptionAr', 500, false);
      await createStringAttr(COLLECTIONS.tools, 'icon', 100, true);
      await createStringAttr(COLLECTIONS.tools, 'slug', 100, true);
      await createBooleanAttr(COLLECTIONS.tools, 'isActive', true, true);
      await createIntegerAttr(COLLECTIONS.tools, 'usageCount', true, 0);
      await createStringAttr(COLLECTIONS.tools, 'category', 100, false);
    }

    // Create ads collection
    console.log('\nCreating ads collection...');
    try {
      await databases.getCollection(DATABASE_ID, COLLECTIONS.ads);
      console.log('  Ads collection already exists');
    } catch {
      await databases.createCollection(DATABASE_ID, COLLECTIONS.ads, 'Ads', 'Ad configurations');
      console.log('  Ads collection created');

      await createStringAttr(COLLECTIONS.ads, 'name', 255, true);
      await createStringAttr(COLLECTIONS.ads, 'adNetwork', 100, true);
      await createStringAttr(COLLECTIONS.ads, 'adCode', 65535, false);
      await createStringAttr(COLLECTIONS.ads, 'position', 50, true);
      await createBooleanAttr(COLLECTIONS.ads, 'isActive', true, true);
      await createIntegerAttr(COLLECTIONS.ads, 'priority', true, 0);
    }

    // Create analytics collection
    console.log('\nCreating analytics collection...');
    try {
      await databases.getCollection(DATABASE_ID, COLLECTIONS.analytics);
      console.log('  Analytics collection already exists');
    } catch {
      await databases.createCollection(DATABASE_ID, COLLECTIONS.analytics, 'Analytics', 'Usage analytics');
      console.log('  Analytics collection created');

      await createStringAttr(COLLECTIONS.analytics, 'eventType', 100, true);
      await createStringAttr(COLLECTIONS.analytics, 'toolName', 100, false);
      await createStringAttr(COLLECTIONS.analytics, 'metadata', 65535, false);
      await createStringAttr(COLLECTIONS.analytics, 'ipAddress', 45, false);
      await createStringAttr(COLLECTIONS.analytics, 'userAgent', 500, false);
    }

    // Create settings collection
    console.log('\nCreating settings collection...');
    try {
      await databases.getCollection(DATABASE_ID, COLLECTIONS.settings);
      console.log('  Settings collection already exists');
    } catch {
      await databases.createCollection(DATABASE_ID, COLLECTIONS.settings, 'Settings', 'App settings');
      console.log('  Settings collection created');

      await createStringAttr(COLLECTIONS.settings, 'key', 100, true);
      await createStringAttr(COLLECTIONS.settings, 'value', 65535, false);
      await createStringAttr(COLLECTIONS.settings, 'type', 20, true, 'string');
    }

    console.log('\nAppwrite database setup complete!');
    console.log('\nDatabase ID: ' + DATABASE_ID);
    console.log('Collections: tools, ads, analytics, settings');

  } catch (error: any) {
    console.error('\nSetup failed:', error.message);
    process.exit(1);
  }
}

setup();
