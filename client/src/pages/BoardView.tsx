import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import type { AppDispatch, RootState } from '../store';
import { setLists, clearLists, reorderListsOptimistic } from '../store/listsSlice';
import { setCardsFromBoard, clearCards, moveCardOptimistic } from '../store/cardsSlice';
import { fetchLabels, clearLabels } from '../store/labelsSlice';
import { boardService } from '../services/boardService';
import { listService } from '../services/listService';
import { cardService } from '../services/cardService';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';
import List from '../components/board/List';
import AddListButton from '../components/board/AddListButton';
import FilterBar, { type FilterState } from '../components/board/FilterBar';
import LabelManager from '../components/board/LabelManager';

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector((state: RootState) => state.lists.lists);
  const cardsById = useSelector((state: RootState) => state.cards.cards);
  const cardsByList = useSelector((state: RootState) => state.cards.cardsByList);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    labelIds: [],
    memberIds: [],
    showOverdue: false,
    showDueSoon: false,
    showNoDueDate: false,
  });

  useEffect(() => {
    const fetchBoard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const boardData = await boardService.getBoard(id);
        setBoard(boardData);
        dispatch(setLists(boardData.lists || []));

        // Populate cards in Redux store
        const cardsData = (boardData.lists || []).map((list: any) => ({
          listId: list.id,
          cards: list.cards || [],
        }));
        dispatch(setCardsFromBoard(cardsData));

        // Fetch labels for the board
        dispatch(fetchLabels(id));
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
      dispatch(clearCards());
      dispatch(clearLabels());
    };
  }, [id, dispatch]);

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Dragging lists
    if (type === 'list') {
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);

      // Update positions
      const updatedLists = newLists.map((list, index) => ({
        ...list,
        position: index,
      }));

      // Optimistic update
      dispatch(reorderListsOptimistic(updatedLists));

      // Persist to backend
      try {
        await listService.reorderLists({
          lists: updatedLists.map((list) => ({
            id: list.id,
            position: list.position,
          })),
        });
      } catch (error) {
        console.error('Failed to reorder lists:', error);
        // Revert on error - refetch board
        const boardData = await boardService.getBoard(id!);
        dispatch(setLists(boardData.lists || []));
      }
      return;
    }

    // Dragging cards
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    // Optimistic update first
    dispatch(
      moveCardOptimistic({
        cardId: draggableId,
        sourceListId,
        destListId,
        sourceIndex: source.index,
        destIndex: destination.index,
      })
    );

    // Persist to backend
    try {
      // Get updated card positions from Redux store after optimistic update
      const sourceCardIds = cardsByList[sourceListId] || [];
      const destCardIds =
        sourceListId === destListId
          ? sourceCardIds
          : cardsByList[destListId] || [];

      const cardsToUpdate: any[] = [];

      // Add source list cards
      sourceCardIds.forEach((cardId, index) => {
        const card = cardsById[cardId];
        if (card) {
          cardsToUpdate.push({
            id: cardId,
            position: index,
            ...(card.listId !== sourceListId && { listId: card.listId }),
          });
        }
      });

      // Add dest list cards if different from source
      if (sourceListId !== destListId) {
        destCardIds.forEach((cardId, index) => {
          const card = cardsById[cardId];
          if (card && !cardsToUpdate.find((c) => c.id === cardId)) {
            cardsToUpdate.push({
              id: cardId,
              position: index,
              listId: destListId,
            });
          }
        });
      }

      await cardService.reorderCards({ cards: cardsToUpdate });
    } catch (error) {
      console.error('Failed to reorder/move cards:', error);
      // Revert on error
      const boardData = await boardService.getBoard(id!);
      dispatch(setLists(boardData.lists || []));
      const cardsData = (boardData.lists || []).map((list: any) => ({
        listId: list.id,
        cards: list.cards || [],
      }));
      dispatch(setCardsFromBoard(cardsData));
    }
  };

  // Filter logic - we don't actually filter the lists, just use the filters in the List component
  // The filtering will be done at the card level in the List component

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

  return (
    <Layout showSidebar={false}>
      <PageTransition>
        {/* Board Header */}
        <div style={{ backgroundColor: board.color }} className="shadow-md">
          <div className="px-6 py-4">
            {/* Top Row: Navigation and Board Title */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all flex items-center gap-2 font-medium"
                  title="Back to boards"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">All Boards</span>
                </button>
                <div className="h-6 w-px bg-white bg-opacity-30"></div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{board.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLabelManager(true)}
                  className="px-4 py-2 text-sm bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Labels
                </button>
              </div>
            </div>

            {/* Description if available */}
            {board.description && (
              <p className="text-white text-opacity-90 text-sm mb-3 max-w-3xl">{board.description}</p>
            )}

            {/* Filter Bar */}
            <FilterBar filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Board Content - Lists */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                className="overflow-x-auto overflow-y-hidden"
                style={{
                  backgroundColor: board.color,
                  height: 'calc(100vh - 160px)',
                  minHeight: '500px'
                }}
              >
                <div
                  className="flex gap-4 p-6 h-full items-start"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {lists.map((list, index) => (
                    <List key={list.id} list={list} index={index} filters={filters} />
                  ))}
                  {provided.placeholder}

                  {/* Add List Button */}
                  {id && <AddListButton boardId={id} />}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Label Manager Modal */}
        {id && (
          <LabelManager
            isOpen={showLabelManager}
            onClose={() => setShowLabelManager(false)}
            boardId={id}
          />
        )}
      </PageTransition>
    </Layout>
  );
}
