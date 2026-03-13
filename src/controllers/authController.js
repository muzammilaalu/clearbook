// src/controllers/authController.js

import crypto from "crypto";
import axios from "axios";
import oauthConfig from "../config/oauth.js";

// ---------------------------------------------------------------------------
// GET /auth/login → redirect user to ClearBooks
// ---------------------------------------------------------------------------
export function login(req, res) {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;

  const authUrl = new URL(oauthConfig.authorizationUrl);

  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", oauthConfig.clientId);
  authUrl.searchParams.set("redirect_uri", oauthConfig.redirectUri);
  authUrl.searchParams.set("scope", oauthConfig.scope);
  authUrl.searchParams.set("state", state);

  console.log(`[Auth] Redirecting → ${authUrl}`);

  res.redirect(authUrl.toString());
}

// ---------------------------------------------------------------------------
// GET /auth/callback → exchange code for tokens
// ---------------------------------------------------------------------------
export async function callback(req, res) {
  const { code, state, error, error_description } = req.query;

  const FRONTEND = process.env.FRONTEND_URL

  // Handle ClearBooks error
  if (error) {
    console.error("[Auth] OAuth error:", error, error_description);
    return res.redirect(FRONTEND);
  }

  // Validate state (CSRF protection)
  if (!state || state !== req.session.oauthState) {
    console.error("[Auth] State mismatch");
    return res.redirect(FRONTEND);
  }

  // Ensure code exists
  if (!code) {
    console.error("[Auth] Missing authorization code");
    return res.redirect(FRONTEND);
  }

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: oauthConfig.redirectUri,
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
    });

    const { data: tokenData } = await axios.post(
      oauthConfig.tokenUrl,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    // remove state
    delete req.session.oauthState;

    // store tokens
    req.session.accessToken = tokenData.access_token;
    req.session.refreshToken = tokenData.refresh_token || null;
    req.session.tokenExpiry = tokenData.expires_in
      ? Date.now() + tokenData.expires_in * 1000
      : null;

    console.log("[Auth] Access token stored in session.");

    // redirect back to frontend dashboard
    return res.redirect(`${FRONTEND}/dashboard`);

  } catch (err) {
    const details = err.response?.data || err.message;
    console.error("[Auth] Token exchange failed:", details);

    return res.redirect(FRONTEND);
  }
}

// ---------------------------------------------------------------------------
// GET /auth/status → check session token
// ---------------------------------------------------------------------------
export function status(req, res) {
  if (!req.session?.accessToken) {
    return res.status(200).json({ authenticated: false });
  }

  const expired = req.session.tokenExpiry
    ? Date.now() > req.session.tokenExpiry
    : false;

  return res.status(200).json({
    authenticated: true,
    token_preview: `${req.session.accessToken.substring(0, 12)}…`,
    expires_at: req.session.tokenExpiry
      ? new Date(req.session.tokenExpiry).toISOString()
      : "unknown",
    expired,
  });
}

// ---------------------------------------------------------------------------
// GET /auth/logout → destroy session
// ---------------------------------------------------------------------------
export function logout(req, res) {
  req.session.destroy(() => {
    res.status(200).json({
      success: true,
      message: "Session cleared.",
    });
  });
}