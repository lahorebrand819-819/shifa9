import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AgencyData, WebsiteSettings } from '../src/types';
import { initialAgencyData } from './initialData';
import {
  telcaServices,
  telcaPricingPackages,
  telcaFaqs,
  telcaClients,
  telcaProjects,
  telcaTasks,
  telcaCampaigns,
  telcaResearchProjects,
  telcaIntegrations,
  telcaAuditLogs,
  telcaInvoices,
  telcaNotifications,
  telcaLeads
} from './telcaData';
import { initialPolicies } from './policyData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_BACKUP_FILE = path.join(DATA_DIR, 'db.backup.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure necessary directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory cache & database metadata
let cachedData: AgencyData | null = null;
let dataVersion = 1;
let lastUpdatedAt = new Date().toISOString();

// Active Real-Time SSE Client Connections across all devices
const activeClients = new Set<{ id: string; res: Response; isAdmin: boolean; ip: string }>();

// Optional Supabase client initialization
let supabaseClient: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('[Database] Supabase integration initialized successfully.');
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err);
  }
}

/**
 * Initialize database and pull from Supabase if configured,
 * or load from persistent local JSON file.
 */
export async function initializeDatabase(): Promise<AgencyData> {
  // 1. If Supabase is available, try to sync from cloud
  if (supabaseClient) {
    try {
      const { data: remoteData, error } = await supabaseClient
        .from('agency_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (!error && remoteData && remoteData.payload) {
        cachedData = remoteData.payload as AgencyData;
        dataVersion = remoteData.version || dataVersion + 1;
        lastUpdatedAt = remoteData.updated_at || new Date().toISOString();
        console.log('[Database] Successfully loaded centralized settings from Supabase.');
        return cachedData;
      }
    } catch (e) {
      console.warn('[Database] Supabase fetch error, falling back to local persistent store:', e);
    }
  }

  // 2. Load from local persistent storage
  return getData();
}

/**
 * Retrieves the current AgencyData, loading from disk if not cached.
 */
