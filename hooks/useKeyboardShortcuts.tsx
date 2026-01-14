import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';

export function useKeyboardShortcuts() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Prevent default for our shortcuts
      if (event.key === 'n' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        router.push('/add-task');
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        router.push('/add-note');
      } else if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault();
        router.push('/add-transaction');
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Focus search - this would need to be implemented in each screen
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        router.back();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
