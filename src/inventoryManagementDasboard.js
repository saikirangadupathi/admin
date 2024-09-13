import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './sidebarComponent';

const InventoryPage = () => {
    const [activeLink, setActiveLink] = useState(null);
  const [inventories, setInventories] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
    // Fetch all inventories on component mount
    const fetchInventories = async () => {
      try {
        const response = await axios.get('https://recycle-backend-apao.onrender.com/api/inventories');
        setInventories(response.data);
      } catch (error) {
        console.error('Error fetching inventories:', error);
      }
    };

    fetchInventories();
  }, []);


  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleInventoryChange = (event) => {
    const selected = inventories.find(inv => inv.name === event.target.value);
    setSelectedInventory(selected);
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#e0f7da',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
  };

  const mainContentStyle = {
    flex: 1,
    padding: '20px',
    marginLeft: '280px', // Adjust according to the sidebar width
    marginTop: '30px', // Adjust according to the header height
    overflowY: 'auto',
    height: 'calc(100vh - 60px)' // Adjust according to the header height
};

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D6CDF6',
    padding: '10px 20px',
    color: 'black',
    fontFamily: 'Arial, sans-serif',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    zIndex: '1000',
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

  return (
    <div>
      <header style={headerStyle}>
        <div style={logoStyle}>Logo</div>
        <nav style={navStyle}>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
          <a href="#" style={linkStyle}>User Profile</a>
          <a href="#" style={linkStyle}>Settings</a>
          <a href="#" style={linkStyle}>Log Out</a>
        </nav>
      </header>
      <div style={containerStyle}>
        <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
                        <div style={ mainContentStyle }>
                        <h1>Inventory Management</h1>
                        
                        {/* Dropdown to select inventory */}
                        <label>Select Inventory:</label>
                        <select onChange={handleInventoryChange}>
                            <option value="">Select...</option>
                            {inventories.map((inventory) => (
                            <option key={inventory.id} value={inventory.name}>
                                {inventory.name}
                            </option>
                            ))}
                        </select>

                        {/* Display selected inventory details */}
                        {selectedInventory && (
                            <div>
                            <h2>{selectedInventory.name}</h2>
                            <p>Type: {selectedInventory.type}</p>
                            <p>Location: {selectedInventory.location?.address}</p>
                            {selectedInventory.type === 'scrap' && selectedInventory.scrap && (
                                <div>
                                <h3>Scrap Inventory</h3>
                                <p>Total Capacity: {selectedInventory.scrap.totalCapacity}</p>
                                <p>Total Capacity Filled: {selectedInventory.scrap.totalCapacityFilled}</p>
                                <p>Total Inventory Value: {selectedInventory.scrap.totalInventoryValue}</p>
                                {/* Displaying individual items in scrap */}
                                <ul>
                                    {selectedInventory.scrap.items.map((item, index) => (
                                    <li key={index}>
                                        {item.name} - {item.weight}kg - ${item.totalPrice}
                                    </li>
                                    ))}
                                </ul>
                                </div>
                            )}
                            {selectedInventory.type === 'e_commerce' && selectedInventory.e_commerce && (
                                <div>
                                <h3>E-Commerce Inventory</h3>
                                <p>Total Capacity: {selectedInventory.e_commerce.totalCapacity}</p>
                                <p>Total Capacity Filled: {selectedInventory.e_commerce.totalCapacityFilled}</p>
                                <p>Total Inventory Value: {selectedInventory.e_commerce.totalInventoryValue}</p>
                                {/* Displaying individual products in e_commerce */}
                                <ul>
                                    {selectedInventory.e_commerce.products.map((product, index) => (
                                    <li key={index}>
                                        {product.name} - Quantity: {product.quantity} - ${product.price}
                                    </li>
                                    ))}
                                </ul>
                                </div>
                            )}
                            {selectedInventory.type === 'both' && (
                                <div>
                                <h3>Combined Inventory</h3>
                                <p>Total Capacity: {selectedInventory.totalCapacity}</p>
                                <p>Total Capacity Filled: {selectedInventory.totalCapacityFilled}</p>
                                <p>Total Inventory Value: {selectedInventory.totalInventoryValue}</p>
                                </div>
                            )}
                            </div>
                        )}
                </div>

            </div>
        </div>
  );
};

export default InventoryPage;
