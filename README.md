# Property Dealer Application

A full-stack, bilingual (English & Hindi) web application for property dealers to list properties (for sale, purchase interest, or rent), with all registered users able to browse and search listings. Access is via Name + WhatsApp number, with dealer-side approval instead of a password or OTP.

## Tech Stack

- **Frontend + Backend**: Next.js (React, TypeScript) with App Router
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl (English and Hindi)
- **Database**: PostgreSQL via Supabase (free tier) - using SQLite for local development
- **ORM**: Prisma
- **Image Storage**: Supabase Storage (for production)
- **Hosting**: Vercel (for frontend/backend) and Supabase (for database and storage)

## Features

- **User Roles**: Property Dealer, Regular User, Admin
- **Access Request Flow**: Users submit name and WhatsApp number to request access to a dealer's contact info; dealer approves or declines
- **Property Management**: Dealers can create, edit, delete, and manage their property listings
- **Browse & Search**: All users can browse and search listings with filters and sorting
- **Google Map Click Tracking**: Track when authorized users click on a property's Google Maps link
- **Dealer Dashboard**: View properties, manage access requests, see map click statistics
- **Admin Dashboard**: Moderate properties, users, and access requests
- **Bilingual Support**: Full English and Hindi language toggle
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd property-dealer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:
   ```
   # For local development with SQLite
   DATABASE_URL="file:./dev.db"

   # For Supabase (when deploying to production)
   # DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
   # SUPABASE_URL="[YOUR-SUPABASE-URL]"
   # SUPABASE_ANON_KEY="[YOUR-SUPABASE-ANON-KEY]"
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

6. **Seed the database (optional)**
   ```bash
   npx ts-node seed.ts
   ```

   This will create sample data including dealers, properties, users, access requests, and map click events.

### Project Structure

- `/app` - Next.js App Router pages and components
- `/components` - Reusable React components
- `/lib` - Utility functions (Prisma client, rate limiting, etc.)
- `/prisma` - Prisma schema and migrations
- `/locales` - Translation files for English and Hindi
- `/seed.ts` - Database seeding script

### Key Features Implementation

#### Authentication & Access Control

- Users are identified by their WhatsApp number
- Access requests are submitted via name and WhatsApp number
- Dealers can approve or decline access requests
- Authorized users can view dealer contact information and have their Google Maps clicks tracked
- Admin users have full access to moderate content

#### Property Listings

- Dealers can create listings for sale, rent, or wanted to buy (buy)
- Each listing includes property details, photos (max 5), Google Maps link, and description
- Listings can be filtered by type, category, location, price, size, and land classification
- Listings can be sorted by latest (newest first) or value (price ascending/descending)

#### Bilingual Support

- All UI text is available in English and Hindi
- Language toggle persists across sessions via cookies
- User-generated content (property descriptions, etc.) is displayed as entered without translation

#### Image Handling

- For production, images are uploaded to Supabase Storage
- Images are compressed client-side before upload to conserve storage
- Maximum of 5 photos per listing

### Deployment

#### To Vercel (Frontend + Backend)

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set the environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - (Optional) `SUPABASE_URL` and `SUPABASE_ANON_KEY` if using Supabase Storage directly in the code

#### To Supabase (Database & Storage)

1. Create a new Supabase project
2. Enable the PostgreSQL database
3. Create a storage bucket for property images (make it public or set appropriate policies)
4. Run the Prisma migration to set up the database schema:
   ```bash
   npx prisma migrate deploy
   ```
5. (Optional) Run the seed script to populate with sample data:
   ```bash
   npx ts-node seed.ts
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@db.xyz.supabase.co:5432/postgres` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run migrations against the database
- `npx prisma studio` - Open Prisma Studio to view the database
- `npx ts-node seed.ts` - Seed the database with sample data

### Notes

- The application uses SQLite for local development. For production, configure the `DATABASE_URL` to point to your Supabase PostgreSQL database.
- Image upload functionality to Supabase Storage is not fully implemented in this starter. You'll need to implement the image upload logic in the property creation/edit forms using the `@supabase/supabase-js` client.
- Rate limiting is implemented for access request submissions to prevent abuse.
- Admin users can be created by directly inserting into the database or by extending the signup flow.

### Future Enhancements

- Implement image upload to Supabase Storage with client-side compression
- Add password reset and account security features
- Implement real-time notifications for access requests and map clicks
- Add analytics and reporting for dealers
- Enhance the admin dashboard with more moderation tools
- Implement a React Native or Capacitor-wrapped Android app using the same API