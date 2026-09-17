import { SupportedLanguageId } from '../types/index.ts';

const LAST_SESSION_KEY = 'onlinecoder_last_session';
const THEME_KEY = 'onlinecoder_theme';

export interface LastSessionState {
  language: SupportedLanguageId;
  code: string;
  input: string;
  activeProgramId: string | null;
  activeProgramTitle: string | null;
}

export function saveLastSession(state: LastSessionState): void {
  try {
    localStorage.setItem(
      LAST_SESSION_KEY,
      JSON.stringify({
        ...state,
        input: '', // Never store stale input to prevent random/cached values
      })
    );
  } catch (e) {}
}

export function loadLastSession(): LastSessionState | null {
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY) || localStorage.getItem('codeforge_last_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      input: '', // Input must strictly be provided fresh by the user
    };
  } catch (e) {
    return null;
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const theme = localStorage.getItem(THEME_KEY) || localStorage.getItem('codeforge_theme');
    if (theme === 'light' || theme === 'dark') return theme;
  } catch (e) {}
  return 'dark'; // default theme is Dark as required
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
}

