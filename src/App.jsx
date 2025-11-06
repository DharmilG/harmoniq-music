import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import GuitarLobby from './pages/GuitarLobby.jsx'
import GuitarPractice from './pages/GuitarPractice.jsx'
import RankedGuitarGameSelection from './pages/RankedGuitarGameSelection.jsx'
import ChordProgressionChallenge from './pages/ChordProgressionChallenge.jsx'
import RhythmMasterGame from './pages/RhythmMasterGame.jsx'
import PageTransition from './components/PageTransition.jsx'
import Home from './pages/Home.jsx'
import Lessons from './pages/Lessons.jsx'
import InstrumentSelection from './pages/InstrumentSelection.jsx'
import PianoLobby from './pages/PianoLobby.jsx'
import PianoPractice from './pages/PianoPractice.jsx'
import RankedGameSelection from './pages/RankedGameSelection.jsx'
import MelodicMemoryGame from './pages/MelodicMemoryGame.jsx'
import NotefallGame from './pages/NotefallGame.jsx'
import ScaleRunnerGame from './pages/ScaleRunnerGame.jsx'
import ChordBuilderGame from './pages/ChordBuilderGame.jsx'
import DailyQuiz from './pages/DailyQuiz.jsx'
import LearnPage from './pages/Learn.jsx'
import PracticeLog from './pages/PracticeLog.jsx'
import Store from './pages/Store.jsx'
import Rewards from './pages/Rewards.jsx'
import Partnerships from './pages/Partnerships.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import VerifyResetCode from './pages/VerifyResetCode.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Account from './pages/Account.jsx'
import TourBooking from './pages/TourBooking.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Toast from './components/Toast'
import OrderHistory from './pages/OrderHistory.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <Navbar />
          <main className="container">
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/lessons" element={<Lessons />} />
                {/* --- UPDATED GUITAR ROUTES --- */}
                <Route path="/learn/practice" element={<InstrumentSelection />} />
                <Route path="/learn/practice/guitar/lobby" element={<GuitarLobby />} />
                <Route path="/learn/practice/guitar/unranked" element={<GuitarPractice />} />
                <Route path="/learn/practice/guitar/ranked/selection" element={<ProtectedRoute><RankedGuitarGameSelection /></ProtectedRoute>} />
                <Route path="/learn/practice/guitar/ranked/chord-progression" element={<ProtectedRoute><ChordProgressionChallenge /></ProtectedRoute>} />
                <Route path="/learn/practice/guitar/ranked/rhythm-master" element={<ProtectedRoute><RhythmMasterGame /></ProtectedRoute>} />
                <Route path="/learn/practice/piano/lobby" element={<PianoLobby />} />
                <Route path="/learn/practice/piano/ranked" element={<RankedGameSelection />} />
                <Route path="/learn/practice/piano/ranked/melodic-memory" element={<ProtectedRoute><MelodicMemoryGame /></ProtectedRoute>} />
                <Route path="/learn/practice/piano/ranked/notefall" element={<NotefallGame />} />
                <Route path="/learn/practice/piano/ranked/scale-runner" element={<ProtectedRoute><ScaleRunnerGame /></ProtectedRoute>} />
                <Route path="/learn/practice/piano/unranked" element={<PianoPractice />} />
                <Route path="/learn/quiz" element={<ProtectedRoute><DailyQuiz /></ProtectedRoute>} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/practice-log" element={<ProtectedRoute><PracticeLog /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/leaderboard/:gameType" element={<LeaderboardPage />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/store" element={<Store />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/tour-booking" element={<TourBooking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-reset-code" element={<VerifyResetCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } />
                <Route path="/account/order-history" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
        </div>
        <Toast />
      </CartProvider>
    </AuthProvider>
  )
}
