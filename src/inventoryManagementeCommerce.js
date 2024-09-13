import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './sidebarComponent';

Chart.register(...registerables);

const InventoryManagementPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // State for filtered products
  const [ordersData, setOrdersData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [activeLink, setActiveLink] = useState(null);

  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [eCommerceInventories, setECommerceInventories] = useState([]);
  const [bothInventories, setBothInventories] = useState([]);



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch inventory data from the API
      const inventoryResponse = await axios.get('https://recycle-backend-apao.onrender.com/api/products');
  
      // Fetch delivery tracking data from the API
      const deliveryTrackingResponse = await axios.get('https://recycle-backend-apao.onrender.com/api/deliveryTracking');
      
      const ordersResponse = deliveryTrackingResponse.data.map(tracking => ({
        trackingId: tracking.trackingId,
        packageId: tracking.package.packageId,
        customerId: tracking.customerId,
        status: tracking.status,
        nearestInventoryId: tracking.nearestInventoryId,
        weight: tracking.weight,
      }));
  
      const suppliersResponse = {
        data: [
          { id: 'SUP001', name: 'Supplier A', contact: 'supplierA@example.com', products: ['Product A', 'Product B'] },
          { id: 'SUP002', name: 'Supplier B', contact: 'supplierB@example.com', products: ['Product C'] },
          { id: 'SUP003', name: 'Supplier C', contact: 'supplierC@example.com', products: ['Product D', 'Product E'] },
          { id: 'SUP004', name: 'Supplier D', contact: 'supplierD@example.com', products: ['Product F'] },
          { id: 'SUP005', name: 'Supplier E', contact: 'supplierE@example.com', products: ['Product G', 'Product H'] },
        ],
      };
  
      const reportResponse = {
        data: [
          { month: 'January', sales: 1500 },
          { month: 'February', sales: 2000 },
          { month: 'March', sales: 2500 },
          { month: 'April', sales: 3000 },
          { month: 'May', sales: 4000 },
        ],
      };
  
      // Fetch eCommerce inventories
      const eCommerceInventoriesResponse = await axios.get('https://recycle-backend-apao.onrender.com/api/inventories/type/e_commerce');
      setECommerceInventories(eCommerceInventoriesResponse.data);
  
      // Fetch both type inventories
      const bothInventoriesResponse = await axios.get('https://recycle-backend-apao.onrender.com/api/inventories/type/both');
      setBothInventories(bothInventoriesResponse.data);
  
      setInventoryData(inventoryResponse.data);
      setOrdersData(ordersResponse); // Set the orders data from deliveryTracking response
      setSuppliersData(suppliersResponse.data);
      setReportData(reportResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  
  

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    // Update filtered products whenever selectedInventoryId or inventoryData changes
    if (selectedInventoryId) {
      const filtered = inventoryData.flatMap(item =>
        item.availableAtInventories
          .filter(inventory => inventory.inventoryId === selectedInventoryId)
          .map(inventory => ({
            id: item.id,
            name: item.name,
            inventoryId: inventory.inventoryId,
            stockLevel: inventory.stockLevel,
            thirdPartySellerId: inventory.thirdPartySellerId,
          }))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]); // Clear if no inventory is selected
    }
  }, [selectedInventoryId, inventoryData]);

  const handleInventoryChange = (e) => {
    setSelectedInventoryId(e.target.value);
  };

  const renderInventorySelector = () => (
    <div className="mb-3">
      <label htmlFor="inventorySelect" className="form-label">Select Inventory</label>
      <select
        id="inventorySelect"
        className="form-select"
        value={selectedInventoryId}
        onChange={handleInventoryChange}
      >
        <option value="">Select Inventory</option>
        {eCommerceInventories.map(inventory => (
          <option key={inventory.id} value={inventory.id}>
            {inventory.name} (eCommerce)
          </option>
        ))}
        {bothInventories.map(inventory => (
          <option key={inventory.id} value={inventory.id}>
            {inventory.name} (Both)
          </option>
        ))}
      </select>
    </div>
  );

  const renderDashboard = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Dashboard Overview</h3>
      <div className="row">
        <div className="col-md-6">
          <h5>Total Inventory Value</h5>
          <Bar data={generateChartData('inventory')} />
        </div>
        <div className="col-md-6">
          <h5>Top Selling Products</h5>
          <Bar data={generateChartData('sales')} />
        </div>
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Inventory Management</h3>
      {renderInventorySelector()}
      <table className="table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Inventory ID</th>
            <th>Stock Level</th>
            <th>Seller Id</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <tr key={`${product.id}-${product.inventoryId}`}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.inventoryId}</td>
                <td>{product.stockLevel}</td>
                <td>{product.thirdPartySellerId}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No products available for the selected inventory.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  
  
  
  const renderOrderManagement = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Order Management</h3>
      {renderInventorySelector()}
      <table className="table">
        <thead>
          <tr>
            <th>Tracking ID</th>
            <th>Package ID</th>
            <th>Customer ID</th>
            <th>Weight</th>
            <th>Status</th>
            <th>nearestInventoryId</th>
          </tr>
        </thead>
        <tbody>
          {ordersData.filter(order => 
            !selectedInventoryId || order.nearestInventoryId === selectedInventoryId
          ).map(order => (
            <tr key={order.trackingId}>
              <td>{order.trackingId}</td>
              <td>{order.packageId}</td>
              <td>{order.customerId}</td>
              <td>{order.weight}</td>
              <td>{order.status}</td>
              <td>{order.nearestInventoryId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  

  const renderSupplierManagement = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Supplier Management</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Supplier ID</th>
            <th>Supplier Name</th>
            <th>Contact</th>
            <th>Products Supplied</th>
          </tr>
        </thead>
        <tbody>
          {suppliersData.map(supplier => (
            <tr key={supplier.id}>
              <td>{supplier.id}</td>
              <td>{supplier.name}</td>
              <td>{supplier.contact}</td>
              <td>{supplier.products.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Reports & Analytics</h3>
      <div className="row">
        <div className="col-md-12">
          <h5>Sales Report</h5>
          <Bar data={generateReportChartData()} />
        </div>
      </div>
    </div>
  );

  const generateChartData = (type) => {
    const data = {
      labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
      datasets: [
        {
          label: type === 'inventory' ? 'Inventory Level' : 'Sales',
          backgroundColor: 'rgba(75,192,192,0.6)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(75,192,192,0.8)',
          hoverBorderColor: 'rgba(75,192,192,1)',
          data: [120, 80, 50, 200, 150],
        },
      ],
    };
    return data;
  };

  const generateReportChartData = () => {
    const data = {
      labels: reportData.map(report => report.month),
      datasets: [
        {
          label: 'Monthly Sales',
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(153, 102, 255, 0.8)',
          hoverBorderColor: 'rgba(153, 102, 255, 1)',
          data: reportData.map(report => report.sales),
        },
      ],
    };
    return data;
  };

  return (
    <div>
      <header style={headerStyle}>
        <div style={{ fontSize: '1.5em' }}>Logo</div>
      </header>
      <div style={containerStyle}>
        <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        <div style={styles.container}>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
                  <a className="nav-link" href="#" onClick={() => handleTabChange('dashboard')}>Dashboard</a>
                </li>
                <li className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}>
                  <a className="nav-link" href="#" onClick={() => handleTabChange('inventory')}>Inventory Management</a>
                </li>
                <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
                  <a className="nav-link" href="#" onClick={() => handleTabChange('orders')}>Order Management</a>
                </li>
                <li className={`nav-item ${activeTab === 'suppliers' ? 'active' : ''}`}>
                  <a className="nav-link" href="#" onClick={() => handleTabChange('suppliers')}>Supplier Management</a>
                </li>
                <li className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}>
                  <a className="nav-link" href="#" onClick={() => handleTabChange('reports')}>Reports & Analytics</a>
                </li>
              </ul>
            </div>
          </nav>

          <div style={styles.mainContent}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'inventory' && renderInventoryManagement()}
            {activeTab === 'orders' && renderOrderManagement()}
            {activeTab === 'suppliers' && renderSupplierManagement()}
            {activeTab === 'reports' && renderReports()}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    flex: 1,
    padding: '20px',
    marginLeft: '280px',
    marginTop: '30px',
    overflowY: 'auto',
    height: 'calc(100vh - 60px)',
  },
  mainContent: {
    padding: '20px',
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },

};
const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#e0f7da',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
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

export default InventoryManagementPage;
