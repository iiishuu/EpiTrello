import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - will be replaced with real data from API
  const boards = [
    { id: '1', name: 'Project Alpha', color: '#0079BF', description: 'Development tasks' },
    { id: '2', name: 'Marketing', color: '#61BD4F', description: 'Marketing campaigns' },
    { id: '3', name: 'Personal', color: '#EB5A46', description: 'Personal tasks' },
  ];

  return (
    <Layout>
      <PageTransition>
      <div className="p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your boards and collaborate with your team
          </p>
        </div>

        {/* Boards Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Boards</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Board
          </Button>
        </div>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-600 mb-6">Create your first board to get started</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create your first board
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <Card
                key={board.id}
                hover
                onClick={() => navigate(`/board/${board.id}`)}
                className="cursor-pointer"
                padding="none"
              >
                <div
                  className="h-24 rounded-t-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: board.color }}
                >
                  {board.name.charAt(0)}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{board.name}</h3>
                  <p className="text-sm text-gray-600">{board.description}</p>
                </div>
              </Card>
            ))}

            {/* Create new board card */}
            <Card
              hover
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[180px]"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-medium text-gray-700">Create new board</p>
              </div>
            </Card>
          </div>
        )}
      </div>
      </PageTransition>
    </Layout>
  );
}
