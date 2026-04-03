import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pricer from './pages/Pricer';
import IVSolver from './pages/IVSolver';
import Chain from './pages/Chain';
import Surface from './pages/Surface';
import Summary from './pages/Summary';
import Analysis from './pages/Analysis';
import Exotics from './pages/Exotics';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0',
  backgroundColor: '#F0E6C8',
  borderBottom: '1px solid #C9AD6E',
  padding: '0 40px',
};

const brandStyle = {
  fontFamily: "'EB Garamond', Garamond, serif",
  fontSize: '18px',
  fontWeight: 600,
  color: '#2D0A0B',
  letterSpacing: '1px',
  padding: '12px 24px 12px 0',
  marginRight: '24px',
  borderRight: '1px solid #C9AD6E',
};

const linkStyle = {
  padding: '14px 20px',
  color: '#7A6A50',
  textDecoration: 'none',
  fontSize: '14px',
  fontFamily: "'EB Garamond', Garamond, serif",
  letterSpacing: '0.5px',
  borderBottom: '2px solid transparent',
};

const activeLinkStyle = {
  ...linkStyle,
  color: '#2D0A0B',
  borderBottom: '2px solid #B22234',
};

function Nav() {
  const getStyle = ({ isActive }) => (isActive ? activeLinkStyle : linkStyle);

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>DGH</div>
      <NavLink to="/" style={getStyle} end>Dashboard</NavLink>
      <NavLink to="/pricer" style={getStyle}>Pricer</NavLink>
      <NavLink to="/iv" style={getStyle}>IV Solver</NavLink>
      <NavLink to="/chain" style={getStyle}>IV Chain</NavLink>
      <NavLink to="/surface" style={getStyle}>Surface</NavLink>
      <NavLink to="/summary" style={getStyle}>IV Analysis</NavLink>
      <NavLink to="/analysis" style={getStyle}>Skew & Term</NavLink>
      <NavLink to="/exotics" style={linkStyle}>Exotics</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pricer" element={<Pricer />} />
        <Route path="/iv" element={<IVSolver />} />
        <Route path="/chain" element={<Chain />} />
        <Route path="/surface" element={<Surface />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/exotics" element={<Exotics />} />
      </Routes>
    </BrowserRouter>
  );
}
