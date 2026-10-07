import { useIoT } from '../context/IoTContext';
import { AppTheme, darkTheme, lightTheme } from './colors';

// Single place where screens get the active colors (light / dark).
export function useTheme(): AppTheme {
  const { darkMode } = useIoT();
  return darkMode ? darkTheme : lightTheme;
}
