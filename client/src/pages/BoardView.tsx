import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock data - will be replaced with real data from API
  const board = {
    id: id || '1',
    name: 'Project Alpha',
    color: '#0079BF',
    description: 'Development tasks',
  };

  const lists = [
    {
      id: '1',
      name: 'To Do',
      cards: [
        { id: '1', title: 'Design homepage', description: 'Create mockups' },
        { id: '2', title: 'Setup database', description: 'PostgreSQL configuration' },
      ],
    },
    {
      id: '2',
      name: 'In Progress',
      cards: [
        { id: '3', title: 'API development', description: 'REST endpoints' },
      ],
    },
    {
      id: '3',
      name: 'Done',
      cards: [
        { id: '4', title: 'Project setup', description: 'Initial configuration' },
        { id: '5', title: 'Authentication', description: 'JWT implementation' },
      ],
    },
  ];

  return (
    <Layout showSidebar={false}>
      {/* Board Header */}
      <div
        className="px-6 py-4 border-b border-gray-200"
        style={{ backgroundColor: board.color }}
      >
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
            <div
              key={list.id}
              className="flex-shrink-0 w-72"
            >
              <Card padding="sm" className="bg-gray-100 border-none">
                {/* List Header */}
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="font-bold text-gray-900">{list.name}</h3>
                  <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {list.cards.map((card) => (
                    <Card
                      key={card.id}
                      hover
                      padding="sm"
                      className="cursor-pointer"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{card.title}</h4>
                      {card.description && (
                        <p className="text-sm text-gray-600">{card.description}</p>
                      )}
                    </Card>
                  ))}

                  {/* Add Card Button */}
                  <button className="w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-200 rounded-lg transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add a card
                  </button>
                </div>
              </Card>
            </div>
          ))}

          {/* Add List Button */}
          <div className="flex-shrink-0 w-72">
            <button className="w-full px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 rounded-lg transition flex items-center gap-2 border-2 border-dashed border-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add another list
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
