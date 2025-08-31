import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				casino: {
					bg: 'hsl(var(--casino-bg))',
					surface: 'hsl(var(--casino-surface))',
					elevated: 'hsl(var(--casino-surface-elevated))',
					gold: 'hsl(var(--casino-gold))',
					'gold-muted': 'hsl(var(--casino-gold-muted))',
					win: 'hsl(var(--casino-win))',
					lose: 'hsl(var(--casino-lose))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'coin-flip': {
					'0%': { 
						transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
						filter: 'drop-shadow(0 0 10px hsl(var(--casino-gold) / 0.3))'
					},
					'25%': { 
						transform: 'perspective(1000px) rotateY(450deg) rotateX(180deg) scale(1.1)',
						filter: 'drop-shadow(0 0 20px hsl(var(--casino-gold) / 0.6))'
					},
					'50%': { 
						transform: 'perspective(1000px) rotateY(900deg) rotateX(360deg) scale(1.2)',
						filter: 'drop-shadow(0 0 30px hsl(var(--casino-gold) / 0.8))'
					},
					'75%': { 
						transform: 'perspective(1000px) rotateY(1350deg) rotateX(540deg) scale(1.1)',
						filter: 'drop-shadow(0 0 20px hsl(var(--casino-gold) / 0.6))'
					},
					'100%': { 
						transform: 'perspective(1000px) rotateY(1800deg) rotateX(720deg) scale(1)',
						filter: 'drop-shadow(0 0 10px hsl(var(--casino-gold) / 0.3))'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'pulse-gold': {
					'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--casino-gold) / 0.4)' },
					'50%': { boxShadow: '0 0 0 10px hsl(var(--casino-gold) / 0)' }
				},
				'glow': {
					'0%, 100%': { filter: 'drop-shadow(0 0 5px hsl(var(--casino-gold) / 0.5))' },
					'50%': { filter: 'drop-shadow(0 0 20px hsl(var(--casino-gold) / 0.8))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'coin-flip': 'coin-flip 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in': 'fade-in 0.3s ease-out',
				'pulse-gold': 'pulse-gold 2s infinite',
				'glow': 'glow 2s ease-in-out infinite alternate'
			},
			backgroundImage: {
				'gradient-casino': 'var(--gradient-casino)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-card': 'var(--gradient-card)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
