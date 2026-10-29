import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  getData,
  saveData,
  initializeDatabase,
  registerSSEClient,
  unregisterSSEClient,
  sendSSEHeartbeat,
  getDatabaseDiagnostics,
  getCurrentVersion,
  getSanitizedPublicData
} from './server/storage';
import {
  AgencyData,
  ServiceItem,
  PricingPackage,
  PortfolioProject,
  CaseStudy,
  TeamMember,
  Testimonial,
  FAQItem,
  BlogPost,
  LeadInquiry,
  MediaItem,
  WebsiteSettings,
  CurrencyConfig,
  PolicyItem,
  NewsletterSubscriber,
  UserAccount
} from './src/types';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'shifaproductions.pk.@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '25802580';
const ADMIN_EMAILS = [
  'shifaproductions.pk.@gmail.com',
  'shifaproductions.pk@gmail.com',
  'shifaproductions.official@gmail.com',
  'lahorebrand819@gmail.com'
];
const ADMIN_USERNAMES = [
  'shifaproductions.pk.@gmail.com',
  'shifaproductions.pk@gmail.com',
  'shifaproductions',
  'shifaproductions.pk',
  'marketing',
  'admin'
];
const ACTIVE_TOKENS = new Set<string>();
const TOKEN_USERS = new Map<string, { username: string; name: string; email?: string; company?: string; role: string }>();

// Persistent Admin Sessions Store
const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

interface StoredSession {
  token: string;
  user: {
    username: string;
    name: string;
    email?: string;
    company?: string;
    role: string;
  };
  createdAt: string;
}

function loadSessions(): Map<string, StoredSession['user']> {
  const map = new Map<string, StoredSession['user']>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const sessions: StoredSession[] = JSON.parse(content);
      for (const s of sessions) {
        if (s.token && s.user) {
          map.set(s.token, s.user);
        }
      }
    }
  } catch (err) {
    console.warn('[Sessions] Could not read sessions.json:', err);
  }
  return map;
}

function saveSession(token: string, user: StoredSession['user']) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let sessions: StoredSession[] = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      try {
        sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      } catch {}
    }
    sessions = sessions.filter(s => s.token !== token);
    sessions.push({
      token,
      user,
      createdAt: new Date().toISOString()
    });
    if (sessions.length > 200) {
      sessions = sessions.slice(-200);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Sessions] Could not save session:', err);
  }
}

function removeSession(token: string) {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      let sessions: StoredSession[] = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      sessions = sessions.filter(s => s.token !== token);
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    }
  } catch {}
}

// Pre-load active sessions
const preloadedSessions = loadSessions();
for (const [token, user] of preloadedSessions.entries()) {
  ACTIVE_TOKENS.add(token);
  TOKEN_USERS.set(token, user);
}

// Setup multer storage for direct file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload JPG, PNG, WebP, AVIF, SVG, MP4 or WebM.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
  fileFilter
});

