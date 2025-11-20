import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { setLists, clearLists } from '../store/listsSlice';
import { boardService } from '../services/boardService';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PageTransition from '../components/common/PageTransition';
import List from '../components/board/List';
import AddListButton from '../components/board/AddListButton';

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector((state: RootState) => state.lists.lists);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const boardData = await boardService.getBoard(id);
        setBoard(boardData);
        dispatch(setLists(boardData.lists || []));
      } catch (err: any) {
        console.error('Failed to fetch board:', err);
        setError(err.response?.data?.error || 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();

    return () => {
      dispatch(clearLists());
    };
  }, [id, dispatch]);

  if (loading) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading board...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !board) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Board not found'}</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: board.name, path: `/board/${board.id}` },
  ];

  return (
    <Layout showSidebar={false}>
      <PageTransition>
        {/* Board Header */}
        <div
          className="px-6 py-4 border-b border-gray-200"
          style={{ backgroundColor: board.color }}
        >
          <div className="mb-3">
            <Breadcrumbs items={breadcrumbItems.map(item => ({
              ...item,
              label: item.label === board.name ? item.label : item.label,
            }))} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">{board.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowInviteModal(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite
              </Button>
            </div>
          </div>
        </div>

        {/* Board Content - Lists */}
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4 min-h-[calc(100vh-180px)]">
            {lists.map((list) => (
              <List key={list.id} list={list} />
            ))}

            {/* Add List Button */}
            {id && <AddListButton boardId={id} />}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}
