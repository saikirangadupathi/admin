import React from 'react';
import Modal from 'react-modal';

const OrderDetailsModal = ({ isOpen, onRequestClose, userInfo, orderInfo, onStartOrder, onCompleteOrder }) => {
  const handleCompleteOrder = () => {
    const updatedItems = orderInfo.items.map(item => ({
      ...item,
      status: 'completed'
    }));
    onCompleteOrder(updatedItems);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Order Details"
      style={modalStyles}
    >
      <h2>Order Details</h2>
      <div style={modalContentStyle}>
        <h3>User Info</h3>
        <p><strong>Name:</strong> {userInfo.name}</p>
        <p><strong>Contact:</strong> {userInfo.contact}</p>
        <p><strong>User ID:</strong> {userInfo.userId}</p>

        <h3>Order Info</h3>
        <p><strong>Address:</strong> {orderInfo.address}</p>
        <p><strong>Schedule Date:</strong> {orderInfo.scheduleDate}</p>
        <p><strong>Status:</strong> {orderInfo.status}</p>
        <p><strong>Nearest InveentoryId:</strong> {orderInfo.nearestInventoryId}</p>
        <h3>Items</h3>
        <ul>
          {orderInfo.items.map((item, index) => (
            <li key={index}>
              {item.category} ({item.weight} kg) - Price: {item.price}
            </li>
          ))}
        </ul>

        {orderInfo.status === 'orderplaced' && (
          <button style={buttonStyle} onClick={onStartOrder}>Start Order</button>
        )}
        {orderInfo.status === 'in progress' && (
          <button style={buttonStyle} onClick={handleCompleteOrder}>Complete Order</button>
        )}
      </div>
    </Modal>
  );
};


const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1001
  },
};


const modalContentStyle = {
  fontFamily: 'Arial, sans-serif',
  lineHeight: '1.6',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
};

export default OrderDetailsModal;
