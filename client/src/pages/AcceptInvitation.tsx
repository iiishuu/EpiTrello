import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { invitationService } from '../services/invitationService';

interface Invitation {
  id: string;
  email: string;
  token: string;
  boardId: string;
  status: string;
  expiresAt: string;
  board?: {
    id: string;
    name: string;
    color: string;
  };
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const response = await invitationService.getInvitation(token);
        setInvitation(response.invitation);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Invitation not found');
        } else if (err.response?.status === 410) {
          setError('This invitation has expired');
        } else if (err.response?.status === 400) {
          setError('This invitation has already been used');
        } else {
          setError('Failed to load invitation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !isAuthenticated) return;

    setAccepting(true);
    setError('');

    try {
      await invitationService.acceptInvitation(token);
      setSuccess(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('This invitation was sent to a different email address');
      } else if (err.response?.status === 410) {
        setError('This invitation has expired');
      } else if (err.response?.status === 400) {
        setError('This invitation has already been used');
      } else {
        setError('Failed to accept invitation');
      }
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
          <p className="text-gray-600">You now have access to the board. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-700 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Board Invitation</h1>
          <p className="text-gray-600">You've been invited to collaborate!</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4"
              style={{ backgroundColor: invitation?.board?.color || '#0079BF' }}
            >
              {invitation?.board?.name?.charAt(0) || 'B'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{invitation?.board?.name}</h2>
              <p className="text-sm text-gray-600">Board</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Invited by</p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {invitation?.sender?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{invitation?.sender?.name}</p>
                <p className="text-sm text-gray-600">{invitation?.sender?.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-sm text-gray-600">Invited email</p>
            <p className="font-medium text-gray-900">{invitation?.email}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-center text-gray-600 mb-4">
              Please sign in or create an account to accept this invitation
            </p>
            <Link
              to="/login"
              className="block w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition text-center"
            >
              Create Account
            </Link>
          </div>
        ) : user?.email !== invitation?.email ? (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium mb-1">Email mismatch</p>
              <p className="text-sm">This invitation was sent to {invitation?.email}, but you're logged in as {user?.email}</p>
            </div>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? 'Accepting...' : 'Accept Anyway'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
        )}
      </div>
    </div>
  );
}
