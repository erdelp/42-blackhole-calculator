# 42 Blackhole Calculator 🕳️

**A Next.js tool for calculating the "blackhole" status in the 42 Paris curriculum with 42 API integration.**

**ALWAYS ASSUME YOUR BLACKHOLE IS EARLIER**

## 💡 About the Project
The **42 Blackhole Calculator** helps students of the [42 Paris](https://42.fr/) track their progress and predict when they might enter the "blackhole" phase.

The blackhole is a part of the 42 curriculum that requires students to maintain activity to avoid removal from the program. This tool calculates your estimated days left based on your actual cursus begin date from the 42 API.

**New Features:**
- 42 API OAuth login integration
- Automatic cursus begin date retrieval
- Exact same styling and functionality as the original
- Built with Next.js and TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A 42 API application (created at [42 API](https://api.intra.42.fr/apidoc))

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 42-blackhole-calculator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create your 42 API application:**
   - Go to [42 API](https://api.intra.42.fr/apidoc)
   - Create a new application
   - Set the redirect URI to: `http://localhost:3000/api/auth/callback`
   - **Important**: The redirect URI must be exactly `http://localhost:3000/api/auth/callback`
   - Note down your Client ID and Client Secret

4. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   FORTYTWO_CLIENT_ID=your-42-client-id
   FORTYTWO_CLIENT_SECRET=your-42-client-secret
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🔧 How It Works

1. **Login**: Click "Login with 42 School" to authenticate with your 42 account
2. **Automatic Data**: Your cursus begin date is automatically fetched from the 42 API
3. **Calculate**: Select your current milestone and freeze days
4. **Results**: See your blackhole date and days remaining with the same visual effects as the original

## 🌟 DISCLAIMER
The project was created using publicly available information about the Pace System and Pace 24 Deadlines. Please note that this information is subject to change; therefore, the results may be inaccurate.

**Use this as an indication but not as the absolute truth**

The freeze day calculation is not guaranteed to be working accurately but will give you a gross idea of when your blackhole is.
Again, **Use this as an indication but not as the absolute truth** .

**ALWAYS ASSUME YOUR BLACKHOLE IS EARLIER**

## 🛠️ Tech Stack
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **NextAuth.js** - Authentication
- **42 API** - Real cursus data
- **CSS** - Original styling preserved

## 📝 License
This project maintains the same spirit as the original and is built for educational purposes to help 42 students track their progress.

Don't hesitate to pull request or write to me hello@erdelp.com


