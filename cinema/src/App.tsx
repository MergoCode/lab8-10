import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import MoviePage from './pages/MoviePage'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
function App() {

  return (
    <Router>
      <Layout>
      <Routes>
        <Route path='/' element={<LandingPage/>}></Route>
      <Route path='/movies' element={<MoviePage/>}></Route>
      </Routes>
      </Layout>
    </Router>
  )
}

export default App
