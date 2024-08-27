import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const activeLink = location.pathname;

  const [isEcommerceOpen, setEcommerceOpen] = useState(false);
  const [isProductsOpen, setProductsOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [isCustomersOpen, setCustomersOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isInventoryOpen, setInventoryOpen] = useState(false);

  // useEffect to check activeLink and set the state accordingly
  useEffect(() => {
    if (activeLink.startsWith('/reCommerce/dashboard')) {
      setEcommerceOpen(true);
    }
    if (activeLink.startsWith('/inventoryManagement/scrap')) {
      setInventoryOpen(true);
    } else if (activeLink.startsWith('/inventoryManagement/dashboard')) {
      setInventoryOpen(true);
    } else if (activeLink.startsWith('/inventoryManagement/eCommerce')) {
      setInventoryOpen(true);
    }
    if (activeLink.startsWith('/ecommerce/products')) {
        setEcommerceOpen(true);
        setProductsOpen(true);
      } else if (activeLink.startsWith('/ecommerce/orders')) {
        setEcommerceOpen(true);
        setOrdersOpen(true);
      } else if (activeLink.startsWith('/ecommerce/customers')) {
        setEcommerceOpen(true);
        setCustomersOpen(true);
      } else if (activeLink.startsWith('/ecommerce/settings')) {
        setEcommerceOpen(true);
        setSettingsOpen(true);
      }
    
  }, [activeLink]);

  const toggleEcommerce = () => setEcommerceOpen(!isEcommerceOpen);
  const toggleProducts = () => setProductsOpen(!isProductsOpen);
  const toggleOrders = () => setOrdersOpen(!isOrdersOpen);
  const toggleCustomers = () => setCustomersOpen(!isCustomersOpen);
  const toggleSettings = () => setSettingsOpen(!isSettingsOpen);
  const toggleInventory = () => setInventoryOpen(!isInventoryOpen);


  const sidebarStyle = {
    backgroundColor: '#6864B9',
    marginTop: '49px',
    padding: '10px',
    width: '270px',
    color: 'white',
    position: 'fixed',
    top: '0',
    left: '0',
    bottom: '0',
    height: '100vh',
    overflowY: 'auto',
  };

  const sidebarItemStyle = (link, level = 0) => ({
    marginTop: '10px',
    marginBottom: '10px',
    cursor: 'pointer',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    color: activeLink === link ? 'black' : 'whitesmoke',
    textDecoration: 'none',
    fontWeight: 'bold',
    padding: '10px',
    backgroundColor: activeLink === link ? 'lightgray' : '#6864B9',
  });

  const subItemStyle = (link, level = 1) => ({
    marginLeft: `${level * 20}px`, // Indent based on level
    marginBottom: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: activeLink === link ? '#EEEEEE' : 'whitesmoke',
    textDecoration: 'none',
    padding: '5px',
  });

  const bulletStyle = (link) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: activeLink === link ? '#79F133' : 'whitesmoke',
    marginRight: '10px',
  });

  return (
    <div style={sidebarStyle}>
      <Link to="/user-management" style={sidebarItemStyle('/user-management')}>User Management</Link>
      <Link to="/deliveryManagement" style={sidebarItemStyle('/deliveryManagement')}>Delivery Management</Link>
      <Link to="/collectionManagement" style={sidebarItemStyle('/collectionManagement')}>Collection Management</Link>
      <div onClick={toggleInventory} style={{...sidebarItemStyle, fontWeight: 'bold',}}>
         Inventory Management
        {isInventoryOpen ? <FaChevronDown /> : <FaChevronRight />}
      </div>
      {isInventoryOpen && (
        <div>
            <Link to="/inventoryManagement/dashboard" style={subItemStyle('/inventoryManagement/dashboard',1)}>
              <div style={bulletStyle('/inventoryManagement/dashboard')}></div>
              Dashboard
            </Link>
            <Link to="/inventoryManagement/scrap" style={subItemStyle('/inventoryManagement/scrap',1)}>
              <div style={bulletStyle('/inventoryManagement/scrap')}></div>
              Scrap Inventory
            </Link>
            <Link to="/inventoryManagement/eCommerce" style={subItemStyle('/inventoryManagement/eCommerce',1)}>
              <div style={bulletStyle('/inventoryManagement/eCommerce')}></div>
              E-commerce Inventory
            </Link>
        </div>
      )}
      <Link to="/orderManagement" style={sidebarItemStyle('/orderManagement')}>Sales Management</Link>
      <Link style={sidebarItemStyle('/analyticsReporting')}>Analytics and Reporting</Link>
      <Link to="/communicationPage" style={sidebarItemStyle('/communicationPage')}>Communication</Link>
      <div onClick={toggleEcommerce} style={{ fontWeight: 'bold',}}>
         E-commerce Management
        {isEcommerceOpen ? <FaChevronDown /> : <FaChevronRight />}
      </div>
      {isEcommerceOpen && (
        <div>
          <Link to="/reCommerce/dashboard" style={subItemStyle('/reCommerce/dashboard',1)}>
            <div style={bulletStyle('/reCommerce/dashboard')}></div>
            Dashboard
          </Link>
          <div onClick={toggleProducts} style={subItemStyle('/ecommerce/products', 1)}>
            <div style={bulletStyle('/ecommerce/products')}></div> 
            Products
            {isProductsOpen ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {isProductsOpen && (
            <div>
              <Link to="/ecommerce/products/list" style={subItemStyle('/ecommerce/products/list', 2)}>
                <div style={{...bulletStyle('/ecommerce/products/list'), marginRight: '10px' }}></div>
                Product List
              </Link>
              <Link to="/ecommerce/products/categories" style={subItemStyle('/ecommerce/products/categories', 2)}>
                <div style={{...bulletStyle('/ecommerce/products/categories'), marginRight: '10px' }}></div>
                Category List
              </Link>
            </div>  
          )}
          <div onClick={toggleOrders} style={subItemStyle('/ecommerce/orders', 1)}>
            <div style={bulletStyle('/ecommerce/orders')}></div>
            Order
            {isOrdersOpen ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {isOrdersOpen && (
            <div>
              <Link to="/ecommerce/orders/list" style={subItemStyle('/ecommerce/orders/list', 2)}>
                <div style={{...bulletStyle('/ecommerce/orders/list'), marginRight: '10px' }}></div>
                Order List
              </Link>
              <Link to="/ecommerce/orders/details" style={subItemStyle('/ecommerce/orders/details', 2)}>
                <div style={{...bulletStyle('/ecommerce/orders/details'), marginRight: '10px'}}></div>
                Order Details
              </Link>
            </div>
          )}
          <div onClick={toggleCustomers} style={subItemStyle('/ecommerce/customers', 1)}>
            <div style={bulletStyle('/ecommerce/customers')}></div>
            Customer
            {isCustomersOpen ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {isCustomersOpen && (
            <div>
              <Link to="/ecommerce/customers/all" style={subItemStyle('/ecommerce/customers/all', 2)}>
                <div style={{...bulletStyle('/ecommerce/customers/all'), marginRight: '10px' }}></div>
                All Customers
              </Link>
              <Link to="/ecommerce/customers/details/overview" style={subItemStyle('/ecommerce/customers/details/overview', 2)}>
                <div style={{...bulletStyle('/ecommerce/customers/details/overview'), marginRight: '10px' }}></div>
                Overview
              </Link>
              <Link to="/ecommerce/customers/details/security" style={subItemStyle('/ecommerce/customers/details/security', 2)}>
                <div style={{...bulletStyle('/ecommerce/customers/details/security'), marginRight: '10px' }}></div>
                Security
              </Link>
              <Link to="/ecommerce/customers/details/address-billing" style={subItemStyle('/ecommerce/customers/details/address-billing', 2)}>
                <div style={{...bulletStyle('/ecommerce/customers/details/address-billing'), marginRight: '10px' }}></div>
                Address & Billing
              </Link>
              <Link to="/ecommerce/customers/details/notifications" style={subItemStyle('/ecommerce/customers/details/notifications', 2)}>
                <div style={{...bulletStyle('/ecommerce/customers/details/notifications'), marginRight: '10px' }}></div>
                Notifications
              </Link>
            </div>
          )}
          <Link to="/ecommerce/manage-reviews" style={subItemStyle('/ecommerce/manage-reviews', 1)}>
            <div style={bulletStyle('/ecommerce/manage-reviews')}></div>
            Manage Reviews
          </Link>
          <Link to="/ecommerce/referrals" style={subItemStyle('/ecommerce/referrals', 1)}>
            <div style={bulletStyle('/ecommerce/referrals')}></div>
            Referrals
          </Link>
          <div onClick={toggleSettings} style={subItemStyle('/ecommerce/settings', 1)}>
            <div style={bulletStyle('/ecommerce/settings')}></div>
            Settings
            {isSettingsOpen ? <FaChevronDown /> : <FaChevronRight />}
          </div>
          {isSettingsOpen && (
            <div>
              <Link to="/ecommerce/settings/store-details" style={subItemStyle('/ecommerce/settings/store-details', 2)}>
                <div style={{ ...bulletStyle('/ecommerce/settings/store-details'), marginRight: '10px' }}></div>
                Store Details
              </Link>
              <Link to="/ecommerce/settings/payments" style={subItemStyle('/ecommerce/settings/payments', 2)}>
                <div style={{...bulletStyle('/ecommerce/settings/payments'), marginRight: '10px' }}></div>
                Payments
              </Link>
              <Link to="/ecommerce/settings/checkout" style={subItemStyle('/ecommerce/settings/checkout', 2)}>
                <div style={{...bulletStyle('/ecommerce/settings/checkout'), marginRight: '10px' }}></div>
                Checkout
              </Link>
              <Link to="/ecommerce/settings/shipping-delivery" style={subItemStyle('/ecommerce/settings/shipping-delivery', 2)}>
                <div style={{...bulletStyle('/ecommerce/settings/shipping-delivery'), marginRight: '10px' }}></div>
                Shipping & Delivery
              </Link>
              <Link to="/ecommerce/settings/locations" style={subItemStyle('/ecommerce/settings/locations', 2)}>
                <div style={{...bulletStyle('/ecommerce/settings/locations'), marginRight: '10px' }}></div>
                Locations
              </Link>
              <Link to="/ecommerce/settings/notifications" style={subItemStyle('/ecommerce/settings/notifications', 2)}>
                <div style={{...bulletStyle('/ecommerce/settings/notifications'), marginRight: '10px' }}></div>
                Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
