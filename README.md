# MedTrack

A modern medication tracking application built with Next.js 14, featuring a beautiful UI and comprehensive medication management features.

## Features

- 🎨 Beautiful UI with shadcn/ui components
- 🌓 Light/dark mode + custom themes
- 📱 Fully responsive design
- 🔒 Secure authentication with NextAuth.js
- 📊 Medication tracking and statistics
- 📅 Calendar integration
- 📧 Email notifications
- 🚦 Rate limiting
- 🔍 Error tracking with Sentry
- ⚡ Real-time updates
- 🧪 Comprehensive testing suite

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Auth:** NextAuth.js
- **Database:** PostgreSQL + Prisma
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Email:** React Email + Resend
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Testing:** Playwright + Jest
- **Monitoring:** Sentry
- **Rate Limiting:** Upstash Redis

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medtrack.git
   cd medtrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local`

5. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables are documented in `.env.example`. Make sure to set them up before running the application.

## Testing

- Run unit tests:
  ```bash
  npm test
  ```

- Run E2E tests:
  ```bash
  npm run test:e2e
  ```

- Run E2E tests with UI:
  ```bash
  npm run test:e2e:ui
  ```

## UI Components

The application uses a comprehensive set of UI components from shadcn/ui and Radix UI:

- Accordion
- Alert Dialog
- Avatar
- Badge
- Button
- Calendar
- Card
- Checkbox
- Command
- Context Menu
- Dialog
- Dropdown Menu
- Form
- Hover Card
- Input
- Label
- Menubar
- Navigation Menu
- Popover
- Progress
- Radio Group
- Select
- Separator
- Sheet
- Slider
- Switch
- Tabs
- Toast
- Toggle
- Tooltip

## Project Structure

```
.
├── app/                # Next.js app router pages
├── components/         # React components
├── lib/               # Utility functions and shared logic
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── styles/            # Global styles
├── types/             # TypeScript type definitions
├── e2e/               # End-to-end tests
└── hooks/             # Custom React hooks
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.