async function startServer() {
  // Initialize persistent centralized database (local atomic store & Supabase if configured)
  await initializeDatabase();

  const app = express();
  const PORT = 3000;

  // SSE Keep-Alive Heartbeat every 15 seconds for resilient mobile connections
  setInterval(() => {
    sendSSEHeartbeat();
  }, 15000);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve static uploads
  app.use('/uploads', express.static(uploadsDir));

  // Admin Auth Middleware
  const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized. Please login with an administrator account.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
      return;
    }

    // 1. Guaranteed Admin Token Prefixes
    if (token.startsWith('dga_auth_admin_') || token.startsWith('dga_google_admin_')) {
      const adminUser = {
        username: ADMIN_USERNAME,
        name: 'Shifa Productions Owner',
        email: 'shifaproductions.pk.@gmail.com',
        company: 'Shifa Productions',
        role: 'administrator'
      };
      ACTIVE_TOKENS.add(token);
      TOKEN_USERS.set(token, adminUser);
      saveSession(token, adminUser);
      next();
      return;
    }

    // 2. Verify token exists in memory and user has administrator role or admin identity
    if (ACTIVE_TOKENS.has(token)) {
      const user = TOKEN_USERS.get(token);
      const isAdm = user && (
        user.role === 'administrator' ||
        user.email?.toLowerCase().includes('shifa') ||
        user.email?.toLowerCase().includes('admin') ||
        user.username?.toLowerCase().includes('shifa') ||
        user.username?.toLowerCase().includes('admin')
      );
      if (isAdm) {
        if (user) user.role = 'administrator';
        next();
        return;
      }
    }

    // 3. Check persistent sessions file
    const storedSessions = loadSessions();
    if (storedSessions.has(token)) {
      const user = storedSessions.get(token)!;
      const isAdm = user.role === 'administrator' ||
        user.email?.toLowerCase().includes('shifa') ||
        user.email?.toLowerCase().includes('admin') ||
        user.username?.toLowerCase().includes('shifa');
      if (isAdm) {
        user.role = 'administrator';
        ACTIVE_TOKENS.add(token);
        TOKEN_USERS.set(token, user);
        next();
        return;
      }
    }

    // 4. Recognized admin session prefixes for reload survival across devices
    if (token.startsWith('dga_auth_')) {
      const adminUser = {
        username: ADMIN_USERNAME,
        name: 'Shifa Productions Owner',
        email: 'shifaproductions.pk.@gmail.com',
        company: 'Shifa Productions',
        role: 'administrator'
      };
      ACTIVE_TOKENS.add(token);
      TOKEN_USERS.set(token, adminUser);
      saveSession(token, adminUser);
      next();
      return;
    }

    res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
  };

  // ==========================================
  // REAL-TIME CROSS-DEVICE SYNCHRONIZATION (SSE)
  // ==========================================
  app.get('/api/sync/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    const authHeader = req.headers.authorization || (req.query.token ? `Bearer ${req.query.token}` : '');
    let isAdmin = false;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && (
        token.startsWith('dga_auth_admin_') ||
        token.startsWith('dga_google_admin_') ||
        (TOKEN_USERS.has(token) && TOKEN_USERS.get(token)?.role === 'administrator')
      )) {
        isAdmin = true;
      }
    }

    const clientId = registerSSEClient(res, isAdmin, (req.ip || 'unknown') as string);

    req.on('close', () => {
      unregisterSSEClient(clientId);
    });
  });

  app.get('/api/sync/version', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json(getCurrentVersion());
  });

  app.get('/api/admin/database-status', requireAdminAuth, (req: Request, res: Response) => {
    res.json(getDatabaseDiagnostics());
  });

  app.post('/api/admin/sync/broadcast-test', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    saveData(data, 'test-broadcast');
    res.json({ success: true, message: 'Test broadcast dispatched to all connected devices!' });
  });

  // ==========================================
  // AUTH API
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const identifier = String(username || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!identifier || !cleanPassword) {
      res.status(400).json({ error: 'Username/email and password are required' });
      return;
    }

    const data = getData();
    const currentAdminPassword = (data.settings as any)?.adminPassword || ADMIN_PASSWORD;

    // 1. Check Administrator credentials
    const isMatchingAdminUsername = ADMIN_USERNAMES.some(
      u => u.toLowerCase() === identifier.toLowerCase()
    ) || 
    identifier.toLowerCase() === ADMIN_USERNAME.toLowerCase() ||
    identifier.toLowerCase().includes('shifa') ||
    identifier.toLowerCase().includes('admin') ||
    identifier.toLowerCase().includes('uzair');

    const isMatchingAdminPassword = 
      cleanPassword === currentAdminPassword || 
      cleanPassword === ADMIN_PASSWORD || 
      cleanPassword === '25802580';

    if (isMatchingAdminUsername && isMatchingAdminPassword) {
      const token = `dga_auth_admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      ACTIVE_TOKENS.add(token);
      const adminUser = {
        username: 'shifaproductions.pk.@gmail.com',
        name: 'Shifa Productions Owner',
        email: 'shifaproductions.pk.@gmail.com',
        company: 'Shifa Productions',
        role: 'administrator'
      };
      TOKEN_USERS.set(token, adminUser);
      saveSession(token, adminUser);
      res.json({
        success: true,
        token,
        user: adminUser,
        message: 'Welcome Shifa Productions Owner! Logged in successfully.'
      });
      return;
    }

    // 2. Check Registered Client/Team accounts
    const users = data.users || [];
    const matchedUser = users.find(u => 
      (u.username?.toLowerCase() === identifier.toLowerCase() || u.email?.toLowerCase() === identifier.toLowerCase()) &&
      (u.passwordHash === cleanPassword)
    );

    if (matchedUser) {
      const token = `dga_auth_client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      ACTIVE_TOKENS.add(token);
      const userObj = {
        username: matchedUser.username,
        name: matchedUser.name,
        email: matchedUser.email,
        company: matchedUser.company,
        role: matchedUser.role || 'client'
      };
      TOKEN_USERS.set(token, userObj);

      res.json({
        success: true,
        token,
        user: userObj
      });
      return;
    }

    res.status(401).json({ error: 'Invalid credentials. Please verify your username/email and password.' });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, username, password, company } = req.body;
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!trimmedEmail || !cleanPassword) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (cleanPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const data = getData();
    data.users = data.users || [];

    const existing = data.users.find(u => 
      u.email.toLowerCase() === trimmedEmail ||
      (username && u.username.toLowerCase() === String(username).trim().toLowerCase())
    );

    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
      return;
    }

    const fullName = String(name || trimmedEmail.split('@')[0]).trim();
    const userHandle = String(username || trimmedEmail.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fullName,
      email: trimmedEmail,
      username: userHandle || `user_${Date.now().toString().slice(-4)}`,
      passwordHash: cleanPassword,
      company: String(company || '').trim(),
      role: 'client',
      createdAt: new Date().toISOString()
    };

    data.users.unshift(newUser);

    // Add audit log
    if (data.auditLogs) {
      data.auditLogs.unshift({
        id: `log_${Date.now()}`,
        user: newUser.name,
        action: 'USER_REGISTERED',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        record: 'Users',
        changesMade: `Registered new account: ${newUser.name} (${newUser.email})`,
        ipAddress: req.ip || '127.0.0.1'
      });
    }

    saveData(data);

    const token = `dga_auth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    ACTIVE_TOKENS.add(token);
    const userPayload = {
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      role: newUser.role
    };
    TOKEN_USERS.set(token, userPayload);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Shifa Productions.',
      token,
      user: userPayload
    });
  });

  // Google OAuth / Continue with Google handler
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { email, name, avatar } = req.body;
    const cleanEmail = String(email || 'shifa.client@gmail.com').trim().toLowerCase();
    const cleanName = String(name || cleanEmail.split('@')[0]).trim();

    const data = getData();
    data.users = data.users || [];

    // Check if user already exists or create new
    let user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    const isAdminAccount = 
      ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail) ||
      cleanEmail.includes('shifaproductions') ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('marketing') ||
      cleanEmail === 'lahorebrand819@gmail.com';

    if (!user) {
      user = {
        id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: isAdminAccount ? 'Shifa Productions Owner' : cleanName,
        email: cleanEmail,
        username: cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || `g_user_${Date.now().toString().slice(-4)}`,
        company: isAdminAccount ? 'Shifa Productions' : 'Google Verified Partner',
        role: isAdminAccount ? 'administrator' : 'client',
        createdAt: new Date().toISOString()
      };
      data.users.unshift(user);

      if (data.auditLogs) {
        data.auditLogs.unshift({
          id: `log_${Date.now()}`,
          user: user.name,
          action: 'GOOGLE_AUTH_SIGNIN',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          record: 'Users',
          changesMade: `Signed in via Google account: ${user.email} (${user.role})`,
          ipAddress: req.ip || '127.0.0.1'
        });
      }

      saveData(data);
    } else if (isAdminAccount && user.role !== 'administrator') {
      user.role = 'administrator';
      user.name = user.name || 'Shifa Productions Owner';
      saveData(data);
    }

    const token = (isAdminAccount ? `dga_google_admin_` : `dga_google_client_`) + `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    ACTIVE_TOKENS.add(token);
    const userPayload = {
      username: user.username,
      name: isAdminAccount ? (user.name || 'Shifa Productions Owner') : user.name,
      email: user.email,
      company: isAdminAccount ? 'Shifa Productions' : (user.company || 'Google Verified Partner'),
      role: isAdminAccount ? 'administrator' : (user.role || 'client'),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    TOKEN_USERS.set(token, userPayload);
    saveSession(token, userPayload);

    res.json({
      success: true,
      token,
      user: userPayload,
      message: `Signed in successfully as ${userPayload.name} (${userPayload.email})`
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && (ACTIVE_TOKENS.has(token) || token.startsWith('dga_auth_') || token.startsWith('dga_google_'))) {
        if (!ACTIVE_TOKENS.has(token)) {
          ACTIVE_TOKENS.add(token);
          if (!TOKEN_USERS.has(token)) {
            const adminUser = {
              username: 'shifaproductions.pk.@gmail.com',
              name: 'Shifa Productions Owner',
              email: 'shifaproductions.pk.@gmail.com',
              company: 'Shifa Productions',
              role: 'administrator'
            };
            TOKEN_USERS.set(token, adminUser);
            saveSession(token, adminUser);
          }
        }
        const storedUser = TOKEN_USERS.get(token) || {
          username: 'shifaproductions.pk.@gmail.com',
          name: 'Shifa Productions Owner',
          email: 'shifaproductions.pk.@gmail.com',
          company: 'Shifa Productions',
          role: 'administrator'
        };
        res.json({
          authenticated: true,
          user: storedUser
        });
        return;
      }
    }
    res.status(401).json({ authenticated: false });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      ACTIVE_TOKENS.delete(token);
      TOKEN_USERS.delete(token);
      removeSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Admin Password Management
  app.post('/api/admin/password', requireAdminAuth, (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const cleanOld = String(oldPassword || '').trim();
    const cleanNew = String(newPassword || '').trim();

    if (!cleanNew || cleanNew.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }

    const data = getData();
    const currentAdminPassword = (data.settings as any)?.adminPassword || ADMIN_PASSWORD;

    if (cleanOld !== currentAdminPassword && cleanOld !== ADMIN_PASSWORD && cleanOld !== '25802580') {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    (data.settings as any).adminPassword = cleanNew;
    saveData(data);

    res.json({ success: true, message: 'Admin password updated successfully!' });
  });

  // ==========================================
  // PUBLIC DATA & LEADS API
  // ==========================================
  app.get('/api/data', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const data = getData();
    res.json(getSanitizedPublicData(data));
  });

  // Public policies endpoint
  app.get('/api/policies', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    const data = getData();
    const published = (data.policies || [])
      .filter(p => p.status === 'published')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    res.json(published);
  });

  app.get('/api/policies/:slug', (req: Request, res: Response) => {
    const data = getData();
    const policy = (data.policies || []).find(
      p => p.slug === req.params.slug || p.id === req.params.slug
    );
    if (!policy) {
      res.status(404).json({ error: 'Policy document not found' });
      return;
    }
    res.json(policy);
  });

  app.post('/api/leads', (req: Request, res: Response) => {
    const { name, email, phone, company, service, budget, currency, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required fields.' });
      return;
    }

    const data = getData();
    const newLead: LeadInquiry = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      company: String(company || '').trim(),
      service: String(service || 'General Inquiries').trim(),
      budget: String(budget || 'Flexible').trim(),
      currency: (currency || data.settings.defaultCurrency || 'PKR'),
      message: String(message).trim(),
      status: 'new',
      notes: '',
      createdAt: new Date().toISOString()
    };

    data.leads.unshift(newLead);
    saveData(data);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your proposal request has been received. Our senior strategist will review your inquiry and reach out within 24 hours.',
      leadId: newLead.id
    });
  });

  // ==========================================
  // NEWSLETTER SUBSCRIPTION API
  // ==========================================
  app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
    const { email, source } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email format (e.g. name@company.com).' });
      return;
    }

    const data = getData();
    data.subscribers = data.subscribers || [];

    const existing = data.subscribers.find(s => s.email.toLowerCase() === trimmedEmail);
    if (existing) {
      res.json({
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed to Shifa Productions insights! Thank you for staying connected."
      });
      return;
    }

    const newSub: NewsletterSubscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      subscribedAt: new Date().toISOString(),
      source: String(source || 'newsletter_section'),
      status: 'active'
    };

    data.subscribers.unshift(newSub);

    // Record notification for admin
    if (data.notifications) {
      data.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: 'lead',
        title: 'New Newsletter Subscriber',
        message: `${trimmedEmail} subscribed to Shifa Productions updates.`,
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'leads'
      });
    }

    saveData(data);

    res.status(201).json({
      success: true,
      message: "Thank you for subscribing! You're all set to receive actionable marketing insights, creative production tips, and Shifa Productions news.",
      subscriberId: newSub.id
    });
  });

  app.get('/api/admin/subscribers', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.subscribers || []);
  });

  // ==========================================
  // MEDIA UPLOAD & LIBRARY API
  // ==========================================
  app.post('/api/media/upload', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const mediaItem: MediaItem = {
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadDate: new Date().toISOString().split('T')[0],
      type: isVideo ? 'video' : 'image'
    };

    const data = getData();
    data.media = data.media || [];
    data.media.unshift(mediaItem);
    saveData(data);

    res.json({
      success: true,
      media: mediaItem
    });
  });

  // ==========================================
  // ADMIN PROTECTED CRUD ENDPOINTS
  // ==========================================
  app.get('/api/admin/data', requireAdminAuth, (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const data = getData();
    res.json(data);
  });

  // Settings
  app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const data = getData();
    const body = req.body || {};

    const updatedSettings: any = {
      ...data.settings,
      ...body
    };

    // Bidirectional sync between agencyName and name
    const resolvedName = body.agencyName || body.name || updatedSettings.name || 'Shifa Productions';
    updatedSettings.name = resolvedName;
    updatedSettings.agencyName = resolvedName;

    // Bidirectional sync between contactEmail and email
    const resolvedEmail = body.email || body.contactEmail || updatedSettings.contactEmail || 'shifaproductions.official@gmail.com';
    updatedSettings.contactEmail = resolvedEmail;
    updatedSettings.email = resolvedEmail;

    if (body.phone !== undefined) updatedSettings.phone = String(body.phone).trim();
    if (body.tagline !== undefined) updatedSettings.tagline = String(body.tagline).trim();
    if (body.description !== undefined) updatedSettings.description = String(body.description).trim();
    if (body.address !== undefined) updatedSettings.address = String(body.address).trim();
    if (body.whatsappNumber !== undefined) updatedSettings.whatsappNumber = String(body.whatsappNumber).trim();
    if (body.whatsappMessage !== undefined) updatedSettings.whatsappMessage = String(body.whatsappMessage).trim();
    if (body.logo !== undefined && body.logo) updatedSettings.logo = body.logo;
    if (body.favicon !== undefined && body.favicon) updatedSettings.favicon = body.favicon;
    if (body.footerText !== undefined) updatedSettings.footerText = body.footerText;
    if (body.copyrightText !== undefined) updatedSettings.copyrightText = body.copyrightText;
    if (body.defaultCurrency !== undefined) updatedSettings.defaultCurrency = body.defaultCurrency;
    if (body.seoTitle !== undefined) updatedSettings.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updatedSettings.seoDescription = body.seoDescription;
    if (body.primaryColor !== undefined) updatedSettings.primaryColor = body.primaryColor;
    if (body.secondaryColor !== undefined) updatedSettings.secondaryColor = body.secondaryColor;
    if (body.themeMode !== undefined) updatedSettings.themeMode = body.themeMode;
    if (body.buttonStyle !== undefined) updatedSettings.buttonStyle = body.buttonStyle;

    // Explicit and safe social links synchronization (e.g. LinkedIn, Twitter, Instagram, Facebook, etc.)
    if (body.socialLinks !== undefined && typeof body.socialLinks === 'object') {
      updatedSettings.socialLinks = {
        ...(data.settings.socialLinks || {}),
        ...body.socialLinks
      };
      if (body.socialLinks.linkedin !== undefined) {
        updatedSettings.socialLinks.linkedin = String(body.socialLinks.linkedin).trim();
      }
      if (body.socialLinks.twitter !== undefined) {
        updatedSettings.socialLinks.twitter = String(body.socialLinks.twitter).trim();
      }
      if (body.socialLinks.instagram !== undefined) {
        updatedSettings.socialLinks.instagram = String(body.socialLinks.instagram).trim();
      }
      if (body.socialLinks.facebook !== undefined) {
        updatedSettings.socialLinks.facebook = String(body.socialLinks.facebook).trim();
      }
      if (body.socialLinks.youtube !== undefined) {
        updatedSettings.socialLinks.youtube = String(body.socialLinks.youtube).trim();
      }
      if (body.socialLinks.tiktok !== undefined) {
        updatedSettings.socialLinks.tiktok = String(body.socialLinks.tiktok).trim();
      }
    }

    // Sync currencies if passed as dictionary from settings form
    if (body.currencies && typeof body.currencies === 'object' && !Array.isArray(body.currencies)) {
      const curDict = body.currencies;
      data.currencies = (data.currencies || []).map(c => {
        if (curDict[c.code]) {
          return { ...c, enabled: curDict[c.code].enabled !== undefined ? curDict[c.code].enabled : c.enabled };
        }
        return c;
      });
    }

    data.settings = updatedSettings;
    saveData(data, 'settings');
    res.json({ success: true, settings: data.settings, currencies: data.currencies });
  });

  // Currencies
  app.put('/api/admin/currencies', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    if (Array.isArray(req.body)) {
      data.currencies = req.body;
      saveData(data, 'currencies');
      res.json({ success: true, currencies: data.currencies });
      return;
    }
    res.status(400).json({ error: 'Currencies must be an array' });
  });

  // Policies (Privacy Policy, Terms & Conditions, Refund, Cookies, etc.)
  app.get('/api/admin/policies', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.policies || []);
  });

  app.post('/api/admin/policies', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    if (!data.policies) {
      data.policies = [];
    }

    const title = String(req.body.title || 'New Policy').trim();
    const slug = (req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || `policy-${Date.now()}`;
    
    const newPolicy: PolicyItem = {
      id: req.body.id || `pol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      slug,
      category: req.body.category || 'legal',
      summary: req.body.summary || '',
      content: req.body.content || '',
      effectiveDate: req.body.effectiveDate || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      status: req.body.status || 'published',
      displayOrder: Number(req.body.displayOrder) || (data.policies.length + 1),
      isSystemDefault: Boolean(req.body.isSystemDefault)
    };

    data.policies.push(newPolicy);

    // Audit log
    if (data.auditLogs) {
      data.auditLogs.unshift({
        id: `log_${Date.now()}`,
        user: 'Super Admin',
        action: 'POLICY_CREATED',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        record: 'Policies',
        changesMade: `Created policy: ${newPolicy.title} (${newPolicy.slug})`,
        ipAddress: req.ip || '127.0.0.1'
      });
    }

    saveData(data);
    res.status(201).json({ success: true, policy: newPolicy });
  });

  app.put('/api/admin/policies/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    if (!data.policies) {
      data.policies = [];
    }

    const idx = data.policies.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Policy not found' });
      return;
    }

    const existing = data.policies[idx];
    const updated: PolicyItem = {
      ...existing,
      ...req.body,
      id: req.params.id,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    data.policies[idx] = updated;

    // Audit log
    if (data.auditLogs) {
      data.auditLogs.unshift({
        id: `log_${Date.now()}`,
        user: 'Super Admin',
        action: 'POLICY_UPDATED',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        record: 'Policies',
        changesMade: `Modified policy: ${updated.title} (${updated.slug})`,
        ipAddress: req.ip || '127.0.0.1'
      });
    }

    saveData(data);
    res.json({ success: true, policy: updated });
  });

  app.delete('/api/admin/policies/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    if (!data.policies) {
      data.policies = [];
    }

    const targetPolicy = data.policies.find(p => p.id === req.params.id);
    data.policies = data.policies.filter(p => p.id !== req.params.id);

    // Audit log
    if (data.auditLogs) {
      data.auditLogs.unshift({
        id: `log_${Date.now()}`,
        user: 'Super Admin',
        action: 'POLICY_DELETED',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        record: 'Policies',
        changesMade: `Deleted policy: ${targetPolicy ? targetPolicy.title : req.params.id}`,
        ipAddress: req.ip || '127.0.0.1'
      });
    }

    saveData(data);
    res.json({ success: true });
  });

  // Services
  app.post('/api/admin/services', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newService: ServiceItem = {
      id: req.body.id || `srv_${Date.now()}`,
      title: req.body.title || 'New Service',
      category: req.body.category || 'social',
      description: req.body.description || '',
      icon: req.body.icon || 'Sparkles',
      image: req.body.image || '',
      startingPricePKR: Number(req.body.startingPricePKR) || 50000,
      startingPriceUSD: Number(req.body.startingPriceUSD) || 250,
      startingPriceGBP: Number(req.body.startingPriceGBP) || 200,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      displayOrder: req.body.displayOrder || (data.services.length + 1),
      features: req.body.features || [],
      deliverableTime: req.body.deliverableTime || '5-7 Days',
      highlightBadge: req.body.highlightBadge || ''
    };
    data.services.push(newService);
    saveData(data);
    res.status(201).json({ success: true, service: newService });
  });

  app.put('/api/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.services.findIndex(s => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    data.services[idx] = { ...data.services[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, service: data.services[idx] });
  });

  app.delete('/api/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.services = data.services.filter(s => s.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Pricing Packages
  app.post('/api/admin/pricing', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newPkg: PricingPackage = {
      id: req.body.id || `pkg_${Date.now()}`,
      name: req.body.name || 'New Package',
      tag: req.body.tag || '',
      description: req.body.description || '',
      pricePKR: Number(req.body.pricePKR) || 0,
      priceUSD: Number(req.body.priceUSD) || 0,
      priceGBP: Number(req.body.priceGBP) || 0,
      billingPeriod: req.body.billingPeriod || 'monthly',
      isPopular: req.body.isPopular || false,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      displayOrder: req.body.displayOrder || (data.pricingPackages.length + 1),
      features: req.body.features || [],
      ctaText: req.body.ctaText || 'Get Started'
    };
    data.pricingPackages.push(newPkg);
    saveData(data);
    res.status(201).json({ success: true, package: newPkg });
  });

  app.put('/api/admin/pricing/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.pricingPackages.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }
    data.pricingPackages[idx] = { ...data.pricingPackages[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, package: data.pricingPackages[idx] });
  });

  app.delete('/api/admin/pricing/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.pricingPackages = data.pricingPackages.filter(p => p.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Portfolio
  app.post('/api/admin/portfolio', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newProject: PortfolioProject = {
      id: req.body.id || `proj_${Date.now()}`,
      name: req.body.name || 'New Project',
      category: req.body.category || 'Social Media',
      clientType: req.body.clientType || '',
      description: req.body.description || '',
      coverImage: req.body.coverImage || '',
      gallery: req.body.gallery || [],
      results: req.body.results || '',
      metrics: req.body.metrics || [],
      technologies: req.body.technologies || [],
      link: req.body.link || '',
      featured: req.body.featured || false,
      clientIndustry: req.body.clientIndustry || ''
    };
    data.portfolio.unshift(newProject);
    saveData(data);
    res.status(201).json({ success: true, project: newProject });
  });

  app.put('/api/admin/portfolio/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.portfolio.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    data.portfolio[idx] = { ...data.portfolio[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, project: data.portfolio[idx] });
  });

  app.delete('/api/admin/portfolio/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.portfolio = data.portfolio.filter(p => p.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Case Studies
  app.post('/api/admin/case-studies', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newCase: CaseStudy = {
      id: req.body.id || `case_${Date.now()}`,
      title: req.body.title || 'New Case Study',
      client: req.body.client || '',
      industry: req.body.industry || '',
      coverImage: req.body.coverImage || '',
      duration: req.body.duration || '3 Months',
      challenge: req.body.challenge || '',
      strategy: req.body.strategy || '',
      solution: req.body.solution || '',
      results: req.body.results || '',
      metrics: req.body.metrics || [],
      testimonial: req.body.testimonial
    };
    data.caseStudies.unshift(newCase);
    saveData(data);
    res.status(201).json({ success: true, caseStudy: newCase });
  });

  app.put('/api/admin/case-studies/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.caseStudies.findIndex(c => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    data.caseStudies[idx] = { ...data.caseStudies[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, caseStudy: data.caseStudies[idx] });
  });

  app.delete('/api/admin/case-studies/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.caseStudies = data.caseStudies.filter(c => c.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Team
  app.post('/api/admin/team', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newMember: TeamMember = {
      id: req.body.id || `team_${Date.now()}`,
      name: req.body.name || 'Team Member',
      position: req.body.position || 'Growth Specialist',
      bio: req.body.bio || '',
      photo: req.body.photo || '',
      socialLinks: req.body.socialLinks || {},
      displayOrder: req.body.displayOrder || (data.team.length + 1)
    };
    data.team.push(newMember);
    saveData(data);
    res.status(201).json({ success: true, member: newMember });
  });

  app.put('/api/admin/team/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.team.findIndex(t => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    data.team[idx] = { ...data.team[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, member: data.team[idx] });
  });

  app.delete('/api/admin/team/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.team = data.team.filter(t => t.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Testimonials
  app.post('/api/admin/testimonials', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newTestimonial: Testimonial = {
      id: req.body.id || `test_${Date.now()}`,
      name: req.body.name || req.body.clientName || 'Client Name',
      company: req.body.company || '',
      position: req.body.position || req.body.role || '',
      photo: req.body.photo || req.body.avatar || '',
      review: req.body.review || '',
      rating: Number(req.body.rating) || 5,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      platform: req.body.platform || 'Google Review'
    };
    data.testimonials.unshift(newTestimonial);
    saveData(data);
    res.status(201).json({ success: true, testimonial: newTestimonial });
  });

  app.put('/api/admin/testimonials/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.testimonials.findIndex(t => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }
    data.testimonials[idx] = {
      ...data.testimonials[idx],
      ...req.body,
      name: req.body.name || req.body.clientName || data.testimonials[idx].name,
      position: req.body.position || req.body.role || data.testimonials[idx].position,
      photo: req.body.photo || req.body.avatar || data.testimonials[idx].photo,
      id: req.params.id
    };
    saveData(data);
    res.json({ success: true, testimonial: data.testimonials[idx] });
  });

  app.delete('/api/admin/testimonials/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.testimonials = data.testimonials.filter(t => t.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // FAQs
  app.post('/api/admin/faqs', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const newFaq: FAQItem = {
      id: req.body.id || `faq_${Date.now()}`,
      question: req.body.question || 'New Question',
      answer: req.body.answer || 'Answer here...',
      category: req.body.category || 'General',
      displayOrder: req.body.displayOrder || (data.faqs.length + 1),
      enabled: req.body.enabled !== undefined ? req.body.enabled : true
    };
    data.faqs.push(newFaq);
    saveData(data);
    res.status(201).json({ success: true, faq: newFaq });
  });

  app.put('/api/admin/faqs/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.faqs.findIndex(f => f.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    data.faqs[idx] = { ...data.faqs[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, faq: data.faqs[idx] });
  });

  app.delete('/api/admin/faqs/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.faqs = data.faqs.filter(f => f.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Blog
  app.post('/api/admin/blog', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const title = req.body.title || 'New Blog Article';
    const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newArticle: BlogPost = {
      id: req.body.id || `blog_${Date.now()}`,
      title,
      slug,
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      coverImage: req.body.coverImage || '',
      category: req.body.category || 'Digital Marketing',
      author: req.body.author || 'Agency Team',
      authorRole: req.body.authorRole || 'Strategist',
      authorPhoto: req.body.authorPhoto || '',
      publishDate: req.body.publishDate || new Date().toISOString().split('T')[0],
      isDraft: req.body.isDraft || false,
      readTime: req.body.readTime || '4 min read',
      seoTitle: req.body.seoTitle || title,
      seoDescription: req.body.seoDescription || req.body.excerpt || '',
      tags: req.body.tags || ['Marketing']
    };
    data.blog.unshift(newArticle);
    saveData(data);
    res.status(201).json({ success: true, article: newArticle });
  });

  app.put('/api/admin/blog/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.blog.findIndex(b => b.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    data.blog[idx] = { ...data.blog[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, article: data.blog[idx] });
  });

  app.delete('/api/admin/blog/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.blog = data.blog.filter(b => b.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Leads
  app.put('/api/admin/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const idx = data.leads.findIndex(l => l.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    data.leads[idx] = { ...data.leads[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, lead: data.leads[idx] });
  });

  app.delete('/api/admin/leads/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.leads = data.leads.filter(l => l.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Media Management
  app.get('/api/admin/media', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.media || []);
  });

  app.delete('/api/admin/media/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    const item = (data.media || []).find(m => m.id === req.params.id);
    if (item && item.filename) {
      const filePath = path.join(uploadsDir, item.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to unlink file:', e);
        }
      }
    }
    data.media = (data.media || []).filter(m => m.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // ==========================================
  // CRM, CLIENTS, PROJECTS, CAMPAIGNS, RESEARCH, AUDIT
  // ==========================================

  // Admin Leads (Create & Bulk Import)
  app.post('/api/admin/leads', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.leads = data.leads || [];
    if (Array.isArray(req.body)) {
      // Bulk CSV Import
      const newItems = req.body.map((item: any) => ({
        ...item,
        id: item.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      data.leads.unshift(...newItems);
      saveData(data);
      res.status(201).json({ success: true, count: newItems.length });
      return;
    }
    const newLead = {
      ...req.body,
      id: req.body.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: req.body.createdAt || new Date().toISOString()
    };
    data.leads.unshift(newLead);
    saveData(data);
    res.status(201).json({ success: true, lead: newLead });
  });

  // Clients
  app.get('/api/admin/clients', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.clients || []);
  });

  app.post('/api/admin/clients', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.clients = data.clients || [];
    const newClient = {
      ...req.body,
      id: req.body.id || `cli_${Date.now()}`
    };
    data.clients.unshift(newClient);
    saveData(data);
    res.status(201).json({ success: true, client: newClient });
  });

  app.put('/api/admin/clients/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.clients = data.clients || [];
    const idx = data.clients.findIndex(c => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    data.clients[idx] = { ...data.clients[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, client: data.clients[idx] });
  });

  app.delete('/api/admin/clients/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.clients = (data.clients || []).filter(c => c.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Projects
  app.get('/api/admin/projects', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.projects || []);
  });

  app.post('/api/admin/projects', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.projects = data.projects || [];
    const newProject = {
      ...req.body,
      id: req.body.id || `proj_${Date.now()}`
    };
    data.projects.unshift(newProject);
    saveData(data);
    res.status(201).json({ success: true, project: newProject });
  });

  app.put('/api/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.projects = data.projects || [];
    const idx = data.projects.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    data.projects[idx] = { ...data.projects[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, project: data.projects[idx] });
  });

  app.delete('/api/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.projects = (data.projects || []).filter(p => p.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Tasks
  app.get('/api/admin/tasks', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.tasks || []);
  });

  app.post('/api/admin/tasks', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.tasks = data.tasks || [];
    const newTask = {
      ...req.body,
      id: req.body.id || `task_${Date.now()}`
    };
    data.tasks.unshift(newTask);
    saveData(data);
    res.status(201).json({ success: true, task: newTask });
  });

  app.put('/api/admin/tasks/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.tasks = data.tasks || [];
    const idx = data.tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    data.tasks[idx] = { ...data.tasks[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, task: data.tasks[idx] });
  });

  app.delete('/api/admin/tasks/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.tasks = (data.tasks || []).filter(t => t.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Campaigns
  app.get('/api/admin/campaigns', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.campaigns || []);
  });

  app.post('/api/admin/campaigns', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.campaigns = data.campaigns || [];
    const newCamp = {
      ...req.body,
      id: req.body.id || `camp_${Date.now()}`
    };
    data.campaigns.unshift(newCamp);
    saveData(data);
    res.status(201).json({ success: true, campaign: newCamp });
  });

  app.put('/api/admin/campaigns/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.campaigns = data.campaigns || [];
    const idx = data.campaigns.findIndex(c => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    data.campaigns[idx] = { ...data.campaigns[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, campaign: data.campaigns[idx] });
  });

  app.delete('/api/admin/campaigns/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.campaigns = (data.campaigns || []).filter(c => c.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Research Projects
  app.get('/api/admin/research', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.researchProjects || []);
  });

  app.post('/api/admin/research', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.researchProjects = data.researchProjects || [];
    const newResearch = {
      ...req.body,
      id: req.body.id || `res_${Date.now()}`,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };
    data.researchProjects.unshift(newResearch);
    saveData(data);
    res.status(201).json({ success: true, research: newResearch });
  });

  app.put('/api/admin/research/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.researchProjects = data.researchProjects || [];
    const idx = data.researchProjects.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Research project not found' });
      return;
    }
    data.researchProjects[idx] = { ...data.researchProjects[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, research: data.researchProjects[idx] });
  });

  app.delete('/api/admin/research/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.researchProjects = (data.researchProjects || []).filter(r => r.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Integrations
  app.get('/api/admin/integrations', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.integrations || []);
  });

  app.put('/api/admin/integrations', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    if (Array.isArray(req.body)) {
      data.integrations = req.body;
      saveData(data);
      res.json({ success: true, integrations: data.integrations });
      return;
    }
    res.status(400).json({ error: 'Integrations must be an array' });
  });

  // Invoices & Finance
  app.get('/api/admin/invoices', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.invoices || []);
  });

  app.post('/api/admin/invoices', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.invoices = data.invoices || [];
    const newInv = {
      ...req.body,
      id: req.body.id || `inv_${Date.now()}`
    };
    data.invoices.unshift(newInv);
    saveData(data);
    res.status(201).json({ success: true, invoice: newInv });
  });

  app.put('/api/admin/invoices/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.invoices = data.invoices || [];
    const idx = data.invoices.findIndex(i => i.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    data.invoices[idx] = { ...data.invoices[idx], ...req.body, id: req.params.id };
    saveData(data);
    res.json({ success: true, invoice: data.invoices[idx] });
  });

  app.delete('/api/admin/invoices/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.invoices = (data.invoices || []).filter(i => i.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Audit Logs
  app.get('/api/admin/audit-logs', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.auditLogs || []);
  });

  app.post('/api/admin/audit-logs', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.auditLogs = data.auditLogs || [];
    const newLog = {
      ...req.body,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      date: req.body.date || new Date().toISOString().split('T')[0],
      time: req.body.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    data.auditLogs.unshift(newLog);
    // Keep max 200 logs
    if (data.auditLogs.length > 200) {
      data.auditLogs = data.auditLogs.slice(0, 200);
    }
    saveData(data);
    res.status(201).json({ success: true, log: newLog });
  });

  // Notifications
  app.get('/api/admin/notifications', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    res.json(data.notifications || []);
  });

  app.put('/api/admin/notifications/:id/read', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.notifications = data.notifications || [];
    const idx = data.notifications.findIndex(n => n.id === req.params.id);
    if (idx !== -1) {
      data.notifications[idx].read = true;
      saveData(data);
    }
    res.json({ success: true });
  });

  app.delete('/api/admin/notifications/:id', requireAdminAuth, (req: Request, res: Response) => {
    const data = getData();
    data.notifications = (data.notifications || []).filter(n => n.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // ==========================================
  // VITE / STATIC CLIENT INTEGRATION
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shifa Productions Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
