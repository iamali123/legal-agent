# Legal Portal

A scalable, professional React application built with React 18, Vite, React Router v6, Tailwind CSS, and shadcn/ui.

## Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development and building
- ✅ React Router v6 for navigation
- ✅ Tailwind CSS with custom theme system
- ✅ shadcn/ui components
- ✅ Poppins font from Google Fonts
- ✅ Clean, maintainable folder structure
- ✅ Pixel-perfect UI matching Figma designs

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, MainLayout)
│   └── ui/              # shadcn/ui components (Button, Card, Badge, etc.)
├── lib/
│   ├── theme.tsx        # Theme context and provider
│   └── utils.ts         # Utility functions (cn helper)
├── pages/               # Page components
│   ├── Dashboard.tsx    # Welcome/Dashboard page
│   └── Legislations.tsx # Legislations page
├── routes/
│   └── index.tsx        # React Router configuration
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles and Tailwind directives
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Theme System

### Colors
- Background: `#020817`
- Primary Accent: `#00D9FF`
- Muted Text: `#99A1AF`
- Primary Text: `#FFFFFF`

### Gradients
- Horizontal Cyan: `linear-gradient(90deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%)`
- Vertical Cyan: `linear-gradient(180deg, #00D9FF 0%, #00A8B5 100%)`

Toggle the theme using the theme toggle button in the sidebar.

## Available Routes

- `/` - Dashboard/Welcome page
- `/legislations` - Legislations management page
- `/laws-policy` - Laws / Policy (placeholder)
- `/contracts` - Contracts (placeholder)
- `/agreements` - Agreements (placeholder)
- `/approvals` - Approvals (placeholder)

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Class name utilities

## Development Guidelines

- All components are functional components using TypeScript
- Follow the existing folder structure for new features
- Use Tailwind CSS for styling (avoid inline styles)
- Extract reusable components instead of duplicating code
- Use shadcn/ui components where appropriate
- Maintain consistent spacing and typography

## Future Enhancements

- Authentication system
- Backend API integration
- State management (if needed)
- Additional pages and features
- Testing setup
