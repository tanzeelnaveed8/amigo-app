# E2EE (End-to-End Encryption) for DM

This folder is reserved for **Signal Protocol**–based E2EE for Direct Messages.

## Intended implementation

- Use a library such as `@signalapp/libsignal-client` (or a React Native–compatible wrapper) to implement:
  - Identity key pair and signed prekeys
  - Key exchange and session setup with recipient
  - Encrypt message body (and optional media) before sending
  - Decrypt on receive; store only ciphertext on server

## Placeholder

Until Signal is integrated, the app sends DM messages as plaintext over HTTPS.  
Server and client must run over **TLS 1.3** in production (see backend `SECURITY.md`).

## Integration points

- Before sending a DM: encrypt payload with recipient’s public key / session.
- After receiving a DM: decrypt with local session.
- Backend: store and return only encrypted payload and metadata; no decryption on server.
