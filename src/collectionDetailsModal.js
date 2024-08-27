import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    width: '600px',
    borderRadius: '10px',
    zIndex: 1000,
  },
  overlay: {
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

Modal.setAppElement('#root');

const CollectionDetailsModal = ({ isOpen, onRequestClose, userInfo, pickupInfo, onStartPickup, onCompletePickup, onApprovePickup }) => {
  const [paidAmnt, setPaidAmnt] = useState([]);

  useEffect(() => {
    if (pickupInfo && pickupInfo.cart) {
      // Initialize with the current prices or empty strings if none are provided
      setPaidAmnt(pickupInfo.cart.map((item) => item.paidAmnt || ''));
    }
  }, [pickupInfo]);

  const handlePriceChange = (index, value) => {
    const newPrices = [...paidAmnt];
    newPrices[index] = value;
    setPaidAmnt(newPrices); // Update state
  };

  const handleCompletePickup = () => {
    if (pickupInfo && pickupInfo.cart) {
      const updatedItems = pickupInfo.cart.map((item, index) => ({
        ...item,
        paidAmnt: paidAmnt[index],
      }));
      onCompletePickup(updatedItems);
    }
  };

  const handleApprovePickup = () => {
    if (pickupInfo && pickupInfo.cart) {
      const updatedItems = pickupInfo.cart.map((item, index) => ({
        ...item,
        paidAmnt: paidAmnt[index],
      }));
      onApprovePickup(updatedItems);
    }
  };

  const allPricesFilled = paidAmnt.every(amount => amount !== '');

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Collection Details Modal"
    >
      <Container>
        <Header>Collection Details</Header>
        <InfoContainer>
          <UserInfo>
            <InfoHeader>User INFO</InfoHeader>
            <InfoBody>
              <InfoItem>Name: {userInfo.name}</InfoItem>
              <InfoItem>Contact: {userInfo.contact}</InfoItem>
              <InfoItem>User ID: {userInfo.userId}</InfoItem>
            </InfoBody>
          </UserInfo>
          <PickupInfo>
            <InfoHeader>Pickup INFO</InfoHeader>
            <InfoBody>
              <InfoItem>Address: {pickupInfo.address}</InfoItem>
              <InfoItem>Location: {pickupInfo.location}</InfoItem>
              <InfoItem>Schedule Date: {pickupInfo.scheduleDate}</InfoItem>
              <InfoItem>Nearest Inventory: {pickupInfo.nearestInventoryId}</InfoItem>
              <ImageContainer>
                {pickupInfo.imageURLs && pickupInfo.imageURLs.map((url, index) => (
                  <StyledImage key={index} src={url} alt={`Preview ${index + 1}`} />
                ))}
              </ImageContainer>
            </InfoBody>
          </PickupInfo>
        </InfoContainer>
        <Infocart>
          ITEMS
          {pickupInfo && pickupInfo.cart ? pickupInfo.cart.map((item, index) => (
            <div key={index}>
              <div>{item.name} - {item.quantity} /KGS | cost- {item.price} | Est.Price - {item.quantity * item.price} 
              </div>
              <div> AmntPaid: 
                <input
                  type="number"
                  value={paidAmnt[index] } // Bind to state
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  required
                />
              </div>
            </div>
          )) : 'No items available'}
        </Infocart>
        <Actions>
          {pickupInfo && pickupInfo.status === 'inProgress' ? (
            <ActionButton onClick={handleCompletePickup} disabled={!allPricesFilled}>
              Complete Pickup
            </ActionButton>
          ) : (
            <div>
              <ActionButton onClick={onStartPickup}>Start Pickup</ActionButton>
              <ActionButton onClick={handleApprovePickup}>Approve Pickup</ActionButton>
            </div>
          )}
          <ActionButton>Contact User</ActionButton>
          <ActionButton>Report Issue</ActionButton>
        </Actions>
      </Container>
    </Modal>
  );
};

export default CollectionDetailsModal;

// Styled Components
const Container = styled.div`
  text-align: center;
`;

const Header = styled.h1`
  font-size: 24px;
  color: #2e7d32;
  margin-bottom: 20px;
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const UserInfo = styled.div`
  width: 45%;
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 10px;
`;

const Infocart = styled.div`
  min-width: 60%;
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 10px;
`;

const ImageContainer = styled.div`
  display: flex;
  overflow-x: scroll;
  height: 200px;
  width: 200px;
`;

const StyledImage = styled.img`
  flex-shrink: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const PickupInfo = styled.div`
  width: 45%;
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 10px;
`;

const InfoHeader = styled.h2`
  font-size: 18px;
  color: #2e7d32;
  margin-bottom: 10px;
`;

const InfoBody = styled.div`
  text-align: left;
`;

const InfoItem = styled.p`
  margin: 5px 0;
`;

const Actions = styled.div`
  margin-top: 20px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  margin: 0 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;
