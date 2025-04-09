import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import MoviePage from './pages/MoviePage'

function App() {

  return (
    <Router>
      <Routes>
      <Route path='/movies' element={<MoviePage/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
