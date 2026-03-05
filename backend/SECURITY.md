# Amigo Chat – Security Implementation

## 1. Transport Security (TLS 1.3)

- **Groups and Channels:** All communication is secured with **TLS 1.3** when the app is deployed over HTTPS.
- **Production:** Run the backend behind a reverse proxy (e.g. Nginx, Caddy) with TLS 1.3 enabled, or use a platform (e.g. Render, Railway) that terminates TLS.
- Ensure your server/cluster is configured for TLS 1.3 and that HTTPS is used for all API and WebSocket endpoints.

## 2. Direct Messages (DM) – End-to-End Encryption (E2EE)

- **Target:** Signal Protocol–based E2EE for DM so that only the sender and recipient can read messages.
- **Current:** Backend stores message payloads; clients can optionally encrypt the body before send and decrypt after receive.
- **To complete Signal Protocol E2EE:**
  - Use a client library such as `@signalapp/libsignal-client` (or equivalent) for key agreement and Double Ratchet.
  - Publish identity and signed prekeys to the server; clients fetch each other’s keys and establish a session.
  - Encrypt message body (and optional attachments) with the session before sending; store only ciphertext and metadata on the server.
  - Implement session reset and key rotation as per Signal’s recommendations.

## 3. Amigo Wallet

- Wallet files are encrypted at rest using **AES-256-GCM** (see `utility/walletEncryption.js`).
- Encryption key is derived from `WALLET_ENCRYPTION_KEY` (or fallback). Set a strong key in production.
- S3 bucket for wallet should have server-side encryption (SSE) enabled for an extra layer.

## 4. General

- Use strong JWT secrets and short-lived access tokens.
- Never log or expose encryption keys or raw secrets.
- Prefer TLS 1.3 and HTTPS everywhere in production.
