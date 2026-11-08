// The three palettes, for the theme picker and the browser's theme-color.
// Keep in step with styles/themes.css.

export const PALETTES = {
  'prism': {
    'light': {
      'bg': '#F6F5FA',
      'surface': '#FDFCFF',
      'ink': '#17151F',
      'muted': '#4A4658',
      'accent': '#5638D1',
      'on-accent': '#FFFFFF',
      'accent-soft': '#E5E0FA',
      'border': '#DCD7EC'
    },
    'dark': {
      'bg': '#141221',
      'surface': '#1D1A2E',
      'ink': '#EEEBF8',
      'muted': '#B3ADC9',
      'accent': '#A898F2',
      'on-accent': '#141221',
      'accent-soft': '#2A2448',
      'border': '#2F2A44'
    }
  },
  'focus': {
    'light': {
      'bg': '#F5F8F8',
      'surface': '#FCFEFE',
      'ink': '#14232A',
      'muted': '#44575E',
      'accent': '#0E6B70',
      'on-accent': '#FFFFFF',
      'accent-soft': '#D3ECEA',
      'border': '#D2DEDE'
    },
    'dark': {
      'bg': '#0F1B20',
      'surface': '#16252B',
      'ink': '#EAF3F3',
      'muted': '#A9BEBF',
      'accent': '#7CCFCB',
      'on-accent': '#0F1B20',
      'accent-soft': '#1C3A3D',
      'border': '#26393F'
    }
  },
  'companion': {
    'light': {
      'bg': '#FBF7F4',
      'surface': '#FFFDFB',
      'ink': '#2A2320',
      'muted': '#5A4E48',
      'accent': '#B4532F',
      'on-accent': '#FFFFFF',
      'accent-soft': '#F5DDD2',
      'border': '#EADBD2'
    },
    'dark': {
      'bg': '#1F1A17',
      'surface': '#2A2420',
      'ink': '#F6EFEA',
      'muted': '#C4B5AC',
      'accent': '#E9A285',
      'on-accent': '#1F1A17',
      'accent-soft': '#3A2A22',
      'border': '#3A302A'
    }
  }
} as const
