import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Alert, Card } from '../components/UI';
import { getErrorMessage } from '../utils/helpers';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [email, setEmail] = useState(location.state?.email || '');

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({
        email: email.trim(),
        code: code,
      });
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            {email ? `We've sent a verification code to ${email}` : 'Check your email for a verification code'}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!location.state?.email && (
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              6-Digit Verification Code
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="text-center text-2xl font-bold tracking-widest"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Code expires in: <span className="font-semibold">{formatTime(timer)}</span>
            </p>
          </div>

          <Button type="submit" size="lg" loading={loading} disabled={timer === 0}>
            Verify Email
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Didn't receive the code?{' '}
            <button className="text-green-600 hover:text-green-700 font-semibold" disabled={timer > 0}>
              Resend
            </button>
          </p>
        </div>

        <p className="text-center text-gray-600 text-sm mt-4">
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Create new account
          </button>
        </p>
      </Card>
    </div>
  );
};

export default EmailVerification;
