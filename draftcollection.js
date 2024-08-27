import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'react-calendar/dist/Calendar.css';
import Sidebar from './sidebarComponent';

const CollectionManagement = () => {
  const [date, setDate] = useState(new Date());
  const [collections, setCollections] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [currentLocation, setCurrentLocation] = useState([51.505, -0.09]);

  const [activeLink, setActiveLink] = useState(null);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    // Fetch collections for the selected date
    const fetchCollections = async (selectedDate) => {
      const response = await fetch(`/api/collections?date=${selectedDate.toISOString().split('T')[0]}`);
      const data = await response.json();
      setCollections(data.collections);
      setMapLocations(data.mapLocations);
      setFilteredCollections(data.collections);
    };

    fetchCollections(date);

    // Get the current location of the user
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting current location: ", error);
      }
    );
  }, [date]);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = collections.filter(
      (collection) =>
        collection.username.toLowerCase().includes(lowercasedQuery) ||
        collection.email.toLowerCase().includes(lowercasedQuery) ||
        collection.id.toString().includes(lowercasedQuery)
    );
    setFilteredCollections(filtered);
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>Logo</div>
        <nav style={navStyle}>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
          <a href="#" style={linkStyle}>User Profile</a>
          <a href="#" style={linkStyle}>Settings</a>
          <a href="#" style={linkStyle}>Log Out</a>
        </nav>
      </header>
      <div style={mainStyle}>
        <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        <main style={contentStyle}>
          <h2>Collection Management</h2>
          <div style={viewStyle}>
            <div style={calendarStyle}>
              <h3>Calendar View</h3>
              <Calendar onChange={handleDateChange} value={date} />
            </div>
            <div style={mapStyle}>
              <h3>Map View</h3>
              <div style={mapContainerStyle}>
                <MapContainer center={currentLocation} zoom={13} style={mapInnerContainerStyle} key={currentLocation.join()}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {mapLocations.map((location, index) => (
                    <Marker key={index} position={[location.latitude, location.longitude]}>
                      <Popup>{location.address}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="Name, User ID or email"
              style={searchInputStyle}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button style={searchButtonStyle} onClick={handleSearch}>🔍</button>
          </div>
          <div style={tableContainerStyle}>
            <h3>Collection List</h3>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableCellStyle}>Collection ID</th>
                  <th style={tableCellStyle}>UserName</th>
                  <th style={tableCellStyle}>Address</th>
                  <th style={tableCellStyle}>Date</th>
                  <th style={tableCellStyle}>Status</th>
                  <th style={tableCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((collection) => (
                  <tr key={collection.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{collection.id}</td>
                    <td style={tableCellStyle}>{collection.username}</td>
                    <td style={tableCellStyle}>{collection.address}</td>
                    <td style={tableCellStyle}>{collection.date}</td>
                    <td style={tableCellStyle}>{collection.status}</td>
                    <td style={tableCellStyle}>
                      <button style={actionButtonStyle}>Edit</button>
                      <button style={actionButtonStyle}>View</button>
                      <button style={actionButtonStyle}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

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
  backgroundColor: '#8ce08a',
  color: '#4b4b4b',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  overflowY: 'auto',
};

const sidebarLinkStyle = {
  display: 'block',
  marginBottom: '10px',
  color: '#4b4b4b',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const contentStyle = {
  flex: '1',
  backgroundColor: '#e0f7da',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
};

const searchInputStyle = {
  flex: '1',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #cccccc',
};

const searchButtonStyle = {
  marginLeft: '10px',
  padding: '10px 20px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const tableContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

const tableHeaderStyle = {
  backgroundColor: '#d873f5',
  color: '#ffffff',
};

const tableRowStyle = {
  backgroundColor: '#f9f9f9',
};

const tableCellStyle = {
  padding: '10px',
  border: '1px solid #dddddd',
};

const actionButtonStyle = {
  padding: '5px 10px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '5px',
};

const viewStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const calendarStyle = {
  flex: '1',
  marginRight: '10px',
};

const mapStyle = {
  flex: '1',
  marginLeft: '10px',
};

const mapContainerStyle = {
  height: '300px',
  position: 'relative',
};

const mapInnerContainerStyle = {
  height: '100%',
  width: '100%',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

export default CollectionManagement;