export function getData(): AgencyData {
  if (cachedData) {
    return cachedData;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      cachedData = JSON.parse(fileContent) as AgencyData;

      let changed = false;

      // Ensure agency branding is updated to Shifa Productions
      if (cachedData.settings) {
        if (!cachedData.settings.name || cachedData.settings.name.includes('Digital Growth') || cachedData.settings.name.includes('Telca')) {
          cachedData.settings.name = 'Shifa Productions';
          cachedData.settings.agencyName = 'Shifa Productions';
          changed = true;
        }
        if (!cachedData.settings.logo || cachedData.settings.logo.includes('default') || cachedData.settings.logo === '' || cachedData.settings.logo.includes('telca-logo')) {
          cachedData.settings.logo = '/shifa-logo.png';
          cachedData.settings.favicon = '/shifa-logo.png';
          changed = true;
        }
        if (!cachedData.settings.whatsappMessage || cachedData.settings.whatsappMessage.includes('Digital Growth Agency') || cachedData.settings.whatsappMessage.includes('Telca')) {
          cachedData.settings.whatsappMessage = "Hi Shifa Productions! I'd like to discuss a video production & marketing project.";
          changed = true;
        }
        if (!cachedData.settings.copyrightText || cachedData.settings.copyrightText.includes('Digital Growth Agency') || cachedData.settings.copyrightText.includes('Telca')) {
          cachedData.settings.copyrightText = '© 2026 Shifa Productions. All rights reserved. Built with precision for market leaders.';
          changed = true;
        }
      }

      // Ensure services exist
      if (!cachedData.services || cachedData.services.length === 0) {
        cachedData.services = telcaServices;
        changed = true;
      }

      // Ensure pricing packages exist
      if (!cachedData.pricingPackages || cachedData.pricingPackages.length === 0) {
        cachedData.pricingPackages = telcaPricingPackages;
        changed = true;
      }

      // Ensure FAQs exist
      if (!cachedData.faqs || cachedData.faqs.length === 0) {
        cachedData.faqs = telcaFaqs;
        changed = true;
      }

      // Ensure leads exist
      if (!cachedData.leads || cachedData.leads.length === 0) {
        cachedData.leads = telcaLeads;
        changed = true;
      }

      // Ensure clients exist
      if (!cachedData.clients || cachedData.clients.length === 0) {
        cachedData.clients = telcaClients;
        changed = true;
      }

      // Ensure projects exist
      if (!cachedData.projects || cachedData.projects.length === 0) {
        cachedData.projects = telcaProjects;
        changed = true;
      }

      // Ensure tasks exist
      if (!cachedData.tasks || cachedData.tasks.length === 0) {
        cachedData.tasks = telcaTasks;
        changed = true;
      }

      // Ensure campaigns exist
      if (!cachedData.campaigns || cachedData.campaigns.length === 0) {
        cachedData.campaigns = telcaCampaigns;
        changed = true;
      }

      // Ensure research projects exist
      if (!cachedData.researchProjects || cachedData.researchProjects.length === 0) {
        cachedData.researchProjects = telcaResearchProjects;
        changed = true;
      }

      // Ensure integrations exist
      if (!cachedData.integrations || cachedData.integrations.length === 0) {
        cachedData.integrations = telcaIntegrations;
        changed = true;
      }

      // Ensure audit logs exist
      if (!cachedData.auditLogs || cachedData.auditLogs.length === 0) {
        cachedData.auditLogs = telcaAuditLogs;
        changed = true;
      }

      // Ensure invoices exist
      if (!cachedData.invoices || cachedData.invoices.length === 0) {
        cachedData.invoices = telcaInvoices;
        changed = true;
      }

      // Ensure notifications exist
      if (!cachedData.notifications || cachedData.notifications.length === 0) {
        cachedData.notifications = telcaNotifications;
        changed = true;
      }

      // Ensure policies exist
      if (!cachedData.policies || cachedData.policies.length === 0) {
        cachedData.policies = initialPolicies;
        changed = true;
      }

      // Ensure subscribers exist
      if (!cachedData.subscribers) {
        cachedData.subscribers = [];
        changed = true;
      }

      // Ensure users exist
      if (!cachedData.users) {
        cachedData.users = [];
        changed = true;
      }

      if (changed) {
        saveData(cachedData, 'initial-sync');
      }

      return cachedData;
    }
  } catch (error) {
    console.error('[Database] Error reading db.json, falling back to backup or initial data:', error);
    try {
      if (fs.existsSync(DB_BACKUP_FILE)) {
        const backupContent = fs.readFileSync(DB_BACKUP_FILE, 'utf-8');
        cachedData = JSON.parse(backupContent) as AgencyData;
        return cachedData;
      }
    } catch {}
  }

  // Initialize with seed data
  cachedData = JSON.parse(JSON.stringify(initialAgencyData));
  cachedData!.pricingPackages = telcaPricingPackages;
  cachedData!.faqs = telcaFaqs;
  cachedData!.leads = telcaLeads;
  cachedData!.clients = telcaClients;
  cachedData!.projects = telcaProjects;
  cachedData!.tasks = telcaTasks;
  cachedData!.campaigns = telcaCampaigns;
  cachedData!.researchProjects = telcaResearchProjects;
  cachedData!.integrations = telcaIntegrations;
  cachedData!.auditLogs = telcaAuditLogs;
  cachedData!.invoices = telcaInvoices;
  cachedData!.notifications = telcaNotifications;
  cachedData!.policies = initialPolicies;
  saveData(cachedData as AgencyData, 'seed-data');
  return cachedData as AgencyData;
}

/**
 * Atomically saves AgencyData to disk and optionally mirrors to Supabase.
 * Increments version and broadcasts real-time update to all connected devices.
 */
export function saveData(data: AgencyData, triggerScope = 'general'): boolean {
  try {
    cachedData = data;
    dataVersion += 1;
    lastUpdatedAt = new Date().toISOString();

    const serialized = JSON.stringify(data, null, 2);
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;

    // Atomic write to avoid corrupted JSON if interrupted
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);

    // Keep backup copy
    try {
      fs.writeFileSync(DB_BACKUP_FILE, serialized, 'utf-8');
    } catch {}

    // Mirror to Supabase if configured
    if (supabaseClient) {
      Promise.resolve(
        supabaseClient
          .from('agency_settings')
          .upsert({
            id: 'global',
            payload: data,
            version: dataVersion,
            updated_at: lastUpdatedAt
          })
      )
        .then(({ error }: any) => {
          if (error) console.warn('[Database] Supabase upsert error:', error.message);
        })
        .catch((err: any) => console.warn('[Database] Supabase write failed:', err));
    }

    // Broadcast change across all active devices in real-time
    broadcastChange(triggerScope, data);

    return true;
  } catch (error) {
    console.error('[Database] Error saving data to db.json:', error);
    return false;
  }
}

