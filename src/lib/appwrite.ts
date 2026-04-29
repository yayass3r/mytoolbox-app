import { Client, Databases, ID } from 'appwrite';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';

export function getAppwriteClient() {
  const client = new Client();
  client.setEndpoint(APPWRITE_ENDPOINT);
  client.setProject(APPWRITE_PROJECT_ID);
  client.setDevKey(APPWRITE_API_KEY);
  return client;
}

export function getAppwriteDatabase(databaseId: string) {
  const client = getAppwriteClient();
  return new Databases(client, databaseId);
}

export { ID };
export { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID };
