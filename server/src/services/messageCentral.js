const axios = require('axios');

// MessageCentral "Verify" (OTP) integration.
// MessageCentral generates, delivers AND validates the OTP — we only hold on to
// the `verificationId` it hands back so we can validate the code later.
// Docs: https://www.messagecentral.com/ → Verify / Verification API (v3)

const BASE         = process.env.MC_BASE_URL || 'https://cpaas.messagecentral.com';
const COUNTRY_CODE = process.env.MC_COUNTRY_CODE || '91';   // dialing code for send/validate
const AUTH_COUNTRY = process.env.MC_AUTH_COUNTRY || 'IN';   // ISO code for the token endpoint
// MessageCentral defaults to a 4-digit OTP; our UI renders 6 boxes, so request 6.
const OTP_LENGTH   = process.env.MC_OTP_LENGTH || '6';

// Dev fallback OTP, used only when MessageCentral isn't configured (no env), so
// local development keeps working without real SMS credentials.
const DEV_OTP          = '111111';
const DEV_VERIFICATION = 'DEV';

// MessageCentral wants the bare local number; we store phones as "+91XXXXXXXXXX".
const toLocalNumber = (phone = '') => phone.replace(/\D/g, '').slice(-10);

const isConfigured = () =>
  Boolean(process.env.MC_CUSTOMER_ID && (process.env.MC_AUTH_TOKEN || process.env.MC_PASSWORD));

// ── Auth token ───────────────────────────────────────────────────────────
// Every Verify call is signed with an `authToken`. You can paste a long-lived
// token straight into MC_AUTH_TOKEN, or let us mint one from customerId +
// password (MessageCentral's "key" is just the base64 of the password).
let cachedToken = null;
let cachedAt    = 0;
const TOKEN_TTL_MS = 6 * 24 * 60 * 60 * 1000; // refresh comfortably before expiry

const getAuthToken = async () => {
  if (process.env.MC_AUTH_TOKEN) return process.env.MC_AUTH_TOKEN;
  if (cachedToken && Date.now() - cachedAt < TOKEN_TTL_MS) return cachedToken;

  const key = Buffer.from(process.env.MC_PASSWORD).toString('base64');
  const { data } = await axios.get(`${BASE}/auth/v1/authentication/token`, {
    params: {
      customerId: process.env.MC_CUSTOMER_ID,
      key,
      scope:   'NEW',
      country: AUTH_COUNTRY,
      email:   process.env.MC_EMAIL,
    },
  });

  if (!data?.token) throw new Error('MessageCentral auth: no token returned');
  cachedToken = data.token;
  cachedAt    = Date.now();
  return cachedToken;
};

// ── Send OTP ─────────────────────────────────────────────────────────────
// Returns the verificationId to persist against the auth session.
const sendOtp = async (phone) => {
  if (!isConfigured()) {
    console.log(`[DEV] MessageCentral not configured — OTP for ${phone} is ${DEV_OTP}`);
    return DEV_VERIFICATION;
  }

  const token = await getAuthToken();
  const { data } = await axios.post(`${BASE}/verification/v3/send`, null, {
    params: {
      countryCode:  COUNTRY_CODE,
      customerId:   process.env.MC_CUSTOMER_ID,
      flowType:     'SMS',
      mobileNumber: toLocalNumber(phone),
      otpLength:    OTP_LENGTH,
    },
    headers: { accept: '*/*', authToken: token },
  });

  const verificationId = data?.data?.verificationId;
  if (!verificationId) {
    throw new Error(`MessageCentral send failed: ${data?.message || 'no verificationId'}`);
  }
  return String(verificationId);
};

// ── Validate OTP ─────────────────────────────────────────────────────────
// Returns true only when MessageCentral confirms the code matches.
const validateOtp = async ({ phone, verificationId, code }) => {
  if (!isConfigured() || verificationId === DEV_VERIFICATION) {
    return code === DEV_OTP;
  }

  const token = await getAuthToken();
  try {
    const { data } = await axios.get(`${BASE}/verification/v3/validateOtp`, {
      params: {
        countryCode:  COUNTRY_CODE,
        mobileNumber: toLocalNumber(phone),
        verificationId,
        customerId:   process.env.MC_CUSTOMER_ID,
        code,
      },
      headers: { accept: '*/*', authToken: token },
    });
    // MC can answer 200 with a non-COMPLETED status / errorMessage for a wrong code.
    return data?.data?.verificationStatus === 'VERIFICATION_COMPLETED'
        && !data?.data?.errorMessage;
  } catch (err) {
    // MessageCentral returns a 4xx for wrong/expired codes — treat as a failed
    // verification rather than a server error.
    console.warn('MessageCentral validateOtp rejected:', err.response?.data?.message || err.message);
    return false;
  }
};

module.exports = { sendOtp, validateOtp, isConfigured };
