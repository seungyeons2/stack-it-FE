// src/utils/theme.js

export const themes = {
  // ✅ 기본 테마 (유지)
  default: {
    background: {
      primary: '#003340',
      secondary: '#004455',
      card: 'rgba(255, 255, 255, 0.09)',
    },
    text: {
      primary: '#EFF1F5',
      secondary: '#B8C5D1',
      tertiary: '#6B7280',
      disabled: '#AAAAAA',
    },
    accent: {
      primary: '#F074BA',
      light: '#FFD1EB',
      pale: '#fb9dd2ff',
    },
    status: {
      up: '#F074BA',
      down: '#00BFFF',
      same: '#AAAAAA',
      success: '#6EE69E',
      error: '#FF6B6B',
    },
    chart: {
      colors: [
        '#F074BA', '#3B82F6', '#34D399', '#10B981',
        '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6',
        '#EC4899', '#F87171', '#FBBF24', '#4ADE80',
        '#22D3EE', '#60A5FA', '#A78BFA', '#F472B6',
      ],
    },
    button: {
      primary: '#F074BA',
      secondary: '#EFF1F5',
      info: '#6366F1',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // 🌿 stack - 민트 화이트
  stack: {
    background: {
      primary: '#F9FCF9',
      secondary: '#EAF4ED',
      card: 'rgba(44, 173, 102, 0.06)',
    },
    text: {
      primary: '#1F3A28',
      secondary: '#3F5A46',
      tertiary: '#78937B',
      disabled: '#A8B8A8',
    },
    accent: {
      primary: '#2CAD66',
      light: '#A8E6C1',
      pale: '#DFF9E9',
    },
    status: {
      up: '#A8E6C1',
      down: '#FFCA61',
      same: '#94A59B',
      success: '#4ADE80',
      error: '#E85D4A',
    },
    chart: {
colors: [
  '#2CAD66',
  '#FFD166', 
  '#6EE69E',
  '#FF8FB1',
  '#26C6DA', 
  '#B39DDB', 
  '#7FD99A',
  '#E85D4A', 
  '#81C784', 
  '#F4E285', 
  '#A78BD4', 
  '#4FC3F7',
  '#FFB74D', 
  '#C8E6C9',
  '#F8BBD0',
  '#CFD8DC',
]

    },
    button: {
      primary: '#2CAD66',
      secondary: '#C7EFD4',
      info: '#4ECDC4',
    },
    border: {
      light: 'rgba(44, 173, 102, 0.12)',
      medium: 'rgba(44, 173, 102, 0.22)',
    },
  },

  // ✨ premium - 화이트 & 골드
  premium: {
    background: {
      primary: '#FDFBF7',
      secondary: '#F5F1E6',
      card: 'rgba(255, 215, 0, 0.07)',
    },
    text: {
      primary: '#3A3A3A',
      secondary: '#6B6B6B',
      tertiary: '#9B9B9B',
      disabled: '#C0C0C0',
    },
    accent: {
      primary: '#C6A200',
      light: '#FFE97F',
      pale: '#FFF5CC',
    },
    status: {
      up: '#C6A200',
      down: '#6BB1FF',
      same: '#A8A8A8',
      success: '#7FD4C2',
      error: '#FF7C7C',
    },
    chart: {
      colors: [
        '#C6A200', '#FFE97F', '#FFB84D', '#BFA181',
        '#4FC3F7', '#FFD54F', '#8BC34A', '#FDD835',
        '#BA68C8', '#FF8A65', '#FFD740', '#AED581',
        '#4DD0E1', '#FFF9C4', '#FFB300', '#FFE082',
      ],
    },
    button: {
      primary: '#C6A200',
      secondary: '#F7E8B3',
      info: '#BFA181',
    },
    border: {
      light: 'rgba(198, 162, 0, 0.15)',
      medium: 'rgba(198, 162, 0, 0.25)',
    },
  },

  // 🌸 sakura (유지)
  sakura: {
    background: {
      primary: '#FFF5F7',
      secondary: '#FFE4E9',
      card: 'rgba(255, 192, 203, 0.08)',
    },
    text: {
      primary: '#2D1F2E',
      secondary: '#5A4A5E',
      tertiary: '#8B7A8F',
      disabled: '#B8ADB9',
    },
    accent: {
      primary: '#FFB7C5',
      light: '#FFD4DC',
      pale: '#FFEAF0',
    },
    status: {
      up: '#98D8C8',
      down: '#F7A4BC',
      same: '#C5B8C9',
      success: '#7EC4B6',
      error: '#E88D99',
    },
    chart: {
      colors: [
        '#FFB7C5', '#98D8C8', '#A8D8EA', '#F7A4BC',
        '#C5A3D9', '#E0B8D3', '#FFC9D4', '#B4E7CE',
        '#E8BBE0', '#87CEEB', '#9BD3D0', '#FFD1FF',
        '#A5D8CF', '#FAD0C4', '#E0B8D3', '#7FD5D5',
      ],
    },
    button: {
      primary: '#FFB7C5',
      secondary: '#98D8C8',
      info: '#C5A3D9',
    },
    border: {
      light: 'rgba(255, 183, 197, 0.15)',
      medium: 'rgba(255, 183, 197, 0.25)',
    },
  },

  // 🩵 ocean - 스카이블루 & 화이트
  ocean: {
    background: {
      primary: '#F4FBFF',
      secondary: '#E5F6FD',
      card: 'rgba(0, 168, 232, 0.07)',
    },
    text: {
      primary: '#0F2A3A',
      secondary: '#355870',
      tertiary: '#7195A8',
      disabled: '#A5B7C2',
    },
    accent: {
      primary: '#00A8E8',
      light: '#7FD4F9',
      pale: '#D9F5FF',
    },
    status: {
      up: '#00C6A8',
      down: '#FF8FB1',
      same: '#9DBCC6',
      success: '#34D399',
      error: '#FF6B81',
    },
    chart: {
      colors: [
        '#00A8E8', '#34D399', '#7FD4F9', '#FFB84D',
        '#5EE3C1', '#F59E0B', '#6EE7B7', '#9D7EF0',
        '#22D3EE', '#FF85A2', '#1ABC9C', '#60A5FA',
        '#81C784', '#A78BFA', '#4ECDC4', '#64B5F6',
      ],
    },
    button: {
      primary: '#00A8E8',
      secondary: '#9EE3FA',
      info: '#6BB3E5',
    },
    border: {
      light: 'rgba(0, 168, 232, 0.15)',
      medium: 'rgba(0, 168, 232, 0.25)',
    },
  },

  // 🍂 autumn - 코랄 베이지
  autumn: {
    background: {
      primary: '#FFF9F4',
      secondary: '#FDEFE4',
      card: 'rgba(218, 136, 72, 0.07)',
    },
    text: {
      primary: '#3A251A',
      secondary: '#6B4E3A',
      tertiary: '#A0765B',
      disabled: '#BFA592',
    },
    accent: {
      primary: '#E7985A',
      light: '#FBCB9E',
      pale: '#FFE8D0',
    },
    status: {
      up: '#F8B878',
      down: '#C6794B',
      same: '#A08D7B',
      success: '#E8A24E',
      error: '#D64545',
    },
    chart: {
      colors: [
        '#E7985A', '#FBCB9E', '#C6794B', '#FFD085',
        '#D4A574', '#F8B878', '#FFB366', '#FFC872',
        '#E09F3E', '#F7D4B2', '#FFCD94', '#EFC97B',
        '#FFB84D', '#F4B17A', '#DDA56B', '#FDD5A5',
      ],
    },
    button: {
      primary: '#E7985A',
      secondary: '#F7D4B2',
      info: '#DDA56B',
    },
    border: {
      light: 'rgba(231, 152, 90, 0.15)',
      medium: 'rgba(231, 152, 90, 0.25)',
    },
  },

  // 🌙 midnight - 라벤더 그레이
  midnight: {
    background: {
      primary: '#F8F6FB',
      secondary: '#EDE9F7',
      card: 'rgba(147, 112, 219, 0.07)',
    },
    text: {
      primary: '#2E254A',
      secondary: '#5A4E7A',
      tertiary: '#8A7FA5',
      disabled: '#B8B0C9',
    },
    accent: {
      primary: '#9370DB',
      light: '#C3B1F2',
      pale: '#E9E1FF',
    },
    status: {
      up: '#B09EFF',
      down: '#F6A6E0',
      same: '#A8A0C0',
      success: '#A78BFA',
      error: '#F472B6',
    },
    chart: {
      colors: [
        '#9370DB', '#A78BFA', '#F472B6', '#C3B1F2',
        '#60A5FA', '#8B5CF6', '#E9E1FF', '#9B86BD',
        '#C084FC', '#FDA4AF', '#818CF8', '#D4BFFF',
        '#CDB5FF', '#E2C9FA', '#F5B9E7', '#A6A2FF',
      ],
    },
    button: {
      primary: '#9370DB',
      secondary: '#C3B1F2',
      info: '#B09EFF',
    },
    border: {
      light: 'rgba(147, 112, 219, 0.15)',
      medium: 'rgba(147, 112, 219, 0.25)',
    },
  },
};

// 기본 테마
export const defaultTheme = themes.default;
