import axios from "axios";
import React, { useEffect, useState } from "react";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);

  const sectionStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    overflowX: 'auto',
    marginBottom: '20px',
  };

  const sectionTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#4b4b4b',
  };

  const listStyle = {
    width: '60%',
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

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://recycle-backend-apao.onrender.com/getorders");
      setOrders(response.data.orderslist);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders to show only those with status "completed"
  const completedOrders = orders.filter(order => order.status === "completed");

  // Calculate the net sum price for each order
  const calculateNetSumPrice = (items) => {
    return items.reduce((total, item) => total + (parseFloat(item.paidAmnt) || 0), 0).toFixed(2);
  };

  return (
    <div className="container mt-5" style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Completed PickUp Orders</h2>
      <button className="btn btn-primary mb-3" onClick={fetchOrders}>Fetch Orders</button>
      <table className="table table-bordered table-hover" style={listStyle}>
        <thead style={tableHeaderStyle}>
          <tr>
            <th style={tableCellStyle}>ID</th>
            <th style={tableCellStyle}>Name</th>
            <th style={tableCellStyle}>Contact</th>
            <th style={tableCellStyle}>Schedule Pickup</th>
            <th style={tableCellStyle}>Total Weight</th>
            <th style={tableCellStyle}>Location</th>
            <th style={tableCellStyle}>Items</th>
            <th style={tableCellStyle}>Net Sum Price</th>
          </tr>
        </thead>
        <tbody>
          {completedOrders.map(order => (
            <tr key={order._id} style={tableRowStyle}>
              <td style={tableCellStyle}>{order._id}</td>
              <td style={tableCellStyle}>{order.name}</td>
              <td style={tableCellStyle}>{order.contact}</td>
              <td style={tableCellStyle}>{order.schedulePickup}</td>
              <td style={tableCellStyle}>{order.totalWeight}</td>
              <td style={tableCellStyle}>{order.location ? order.location : "no location"}</td>
              <td style={tableCellStyle}>
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th style={tableCellStyle}>name</th>
                      <th style={tableCellStyle}>Weight</th>
                      <th style={tableCellStyle}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.cart.map((item, index) => (
                      <tr key={index}>
                        <td style={tableCellStyle}>{item.name}</td>
                        <td style={tableCellStyle}>{item.quantity}</td>
                        <td style={tableCellStyle}>{item.price ? `Rupees: ${item.paidAmnt}` : "No price"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td style={tableCellStyle}>Rupees: {calculateNetSumPrice(order.cart)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
