import {useState, useEffect} from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';

import {useCognitoUser} from '../hooks';

const UserDatabaseDashboard = () => {
  const cognitoUser = useCognitoUser();
  const [statistics, setStatistics] = useState({});
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (cognitoUser == null) return; // local dev mode will not have session
    const token = cognitoUser
        .getSignInUserSession()
        .getIdToken()
        .getJwtToken();
    const fetchUsers = async () => {
      const response = await fetch('/api/users', {
        headers: {
          Authorization: token,
        },
      });
      setUsers((await response.json()).users);
    };
    const fetchStatistics = async () => {
      const response = await fetch('/api/statistics', {
        headers: {
          Authorization: token,
        },
      });
      setStatistics((await response.json()).statistics.reduce((acc, cur) => {
        acc[cur.name] = cur.value;
        return acc;
      }, {}));
    };
    fetchUsers();
    fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cognitoUser]); // users is not a dependency

  return (
    <div>
      <CardGroup>
        <Card bg="dark">
          <Card.Body>
            <Card.Title>Total sign-ups</Card.Title>
            <Card.Text>
              <Badge pill bg="success">
                {statistics['total-sign-ups']}
              </Badge>{' '}
            </Card.Text>
          </Card.Body>
        </Card>
        <Card bg="dark">
          <Card.Body>
            <Card.Title>Daily active users</Card.Title>
            <Card.Text>
              <Badge pill bg="info">
                {statistics['daily-active-users']}
              </Badge>
            </Card.Text>
          </Card.Body>
        </Card>
        <Card bg="dark">
          <Card.Body>
            <Card.Title>Avg. active users</Card.Title>
            <Card.Subtitle>7 days rolling</Card.Subtitle>
            <Card.Text>
              <Badge pill bg="secondary">
                {statistics['7d-active-user-rolling']}
              </Badge>
            </Card.Text>
          </Card.Body>
        </Card>
      </CardGroup>
      <Table striped hover responsive variant="dark">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Sign up (UTC)</th>
            <th>Logins</th>
            <th>Last session (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.created}</td>
              <td>{user.loginCount}</td>
              <td>{user.lastSession}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserDatabaseDashboard;
