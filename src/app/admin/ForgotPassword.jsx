'use client';

import { useState } from 'react';

async function post(path, body = {}) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

// Step 1: send a 6-digit code to the owner's email (the server decides the address).
// Step 2: enter the code + a new password. On success the server also signs you in.
export default function ForgotPassword({ onBack, onDone }) {
  const [step, setStep] = useState('ask');
  const [sentTo, setSentTo] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sendCode() {
    setBusy(true);
    setError('');
    try {
      const data = await post('/api/admin/forgot');
      setSentTo(data.sentTo || '');
      setStep('code');
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (step === 'ask') {
      sendCode();
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await post('/api/admin/reset', { otp: otp.trim(), password });
      onDone();
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-login-card" onSubmit={submit}>
      <div className="adm-login-card-heading">
        <div>
          <p className="adm-eyebrow">ACCOUNT RECOVERY</p>
          <h2>Reset password</h2>
        </div>
      </div>

      {step === 'ask' ? (
        <>
          <p className="adm-muted adm-login-intro">
            We will email a 6-digit code to the owner address. The code works
            for 10 minutes.
          </p>
          {error && (
            <p className="adm-form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="adm-button adm-button-primary adm-login-submit"
            disabled={busy}
          >
            {busy ? 'Sending…' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <p className="mx-notice">
            Code sent to {sentTo || 'the owner email'}. Check your inbox (and
            spam).
          </p>
          <label className="adm-field">
            <span>6-digit code</span>
            <input
              value={otp}
              onChange={event =>
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              required
            />
          </label>
          <label className="adm-field">
            <span>New password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>
          <label className="adm-field">
            <span>Confirm new password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={event => setConfirm(event.target.value)}
              autoComplete="new-password"
              placeholder="Type it again"
              minLength={8}
              required
            />
          </label>
          <button
            className="adm-text-button mx-forgot"
            type="button"
            onClick={() => setShowPassword(value => !value)}
          >
            {showPassword ? 'Hide passwords' : 'Show passwords'}
          </button>
          {error && (
            <p className="adm-form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="adm-button adm-button-primary adm-login-submit"
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Reset & sign in'}
          </button>
          <button
            className="adm-text-button mx-center"
            type="button"
            disabled={busy}
            onClick={sendCode}
          >
            Send a new code
          </button>
        </>
      )}

      <button
        className="adm-text-button mx-center"
        type="button"
        onClick={onBack}
      >
        ← Back to sign in
      </button>
    </form>
  );
}
