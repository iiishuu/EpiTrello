import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';

export interface FilterState {
  labelIds: string[];
  memberIds: string[];
  showOverdue: boolean;
  showDueSoon: boolean;
  showNoDueDate: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const { labels } = useAppSelector((state) => state.labels);
  const { user } = useAppSelector((state) => state.auth);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const handleToggleLabel = (labelId: string) => {
    const newLabelIds = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];

    onFiltersChange({ ...filters, labelIds: newLabelIds });
  };

  const handleToggleMember = (memberId: string) => {
    const newMemberIds = filters.memberIds.includes(memberId)
      ? filters.memberIds.filter((id) => id !== memberId)
      : [...filters.memberIds, memberId];

    onFiltersChange({ ...filters, memberIds: newMemberIds });
  };

  const handleToggleDateFilter = (filter: 'overdue' | 'dueSoon' | 'noDueDate') => {
    const updates: Partial<FilterState> = {};

    switch (filter) {
      case 'overdue':
        updates.showOverdue = !filters.showOverdue;
        break;
      case 'dueSoon':
        updates.showDueSoon = !filters.showDueSoon;
        break;
      case 'noDueDate':
        updates.showNoDueDate = !filters.showNoDueDate;
        break;
    }

    onFiltersChange({ ...filters, ...updates });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      labelIds: [],
      memberIds: [],
      showOverdue: false,
      showDueSoon: false,
      showNoDueDate: false,
    });
  };

  const hasActiveFilters =
    filters.labelIds.length > 0 ||
    filters.memberIds.length > 0 ||
    filters.showOverdue ||
    filters.showDueSoon ||
    filters.showNoDueDate;

  const activeFilterCount =
    filters.labelIds.length +
    filters.memberIds.length +
    (filters.showOverdue ? 1 : 0) +
    (filters.showDueSoon ? 1 : 0) +
    (filters.showNoDueDate ? 1 : 0);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm">
      <span className="text-sm font-medium text-white mr-2">Filters:</span>

      {/* Label Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowLabelDropdown(!showLabelDropdown);
            setShowMemberDropdown(false);
            setShowDateDropdown(false);
          }}
          className={`px-3 py-1.5 text-sm rounded transition flex items-center gap-2 ${
            filters.labelIds.length > 0
              ? 'bg-white text-gray-900 font-medium'
              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Labels
          {filters.labelIds.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {filters.labelIds.length}
            </span>
          )}
        </button>

        {showLabelDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowLabelDropdown(false)} />
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 py-2">
              {labels.length === 0 ? (
                <p className="px-4 py-2 text-sm text-gray-500">No labels available</p>
              ) : (
                labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleToggleLabel(label.id)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="w-8 h-4 rounded"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm text-gray-900">{label.name}</span>
                    </div>
                    {filters.labelIds.includes(label.id) && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Member Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowMemberDropdown(!showMemberDropdown);
            setShowLabelDropdown(false);
            setShowDateDropdown(false);
          }}
          className={`px-3 py-1.5 text-sm rounded transition flex items-center gap-2 ${
            filters.memberIds.length > 0
              ? 'bg-white text-gray-900 font-medium'
              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Members
          {filters.memberIds.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {filters.memberIds.length}
            </span>
          )}
        </button>

        {showMemberDropdown && user && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMemberDropdown(false)} />
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 py-2">
              <button
                onClick={() => handleToggleMember(user.id)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
              >
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900">{user.name}</span>
                </div>
                {filters.memberIds.includes(user.id) && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Date Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowDateDropdown(!showDateDropdown);
            setShowLabelDropdown(false);
            setShowMemberDropdown(false);
          }}
          className={`px-3 py-1.5 text-sm rounded transition flex items-center gap-2 ${
            filters.showOverdue || filters.showDueSoon || filters.showNoDueDate
              ? 'bg-white text-gray-900 font-medium'
              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Due Date
          {(filters.showOverdue || filters.showDueSoon || filters.showNoDueDate) && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {(filters.showOverdue ? 1 : 0) + (filters.showDueSoon ? 1 : 0) + (filters.showNoDueDate ? 1 : 0)}
            </span>
          )}
        </button>

        {showDateDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 py-2">
              <button
                onClick={() => handleToggleDateFilter('overdue')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition"
              >
                <span className="text-sm text-gray-900">Overdue</span>
                {filters.showOverdue && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleToggleDateFilter('dueSoon')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition"
              >
                <span className="text-sm text-gray-900">Due Soon (3 days)</span>
                {filters.showDueSoon && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleToggleDateFilter('noDueDate')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition"
              >
                <span className="text-sm text-gray-900">No Due Date</span>
                {filters.showNoDueDate && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <div className="h-4 w-px bg-white bg-opacity-30 mx-2" />
          <button
            onClick={handleClearFilters}
            className="px-3 py-1.5 text-sm text-white hover:bg-white hover:bg-opacity-20 rounded transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear ({activeFilterCount})
          </button>
        </>
      )}
    </div>
  );
};

export default FilterBar;
