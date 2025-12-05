import { useState, useEffect } from 'react';

export default function SaveIndicator() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleSaving = () => {
      setStatus('saving');
      setErrorMessage('');
    };

    const handleSaved = () => {
      setStatus('saved');
      setErrorMessage('');
      // Reset to idle after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    };

    const handleError = (event: any) => {
      setStatus('error');
      setErrorMessage(event.detail?.error || 'Save failed');
      // Reset to idle after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 4000);
    };

    window.addEventListener('board-saving', handleSaving);
    window.addEventListener('board-saved', handleSaved);
    window.addEventListener('board-save-error', handleError);

    return () => {
      window.removeEventListener('board-saving', handleSaving);
      window.removeEventListener('board-saved', handleSaved);
      window.removeEventListener('board-save-error', handleError);
    };
  }, []);

  if (status === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all
          ${status === 'saving' ? 'bg-blue-500 text-white' : ''}
          ${status === 'saved' ? 'bg-green-500 text-white' : ''}
          ${status === 'error' ? 'bg-red-500 text-white' : ''}
        `}
      >
        {status === 'saving' && (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Saving...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Save Error</span>
              {errorMessage && <span className="text-xs opacity-90">{errorMessage}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
