import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './login';
import Dashboard from './dashboard';
import UserManagement from './userManagement';
import CollectionManagement from './collectionManagement';
import OrderManagement from './orderManagement';
import Inventory from './inventoryManagement';
import Sidebar from './sidebarComponent';
import ReCommerceOrderManagement from './reCommerceManagement.js'
import DeliveryManagement from './deliveryManagement.js';

import ProductList from './ecommerceProductList.js';
import OrderList from './orderList.js';
import InventoryPage from './inventoryManagementDasboard.js';
import InventoryManagementPage from './inventoryManagementeCommerce.js';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/collectionManagement" element={<CollectionManagement />} />
          <Route path="/orderManagement" element={<OrderManagement />} />
          <Route path="/" element={<OrderManagement />} />
          <Route path="/inventoryManagement/scrap" element={<Inventory />} />
          <Route path="/reCommerce/dashboard" element={<ReCommerceOrderManagement />} />
          <Route path="/deliveryManagement" element={<DeliveryManagement />} />

          <Route path="/ecommerce/products/list" element={<ProductList />} />

          <Route path="/ecommerce/orders/list" element={<OrderList />} />
          <Route path='/inventoryManagement/dashboard'  element={<InventoryPage />} />

          <Route path='/inventoryManagement/eCommerce'  element={<InventoryManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


