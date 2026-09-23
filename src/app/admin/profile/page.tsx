'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Smartphone,
  QrCode,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';

export default function AdminProfilePage() {
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sampleSecret = 'JBSWY3DPEHPK3PXP';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(sampleSecret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      setIs2faEnabled(true);
      setIs2faModalOpen(false);
      setStatusMessage({ type: 'success', text: 'Two-factor authentication successfully configured and verified!' });
      setTotpCode('');
    } else {
      setStatusMessage({ type: 'error', text: 'Please enter a valid 6-digit TOTP code.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight">
          My Profile &amp; Security Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your administrative profile, role permissions, and Multi-Factor Authentication (2FA).
        </p>
      </div>

      {statusMessage && (
        <Alert variant={statusMessage.type === 'success' ? 'success' : 'danger'}>
          {statusMessage.text}
        </Alert>
      )}

      {/* Profile Details Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Administrative Profile</CardTitle>
            <Badge variant="emerald" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              SUPER_ADMIN
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Full Name</label>
              <input
                type="text"
                readOnly
                value="Imam E Mahdi Foundation Master Admin"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Official Email</label>
              <input
                type="email"
                readOnly
                value="admin@imf-foundation.org"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Phone Number</label>
              <input
                type="text"
                readOnly
                value="+91 99999 00000"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600">Preferred Language</label>
              <input
                type="text"
                readOnly
                value="English (en)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Multi-Factor Authentication Card */}
      <Card id="mfa">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-800" />
              <CardTitle>Multi-Factor Authentication (TOTP 2FA)</CardTitle>
            </div>
            <Badge variant={is2faEnabled ? 'success' : 'warning'} size="md">
              {is2faEnabled ? 'Enforced & Active' : 'Setup Required'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            RFC 6238 time-based one-time password verification using Google Authenticator, Microsoft Authenticator, or Authy.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-800 text-gold-300 shrink-0 shadow-soft">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-emerald-950">Authenticator App Protection</h4>
                <p className="text-[11px] text-slate-600">
                  {is2faEnabled
                    ? 'Your account is secured with 6-digit TOTP verification on every login.'
                    : 'Enhance account security by linking an authenticator app.'}
                </p>
              </div>
            </div>

            <Button
              variant={is2faEnabled ? 'outline' : 'gold'}
              size="sm"
              onClick={() => setIs2faModalOpen(true)}
              leftIcon={<Key className="w-3.5 h-3.5" />}
            >
              {is2faEnabled ? 'Reconfigure 2FA' : 'Activate 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Role & Atomic Permissions Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Assigned Roles &amp; Atomic Permissions</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Your effective permissions resolved from system role hierarchy.
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Active Role:</span>
            <Badge variant="gold">SUPER_ADMIN (Master Authority)</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Full Master Authority Granted</span>
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              As a Super Administrator, you possess universal access across all 21 sub-systems (Finance, Donations,
              Beneficiaries, Projects, HRMS, Compliance Vault, and System Settings).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={is2faModalOpen}
        onClose={() => setIs2faModalOpen(false)}
        title="Configure Multi-Factor Authentication"
        description="Scan this QR code with Google Authenticator or enter the secret manually."
        size="md"
      >
        <form onSubmit={handleVerify2FA} className="space-y-5">
          {/* Simulated QR Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-300 shadow-soft flex items-center justify-center">
              <QrCode className="w-28 h-28 text-emerald-950" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3 text-center">
              Scan with Google Authenticator or Authy
            </p>
          </div>

          {/* Manual Secret Key */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-600">Manual Entry Secret</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sampleSecret}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-800"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySecret}
                leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Verification 6-Digit Code */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700">Enter 6-Digit Security Code from App</label>
            <input
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-center font-mono text-lg font-bold tracking-widest text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIs2faModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={totpCode.length !== 6}>
              Verify &amp; Activate 2FA
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
