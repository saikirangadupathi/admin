import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Sidebar from './sidebarComponent';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [activeLink, setActiveLink] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    contactNumber: '',
    username: '',
    password: '',
    pickupHistory: [],
    reCommerceOrderHistory: [],
    couponsHistory: [],
    greenpoints: '',
    wallet: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`https://recycle-backend-lflh.onrender.com/api/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      name: user.name,
      contactNumber: user.contactNumber,
      username: user.loginCredentials[0]?.username || '',
      password: user.loginCredentials[0]?.password || '',
      pickupHistory: user.pickupHistory,
      reCommerceOrderHistory: user.reCommerceOrderHistory,
      couponsHistory: user.couponsHistory,
      greenpoints: user.greenpoints,
      wallet: user.wallet,
    });
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  const handleDownload = () => {
    const csv = users.map(user => `${user.id},${user.name},${user.contactNumber},${user.greenpoints},${user.wallet}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users_list.csv');
  };

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `user${timestamp}${randomNum}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let { id, ...data } = formData;
  
      if (!id) {
        id = generateUniqueId();
      }
  
      // Initialize greenPoints and wallet with default values if not provided
      const userData = {
        ...data,
        id,
        greenpoints: data.greenpoints || '0',
        wallet: data.wallet || '0',
        loginCredentials: [{ username: formData.username, password: formData.password }]
      };
  
      const response = await axios.post('https://recycle-backend-lflh.onrender.com/api/users', userData);
      if (formData.id) {
        setUsers(users.map(user => (user.id === formData.id ? response.data : user)));
      } else {
        setUsers([...users, response.data]);
      }
      
      setFormData({
        id: '',
        name: '',
        contactNumber: '',
        username: '',
        password: '',
        pickupHistory: [],
        reCommerceOrderHistory: [],
        couponsHistory: [],
        greenpoints: '',
        wallet: '',
      });
    } catch (error) {
      console.error('Error adding/updating user:', error);
    }
  };

  return (
    <Container>
      <Header>
        <Logo>Logo</Logo>
        <Nav>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="#">User Profile</NavLink>
          <NavLink href="#">Settings</NavLink>
          <NavLink href="#">Log Out</NavLink>
        </Nav>
      </Header>
      <Main>
        <SidebarContainer>
          <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        </SidebarContainer>
        <Content>
          <h2>User Management</h2>
          <h3>Upload User Details</h3>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <FormInput
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <FormInput
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Green Points"
                value={formData.greenpoints}
                onChange={(e) => setFormData({ ...formData, greenpoints: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Wallet"
                value={formData.wallet}
                onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
              />
              <SubmitButton type="submit">Submit</SubmitButton>
            </FormRow>
          </Form>
          <SearchContainer>
            <SearchInput type="text" placeholder="Name, User ID or email" />
            <SearchButton>🔍</SearchButton>
          </SearchContainer>
          <DownloadButton onClick={handleDownload}>Download List</DownloadButton>
          <TableContainer>
            <h3>Users List</h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>User ID</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Contact Number</TableHeader>
                  <TableHeader>Username</TableHeader>
                  <TableHeader>Green Points</TableHeader>
                  <TableHeader>Wallet</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  user && user.id && (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.contactNumber}</TableCell>
                    <TableCell>{user.loginCredentials[0]?.username || ''}</TableCell>
                    <TableCell>{user.greenpoints}</TableCell>
                    <TableCell>{user.wallet}</TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleEdit(user)}>Edit</ActionButton>
                      <ActionButton onClick={() => handleView(user)}>View</ActionButton>
                      <ActionButton onClick={() => handleDelete(user.id)}>Delete</ActionButton>
                    </TableCell>
                  </TableRow>
                  )
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </Content>
      </Main>
      {selectedUser && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="User Details"
          style={customStyles}
        >
          <h2>User Details</h2>
          <h3>Pickup History</h3>
          <Table>
            <thead>
              <tr>
                <TableHeader>ID</TableHeader>
                <TableHeader>Items</TableHeader>
                <TableHeader>Address</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>
            <tbody>
              {selectedUser.pickupHistory.map((pickup, index) => (
                <TableRow key={index}>
                  <TableCell>{pickup.id}</TableCell>
                  <TableCell>
                    {pickup.cart.map((item, idx) => (
                      <div key={idx}>
                        {item.name} - {item.quantity} x ₹{item.price}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{pickup.address}</TableCell>
                  <TableCell>{pickup.date}</TableCell>
                  <TableCell>{pickup.status}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          <h3>ReCommerce Order History</h3>
          <Table>
            <thead>
              <tr>
                <TableHeader>ID</TableHeader>
                <TableHeader>Total Price</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Green Points</TableHeader>
              </tr>
            </thead>
            <tbody>
              {selectedUser.reCommerceOrderHistory.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>₹{order.totalPrice}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.greenpoints}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          <button onClick={() => setModalIsOpen(false)}>Close</button>
        </Modal>
      )}
    </Container>
  );
};

export default UserManagement;

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #D6CDF6;
  padding: 10px 20px;
  color: black;
  font-family: Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
`;

const Logo = styled.div`
  font-size: 1.5em;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled.a`
  color: black;
  text-decoration: none;
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  margin-top: 30px; /* Adjust according to the header height */
`;

const SidebarContainer = styled.div`
  background-color: #7cba72;
  padding: 20px;
  width: 250px;
  color: white;
  position: fixed;
  top: 60px; /* Adjust according to the header height */
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 1000;
`;

const Content = styled.main`
  flex: 1;
  background-color: #e0f7da;
  padding: 20px;
  margin-left: 290px; /* Adjust according to the sidebar width */
  overflow-y: auto;
  height: calc(100vh - 60px); /* Adjust according to the header height */
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #cccccc;
`;

const SearchButton = styled.button`
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #8ce08a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const DownloadButton = styled.button`
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #8ce08a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Form = styled.form`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FormInput = styled.input`
  flex: 1 1 45%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #cccccc;
`;

const SubmitButton = styled.button`
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #8ce08a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  flex: 1 1 100%;
`;

const TableContainer = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background-color: #d873f5;
  color: #ffffff;
  padding: 10px;
  border: 1px solid #dddddd;
`;

const TableRow = styled.tr`
  background-color: #f9f9f9;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #dddddd;
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  background-color: #8ce08a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
`;
