import React, { useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';

interface AuthPromptPopupProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  isSuppressed?: boolean;
}

const STORAGE_KEY = 'shifa_auth_prompt_dismissed';
const DELAY_MS = 15000; // 15 seconds of active browsing

export const AuthPromptPopup: React.FC<AuthPromptPopupProps> = ({
  onOpenSignIn,
  isSuppressed = false
}) => {
  const { isAuthenticated } = useAgency();

  useEffect(() => {
    // 1. If already logged in, never show
    if (isAuthenticated) return;

    // Clear any obsolete permanent block from older versions
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    // Check if dismissed in this current session
    const sessionDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (sessionDismissed) return;

    // 15-second timer to prompt user
    const timer = setTimeout(() => {
      const stillDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!stillDismissed && !isAuthenticated && !isSuppressed) {
        onOpenSignIn();
      }
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isSuppressed, onOpenSignIn]);

  return null;
};

