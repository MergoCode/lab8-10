import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import MoviePage from './pages/MoviePage'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
import { LoginComponent, RegisterComponent } from './pages/Login-RegisterPage'
import MovieInner from './pages/MovieInnerPage';
import TicketsPage from './pages/Tickets'
function App() {

  return (
    <Router>
      <Layout>
      <Routes>
        <Route path='/' element={<LandingPage/>}></Route>
        <Route path='/movies/:id' element={<MovieInner/>}></Route>
      <Route path='/movies' element={<MoviePage/>}></Route>
      <Route path='/login' element={<LoginComponent/>}></Route>
      <Route path='/register' element={<RegisterComponent/>}></Route>
      <Route path='/tickets' element={<TicketsPage/>}></Route>
      </Routes>
      </Layout>
    </Router>
  )
}

export default App
