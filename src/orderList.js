import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'react-calendar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import 'leaflet/dist/leaflet.css';
import Sidebar from './sidebarComponent';
import OrderDetailsModal from './orderDetailsModal';
import ShoppingOrders from './shoppingOrders.png'
import Inventory from './inventory.png'

const OrderList = () => {
  const [date, setDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [inventoryLocations, setInventoryLocations] = useState([]); // New state for inventory locations
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState([51.505, -0.09]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [activeLink, setActiveLink] = useState(null);
  const [collectionsByDate, setCollectionsByDate] = useState({});
  const [completedOrders, setCompletedOrders] = useState([]);
  const mapRef = useRef();

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    const formattedDate = selectedDate.toDateString();
    const filtered = orders.filter(order => new Date(order.date).toDateString() === formattedDate);
    setFilteredOrders(filtered);
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`https://recycle-backend-lflh.onrender.com/getreCommerceOrders`);
      console.log('API Response:', response.data);
      const data = response.data.orderslist;
      const orders = Array.isArray(data) ? data.map(order => {
        const orderLocation = (Array.isArray(order.location) && order.location.length > 0) ? order.location[0] : {};
        return {
          id: order.id,
          username: order.name,
          customerId: order.userId,
          date: order.date,
          address: orderLocation.address,
          location: {
            lat: orderLocation.lat,
            lng: orderLocation.lng
          },
          price: order.totalPrice,
          contact: order.contact,
          items: order.cart,
          status: order.status
        };
      }) : [];
      
      setOrders(orders);
      setMapLocations(orders.map(order => ({ lat: order.location.lat, lng: order.location.lng })));

      const ordersByDate = orders.reduce((acc, order) => {
        const date = new Date(order.date).toDateString();
        if (!acc[date]) acc[date] = { pending: 0, completed: 0 };
        if (order.status === 'completed') {
          acc[date].completed++;
        } else if (order.status === 'orderplaced') {
          acc[date].pending++;
        }
        return acc;
      }, {});
      setCollectionsByDate(ordersByDate);
  
      const completed = orders.filter(order => order.status === 'completed');
      setCompletedOrders(completed);
  
      const initialDate = new Date().toDateString();
      const initialFiltered = orders.filter(order => new Date(order.date).toDateString() === initialDate);
      setFilteredOrders(initialFiltered);
  
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };


  const fetchInventoryLocations = async () => {
    try {
      const eCommerceResponse = await axios.get('https://recycle-backend-lflh.onrender.com/api/inventories/type/e_commerce');
      const bothResponse = await axios.get('https://recycle-backend-lflh.onrender.com/api/inventories/type/both');
      
      const combinedInventory = [...eCommerceResponse.data, ...bothResponse.data];
      setInventoryLocations(combinedInventory.map(inv => ({
        id: inv.id,
        name: inv.name,
        lat: inv.location.latitude,
        lng: inv.location.longitude
      })));
    } catch (error) {
      console.error("Error fetching inventory locations:", error);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = x => x * Math.PI / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestInventory = (orderLat, orderLng) => {
    let nearestInventory = null;
    let minDistance = Infinity;
    
    inventoryLocations.forEach(inv => {
      const distance = calculateDistance(orderLat, orderLng, inv.lat, inv.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestInventory = inv;
      }
    });
    
    return nearestInventory;
  };

  useEffect(() => {
    fetchOrders();
    fetchInventoryLocations(); // Fetch inventory locations on component mount
  }, []);
  
  

  const generateTrackingId = () => {
    const date = new Date();
    const components = [
      date.getFullYear(),
      ('0' + (date.getMonth() + 1)).slice(-2),
      ('0' + date.getDate()).slice(-2),
      ('0' + date.getHours()).slice(-2),
      ('0' + date.getMinutes()).slice(-2),
      ('0' + date.getSeconds()).slice(-2),
      ('00' + date.getMilliseconds()).slice(-3)
    ];
    return 'trackid' + components.join('');
  };


  const handleStartOrder = async (order) => {
    if (order) {
      try {
        const trackingId = generateTrackingId();
        const deliveryAgentId = "agent123"; // Example delivery agent ID, replace with actual value
        const customerId = order.customerId; // Example customer ID, replace with actual value

        const response = await axios.post('https://recycle-backend-lflh.onrender.com/startDelivery', {
          id: order.id,
          status: 'pending'
        });

        if (response.status === 200) {
          setOrders(prevOrders => prevOrders.map(ord =>
            ord.id === order.id ? { ...ord, status: 'pending' } : ord
          ));
          setFilteredOrders(prevOrders => prevOrders.map(ord =>
            ord.id === order.id ? { ...ord, status: 'pending' } : ord
          ));
          console.log('Processed location:', order.location.lat, order.location.lng);
          const trackingResponse = await axios.post('https://recycle-backend-lflh.onrender.com/api/deliveryTracking', {
            trackingId:generateTrackingId(),
            package: {
              packageId: order.id,
              seller: "seller123", // Example seller ID, replace with actual value
              products: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                trackingId:`Item${generateTrackingId()}`
              })),
              description: order.description || ""
            },
            customerId,
            weight: order.weight || 1, // Replace with actual weight
            items: order.items.length,
            nearestInventoryId: order.nearestInventoryId,
            destination: {latitude:  order.location.lat , longitude:  order.location.lng},
            status: 'pending',
            estimatedDeliveryTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Example ETA of 24 hours from now
            createdAt: new Date(),
            updatedAt: new Date()
          });

          if (trackingResponse.status === 201) {
            console.log('Delivery tracking entry created successfully',trackingResponse.data);
            setModalIsOpen(false);
          } else {
            console.error('Error creating delivery tracking entry:', trackingResponse.data);
          }
        } else {
          console.error('Error updating order status:', response.data);
        }
      } catch (error) {
        console.error("Error starting order:", error);
      }
    }
  };

  const handleCompleteOrder = async (updatedItems) => {
    if (selectedOrder) {
      try {
        const response = await axios.post('https://recycle-backend-lflh.onrender.com/completeorder', {
          id: selectedOrder.id,
          status: 'completed',
          items: updatedItems
        });
        if (response.status === 200) {
          setOrders(prevOrders => prevOrders.map(ord =>
            ord.id === selectedOrder.id ? { ...ord, status: 'completed', items: updatedItems } : ord
          ));
          setFilteredOrders(prevOrders => prevOrders.filter(ord => ord.id !== selectedOrder.id));
          setCompletedOrders(prevOrders => [...prevOrders, { ...selectedOrder, status: 'completed', items: updatedItems }]);
          setModalIsOpen(false);
        }
      } catch (error) {
        console.error("Error completing order:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/getPurchasedVouchers');
      setCoupons(response.data.vouchers);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.username.toLowerCase().includes(lowercasedQuery) ||
        order.id.toString().includes(lowercasedQuery)
    );
    setFilteredOrders(filtered);
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setCurrentLocation(newLocation);
          const map = mapRef.current;
          if (map) {
            map.setView(newLocation, 13);
          }
        },
        (error) => {
          console.error("Error getting current location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleViewClick = (order) => {
    const nearestInventory = findNearestInventory(order.location.lat, order.location.lng);
    
    // Add nearestInventoryId property to the selected order
    const updatedOrder = {
      ...order,
      nearestInventoryId: nearestInventory ? nearestInventory.id : null
    };
  
    setSelectedOrder(updatedOrder);
    setModalIsOpen(true);
  };
  

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toDateString();
      const pendingCount = collectionsByDate[formattedDate]?.pending || 0;
      const completedCount = collectionsByDate[formattedDate]?.completed || 0;
      if (pendingCount > 0 || completedCount > 0) {
        return (
          <div style={tileContentStyle}>
            {pendingCount > 0 && <div style={pendingBubbleStyle}>{pendingCount}</div>}
            {completedCount > 0 && <div style={completedBubbleStyle}>{completedCount}</div>}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div style={mainContainerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>Logo</div>
        <nav style={navStyle}>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
          <a href="#" style={linkStyle}>User Profile</a>
          <a href="#" style={linkStyle}>Settings</a>
          <a href="#" style={linkStyle}>Log Out</a>
        </nav>
      </header>
      <div style={mainStyle}>
        <div style={{ width: '20%' }}>
          <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        </div>
        <div style={containerStyle}>
          <div style={dashboardContainerStyle}>
            <div style={statusCardStyle}>
              <h3>Received Orders</h3>
              <p>{orders.length}</p>
            </div>
            <div style={statusCardStyle}>
              <h3>Pending Orders</h3>
              <p>{orders.filter(order => order.status === 'pending').length}</p>
            </div>
            <div style={statusCardStyle}>
              <h3>Cancelled Orders</h3>
              <p>{orders.filter(order => order.status === 'cancelled').length}</p>
            </div>
            <div style={statusCardStyle}>
              <h3>Completed Orders</h3>
              <p>{completedOrders.length}</p>
            </div>
          </div>
          <div style={viewStyle}>
            <div style={calendarStyle}>
              <h3>Calendar View</h3>
              <Calendar onChange={handleDateChange} value={date} tileContent={renderTileContent} />
            </div>
            <div style={mapStyle}>
              <h3>Map View</h3>
              <div style={mapContainerStyle}>
                <MapContainer center={currentLocation} zoom={13} style={mapInnerContainerStyle} ref={mapRef}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {mapLocations.map((location, index) => {
                          const lat = parseFloat(location.lat);
                          const lng = parseFloat(location.lng);
                          const id = location.id;
                          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                            console.warn(`Invalid LatLng object: (${lat}, ${lng})`);
                            return null;
                          }
                          
                          const nearestInventory = findNearestInventory(lat, lng);
                          
                          return (
                            <Marker key={index} position={[lat, lng]} icon={locationIcons.e_commerce}>
                              <Popup>
                                {`id: ${id}Location: ${lat}, ${lng}`}
                                {nearestInventory && (
                                  <div>
                                    <p>Nearest InventoryId: {nearestInventory.id}</p>
                                    <p>Nearest Inventory: {nearestInventory.name}</p>
                                  </div>
                                )}
                              </Popup>
                            </Marker>
                          );
                        })}

                        {/* Inventory Markers */}
                          {inventoryLocations.map((inv, index) => (
                            <Marker key={index} position={[inv.lat, inv.lng]} icon={locationIcons.inventory}>
                              <Popup>{`Inventory: ${inv.name}, Location: ${inv.lat}, ${inv.lng}`}</Popup>
                            </Marker>
                          ))}
                </MapContainer>
              </div>
              <button style={locateButtonStyle} onClick={handleLocationClick}>Locate Me</button>
            </div>
          </div>
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="Name, User ID or email"
              style={searchInputStyle}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button style={searchButtonStyle} onClick={handleSearch}>🔍</button>
          </div>
          <div style={tableContainerStyle}>
            <h3>Order List</h3>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableCellStyle}>Order ID</th>
                  <th style={tableCellStyle}>Customer ID</th>
                  <th style={tableCellStyle}>Address</th>
                  <th style={tableCellStyle}>Date</th>
                  <th style={tableCellStyle}>Total Price</th>
                  <th style={tableCellStyle}>Contact</th>
                  <th style={tableCellStyle}>Status</th>
                  <th style={tableCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{order.id}</td>
                    <td style={tableCellStyle}>{order.customerId}</td>
                    <td style={tableCellStyle}>{order.address}</td>
                    <td style={tableCellStyle}>{order.date}</td>
                    <td style={tableCellStyle}>{order.price}</td>
                    <td style={tableCellStyle}>{order.contact}</td>
                    <td style={tableCellStyle}>{order.status}</td>
                    <td style={tableCellStyle}>
                      <button style={actionButtonStyle} onClick={() => handleViewClick(order)}>View</button>
                      <button style={actionButtonStyle}>Edit</button>
                      <button style={actionButtonStyle}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={tableContainerStyle}>
            <h3>Order History</h3>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableCellStyle}>Order ID</th>
                  <th style={tableCellStyle}>CUstomer ID</th>
                  <th style={tableCellStyle}>Address</th>
                  <th style={tableCellStyle}>Date</th>
                  <th style={tableCellStyle}>Total Price</th>
                  <th style={tableCellStyle}>Contact</th>
                  <th style={tableCellStyle}>Status</th>
                  <th style={tableCellStyle}>Items</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.map((order) => (
                  <tr key={order.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{order.id}</td>
                    <td style={tableCellStyle}>{order.customerId}</td>
                    <td style={tableCellStyle}>{order.address}</td>
                    <td style={tableCellStyle}>{order.date}</td>
                    <td style={tableCellStyle}>{order.price}</td>
                    <td style={tableCellStyle}>{order.contact}</td>
                    <td style={tableCellStyle}>{order.status}</td>
                    <td style={tableCellStyle}>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.category} ({item.weight} kg) - Price: {item.price}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={tableContainerStyle}>
            <h3>Purchased Coupons</h3>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableCellStyle}>Coupon ID</th>
                  <th style={tableCellStyle}>Coupon Name</th>
                  <th style={tableCellStyle}>UserName</th>
                  <th style={tableCellStyle}>Email</th>
                  <th style={tableCellStyle}>Date of Purchase</th>
                  <th style={tableCellStyle}>Expiry Date</th>
                  <th style={tableCellStyle}>Price</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((voucher) => (
                  <tr key={voucher.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{voucher.id}</td>
                    <td style={tableCellStyle}>{voucher.name}</td>
                    <td style={tableCellStyle}>{voucher.username}</td>
                    <td style={tableCellStyle}>{voucher.email}</td>
                    <td style={tableCellStyle}>{voucher.dateOfPurchase}</td>
                    <td style={tableCellStyle}>{voucher.expiryDate}</td>
                    <td style={tableCellStyle}>{voucher.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {selectedOrder && (
          <OrderDetailsModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            userInfo={{
              name: selectedOrder.username,
              contact: selectedOrder.contact,
              userId: selectedOrder.id
            }}
            orderInfo={{
              address: `Lat: ${selectedOrder.lat}, Lng: ${selectedOrder.lng}`,
              scheduleDate: selectedOrder.date,
              items: selectedOrder.items,
              status: selectedOrder.status,
              nearestInventoryId: selectedOrder.nearestInventoryId
            }}
            onStartOrder={() => handleStartOrder(selectedOrder)}
            onCompleteOrder={handleCompleteOrder}
          />
        )}
      </div>
    </div>
  );
};


const viewStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const calendarStyle = {
  flex: '1',
  marginRight: '10px',
  position: 'relative'
};

const mainContainerStyle = {
  padding: '20px',
};

const containerStyle = {
  padding: '20px',
  width: '75%',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const headerStyle = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  position: 'fixed',
  alignItems: 'center',
  backgroundColor: '#D6CDF6',
  top: '0',
  left: '0',
  padding: '10px 20px',
  color: 'black',
  fontFamily: 'Arial, sans-serif',
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

const mainStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginTop: '40px',
};

const mapStyle = {
  flex: '1',
  marginLeft: '10px',
};

const mapContainerStyle = {
  height: '300px',
  position: 'relative',
};

const mapInnerContainerStyle = {
  height: '100%',
  width: '100%',
  borderRadius: '10px',
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
};

const searchInputStyle = {
  flex: '1',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #cccccc',
};

const searchButtonStyle = {
  marginLeft: '10px',
  padding: '10px 20px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const tableContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

const tableHeaderStyle = {
  backgroundColor: '#D6CDF6',
  color: 'black',
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

const locateButtonStyle = {
  padding: '5px 10px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '5px',
};

const tileContentStyle = {
  position: 'relative',
};

const locationIcons = {
  e_commerce: new L.Icon({ iconUrl: ShoppingOrders,
     iconSize: [32, 32], 
     iconAnchor: [16, 32],
      popupAnchor: [0, -32] }),
  inventory: new L.Icon({
        iconUrl: Inventory,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
}

const pendingBubbleStyle = {
  backgroundColor: 'red',
  color: 'white',
  borderRadius: '50%',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  right: '5%',
};

const completedBubbleStyle = {
  backgroundColor: 'green',
  color: 'white',
  borderRadius: '50%',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  left: '5%',
};

const dashboardContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '20px',
};

const statusCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

export default OrderList;
