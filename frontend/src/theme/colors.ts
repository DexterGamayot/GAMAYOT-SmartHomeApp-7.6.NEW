export const lightTheme = {
  background: '#ffffff',
  surface: '#ffffff',
  border: '#1f1f1f',
  text: '#1f1f1f',
  mutedText: '#555555',
  primary: '#2f6fed',
  onPrimary: '#ffffff',
  danger: '#b3261e',
  dangerBackground: '#fbe9e7',
  success: '#1b7f3b',
  successBackground: '#e6f4ea',
  banner: '#eeeeee',
  overlay: 'rgba(0,0,0,0.45)',
};

export const darkTheme = {
  background: '#121212',
  surface: '#1f1f1f',
  border: '#d7d7d7',
  text: '#f7f7f7',
  mutedText: '#c9c9c9',
  primary: '#6c9bff',
  onPrimary: '#0b1533',
  danger: '#ff8a80',
  dangerBackground: '#3b1f1c',
  success: '#7ddc9a',
  successBackground: '#1c3325',
  banner: '#2a2a2a',
  overlay: 'rgba(0,0,0,0.65)',
};

export type AppTheme = typeof lightTheme;
