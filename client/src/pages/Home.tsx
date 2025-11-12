import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">EpiTrello</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to EpiTrello!
          </h2>
          <p className="text-gray-600 text-lg">
            You are successfully logged in as <strong>{user?.email}</strong>
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Authentication working!</strong> The backend and frontend are properly connected.
              Next steps will include boards, lists, and cards management.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
