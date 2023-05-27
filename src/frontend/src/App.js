import {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import UserProfile from './components/UserProfile';
import SimpleDashboard from './components/SimpleDashboard';
import UserDatabaseDashboard from './components/UserDatabaseDashboard';
import {useLocationHash} from './hooks';

import './App.css';

/**
 * Main app
 * @return {any} main app
 */
function App() {
  const locationHash = useLocationHash();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  return (
    <div className="App">
      <Navbar expand="lg" bg="light" variant="light">
        <Container>
          <Navbar.Brand href="#simple-dashboard">Simple-IDP</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#user-db-dashboard">
                User Database Dashboard
              </Nav.Link>
            </Nav>
            <Nav>
              <Button variant="light" onClick={handleShowOffcanvas}>
                User Profile
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>User Profile</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <UserProfile />
        </Offcanvas.Body>
      </Offcanvas>
      <header className="App-header">
        {
          locationHash === '#simple-dashboard' || locationHash === '' ?
          <SimpleDashboard /> : locationHash === '#user-db-dashboard' ?
          <UserDatabaseDashboard /> :
          null
        }
      </header>
    </div>
  );
}

export default App;
