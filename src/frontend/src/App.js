import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import {
  CognitoUserPool,
  CookieStorage,
} from 'amazon-cognito-identity-js';

import COGNITO from './constants/cognito';

import './App.css';

/**
 * Main app
 * @return {any} main app
 */
function App() {
  const [cognitoUser, setCognitoUser] = useState();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isExternalIDP, setIsExternalIDP] = useState(false);
  const [validPassword1, setValidPassword1] = useState(true);
  const [validPassword2, setValidPassword2] = useState(true);
  const handleShowOffcanvas = () => setShowOffcanvas(true);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  useEffect(() => {
    const userPool = new CognitoUserPool({
      UserPoolId: COGNITO.USER_POOL_ID,
      ClientId: COGNITO.CLIENT_ID,
      Storage: new CookieStorage({domain: '.simple-idp.click'}),
    });
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) { // local dev mode will not have session
      cognitoUser.getSession(function(err, session) {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        console.log('session validity: ' + session.isValid());
      });
      const userName = cognitoUser.getUsername();
      setIsExternalIDP(userName.startsWith('Google_') ||
        userName.startsWith('Facebook_')
      );
      setCognitoUser(cognitoUser);
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    const oldPassword = form[0].value;
    const newPassword = form[1].value;
    const newPassword2 = form[2].value;

    if (oldPassword === newPassword) {
      setValidPassword1(false);
    } else if (newPassword !== newPassword2) {
      setValidPassword2(false);
    } else {
      if (cognitoUser != null) { // local dev mode will not have session
        cognitoUser.changePassword(oldPassword, newPassword, (err, res) => {
          if (err) {
            alert(err.message || JSON.stringify(err));
            return;
          }
          alert('Reset password successfully!');
        });
      }
      form.reset();
    }
  };

  return (
    <div className="App">
      <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
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
          <Button variant="outline-warning" href="sign-out">Sign out</Button>
        </Offcanvas.Body>
      </Offcanvas>
      <header className="App-header">
        <h1>Simple Dashboard</h1>
        <h2>Reset password</h2>
        <Form onSubmit={handleSubmit} hidden={isExternalIDP}>
          <Form.Group className="mb-3" controlId="oldPassword">
            <Form.Label>Old password</Form.Label>
            <Form.Control type="password" placeholder="Old password" required/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>New password</Form.Label>
            <Form.Control
              type="password"
              placeholder="New password"
              isInvalid={!validPassword1}
              onChange={() => setValidPassword1(true)}
              required/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="newPassword2">
            <Form.Label>Re-enter new password</Form.Label>
            <Form.Control
              type="password"
              placeholder="New password"
              isInvalid={!validPassword2}
              onChange={() => setValidPassword2(true)}
              required
            />
          </Form.Group>
          <Button variant="outline-info" type="submit">Submit</Button>
        </Form>
      </header>
    </div>
  );
}

export default App;
