import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchBoards, createBoard, clearError } from '../store/boardsSlice';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';
import BoardCard from '../components/boards/BoardCard';
import CreateBoardModal from '../components/boards/CreateBoardModal';
import type { CreateBoardData } from '../services/boardService';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { boards, loading, error, creating } = useAppSelector((state) => state.boards);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch boards on mount
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  // Handle board creation
  const handleCreateBoard = async (data: CreateBoardData & { useTemplate?: boolean }) => {
    const result = await dispatch(createBoard(data));
    if (createBoard.fulfilled.match(result)) {
      setShowCreateModal(false);
    }
  };

  // Clear error when modal closes
  const handleCloseModal = () => {
    setShowCreateModal(false);
    dispatch(clearError());
  };

  return (
    <Layout>
      <PageTransition>
        {/* Header Section with gradient background */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 py-8 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your boards and collaborate with your team
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-200px)]">
          <div className="max-w-7xl mx-auto p-6">
            {/* Boards Section Header */}
            <div className="mb-6 flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Boards</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {boards.length} {boards.length === 1 ? 'board' : 'boards'} total
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Board
              </Button>
            </div>

            {/* Loading State */}
            {loading && boards.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading boards...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Error loading boards</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => dispatch(fetchBoards())}
                  >
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && boards.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No boards yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Get started by creating your first board to organize your projects and tasks
                </p>
                <Button onClick={() => setShowCreateModal(true)} size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create your first board
                </Button>
              </div>
            )}

            {/* Boards Grid */}
            {!loading && !error && boards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onClick={() => navigate(`/board/${board.id}`)}
                  />
                ))}

                {/* Create new board card */}
                <Card
                  hover
                  onClick={() => setShowCreateModal(true)}
                  className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center min-h-[180px] transition-all"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Create new board</p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Create Board Modal */}
        <CreateBoardModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSubmit={handleCreateBoard}
          loading={creating}
          error={error}
        />
      </PageTransition>
    </Layout>
  );
}
