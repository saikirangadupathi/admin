import React, { useState, useEffect } from 'react';
import Sidebar from './sidebarComponent';
import axios from 'axios';

const OrderManagement = () => {
    const [activeLink, setActiveLink] = useState(null);
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);

    const handleLinkClick = (link) => {
        setActiveLink(link);
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'whitesmoke',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
    };

        
    const sidebarStyle = {
      backgroundColor: '#7cba72',
      padding: '20px',
      width: '250px',
      color: 'white',
      position: 'fixed',
      top: '0',
      left: '0',
      height: '100vh',
      overflowY: 'auto'
    };

    const sidebarItemStyle = {
        marginBottom: '10px',
        cursor: 'pointer',
        display: 'block',
        marginBottom: '10px',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold'
    };

    const mainContentStyle = {
      flex: 1,
      padding: '20px',
      marginLeft: '280px', // Adjust according to the sidebar width
      marginTop: '60px', // Adjust according to the header height
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
        color: 'black',
        textDecoration: 'none',
    };

    const sectionStyle = {
        backgroundColor: '#d9f0d7',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
    };

    const sectionTitleStyle = {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#2c6e36',
    };

    const listStyle = {
        listStyleType: 'none',
        paddingLeft: '0',
    };

    const listItemStyle = {
        marginBottom: '8px',
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('https://recycle-backend-lflh.onrender.com/getorders');
            setOrders(response.data.orderslist);
            setFilteredOrders(response.data.orderslist);
            console.log('orderssss....',response.data.orderslist)
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleSearch = () => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = orders.filter(
            (order) =>
                order.username.toLowerCase().includes(lowercasedQuery) ||
                order.id.toString().includes(lowercasedQuery)
        );
        setFilteredOrders(filtered);
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
                <Sidebar style={{sidebarStyle}} activeLink={activeLink} onLinkClick={handleLinkClick} />

                <div style={mainContentStyle}>

                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Sales Dashboard</div>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>1. Metrics Overview ---- total sales ---- Revenue ---- Average Order value ---- New customers</li>
                            <li style={listItemStyle}>2. Sales Trends Graph ---- Line chart</li>
                            <li style={listItemStyle}>3. Top Products ---- Product name ---- category ---- Quantity sold ---- Revenue</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Order Management (recycler)</div>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>1. Search bar ---- filters [All, Pending Processed, Shipped, Completed, Cancelled]</li>
                            <li style={listItemStyle}>2. table ---- Order ID ---- Recycler name ---- Item Type ---- Quantity ---- Date ---- Status ---- Total ---- Actions (View/Edit/Invoice)</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Order Details (recycler)</div>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>1. Search bar ---- filters [All, Pending Processed, Shipped, Completed, Cancelled]</li>
                            <li style={listItemStyle}>2. table ---- Recycler details ---- Item sold (Type, Quantity, Price) ---- Shipment Tracking info ---- Invoice Management</li>
                            <li style={listItemStyle}>3. Customer Management (recyclers) ---- filters ---- [all, new, returning, vip] ---- orders (no.) ---- total spend ---- actions (view/edit)</li>
                        </ul>
                    </div>

                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Orders Table</div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Search by name or ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '80%' }}
                            />
                            <button onClick={handleSearch} style={{ padding: '10px', borderRadius: '5px', marginLeft: '10px', backgroundColor: '#8ce08a', border: 'none', cursor: 'pointer' }}>Search</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#d873f5', color: '#ffffff' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Order ID</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Contact</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Schedule Pickup</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total weight</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Items</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} style={{ backgroundColor: '#f9f9f9' }}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order._id}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.name}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.contact}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.schedulePickup}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.totalWeight}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                                <table className="table table-sm table-bordered">
                                                  <thead>
                                                    <tr>
                                                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>name</th>
                                                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Weight</th>
                                                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {order.cart.map((item, index) => (
                                                      <tr key={index}>
                                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.name}</td>
                                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.quantity}</td>
                                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.price ? `Rupees: ${item.paidAmnt}` : "No price"}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <button style={{ padding: '5px', borderRadius: '5px', backgroundColor: '#8ce08a', border: 'none', cursor: 'pointer', marginRight: '5px',marginBottom: '10px' }}>View</button>
                                            <button style={{ padding: '5px', borderRadius: '5px', backgroundColor: '#f58a8a', border: 'none', cursor: 'pointer' }}>Invoice</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}>Transaction Management</div>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>1. Search bar ---- filters [all, pending, completed]</li>
                            <li style={listItemStyle}>2. table ---- customer name (household) ---- date ---- status ---- amount ---- payment type ---- actions (view)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
