// src/config/oauth.js
// All ClearBooks OAuth2 scopes — controls what data your app can access.
// These are sent during /auth/login to request permissions from the user.
// The returned access_token will only allow what the user approved here.

const oauthConfig = {
  clientId:         process.env.CLEARBOOKS_CLIENT_ID,
  clientSecret:     process.env.CLEARBOOKS_CLIENT_SECRET,
  redirectUri:      process.env.CLEARBOOKS_REDIRECT_URI,
  authorizationUrl: 'https://secure.clearbooks.co.uk/account/action/oauth/',
  tokenUrl:         'https://api.clearbooks.co.uk/oauth/token',

  // Each scope grants access to a specific part of the ClearBooks API.
  // Scopes are space-separated — ClearBooks checks these when validating tokens.
  scope: [
    'businesses:read',                  // Read business data
    'businesses:write',                 // Update business data

    'accounting.account_codes:read',    // Read account codes
    'accounting.account_codes:write',   // Create, update, delete account codes

    'accounting.bank_accounts:read',    // Read bank accounts
    'accounting.bank_accounts:write',   // Create, update, delete bank accounts

    'accounting.customers:read',        // Read customers
    'accounting.customers:write',       // Create, update, delete customers

    'accounting.suppliers:read',        // Read suppliers
    'accounting.suppliers:write',       // Create, update, delete suppliers

    'accounting.sales:read',            // Read sales documents (invoices)
    'accounting.sales:write',           // Create, update, delete sales documents

    'accounting.purchases:read',        // Read purchase documents (bills)
    'accounting.purchases:write',       // Create, update, delete purchase documents

    'accounting.payments:read',         // Read payments
    'accounting.payments:write',        // Create, update, delete payments

    'accounting.allocations:read',      // Read allocations
    'accounting.allocations:write',     // Create, delete allocations

    'accounting.stock_items:read',      // Read stock items
    'accounting.stock_items:write',     // Create, update, delete stock items

    'accounting.vat:read',              // Read VAT information


    'accounting.transactions:read',     // Read transactions
    'accounting.journals:write',        // Create journals
  ].join(' '),
};

// Validate required env vars at startup
['clientId', 'clientSecret', 'redirectUri'].forEach((key) => {
  if (!oauthConfig[key]) {
    throw new Error(`Missing env variable for OAuth: ${key}. Check your .env file.`);
  }
});

export default oauthConfig;