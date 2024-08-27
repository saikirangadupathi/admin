import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Dashboard = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    totalSales: 0,
    totalCollections: 0,
    environmentalImpacts: {
      co2: 0,
      trees: 3,
      energy: 0,
    },
  });

  useEffect(() => {
    // Fetch data from sample server
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/dashboard-data'); // Replace with your API endpoint
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#ffffff',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d873f5',
    padding: '10px 20px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  };

  const logoStyle = {
    fontSize: '1.5em',
  };

  const navStyle = {
    display: 'flex',
    gap: '20px',
  };

  const linkStyle = {
    color: '#ffffff',
    textDecoration: 'none',
  };

  const mainStyle = {
    display: 'flex',
    flex: '1',
  };

  const sidebarStyle = {
    width: '200px',
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const contentStyle = {
    flex: '1',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#2b292b',
  };

  const impactStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  };

  const circleContainerStyle = {
    width: '100px',
    height: '100px',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>Logo</div>
        <nav style={navStyle}>
          <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/user-management" style={linkStyle}>User Management</Link>
          <Link to="#" style={linkStyle}>User Profile</Link>
          <Link to="#" style={linkStyle}>Settings</Link>
          <Link to="#" style={linkStyle}>Log Out</Link>
        </nav>
      </header>
      <div style={mainStyle}>
        <aside style={sidebarStyle}>
          Notifications
        </aside>
        <main style={contentStyle}>
          <div style={cardStyle}>
            <h2>{data.totalUsers}</h2>
            <p>Total Users</p>
          </div>
          <div style={cardStyle}>
            <h2>{data.totalSales}</h2>
            <p>Total Sales</p>
          </div>
          <div style={cardStyle}>
            <h2>{data.totalCollections}</h2>
            <p>Total Collections</p>
          </div>
          <div style={cardStyle}>
            <h3>Recent Activities</h3>
            <p>Activity data goes here</p>
          </div>
          <div style={cardStyle}>
            <h3>Environmental Impacts</h3>
            <div style={impactStyle}>
              <div style={circleContainerStyle}>
                <CircularProgressbar
                  value={data.environmentalImpacts.co2}
                  text={`${data.environmentalImpacts.co2}%`}
                  styles={buildStyles({
                    textColor: '#f7c8f9',
                    pathColor: '#f7c8f9',
                  })}
                />
                <p>Co 2</p>
              </div>
              <div style={circleContainerStyle}>
                <CircularProgressbar
                  value={data.environmentalImpacts.trees}
                  text={`${data.environmentalImpacts.trees}%`}
                  styles={buildStyles({
                    textColor: '#e6f9c8',
                    pathColor: '#e6f9c8',
                  })}
                />
                <p>Trees</p>
              </div>
              <div style={circleContainerStyle}>
                <CircularProgressbar
                  value={data.environmentalImpacts.energy}
                  text={`${data.environmentalImpacts.energy}%`}
                  styles={buildStyles({
                    textColor: '#c8f9f7',
                    pathColor: '#c8f9f7',
                  })}
                />
                <p>Energy</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
