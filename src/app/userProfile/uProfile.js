// app/profile/page.js

import { useState } from 'react';

export default function ProfilePage() {
  // Mock user data (can be fetched from an API)
  const [user, setUser] = useState({
    fullName: 'Muhammad Junaid Asif',
    username: '',
    email: '',
    address: 'New York, USA',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Edit Profile</a>
        <a href="/password">Edit Password</a>
        <a href="/logout">User Logout</a>
      </div>
      <div style={styles.profileCard}>
        <div style={styles.header}>
          <img
            src="/profile-pic.jpg" // Replace with dynamic image source
            alt="Profile Picture"
            style={styles.profileImage}
          />
          <h2>{user.fullName}</h2>
          <h4>@{user.username}</h4>
        </div>
        <div style={styles.info}>
          <div style={styles.field}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleInputChange}
            />
          </div>
          <div style={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
            />
          </div>
          <div style={styles.field}>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={user.address}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    width: '100%',
  },
  sidebar: {
    width: '15%',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderRight: '1px solid #ddd',
  },
  profileCard: {
    width: '85%',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    marginBottom: '20px',
  },
  info: {
    width: '100%',
    maxWidth: '500px',
    marginTop: '20px',
  },
  field: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
};
