import {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {useCognitoUser} from '../hooks';

const UserDatabaseDashboard = () => {
  const cognitoUser = useCognitoUser();
  const [isExternalIDP, setIsExternalIDP] = useState(false);
  const [validPassword1, setValidPassword1] = useState(true);
  const [validPassword2, setValidPassword2] = useState(true);

  useEffect(() => {
    if (cognitoUser != null) { // local dev mode will not have session
      const userName = cognitoUser.getUsername();
      setIsExternalIDP(userName.startsWith('Google_') ||
        userName.startsWith('Facebook_')
      );
    }
  }, [cognitoUser]);

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
        cognitoUser.changePassword(oldPassword, newPassword, (err) => {
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
    <div>
      <h1>Simple Dashboard</h1>
      <Form onSubmit={handleSubmit} hidden={isExternalIDP}>
        <h2>Reset password</h2>
        <Form.Group className="mb-3" controlId="oldPassword">
          <Form.Label>Old password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Old password"
            required
          />
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
    </div>
  );
};

export default UserDatabaseDashboard;
