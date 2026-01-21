import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DistrictPage from './pages/DistrictPage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import InitiativesPage from './pages/InitiativesPage'
import BottomNav from './components/BottomNav'

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/district/:districtId" element={<DistrictPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/initiatives" element={<InitiativesPage />} />
            </Routes>
            <BottomNav />
        </>
    )
}

export default App



