// // server.js
// // ClearBooks OAuth2 Authentication - ES Module version

// import 'dotenv/config';
// import express from 'express';
// import session from 'express-session';
// import axios from 'axios';
// import crypto from 'crypto';

// const app  = express();
// const PORT = process.env.PORT || 3000;

// import cors from "cors";

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));

// // ---------------------------------------------------------------------------
// // OAuth2 Config (from .env)
// // ---------------------------------------------------------------------------
// const oauthConfig = {
//   clientId:         process.env.CLEARBOOKS_CLIENT_ID,
//   clientSecret:     process.env.CLEARBOOKS_CLIENT_SECRET,
//   redirectUri:      process.env.CLEARBOOKS_REDIRECT_URI,
//   authorizationUrl: 'https://secure.clearbooks.co.uk/account/action/oauth/',
//   tokenUrl:         'https://api.clearbooks.co.uk/oauth/token',
//   scope:            'businesses:read accounting.sales:read accounting.sales:write accounting.customers:read accounting.customers:write',
// };

// // Validate env vars at startup
// ['clientId', 'clientSecret', 'redirectUri'].forEach((key) => {
//   if (!oauthConfig[key]) {
//     throw new Error(`Missing env variable for: ${key}. Check your .env file.`);
//   }
// });

// // ---------------------------------------------------------------------------
// // Middleware
// // ---------------------------------------------------------------------------
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(session({
//   secret:            process.env.SESSION_SECRET || 'dev-secret-change-in-production',
//   resave:            false,
//   saveUninitialized: false,
//   cookie: {
//     secure:   false,    // set true when using HTTPS in production
//     httpOnly: true,
//     maxAge:   3600000,  // 1 hour
//   },
// }));

// // ---------------------------------------------------------------------------
// // Token Exchange Function (using Axios)
// // ---------------------------------------------------------------------------
// async function exchangeCodeForToken(code) {
//   const params = new URLSearchParams();
//   params.append('grant_type',    'authorization_code');
//   params.append('code',          code);
//   params.append('redirect_uri',  oauthConfig.redirectUri);
//   params.append('client_id',     oauthConfig.clientId);
//   params.append('client_secret', oauthConfig.clientSecret);

//   const response = await axios.post(oauthConfig.tokenUrl, params, {
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Accept':       'application/json',
//     },
//   });

//   return response.data;
// }

// // ---------------------------------------------------------------------------
// // Routes
// // ---------------------------------------------------------------------------

// // Home — show available endpoints
// app.get('/', (req, res) => {
//   res.json({
//     service:   'ClearBooks OAuth2 Backend',
//     status:    'running',
//     endpoints: {
//       login:    'GET /auth/login     → redirects to ClearBooks authorization page',
//       callback: 'GET /auth/callback  → exchanges code for access token',
//       status:   'GET /auth/status    → check current session token',
//       logout:   'GET /auth/logout    → clear session',
//     },
//   });
// });

// // ---------------------------------------------------------------------------
// // GET /auth/login
// // Generates state, saves to session, redirects to ClearBooks
// // ---------------------------------------------------------------------------
// app.get('/auth/login', (req, res) => {
//   const state = crypto.randomBytes(16).toString('hex');
//   req.session.oauthState = state;

//   const authUrl = new URL(oauthConfig.authorizationUrl);
//   authUrl.searchParams.set('response_type', 'code');
//   authUrl.searchParams.set('client_id',     oauthConfig.clientId);
//   authUrl.searchParams.set('redirect_uri',  oauthConfig.redirectUri);
//   authUrl.searchParams.set('scope',         oauthConfig.scope);
//   authUrl.searchParams.set('state',         state);

//   console.log(`[OAuth] Redirecting to ClearBooks: ${authUrl.toString()}`);
//   res.redirect(authUrl.toString());
// });

// // ---------------------------------------------------------------------------
// // GET /auth/callback
// // ClearBooks redirects here with ?code=...&state=...
// // Validates state, exchanges code for access token via Axios
// // ---------------------------------------------------------------------------
// app.get('/auth/callback', async (req, res) => {
//   const { code, state, error, error_description } = req.query;

//   // 1. Handle errors from ClearBooks (e.g. user denied access)
//   if (error) {
//     console.error(`[OAuth] Error from ClearBooks: ${error} – ${error_description}`);
//     return res.status(400).json({
//       success:           false,
//       error,
//       error_description: error_description || 'Authorization was denied or failed.',
//     });
//   }

//   // 2. Validate state to prevent CSRF attacks
//   if (!state || state !== req.session.oauthState) {
//     console.error('[OAuth] State mismatch – possible CSRF attack.');
//     return res.status(403).json({
//       success: false,
//       error:   'state_mismatch',
//       message: 'OAuth state parameter mismatch. Request may have been tampered with.',
//     });
//   }

//   // 3. Ensure authorization code is present
//   if (!code) {
//     return res.status(400).json({
//       success: false,
//       error:   'missing_code',
//       message: 'No authorization code was returned by ClearBooks.',
//     });
//   }

//   // 4. Exchange code for access token
//  try {
//   console.log('[OAuth] Exchanging authorization code for access token...');
//   const tokenData = await exchangeCodeForToken(code);

//   // Clear used state from session
//   delete req.session.oauthState;

//   // Store tokens in session for future API calls
//   req.session.accessToken  = tokenData.access_token;
//   req.session.refreshToken = tokenData.refresh_token || null;
//   req.session.tokenExpiry  = tokenData.expires_in
//     ? Date.now() + tokenData.expires_in * 1000
//     : null;

//   console.log('[OAuth] Access token obtained successfully.');

//   // Redirect back to React frontend instead of returning JSON
//   return res.redirect("http://localhost:5173");

// } catch (err) {

//   const status  = err.response?.status || 500;
//   const details = err.response?.data   || err.message;
//   console.error('[OAuth] Token exchange failed:', details);

//   return res.redirect("http://localhost:5173");
// }
// });

// // ---------------------------------------------------------------------------
// // GET /auth/status
// // Check whether the current session has a valid token
// // ---------------------------------------------------------------------------
// app.get('/auth/status', (req, res) => {
//   if (!req.session.accessToken) {
//     return res.status(200).json({ authenticated: false, message: 'No active session.' });
//   }

//   const expired = req.session.tokenExpiry
//     ? Date.now() > req.session.tokenExpiry
//     : false;

//   return res.status(200).json({
//     authenticated: true,
//     token_preview: `${req.session.accessToken.substring(0, 12)}…`,
//     expires_at:    req.session.tokenExpiry
//       ? new Date(req.session.tokenExpiry).toISOString()
//       : 'unknown',
//     expired,
//   });
// });

// // ---------------------------------------------------------------------------
// // GET /auth/logout
// // Clears the session
// // ---------------------------------------------------------------------------
// app.get('/auth/logout', (req, res) => {
//   req.session.destroy();
//   res.status(200).json({ success: true, message: 'Session cleared.' });
// });

// // ---------------------------------------------------------------------------
// // 404 & Error Handlers
// // ---------------------------------------------------------------------------
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found.' });
// });

// app.use((err, req, res, _next) => {
//   console.error('[Server Error]', err);
//   res.status(500).json({ error: 'Internal server error.', message: err.message });
// });

// // ---------------------------------------------------------------------------
// // Start Server
// // ---------------------------------------------------------------------------
// app.listen(PORT, () => {
//   console.log('');
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log('  ClearBooks OAuth2 Backend');
//   console.log(`  Listening on http://localhost:${PORT}`);
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log(`  → Login:    http://localhost:${PORT}/auth/login`);
//   console.log(`  → Callback: http://localhost:${PORT}/auth/callback`);
//   console.log(`  → Status:   http://localhost:${PORT}/auth/status`);
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log('');
// });



// server.js
// ClearBooks API Backend — ES Module, structured with controllers & routes


// server.js
// ClearBooks API Backend — ES Module, structured with controllers & routes


// server.js
// ClearBooks API Backend — ES Module, structured with controllers & routes





// server.js
// ClearBooks API Backend — ES Module, structured with controllers & routes

import 'dotenv/config';
import express  from 'express';
import session  from 'express-session';
import cors     from 'cors';

// Routes
import authRoutes        from './src/routes/authRoutes.js';
import businessRoutes    from './src/routes/businessRoutes.js';
import customerRoutes    from './src/routes/customerRoutes.js';
import supplierRoutes    from './src/routes/supplierRoutes.js';
import salesRoutes       from './src/routes/salesRoutes.js';
import purchaseRoutes    from './src/routes/purchaseRoutes.js';
import bankAccountRoutes from './src/routes/bankAccountRoutes.js';
import stockItemRoutes    from './src/routes/stockItemRoutes.js';
import accountCodeRoutes  from './src/routes/accountCodeRoutes.js';
import journalRoutes      from './src/routes/journalRoutes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ---------------------------------------------------------------------------
// Body parsers
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   false,   // set true with HTTPS in production
    httpOnly: true,
    maxAge:   3600000, // 1 hour
  },
}));

