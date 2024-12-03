# MedTrack

A comprehensive medication tracking application built with Next.js 14, TypeScript, and Prisma.

## Features

- 💊 **Medication Management**
  - Add, edit, and delete medications
  - Track doses with timestamps
  - Group medications by category
  - Support for different dosage units and frequencies

- 📊 **Statistics & History**
  - View medication adherence rates
  - Track dose history with detailed filters
  - Export history to CSV
  - Visual charts and analytics

- 👥 **Access Management**
  - Share medication tracking with caregivers
  - Granular permission controls
  - Email notifications for shared access

- ⚙️ **User Preferences**
  - Customizable themes
  - Timezone settings
  - Notification preferences
  - Accessibility options

- 🔒 **Security & Validation**
  - Email-based authentication
  - Form validation with Zod
  - Error boundaries for resilience
  - Rate limiting for API protection

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Form Validation**: Zod
- **Email**: Resend
- **Rate Limiting**: Upstash Redis
- **Testing**: Playwright for E2E tests

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

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required environment variables.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Testing

- Run E2E tests:
  ```bash
  npm run test:e2e
  ```

- Run E2E tests with UI:
  ```bash
  npm run test:e2e:ui
  ```

## Deployment

The application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.