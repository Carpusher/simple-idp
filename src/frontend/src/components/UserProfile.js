import {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import {useCognitoUser} from '../hooks';

const UserDatabaseDashboard = () => {
  const cognitoUser = useCognitoUser();
  const [profile, setProfile] = useState({});
  const [displayName, setDisplayName] = useState('');
  const [hideSaveProfile, setHideSaveProfile] = useState(true);

  useEffect(() => {
    if (cognitoUser == null) return; // local dev mode will not have session
    const token = cognitoUser
        .getSignInUserSession()
        .getIdToken()
        .getJwtToken();
    const describeProfile = async () => {
      const response = await fetch('https://simple-idp.click/api/profile', {
        headers: {
          Authorization: token,
        },
      });
      const profile = await response.json();
      setProfile(profile);
      setDisplayName(profile.displayName);
    };
    describeProfile();
  }, [cognitoUser]);

  const handleSubmitProfile = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const displayName = event.currentTarget[1].value;
    if (cognitoUser == null) return; // local dev mode will not have session
    const token = cognitoUser
        .getSignInUserSession()
        .getIdToken()
        .getJwtToken();
    try {
      const response = await fetch('https://simple-idp.click/api/profile', {
        method: 'POST',
        headers: {
          // eslint-disable-next-line quote-props
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({displayName}),
      });

      const profile = await response.json();
      setProfile(profile);
      setDisplayName(profile.displayName);
      setHideSaveProfile(true);
      alert('Update profile successfully!');
    } catch (err) {
      console.log('Unable to update user profile', err);
      alert('Unable to update user profile');
    }
  };

  return (
    <Form onSubmit={handleSubmitProfile}>
      <Row>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control placeholder={profile.email} disabled/>
        </Form.Group>
      </Row>
      <Row>
        <Form.Group className="mb-3" controlId="displayName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            placeholder="Name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setHideSaveProfile(e.target.value === profile.displayName);
            }}/>
        </Form.Group>
      </Row>
      <Row>
        <Col>
          <Button
            variant="outline-info"
            type="submit"
            hidden={hideSaveProfile}
          >
                  Save
          </Button>
        </Col>
        <Col style={{textAlign: 'end'}}>
          <Button variant="outline-warning" href="sign-out">
                  Sign out
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default UserDatabaseDashboard;