// ---------------------------------------------------------------------------
// Mount Routes
// ---------------------------------------------------------------------------
app.use('/auth',          authRoutes);
app.use('/businesses',    businessRoutes);
app.use('/customers',     customerRoutes);
app.use('/suppliers',     supplierRoutes);
app.use('/sales',         salesRoutes);
app.use('/purchases',     purchaseRoutes);
app.use('/bank-accounts', bankAccountRoutes);
app.use('/stock-items',   stockItemRoutes);
app.use('/account-codes', accountCodeRoutes);
app.use('/journals',      journalRoutes);

// ---------------------------------------------------------------------------
// Home — API overview
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    service: 'ClearBooks API Backend',
    status:  'running',
    endpoints: {
      auth: {
        login:    'GET  /auth/login',
        callback: 'GET  /auth/callback',
        status:   'GET  /auth/status',
        logout:   'GET  /auth/logout',
      },
      businesses:   { list: 'GET  /businesses' },
      customers:    { list: 'GET  /customers',  create: 'POST /customers' },
      suppliers:    { list: 'GET  /suppliers' },
      sales:        { list: 'GET  /sales',       create: 'POST /sales' },
      purchases:    { list: 'GET  /purchases' },
      bankAccounts: { list: 'GET  /bank-accounts' },
    },
  });
});

// ---------------------------------------------------------------------------
// 404 & Global Error Handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error.', message: err.message });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ClearBooks API Backend');
  console.log(`  http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Auth      →  GET  /auth/login`);
  console.log(`  Businesses→  GET  /businesses`);
  console.log(`  Customers →  GET  /customers   POST /customers`);
  console.log(`  Suppliers →  GET  /suppliers`);
  console.log(`  Sales     →  GET  /sales        POST /sales`);
  console.log(`  Purchases →  GET  /purchases`);
  console.log(`  Bank Accs →  GET  /bank-accounts`);
  console.log(`  Stock     →  GET  /stock-items   POST /stock-items`);
  console.log(`  AccCodes  →  GET  /account-codes`);
  console.log(`  VatRates  →  GET  /account-codes/vat-rates`);
  console.log(`  Journals  →  POST /journals   POST /journals/bulk`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});