/**
 * Returns public-safe view of agency data (excluding private leads/audit logs)
 */
export function getSanitizedPublicData(data: AgencyData) {
  return {
    version: dataVersion,
    lastUpdated: lastUpdatedAt,
    settings: data.settings,
    policies: (data.policies || []).filter(p => p.status === 'published').sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    currencies: data.currencies.filter(c => c.enabled),
    services: data.services.filter(s => s.enabled).sort((a, b) => a.displayOrder - b.displayOrder),
    pricingPackages: data.pricingPackages.filter(p => p.enabled).sort((a, b) => a.displayOrder - b.displayOrder),
    portfolio: data.portfolio,
    caseStudies: data.caseStudies,
    team: data.team.sort((a, b) => a.displayOrder - b.displayOrder),
    testimonials: data.testimonials.filter(t => t.enabled),
    faqs: data.faqs.filter(f => f.enabled).sort((a, b) => a.displayOrder - b.displayOrder),
    blog: data.blog.filter(b => !b.isDraft)
  };
}

/**
 * Register a client Response for Server-Sent Events (SSE).
 */
export function registerSSEClient(res: Response, isAdmin = false, ip = 'unknown'): string {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clientObj = { id: clientId, res, isAdmin, ip };
  activeClients.add(clientObj);

  // Send initial handshake with current version & settings
  const currentData = getData();
  const initialPayload = {
    type: 'CONNECTED',
    clientId,
    version: dataVersion,
    lastUpdated: lastUpdatedAt,
    settings: currentData.settings,
    currencies: currentData.currencies,
    policies: currentData.policies
  };

  res.write(`event: connected\ndata: ${JSON.stringify(initialPayload)}\n\n`);

  return clientId;
}

/**
 * Unregister a client Response from SSE.
 */
export function unregisterSSEClient(clientId: string) {
  for (const client of activeClients) {
    if (client.id === clientId) {
      activeClients.delete(client);
      break;
    }
  }
}

/**
 * Broadcasts an event to all connected devices.
 */
export function broadcastChange(scope: string, data: AgencyData) {
  if (activeClients.size === 0) return;

  const publicData = getSanitizedPublicData(data);
  const adminPayload = {
    type: 'DATA_UPDATED',
    scope,
    version: dataVersion,
    lastUpdated: lastUpdatedAt,
    data
  };
  const publicPayload = {
    type: 'DATA_UPDATED',
    scope,
    version: dataVersion,
    lastUpdated: lastUpdatedAt,
    settings: publicData.settings,
    policies: publicData.policies,
    currencies: publicData.currencies,
    services: publicData.services,
    pricingPackages: publicData.pricingPackages,
    portfolio: publicData.portfolio,
    caseStudies: publicData.caseStudies,
    testimonials: publicData.testimonials,
    faqs: publicData.faqs,
    blog: publicData.blog,
    team: publicData.team
  };

  const adminMsg = `event: sync\ndata: ${JSON.stringify(adminPayload)}\n\n`;
  const publicMsg = `event: sync\ndata: ${JSON.stringify(publicPayload)}\n\n`;

  for (const client of activeClients) {
    try {
      if (client.isAdmin) {
        client.res.write(adminMsg);
      } else {
        client.res.write(publicMsg);
      }
    } catch (err) {
      activeClients.delete(client);
    }
  }
}

/**
 * Sends a periodic keep-alive heartbeat to all connected SSE clients.
 */
export function sendSSEHeartbeat() {
  for (const client of activeClients) {
    try {
      client.res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch (err) {
      activeClients.delete(client);
    }
  }
}

/**
 * Returns database metadata and synchronization diagnostics.
 */
export function getDatabaseDiagnostics() {
  return {
    version: dataVersion,
    lastUpdated: lastUpdatedAt,
    connectedDevices: activeClients.size,
    storageType: supabaseClient ? 'Supabase Centralized Cloud Database' : 'Server Persistent Atomic Database (Cross-Device SSE)',
    supabaseConfigured: !!supabaseClient,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : null,
    storagePath: DB_FILE,
    storageBytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0
  };
}

export function getCurrentVersion() {
  return {
    version: dataVersion,
    lastUpdated: lastUpdatedAt,
    connectedDevices: activeClients.size
  };
}
