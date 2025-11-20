import type { Board } from '../../services/boardService';
import Card from '../common/Card';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export default function BoardCard({ board, onClick }: BoardCardProps) {
  return (
    <Card
      hover
      onClick={onClick}
      className="cursor-pointer"
      padding="none"
    >
      {/* Board Color Header */}
      <div
        className="h-24 rounded-t-lg flex items-center justify-center text-white font-bold text-xl"
        style={{ backgroundColor: board.color }}
      >
        {board.name.charAt(0).toUpperCase()}
      </div>

      {/* Board Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 truncate">{board.name}</h3>
        {board.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{board.description}</p>
        )}

        {/* Board Stats */}
        {board._count && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{board._count.lists} {board._count.lists === 1 ? 'list' : 'lists'}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
