import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DistrictPage from './pages/DistrictPage'
import AboutPage from './pages/AboutPage'

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/district/:districtId" element={<DistrictPage />} />
            <Route path="/about" element={<AboutPage />} />
        </Routes>
    )
}

export default App
