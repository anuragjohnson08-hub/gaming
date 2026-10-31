import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  Cpu,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { CatalogItem } from '../types/nexus';
import { NexusUser } from '../utils/authLogic';
import { formatINR } from '../utils/catalogLogic';
import { executeWithIdempotency, generateIdempotencyKey } from '../utils/idempotency';

/**
 * 15. ONE-TIME CODE AUTOFILL, 19. IDEMPOTENCY KEYS, 13. HIT SLOP, 14. SAFE AREAS, 16. TABULAR NUMBERS, 17. BALANCED HEADLINES
 */

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: NexusUser | null;
  savedItems: CatalogItem[];
  onLogin: (email: string, password: string) => { success: boolean; error: string | null };
  onSignUp: (input: {
    name: string;
    email: string;
    password: string;
    hardwareRig?: string;
  }) => { success: boolean; error: string | null };
  onLogout: () => void;
  onSelectSavedItem: (item: CatalogItem) => void;
  onUpdateRig: (rig: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  savedItems,
  onLogin,
  onSignUp,
  onLogout,
  onSelectSavedItem,
  onUpdateRig,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [hardwareRig, setHardwareRig] = useState('RTX 5070 12GB · Ryzen 7 9800X3D');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingRig, setEditingRig] = useState('');
  const [rigSavedNotice, setRigSavedNotice] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (currentUser) {
        setEditingRig(currentUser.hardwareRig || 'RTX 5070 12GB · Ryzen 7 9800X3D');
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const idempotencyKey = generateIdempotencyKey('auth_submit', email || 'guest');
    executeWithIdempotency(idempotencyKey, () => {
      if (mode === 'login') {
        const res = onLogin(email, password);
        if (!res.success) {
          setErrorMsg(res.error);
        } else {
          setPassword('');
        }
      } else if (mode === 'signup') {
        const res = onSignUp({
          name,
          email,
          password,
          hardwareRig,
        });
        if (!res.success) {
          setErrorMsg(res.error);
        } else {
          setPassword('');
        }
      } else if (mode === 'otp') {
        const code = otpDigits.join('');
        if (code.length < 6) {
          setErrorMsg('Please enter the complete 6-digit verification code.');
          return;
        }
        // Simulated instant OTP verification
        const res = onLogin('reviewer@nexus.gg', 'nexus2026');
        if (!res.success) {
          setErrorMsg(res.error);
        }
      }
    });
  };

  const handleQuickDemoLogin = () => {
    setErrorMsg(null);
    const key = generateIdempotencyKey('demo_login', 'reviewer');
    executeWithIdempotency(key, () => {
      const res = onLogin('reviewer@nexus.gg', 'nexus2026');
      if (res.success) {
        setPassword('');
      }
    });
  };

  const handleOtpChange = (index: number, val: string) => {
    // Handle multi-character paste
    if (val.length > 1) {
      const chars = val.replace(/\D/g, '').slice(0, 6).split('');
      const updated = [...otpDigits];
      chars.forEach((c, i) => {
        if (i < 6) updated[i] = c;
      });
      setOtpDigits(updated);
      otpRefs.current[Math.min(chars.length, 5)]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '');
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentUser ? 'User Profile and Account' : 'Sign In or Create Account'}
      className="fixed inset-0 z-50 bg-[#312A75]/25 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 nexus-safe-top nexus-safe-bottom"
    >
      <div className="nexus-panel-enter nexus-editorial-modal w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#2E276C]/10 flex items-center justify-between bg-white/65">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-[#584CE8]" />
            <h2 className="font-display text-base font-extrabold text-[#312A75] text-balance">
              {currentUser ? 'NEXUS Member Profile' : 'NEXUS Account Access'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account modal"
            className="nexus-hit-slop p-1.5 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          /* Authenticated User Profile View */
          <div className="p-5 sm:p-6 space-y-5">
            <div className="nexus-editorial-well flex items-center justify-between gap-4 p-4 rounded-2xl !border-[#584CE8]/40">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full nexus-dock-circle-active font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p
                    data-testid="authenticated-user-name"
                    className="font-display text-base font-extrabold text-[#312A75] truncate text-balance"
                  >
                    {currentUser.name}
                  </p>
                  <p className="text-xs font-mono text-[#515E7B] truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#266D75] shrink-0">
                VERIFIED
              </span>
            </div>

            {/* Personal Rig Configuration */}
            <div className="space-y-2">
              <label
                htmlFor="profile-rig-input"
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#515E7B]"
              >
                <Cpu className="w-3.5 h-3.5 text-[#584CE8]" />
                <span>MY SYSTEM CONFIGURATION</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="profile-rig-input"
                  type="text"
                  value={editingRig}
                  onChange={(e) => {
                    setEditingRig(e.target.value);
                    setRigSavedNotice(false);
                  }}
                  className="nexus-editorial-well flex-1 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#312A75] focus:outline-none focus:border-[#584CE8]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const key = generateIdempotencyKey('update_rig', currentUser.id);
                    executeWithIdempotency(key, () => {
                      onUpdateRig(editingRig);
                      setRigSavedNotice(true);
                    });
                  }}
                  className="nexus-hit-slop nexus-editorial-control px-3.5 py-2 rounded-xl text-xs font-semibold text-[#312A75] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {rigSavedNotice ? 'Saved' : 'Update Rig'}
                </button>
              </div>
            </div>

            {/* Saved Items Synced to Account */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#515E7B] mb-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#266D75]" />
                  <span>SAVED TO ACCOUNT (<span className="tabular-nums">{savedItems.length}</span>)</span>
                </span>
                <span className="text-[10px] text-[#584CE8]">SYNCED</span>
              </div>

              {savedItems.length === 0 ? (
                <div className="nexus-editorial-well p-4 rounded-2xl border-dashed text-center text-xs text-[#515E7B]">
                  No reviews or hardware saved yet. Bookmark any card to save it to
                  your profile.
                </div>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                  {savedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectSavedItem(item);
                        onClose();
                      }}
                      className="nexus-editorial-well w-full p-3 rounded-xl hover:bg-white/80 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-[#312A75] block truncate">
                          {item.shortTitle}
                        </span>
                        <span className="text-[11px] text-[#515E7B]">
                          {item.category} · <span className="tabular-nums">{formatINR(item.priceINR)}</span>
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#584CE8] font-bold shrink-0 tabular-nums">
                        {item.overallScore.toFixed(1)}/10
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Log Out Action */}
            <div className="pt-3 border-t border-[#2E276C]/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#515E7B]">
                Member since {currentUser.createdAt}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="nexus-hit-slop nexus-editorial-control inline-flex items-center gap-2 px-4 py-2 rounded-full hover:!bg-red-500/15 text-[#312A75] hover:text-red-700 hover:!border-red-400/50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form View */
          <div className="p-5 sm:p-6">
            {/* Mode Switcher Tabs */}
            <div
              role="tablist"
              aria-label="Authentication Mode"
              className="nexus-editorial-well grid grid-cols-3 gap-1 p-1 rounded-2xl mb-5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#584CE8] text-white shadow-xs'
                    : 'text-[#515E7B] hover:text-[#312A75]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#584CE8] text-white shadow-xs'
                    : 'text-[#515E7B] hover:text-[#312A75]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'otp'}
                onClick={() => {
                  setMode('otp');
                  setErrorMsg(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'otp'
                    ? 'bg-[#584CE8] text-white shadow-xs'
                    : 'text-[#515E7B] hover:text-[#312A75]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>One-Time Code</span>
              </button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                data-testid="auth-error-message"
                className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-400/50 text-xs font-semibold text-red-800"
              >
                {errorMsg}
              </div>
            )}

            {mode === 'otp' ? (
              /* 15. ONE-TIME CODE (OTP) AUTOFILL INTERFACE */
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-display text-sm font-extrabold text-[#312A75]">
                    Enter 6-Digit Passcode
                  </p>
                  <p className="text-xs text-[#515E7B]">
                    Paste or type verification code sent to your authenticator or SMS.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 py-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 sm:w-12 h-12 text-center text-lg font-mono font-extrabold tabular-nums rounded-xl bg-white/80 border border-[#2E276C]/15 focus:border-[#584CE8] focus:ring-2 focus:ring-[#584CE8]/20 focus:outline-none text-[#312A75]"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="nexus-hit-slop nexus-dock-circle-active w-full py-2.5 px-4 rounded-full font-semibold text-sm transition-colors cursor-pointer"
                >
                  Verify & Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="auth-name-input"
                      className="block text-xs font-mono font-bold text-[#515E7B] mb-1.5"
                    >
                      DISPLAY NAME
                    </label>
                    <input
                      id="auth-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="nexus-editorial-well w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#312A75] placeholder-[#515E7B]/60 focus:outline-none focus:border-[#584CE8]"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email-input"
                    className="block text-xs font-mono font-bold text-[#515E7B] mb-1.5"
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@nexus.gg"
                    className="nexus-editorial-well w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#312A75] placeholder-[#515E7B]/60 focus:outline-none focus:border-[#584CE8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password-input"
                    className="block text-xs font-mono font-bold text-[#515E7B] mb-1.5"
                  >
                    PASSWORD
                  </label>
                  <input
                    id="auth-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="nexus-editorial-well w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#312A75] placeholder-[#515E7B]/60 focus:outline-none focus:border-[#584CE8]"
                  />
                </div>

                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="auth-rig-input"
                      className="block text-xs font-mono font-bold text-[#515E7B] mb-1.5"
                    >
                      PRIMARY PC / CONSOLE RIG (OPTIONAL)
                    </label>
                    <input
                      id="auth-rig-input"
                      type="text"
                      value={hardwareRig}
                      onChange={(e) => setHardwareRig(e.target.value)}
                      placeholder="e.g. RTX 5070 · Ryzen 7 9800X3D"
                      className="nexus-editorial-well w-full rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#312A75] placeholder-[#515E7B]/60 focus:outline-none focus:border-[#584CE8]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="nexus-hit-slop nexus-dock-circle-active w-full py-2.5 px-4 rounded-full font-semibold text-sm transition-colors cursor-pointer"
                >
                  {mode === 'login' ? 'Log In to NEXUS' : 'Create NEXUS Account'}
                </button>
              </form>
            )}

            {/* Quick Demo Account Option */}
            <div className="mt-5 pt-4 border-t border-[#2E276C]/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-[#515E7B] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#266D75]" />
                <span>Instant Lab Reviewer Profile:</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="nexus-hit-slop text-xs font-mono font-bold text-[#584CE8] hover:text-[#312A75] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
              >
                Use Demo Account →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
