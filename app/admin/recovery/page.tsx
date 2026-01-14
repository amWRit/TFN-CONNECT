"use client";
import { useState } from 'react';
import { KeyRound, CheckCircle, AlertTriangle, Loader2, Mail, HelpCircle, Eye, EyeOff } from "lucide-react";

export default function AdminRecoveryPage() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword2, setShowPassword2] = useState(false);
  const [step, setStep] = useState(1);
  type ResultType = { success: boolean; restored?: string; error?: string } | null;
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);
  const [password1Error, setPassword1Error] = useState<string | null>(null);
  const [answer1Error, setAnswer1Error] = useState<string | null>(null);
  const [answer2Error, setAnswer2Error] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch('/api/admin-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password1, answer1, answer2, password2 }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  async function handlePassword1Next() {
    setLoading(true);
    setPassword1Error(null);
    setEmailError(null);
    // Only validate password1 and email (send dummy values for other fields)
    const res = await fetch('/api/admin-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password1, answer1: '___', answer2: '___', password2: '___' }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      if (data.error.toLowerCase().includes('email')) {
        setEmailError('Unauthorized or incorrect super admin email.');
      } else if (data.error.toLowerCase().includes('password')) {
        setPassword1Error('Incorrect first recovery password.');
      }
    } else {
      setStep(2);
    }
  }

  async function handleQuestionsNext() {
    setLoading(true);
    setAnswer1Error(null);
    setAnswer2Error(null);
    // Validate answers (send dummy password2)
    const res = await fetch('/api/admin-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password1, answer1, answer2, password2: '___' }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      if (data.error.toLowerCase().includes('question 1')) {
        setAnswer1Error('Incorrect answer to security question 1.');
      } else if (data.error.toLowerCase().includes('question 2')) {
        setAnswer2Error('Incorrect answer to security question 2.');
      } else {
        // fallback: show both
        setAnswer1Error(data.error);
        setAnswer2Error(data.error);
      }
    } else {
      setStep(3);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-xl text-center border-0 relative flex flex-col items-center">
        <span className="bg-blue-100 p-4 rounded-full mb-4 flex items-center justify-center">
          <KeyRound size={38} className="text-blue-600" />
        </span>
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 flex items-center justify-center gap-2">
          Admin Recovery
        </h1>
        <p className="text-base text-gray-600 mb-6 font-medium">
          Enter your super admin email and follow the steps to restore admin access.
        </p>
        {result && (
          <div className="mb-4">
            {result.success ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-base flex items-center gap-2 justify-center">
                <CheckCircle size={20} className="text-green-500" /> Restored: {result.restored}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base flex items-center gap-2 justify-center">
                <AlertTriangle size={20} className="text-red-400" /> {result.error}
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div className="relative mb-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 text-base ${step !== 1 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="Super admin email"
              required
              disabled={step !== 1}
            />
            <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
            {emailError && (
              <div className="text-red-600 text-sm mt-2 text-left">{emailError}</div>
            )}
          </div>
          {step === 1 && (
            <div className="relative mb-4">
              <input
                type={showPassword1 ? "text" : "password"}
                value={password1}
                onChange={e => setPassword1(e.target.value)}
                className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 pr-12 text-base"
                placeholder="First recovery password"
                required
              />
              <KeyRound size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowPassword1((v) => !v)}
                aria-label={showPassword1 ? "Hide password" : "Show password"}
              >
                {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {password1Error && (
                <div className="text-red-600 text-sm mt-2 text-left">{password1Error}</div>
              )}
            </div>
          )}
          {step === 2 && (
            <>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={answer1}
                  onChange={e => setAnswer1(e.target.value)}
                  className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 text-base"
                  placeholder="Who was the first TFN applicant? (first name)"
                  required
                />
                <HelpCircle size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                {answer1Error && (
                  <div className="text-red-600 text-sm mt-2 text-left">{answer1Error}</div>
                )}
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={answer2}
                  onChange={e => setAnswer2(e.target.value)}
                  className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 text-base"
                  placeholder="Birth year of first TFN fellow selected? (e.g. 2013)"
                  required
                />
                <HelpCircle size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                {answer2Error && (
                  <div className="text-red-600 text-sm mt-2 text-left">{answer2Error}</div>
                )}
              </div>
            </>
          )}
          {step === 3 && (
            <div className="relative mb-4">
              <input
                type={showPassword2 ? "text" : "password"}
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 pr-12 text-base"
                placeholder="Second recovery password"
                required
              />
              <KeyRound size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowPassword2((v) => !v)}
                aria-label={showPassword2 ? "Hide password" : "Show password"}
              >
                {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            {step > 1 && (
              <button type="button" className="flex-1 py-2 rounded bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition-colors" onClick={() => setStep(step - 1)} disabled={loading}>Back</button>
            )}
            {step === 1 && (
              <button type="button" className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors" onClick={handlePassword1Next} disabled={loading || !password1}>Next</button>
            )}
            {step === 2 && (
              <button type="button" className="flex-1 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors" onClick={handleQuestionsNext} disabled={loading || !answer1 || !answer2}>Next</button>
            )}
            {step === 3 && (
              <button type="submit" className="flex-1 py-2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2" disabled={loading || !password2}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Restoring...</> : <><KeyRound size={18} className="text-white" /> Restore Admin</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
