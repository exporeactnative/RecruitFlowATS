# RecruitFlow - Modern ATS/CRM Mobile App

A beautifully designed, intuitive mobile application for recruiters to manage candidates through the hiring pipeline.

## 🎨 Design Philosophy

RecruitFlow embodies a modern, minimalist flat aesthetic with:

- **Deep Teal (#0D9494)** - Primary brand color for key elements
- **Vibrant Orange (#FF9F5C)** - Accent color for calls-to-action
- **Crisp White (#FFFFFF)** - Clean backgrounds and text
- **Subtle Wave Gradients** - Reflecting effortless navigation and flow

## ✨ Features

### Candidate Management
- **Candidates List** - Browse all candidates with search and filter capabilities
- **Candidate Profiles** - Comprehensive view of candidate information
- **Status Tracking** - Visual pipeline stages (New, Screening, Interview, Offer, Hired)
- **Quick Actions** - Schedule interviews, add notes, contact candidates

### Modern UI Components
- **Gradient Headers** - Beautiful teal gradients with wave transitions
- **Status Badges** - Color-coded status indicators
- **Info Cards** - Clean, elevated cards for information display
- **Search & Filters** - Intuitive filtering by candidate status
- **Rating System** - 5-star candidate ratings

## 📱 Screens

### 1. Candidates Screen (Home)
- Search bar with real-time filtering
- Status filter tabs (All, New, Screening, Interview, Offer)
- Candidate cards with avatars, ratings, and status badges
- Wave gradient header with app branding

### 2. Candidate Profile Screen
- Gradient header with candidate photo/initials
- Contact information with quick action buttons
- Professional details (experience, education, skills)
- Application timeline and activity feed
- Schedule interview and add notes functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📂 Project Structure

```
recruitflowproject/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Candidates list screen
│   │   ├── explore.tsx         # Pipeline/analytics screen
│   │   └── _layout.tsx         # Tab navigation
│   ├── candidate/
│   │   └── [id].tsx           # Candidate profile screen
│   └── _layout.tsx            # Root layout
├── components/
│   ├── candidates/
│   │   ├── CandidateCard.tsx  # Candidate list item
│   │   ├── CandidateHeader.tsx # Profile header with gradient
│   │   └── InfoSection.tsx    # Reusable info section
│   └── ui/
│       ├── Button.tsx         # Custom button component
│       ├── Card.tsx           # Card container
│       └── Badge.tsx          # Status badge
├── constants/
│   └── theme.ts               # Color palette and theme
├── data/
│   └── mockCandidates.ts      # Mock candidate data
├── types/
│   └── candidate.ts           # TypeScript types
└── lib/
    ├── supabase.ts            # Supabase client
    └── supabase-admin.ts      # Admin client
```

## 🎨 Design System

### Colors

#### Primary Palette
- **Teal 500**: `#0D9494` - Primary actions, headers
- **Teal 100**: `#B3E8E8` - Light backgrounds
- **Orange 500**: `#FF9F5C` - CTAs, accents
- **Orange 100**: `#FFE4D1` - Light accents

#### Status Colors
- **New**: Teal
- **Screening**: Orange
- **Interview**: Blue
- **Offer/Hired**: Green
- **Rejected**: Red
- **Withdrawn**: Gray

### Typography
- **Headers**: 700 weight, system font
- **Body**: 400-600 weight
- **Labels**: 600 weight, smaller size

### Components
- **Border Radius**: 12-16px for cards, 8-10px for badges
- **Shadows**: Subtle elevation (0.08-0.15 opacity)
- **Spacing**: 12-24px between sections

## 🔗 Supabase Integration

The app is configured to work with Supabase for backend services:

- Authentication
- Database (candidates, activities, notes)
- Real-time updates
- File storage (resumes, documents)

See `SUPABASE_SETUP.md` for configuration details.

## 🛠 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based navigation
- **Supabase** - Backend as a service
- **Expo Linear Gradient** - Gradient effects

## 📝 Future Enhancements

- [ ] Calendar integration for interview scheduling
- [ ] Email/SMS communication from app
- [ ] Document viewer for resumes
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Push notifications
- [ ] Offline support
- [ ] Export reports

## 🎯 Design Principles

1. **Minimalist** - Clean, uncluttered interfaces
2. **Intuitive** - Self-explanatory navigation
3. **Professional** - Business-appropriate aesthetics
4. **Delightful** - Smooth animations and transitions
5. **Accessible** - High contrast, readable typography

## 📄 License

Private - All rights reserved

---

Built with ❤️ for modern recruiters
