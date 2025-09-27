import type { Config } from 'tailwindcss'

const config: Config = {
	darkMode: ['class'],
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx,js,jsx}',
	],
	theme: {
		extend: {
			colors: {
					background: 'hsl(var(--bg))',
					foreground: 'hsl(var(--fg))',
					primary: {
						DEFAULT: 'hsl(var(--primary))',
						foreground: 'hsl(var(--primary-foreground))',
					},
					gradientStart: '#4F46E5', // indigo-600
					gradientEnd: '#9333EA',   // purple-600
				destructive: {
					DEFAULT: '#ff4d4f',
					foreground: '#FFFFFF'
				},
				border: '#E5E7EB',
				muted: '#F5F5F5'
			},
			borderRadius: {
				xl: '1rem',
				'2xl': '1.25rem',
			},
				boxShadow: {
					soft: '0 4px 24px -4px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.04)',
					glow: '0 0 0 2px rgba(99,102,241,0.35), 0 0 24px -4px rgba(147,51,234,0.55)'
				},
			keyframes: {
					'pulse-glow': {
						'0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.55)' },
						'50%': { boxShadow: '0 0 0 6px rgba(147,51,234,0)' }
					}
			},
			animation: {
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [],
}

export default config
