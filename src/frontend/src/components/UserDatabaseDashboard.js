import {useState, useEffect} from 'react';
import Table from 'react-bootstrap/Table';

import {useCognitoUser} from '../hooks';

const UserDatabaseDashboard = () => {
  const cognitoUser = useCognitoUser();
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
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cognitoUser]); // users is not a dependency

  return (
    <div>
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
