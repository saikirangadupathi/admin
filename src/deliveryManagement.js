import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Sidebar from './sidebarComponent';
import Modal from 'react-modal';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import DeliveryMapManagement from './deliveryMapManagement';

Modal.setAppElement('#root');

const getDefaultLineChartData = () => ({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sample Line Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
    },
  ],
});

const getDefaultBarChartData = () => ({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sample Bar Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1,
    },
  ],
});

const getDefaultPieChartData = () => ({
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: 'Sample Pie Dataset',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
});

// Custom icon for the delivery agent markers
const agentIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const DeliveryManagement = () => {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [dispatchedDeliveries, setDispatchedDeliveries] = useState([]);

  const [inProgressPickups, setInProgressPickups] = useState([]);

  const [pickupTracking, setPickupTracking] = useState([]);
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Agent 1',
      contactNumber: '1234567890',
      username: 'agent1',
      password: 'password1',
      pickupHistory: [],
      reCommerceOrderHistory: [],
      couponsHistory: [],
      agentGreenPoints: '100',
      agentWallet: '500',
      location: { lat: 51.505, lng: -0.09 }, // Sample location 1
      type: 'both'
    },
    {
      id: '2',
      name: 'Agent 2',
      contactNumber: '1234567891',
      username: 'agent2',
      password: 'password2',
      pickupHistory: [],
      reCommerceOrderHistory: [],
      couponsHistory: [],
      agentGreenPoints: '150',
      agentWallet: '600',
      location: { lat: 51.515, lng: -0.1 }, // Sample location 2
      type: 'pickup'
    },
    {
      id: '3',
      name: 'Agent 3',
      contactNumber: '1234567892',
      username: 'agent3',
      password: 'password3',
      pickupHistory: [],
      reCommerceOrderHistory: [],
      couponsHistory: [],
      agentGreenPoints: '200',
      agentWallet: '700',
      location: { lat: 51.525, lng: -0.11 }, // Sample location 3
      type: 'e_commerce'
    },
    {
      id: '4',
      name: 'Agent 4',
      contactNumber: '1234567893',
      username: 'agent4',
      password: 'password4',
      pickupHistory: [],
      reCommerceOrderHistory: [],
      couponsHistory: [],
      agentGreenPoints: '250',
      agentWallet: '800',
      location: { lat: 51.535, lng: -0.12 }, // Sample location 4
      type: 'both'
    },
  ]);
  const [agencies, setAgencies] = useState([
    {
      id: '1',
      name: 'Sri Sai Satya Agency',
      contactInfo: 'srisaisatya@example.com',
      serviceAreas: ['Area1', 'Area2', 'Area3'],
      onTimeDeliveryRate: '95%',
      averageDeliveryTime: '30 mins',
      deliveryAccuracy: '99%',
      customerRatings: '4.8',
      complaints: '2',
      averageDeliveryTimeData: getDefaultLineChartData(),
      onTimeDeliveryRateData: getDefaultBarChartData(),
      pickupTimeData: getDefaultPieChartData(),
      deliveryCostData: getDefaultBarChartData(),
      costVariationsData: getDefaultLineChartData(),
      reviews: ['Excellent service!', 'Very punctual.'],
      complaintDetails: ['Late delivery on 01/01/2023'],
    },
  ]);
  const [activeLink, setActiveLink] = useState(null);
  const [agentFormData, setAgentFormData] = useState({
    id: '',
    name: '',
    contactNumber: '',
    username: '',
    password: '',
    pickupHistory: [],
    reCommerceOrderHistory: [],
    couponsHistory: [],
    agentGreenPoints: '',
    agentWallet: '',
    location: { lat: 0, lng: 0 }, // Add location field for agent
  });
  const [agencyFormData, setAgencyFormData] = useState({
    id: '',
    name: '',
    contactInfo: '',
    serviceAreas: '',
    onTimeDeliveryRate: '',
    averageDeliveryTime: '',
    deliveryAccuracy: '',
    customerRatings: '',
    complaints: '',
  });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showAssignPickups, setShowAssignPickups] = useState(true);
  const [filteredAgents, setFilteredAgents] = useState([]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/deliveryAgents');
        setAgents(response.data);
        filterAgents(showAssignPickups, response.data); // Initial filtering based on default state
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    const fetchAgencies = async () => {
      try {
        const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/deliveryAgencies');
        setAgencies((prevAgencies) => [...prevAgencies, ...response.data]);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/deliveryTracking');
        const pending = response.data.filter(order => order.status === 'pending');
        const dispatched = response.data.filter(order => order.status === 'Dispatched');
        
        setPendingDeliveries(pending);
        setDispatchedDeliveries(dispatched);
      } catch (error) {
        console.error('Error fetching delivery tracking data:', error);
      }
    };

    const fetchPickupTracking = async () => {
      try {
        const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/pickuptracking');
        const pending = response.data.filter(order => order.status === 'Pending');
        const inProgress = response.data.filter(order => order.status === 'In Progress');
        setPickupTracking(pending);
        setInProgressPickups(inProgress);
      } catch (error) {
        console.error('Error fetching pickup tracking data:', error);
      }
    };

    fetchAgents();
    fetchAgencies();
    fetchDeliveries();
    fetchPickupTracking();

  }, []);

  const filterAgents = (showPickups, agentsList = agents) => {
    const filtered = agentsList.filter(agent => {
      if (showPickups) {
        return agent.type === 'pickup' || agent.type === 'both';
      } else {
        return agent.type === 'e_commerce' || agent.type === 'both';
      }
    });
    setFilteredAgents(filtered);
  };

  const handleToggleButtonClick = (isAssignPickups) => {
    setShowAssignPickups(isAssignPickups);
    filterAgents(isAssignPickups);
  };

  const handleDelete = async (agentId) => {
    try {
      await axios.delete(`https://recycle-backend-lflh.onrender.com/api/deliveryAgents/${agentId}`);
      setAgents(agents.filter((agent) => agent.id !== agentId));
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleDeleteAgency = async (agencyId) => {
    try {
      await axios.delete(`https://recycle-backend-lflh.onrender.com/api/deliveryAgencies/${agencyId}`);
      setAgencies(agencies.filter((agency) => agency.id !== agencyId));
    } catch (error) {
      console.error('Error deleting agency:', error);
    }
  };

  const handleEditAgent = (agent) => {
    setAgentFormData({
      id: agent.id,
      name: agent.name,
      contactNumber: agent.contactNumber,
      username: agent.loginCredentials[0]?.username || '',
      password: agent.loginCredentials[0]?.password || '',
      pickupHistory: agent.pickupHistory,
      reCommerceOrderHistory: agent.reCommerceOrderHistory,
      couponsHistory: agent.couponsHistory,
      agentGreenPoints: agent.agentGreenPoints,
      agentWallet: agent.agentWallet,
      location: agent.location || { lat: 0, lng: 0 },
    });
  };

  const handleEditAgency = (agency) => {
    setAgencyFormData({
      id: agency.id,
      name: agency.name,
      contactInfo: agency.contactInfo,
      serviceAreas: agency.serviceAreas.join(', '),
      onTimeDeliveryRate: agency.onTimeDeliveryRate,
      averageDeliveryTime: agency.averageDeliveryTime,
      deliveryAccuracy: agency.deliveryAccuracy,
      customerRatings: agency.customerRatings,
      complaints: agency.complaints,
    });
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setModalIsOpen(true);
  };

  const handleViewAgency = (agency) => {
    setSelectedAgency({
      ...agency,
      averageDeliveryTimeData: agency.averageDeliveryTimeData || getDefaultLineChartData(),
      onTimeDeliveryRateData: agency.onTimeDeliveryRateData || getDefaultBarChartData(),
      pickupTimeData: agency.pickupTimeData || getDefaultPieChartData(),
      deliveryCostData: agency.deliveryCostData || getDefaultBarChartData(),
      costVariationsData: agency.costVariationsData || getDefaultLineChartData(),
      reviews: agency.reviews || [],
      complaintDetails: agency.complaintDetails || [],
    });
    setModalIsOpen(true);
  };

  const handleDownload = () => {
    const csv = agents
      .map(
        (agent) =>
          `${agent.id},${agent.name},${agent.contactNumber},${agent.agentGreenPoints},${agent.agentWallet}`
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'agents_list.csv');
  };

  const handleAssignOrder = async (orderId, agentId) => {
    const trackingId = orderId;
    try {
      const response = await axios.post(`https://recycle-backend-lflh.onrender.com/deliveryTracking/${orderId}`, {
        trackingId: trackingId,
        deliveryAgentId: agentId,
        status: 'Dispatched'
      });
      if (response.status === 200) {
        setPendingDeliveries(prev => prev.filter(order => order.id !== orderId));
        const updatedOrder = response.data;
        setDispatchedDeliveries(prev => [...prev, updatedOrder]);
      }
    } catch (error) {
      console.error('Error assigning order:', error);
    }
  };

  const handleAssignPickup = async (trackingId, agentId) => {
    try {
      const response = await axios.put(`https://recycle-backend-lflh.onrender.com/api/pickuptracking/${trackingId}`, {
        trackingId: trackingId,
        deliveryAgentId: agentId,
        status: 'In Progress'
      });
      if (response.status === 200) {
        // Update the pickup tracking list with the updated status
        setPickupTracking((prev) => prev.map(tracking => 
          tracking.trackingId === trackingId ? { ...tracking, status: 'In Progress' } : tracking
        ));
        
        // Filter to show only pickups with status 'In Progress'
        const updatedInProgressPickups = pickupTracking.filter(tracking => tracking.status === 'In Progress');
        setInProgressPickups(updatedInProgressPickups);
      }
    } catch (error) {
      console.error('Error assigning pickup:', error);
    }
  };
  

  const handleSubmitAgent = async (e) => {
    e.preventDefault();
    try {
      const { id, ...data } = agentFormData;
      const agentData = {
        ...data,
        loginCredentials: [{ username: agentFormData.username, password: agentFormData.password }],
      };
      const response = await axios.post('https://recycle-backend-lflh.onrender.com/api/deliveryAgents', {
        id,
        ...agentData,
      });
      if (id) {
        setAgents(agents.map((agent) => (agent.id === id ? response.data : agent)));
      } else {
        setAgents([...agents, response.data]);
      }
      setAgentFormData({
        id: '',
        name: '',
        contactNumber: '',
        username: '',
        password: '',
        pickupHistory: [],
        reCommerceOrderHistory: [],
        couponsHistory: [],
        agentGreenPoints: '',
        agentWallet: '',
        location: { latitudes: 0, longitudes: 0 },
      });
    } catch (error) {
      console.error('Error adding/updating agent:', error);
    }
  };

  const handleSubmitAgency = async (e) => {
    e.preventDefault();
    try {
      const { id, ...data } = agencyFormData;
      data.serviceAreas = data.serviceAreas.split(',').map((area) => area.trim());
      const response = await axios.post('https://recycle-backend-lflh.onrender.com/api/deliveryAgencies', {
        id,
        ...data,
      });
      if (id) {
        setAgencies(agencies.map((agency) => (agency.id === id ? response.data : agency)));
      } else {
        setAgencies([...agencies, response.data]);
      }
      setAgencyFormData({
        id: '',
        name: '',
        contactInfo: '',
        serviceAreas: '',
        onTimeDeliveryRate: '',
        averageDeliveryTime: '',
        deliveryAccuracy: '',
        customerRatings: '',
        complaints: '',
      });
    } catch (error) {
      console.error('Error adding/updating agency:', error);
    }
  };

  const renderAgentModalContent = () => (
    <div>
      <h2>Agent Details</h2>
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
          {selectedAgent.pickupHistory.map((pickup, index) => (
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
          {selectedAgent.reCommerceOrderHistory.map((order, index) => (
            <TableRow key={index}>
              <TableCell>{order.id}</TableCell>
              <TableCell>₹{order.totalPrice}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.greenpoints}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );

  const renderAgencyModalContent = () => {
    if (!selectedAgency) {
      return null;
    }

    return (
      <ScrollableModalContent>
        <h2>Agency Details</h2>
        <h3>Agency Profile</h3>
        <p>Name: {selectedAgency.name}</p>
        <p>Contact Info: {selectedAgency.contactInfo}</p>
        <p>Service Areas: {selectedAgency.serviceAreas.join(', ')}</p>
        <h3>Delivery Performance</h3>
        <ChartContainer>
          <Line data={selectedAgency.averageDeliveryTimeData} />
        </ChartContainer>
        <ChartContainer>
          <Bar data={selectedAgency.onTimeDeliveryRateData} />
        </ChartContainer>
        <h3>Operational Efficiency</h3>
        <ChartContainer>
          <Pie data={selectedAgency.pickupTimeData} />
        </ChartContainer>
        <p>Order Tracking: {selectedAgency.orderTracking || 'N/A'}</p>
        <h3>Cost Efficiency</h3>
        <ChartContainer>
          <Bar data={selectedAgency.deliveryCostData} />
        </ChartContainer>
        <ChartContainer>
          <Line data={selectedAgency.costVariationsData} />
        </ChartContainer>
        <h3>Customer Feedback</h3>
        <p>Rating: {selectedAgency.customerRatings || 'N/A'}</p>
        <p>Reviews: {selectedAgency.reviews.join(', ')}</p>
        <p>Complaint Details: {selectedAgency.complaintDetails.join(', ')}</p>
      </ScrollableModalContent>
    );
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
          <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        <Content>
          <DeliveryMapManagement agents={filteredAgents} />

          <ToggleButtons>
            <ToggleButton
              isActive={showAssignPickups}
              onClick={() => handleToggleButtonClick(true)}
            >
              Assign Pickups
            </ToggleButton>
            <ToggleButton
              isActive={!showAssignPickups}
              onClick={() => handleToggleButtonClick(false)}
            >
              Assign Orders
            </ToggleButton>
          </ToggleButtons>

          {showAssignPickups ? (
          <>
            <TableContainer>
              <h3>Assign Pickup</h3>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Tracking ID</TableHeader>
                    <TableHeader>Pickup ID</TableHeader>
                    <TableHeader>Address</TableHeader>
                    <TableHeader>Scheduled Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Assign Agent</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {pickupTracking.map((tracking) => (
                    <TableRow key={tracking.trackingId}>
                      <TableCell>{tracking.trackingId}</TableCell>
                      <TableCell>{tracking.pickupInfo.pickupId}</TableCell>
                      <TableCell>{tracking.pickupInfo.address}</TableCell>
                      <TableCell>{tracking.pickupInfo.scheduledDate}</TableCell>
                      <TableCell>{tracking.status}</TableCell>
                      <TableCell>
                        <select
                          onChange={(e) => (tracking.selectedAgentId = e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select Agent
                          </option>
                          {agents
                            .filter(
                              (agent) => agent.type === 'pickup' || agent.type === 'both'
                            )
                            .map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name}
                              </option>
                            ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            handleAssignPickup(
                              tracking.trackingId,
                              tracking.selectedAgentId
                            )
                          }
                        >
                          Assign
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableContainer>

            {inProgressPickups.length > 0 && (
              <TableContainer>
                <h3>In Progress Pickups</h3>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Tracking ID</TableHeader>
                      <TableHeader>Pickup ID</TableHeader>
                      <TableHeader>Address</TableHeader>
                      <TableHeader>Scheduled Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Agent ID</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {inProgressPickups.map((tracking) => (
                      <TableRow key={tracking.trackingId}>
                        <TableCell>{tracking.trackingId}</TableCell>
                        <TableCell>{tracking.pickupInfo.pickupId}</TableCell>
                        <TableCell>{tracking.pickupInfo.address}</TableCell>
                        <TableCell>{tracking.pickupInfo.scheduledDate}</TableCell>
                        <TableCell>{tracking.status}</TableCell>
                        <TableCell>{tracking.agentId}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </>
          ) : (
            <>
              <TableContainer>
                <h3>Assign Agents</h3>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Tracking ID</TableHeader>
                      <TableHeader>Package ID</TableHeader>
                      <TableHeader>Customer ID</TableHeader>
                      <TableHeader>Weight</TableHeader>
                      <TableHeader>Items</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeliveries.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.trackingId}</TableCell>
                        <TableCell>{order.package.packageId}</TableCell>
                        <TableCell>{order.customerId}</TableCell>
                        <TableCell>{order.weight}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>
                          <select
                            onChange={(e) => order.selectedAgentId = e.target.value}
                            defaultValue=""
                          >
                            <option value="" disabled>Select Agent</option>
                            {agents.filter(agent => agent.type === 'e_commerce' || agent.type === 'both').map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => handleAssignOrder(order.trackingId, order.selectedAgentId)}>Assign</button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>

              <TableContainer>
                <h3>Dispatched Orders</h3>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Tracking ID</TableHeader>
                      <TableHeader>Package ID</TableHeader>
                      <TableHeader>Customer ID</TableHeader>
                      <TableHeader>Weight</TableHeader>
                      <TableHeader>Items</TableHeader>

                      <TableHeader>Agent ID</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatchedDeliveries.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order.trackingId}</TableCell>
                        <TableCell>{order.package.packageId}</TableCell>
                        <TableCell>{order.customerId}</TableCell>
                        <TableCell>{order.weight}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{order.deliveryAgentId}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            </>
          )}

          <h2>Delivery Management</h2>
          <h3>Upload Delivery Details</h3>
          <Form onSubmit={handleSubmitAgent}>
            <FormRow>
              <FormInput
                type="text"
                placeholder="Name"
                value={agentFormData.name}
                onChange={(e) => setAgentFormData({ ...agentFormData, name: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Contact Number"
                value={agentFormData.contactNumber}
                onChange={(e) => setAgentFormData({ ...agentFormData, contactNumber: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Username"
                value={agentFormData.username}
                onChange={(e) => setAgentFormData({ ...agentFormData, username: e.target.value })}
              />
              <FormInput
                type="password"
                placeholder="Password"
                value={agentFormData.password}
                onChange={(e) => setAgentFormData({ ...agentFormData, password: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Green Points"
                value={agentFormData.agentGreenPoints}
                onChange={(e) => setAgentFormData({ ...agentFormData, agentGreenPoints: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Wallet"
                value={agentFormData.agentWallet}
                onChange={(e) => setAgentFormData({ ...agentFormData, agentWallet: e.target.value })}
              />
              <SubmitButton type="submit">Submit</SubmitButton>
            </FormRow>
          </Form>
          <SearchContainer>
            <SearchInput type="text" placeholder="Name, Agent ID or email" />
            <SearchButton>🔍</SearchButton>
          </SearchContainer>
          <DownloadButton onClick={handleDownload}>Download List</DownloadButton>
          <TableContainer>
            <h3>Delivery Agents List</h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Agent ID</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Contact Number</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>agentStatus</TableHeader>
                  <TableHeader>VehicleNumber</TableHeader>
                  <TableHeader>VehicleCapacity</TableHeader>
                  <TableHeader>AgentWallet</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.id}</TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.contactNumber}</TableCell>
                    <TableCell>{agent.type}</TableCell>
                    <TableCell>{agent.agentStatus}</TableCell>
                    <TableCell>{agent.vehicleNumber}</TableCell>
                    <TableCell>{agent.vehicleCapacity}</TableCell>
                    <TableCell>{agent.agentWallet}</TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleEditAgent(agent)}>Edit</ActionButton>
                      <ActionButton onClick={() => handleViewAgent(agent)}>View</ActionButton>
                      <ActionButton onClick={() => handleDelete(agent.id)}>Delete</ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
          <h2>Delivery Agencies</h2>
          <h3>Upload Delivery Agencies Details</h3>
          <Form onSubmit={handleSubmitAgency}>
            <FormRow>
              <FormInput
                type="text"
                placeholder="Agency Name"
                value={agencyFormData.name}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, name: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Contact Info"
                value={agencyFormData.contactInfo}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, contactInfo: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Service Areas (comma separated)"
                value={agencyFormData.serviceAreas}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, serviceAreas: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="On-time Delivery Rate"
                value={agencyFormData.onTimeDeliveryRate}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, onTimeDeliveryRate: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Average Delivery Time"
                value={agencyFormData.averageDeliveryTime}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, averageDeliveryTime: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Delivery Accuracy"
                value={agencyFormData.deliveryAccuracy}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, deliveryAccuracy: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Customer Ratings"
                value={agencyFormData.customerRatings}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, customerRatings: e.target.value })}
              />
              <FormInput
                type="text"
                placeholder="Complaints"
                value={agencyFormData.complaints}
                onChange={(e) => setAgencyFormData({ ...agencyFormData, complaints: e.target.value })}
              />
              <SubmitButton type="submit">Submit</SubmitButton>
            </FormRow>
          </Form>

          <SearchContainer>
            <SearchInput type="text" placeholder="Agency Name, On-time Delivery Rate, Delivery Cost" />
            <SearchButton>🔍</SearchButton>
          </SearchContainer>
          <FilterContainer>
            <label>
              On-time Delivery Rate:
              <select>
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label>
              Delivery Cost:
              <select>
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </FilterContainer>
          <TableContainer>
            <h3>Delivery Agencies List</h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Agency Name</TableHeader>
                  <TableHeader>On-time Delivery Rate</TableHeader>
                  <TableHeader>Average Delivery Time</TableHeader>
                  <TableHeader>Delivery Accuracy</TableHeader>
                  <TableHeader>Customer Ratings</TableHeader>
                  <TableHeader>Complaints</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell>{agency.name}</TableCell>
                    <TableCell>{agency.onTimeDeliveryRate}</TableCell>
                    <TableCell>{agency.averageDeliveryTime}</TableCell>
                    <TableCell>{agency.deliveryAccuracy}</TableCell>
                    <TableCell>{agency.customerRatings}</TableCell>
                    <TableCell>{agency.complaints}</TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleEditAgency(agency)}>Edit</ActionButton>
                      <ActionButton onClick={() => handleViewAgency(agency)}>View</ActionButton>
                      <ActionButton onClick={() => handleDeleteAgency(agency.id)}>Delete</ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </Content>
      </Main>
      {selectedAgent && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Agent Details"
          style={customStyles}
        >
          {renderAgentModalContent()}
          <button onClick={() => setModalIsOpen(false)}>Close</button>
        </Modal>
      )}
      {selectedAgency && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Agency Details"
          style={customStyles}
        >
          {renderAgencyModalContent()}
          <button onClick={() => setModalIsOpen(false)}>Close</button>
        </Modal>
      )}
    </Container>
  );
};

export default DeliveryManagement;

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
  margin-top: 60px; /* Adjust according to the header height */
`;


const Content = styled.main`
  flex: 1;
  background-color: #e0f7da;
  padding: 20px;
  margin-left: 260px; /* Adjust according to the sidebar width */
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

const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
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
  background-color: #D6CDF6;
  color: black;
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

const ScrollableModalContent = styled.div`
  max-height: 80vh;
  overflow-y: auto;
`;

const ChartContainer = styled.div`
  margin-bottom: 20px;
`;

const ToggleButtons = styled.div`
  display: flex;
  justify-content: center; /* Center the buttons horizontally */
  gap: 10px;
  margin-bottom: 20px;
  margin-top: 20px;
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => (props.isActive ? '#8ce08a' : '#d6d6d6')}; /* Active/inactive color */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: ${props => (props.isActive ? 'black' : 'black')}; /* Active/inactive text color */
  font-weight: bold;
  transition: background-color 0.3s, color 0.3s; /* Smooth transition for color changes */

  &:hover {
    background-color: ${props => (props.isActive ? '#7ac476' : '#cccccc')}; /* Slightly different color on hover */
  }
`;
