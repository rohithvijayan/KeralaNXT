import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DistrictPage from './pages/DistrictPage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import InitiativesPage from './pages/InitiativesPage'
import MPDashboardPage from './pages/MPDashboardPage'
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
                <Route path="/mp-fund-dashboard" element={<MPDashboardPage />} />
            </Routes>
            <BottomNav />
        </>
    )
}

export default App



