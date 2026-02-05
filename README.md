# Finalyze 💰  
An intelligent finance tracker that combines **Google OAuth authentication**, **AI-powered natural language transaction entry**, and a **beautiful modern UI** to help users analyze spending patterns and gain financial insights.  

---

## ✨ Features  

### 🔐 Authentication  
- Secure **Google OAuth 2.0** login and signup  
- Per-user data isolation  
- Profile management  
- Sign-out functionality  

### 🤖 Smart Transaction Entry  
- Natural language transaction parsing  
- AI-powered extraction of **amount, category, description**  
- Confirmation before saving transactions  
- **Multi-transaction parsing** (e.g., *"Coffee $5 and lunch $12"*)  
- **Smart date parsing** (e.g., *"yesterday"*, *"last Friday"*)  

### 📊 Dashboard & Transaction History  
- Interactive charts:  
  - **Pie chart** for category distribution  
  - **Line chart** for spending trends  
- Transaction list with **edit/delete** support  
- Category filtering and search  
- Summary cards for **income, expenses, savings**  
- Weekly/monthly view toggles  

### 🎨 Design & UX  
- Responsive, mobile-first design  
- **Dark/Light mode toggle**  
- Smooth custom animations & transitions  
- Clean typography and spacing  

---

## 🛠 Tech Stack  

### Frontend  
- **React + Vite**  
- **Tailwind CSS** for styling  
- Charting library (for visualizations)  
- Google OAuth client  

### Backend  
- **Node.js + Express**  
- **MongoDB** for storage  
- **Google OAuth server-side verification + JWT**  
- **Groq API** for natural language parsing  

---

## 📂 Project Structure  
Finalyze/
├── client/ # React frontend
├── backend/ # Express backend
├── docs/ # Documentation + screenshots
├── README.md # Setup & project guide
└── .env.example # Backend environment template


---

## ⚡️ Getting Started  

### 🔽 Clone the Repository  
```bash
git clone https://github.com/your-username/finalyze.git
cd finalyze

🖥 Frontend Setup
cd client
npm install
npm run dev

⚙️ Backend Setup
cd backend/src
npm install
npm start

🔑 Environment Variables

Create a .env file in backend/src/ with the following:

GROQ_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MONGO_URI=
PORT=5000
REFRESH_TOKEN_SECRET=
JWT_SECRET=


(See .env.example for reference.)

📡 API Endpoints
Authentication

POST /auth/google → Google OAuth callback

POST /auth/refresh → Refresh JWT token

POST /auth/logout → Logout user

GET /auth/profile → Get user profile

Transactions

POST /api/transactions/parse → Parse natural language input

POST /api/transactions → Create transaction

GET /api/transactions → Get transactions (with filters)

PUT /api/transactions/:id → Update transaction

DELETE /api/transactions/:id → Delete transaction

Analytics

GET /api/analytics/summary → Financial summary

GET /api/analytics/categories → Spending by category

GET /api/analytics/trends → Spending trends

🧪 Sample Inputs for Testing

"Coffee at Starbucks $6.50"

"Gas station $40"

"Amazon purchase $89.99"

"Monthly salary $4500"

"Dinner at Italian restaurant $65"

"Uber ride to airport $28"

"Groceries $120 and Netflix $15.99 yesterday"

📸 Screenshots

(Add screenshots of your UI in the docs/ folder and reference them here.)

🚀 Success Indicators

✅ Secure Google OAuth login
✅ AI-powered smart transaction parsing
✅ Interactive charts & insights
✅ Dark/light mode support
✅ Responsive, modern UI with animations

🙌 Credits

Design Inspiration: Credit Karma, Mint

AI Integration: Groq API

Icons & Animations: Open-source libraries