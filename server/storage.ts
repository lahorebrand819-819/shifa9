// Re-export persistent database functions from database.ts
export {
  getData,
  saveData,
  initializeDatabase,
  getSanitizedPublicData,
  registerSSEClient,
  unregisterSSEClient,
  broadcastChange,
  sendSSEHeartbeat,
  getDatabaseDiagnostics,
  getCurrentVersion
} from './database';
