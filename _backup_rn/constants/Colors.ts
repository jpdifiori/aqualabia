const tintColorLight = '#2563EB';
const tintColorDark = '#3B82F6';

export const BrandColors = {
  navy: '#0F172A',         // Slate 900
  darkBlue: '#1E3A8A',     // Blue 900 (Text on primary buttons)
  primary: '#3B82F6',      // Blue 500
  primaryLight: '#E0F2FE', // Blue 100 (Background for primary buttons)
  primaryHover: '#93C5FD', // Blue 300
  slate: '#64748B',        // Slate 500
  lightGray: '#F8FAFC',    // Slate 50
  border: '#E2E8F0',       // Slate 200
  white: '#FFFFFF',
  success: '#10B981',      // Emerald 500
  warning: '#F59E0B',      // Amber 500
  error: '#EF4444',        // Red 500
};

export default {
  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    border: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    border: '#334155',
  },
};
