import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Truckicon from './truck.png';
import EcommerceIcon from './van.png';
import BothIcon from './boxTruck.png';
import PickupIcon from './recycleOrders.png';
import DeliveryIcon from './shoppingOrders.png';
import SellerIcon from './seller.png'; // Add an icon for sellers
import InventoryIcon from './inventory.png'; // Add an icon for inventory

const vehicleIcons = {
  e_commerce: new L.Icon({ iconUrl: EcommerceIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
  pickup: new L.Icon({ iconUrl: Truckicon, iconSize: [40, 45], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
  both: new L.Icon({ iconUrl: BothIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
  pickupTracking: new L.Icon({ iconUrl: PickupIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
  deliveryTracking: new L.Icon({ iconUrl: DeliveryIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }),
  seller: new L.Icon({ iconUrl: SellerIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }), // Add seller icon
  inventory: new L.Icon({ iconUrl: InventoryIcon, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] }), // Add inventory icon
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const getTopTrackingIds = (agentLocation, trackings, trackingType, count = 3) => {
  if (!agentLocation || !agentLocation.latitudes || !agentLocation.longitudes) {
      console.error("Invalid agentLocation", agentLocation);
      return [];
  }

  if (!trackings || !Array.isArray(trackings)) {
      console.error("Invalid or empty trackings array", trackings);
      return [];
  }

  const processedTrackings = trackings.filter(tracking => {
    let lat, lon;
    if (trackingType === 'pickup') {
        lat = tracking?.pickupInfo?.location?.latitude;
        lon = tracking?.pickupInfo?.location?.longitude;
    } else if (trackingType === 'delivery') {
        lat = tracking?.destination?.latitude;
        lon = tracking?.destination?.longitude;
    }

    const hasValidLocation = lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon));
    if (!hasValidLocation) {
        console.error("Invalid or incomplete tracking data skipped", { lat, lon, tracking });
    }
    return hasValidLocation;
  }).map(tracking => {
    const lat = trackingType === 'pickup' ? tracking.pickupInfo.location.latitude : tracking.destination.latitude;
    const lon = trackingType === 'pickup' ? tracking.pickupInfo.location.longitude : tracking.destination.longitude;

    const distance = calculateDistance(
        parseFloat(agentLocation.latitudes),
        parseFloat(agentLocation.longitudes),
        parseFloat(lat),
        parseFloat(lon)
    );
    return { ...tracking, distance };
  }).sort((a, b) => a.distance - b.distance).slice(0, count);

  return processedTrackings.map((tracking, index) => `${index + 1}. ${tracking.trackingId} (${tracking.distance.toFixed(2)} km)`);
};

const getTopAgents = (location, agents, allowedTypes) => {
  return agents
    .filter(agent => allowedTypes.includes(agent.type))
    .map(agent => ({
      ...agent,
      distance: calculateDistance(location.latitude, location.longitude, parseFloat(agent.location.latitudes), parseFloat(agent.location.longitudes))
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((agent, index) => `${index + 1}. ${agent.id} (${agent.distance.toFixed(2)} km)`);
};

const DeliveryMapManagement = ({ agents }) => {
  const [pickupTracking, setPickupTracking] = useState([]);
  const [deliveryTracking, setDeliveryTracking] = useState([]);
  const [sellers, setSellers] = useState([]); // Add state for sellers
  const [inventories, setInventories] = useState([]); // Add state for inventories
  const [selectedInfo, setSelectedInfo] = useState(null);

  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
        try {
            const response = await axios.get(`https://recycle-backend-lflh.onrender.com/api/${endpoint}`);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint} info:`, error);
        }
    };

    fetchData('pickuptracking', setPickupTracking);
    fetchData('deliveryTracking', setDeliveryTracking);
    fetchData('sellers', setSellers); // Fetch seller data
    fetchData('inventories', setInventories); // Fetch inventory data
  }, []);

  const handleMarkerClick = (agent, markerType) => {
    console.log('Agent clicked:', agent);
    setSelectedInfo({ ...agent, markerType });

    let relevantTrackings = [];
    let trackingType;

    switch(agent.type) {
        case 'e_commerce':
            trackingType = 'delivery';
            relevantTrackings = deliveryTracking;
            break;
        case 'pickup':
            trackingType = 'pickup';
            relevantTrackings = pickupTracking;
            break;
        case 'both':
            // For 'both', we handle fetching both types of trackings separately in the popup rendering logic
            break;
        default:
            console.warn('Unknown agent type:', agent.type);
            return;
    }

    if (agent.type !== 'both') {
        const topTrackingIds = getTopTrackingIds(agent.location, relevantTrackings, trackingType);
        console.log(`Nearest Tracking IDs for ${trackingType}:`, topTrackingIds);
    } else {
        // We log separately for 'both' case to ensure it's handled in popup generation
        console.log('Nearest Delivery Tracking IDs:', getTopTrackingIds(agent.location, deliveryTracking, 'delivery'));
        console.log('Nearest Pickup Tracking IDs:', getTopTrackingIds(agent.location, pickupTracking, 'pickup'));
    }
  };

  const handleClose = () => {
    setSelectedInfo(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={[17.366, 78.476]} zoom={13} style={{ height: '600px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {agents.map(agent => (
          <Marker
            key={agent.id}
            position={[parseFloat(agent.location.latitudes), parseFloat(agent.location.longitudes)]}
            icon={vehicleIcons[agent.type] || vehicleIcons.both}
            eventHandlers={{ click: () => handleMarkerClick(agent, 'agent') }}
          >
            <Popup>
              <div style={{ fontSize: '12px', color: '#333' }}>
                <strong>{agent.name}</strong><br />
                {agent.contactNumber}<br />
                {agent.type === 'e_commerce' && (
                  <ul style={{ color: '#007bff' }}>
                    {getTopTrackingIds(agent.location, deliveryTracking, 'delivery').map((tracking, index) => (
                      <li key={index}>{tracking}</li>
                    ))}
                  </ul>
                )}
                {agent.type === 'pickup' && (
                  <ul style={{ color: '#007bff' }}>
                    {getTopTrackingIds(agent.location, pickupTracking, 'pickup').map((tracking, index) => (
                      <li key={index}>{tracking}</li>
                    ))}
                  </ul>
                )}
                {agent.type === 'both' && (
                  <>
                    <strong>Nearest Delivery Trackings:</strong>
                    <ul style={{ color: '#007bff' }}>
                      {getTopTrackingIds(agent.location, deliveryTracking, 'delivery').map((tracking, index) => (
                        <li key={index}>{tracking}</li>
                      ))}
                    </ul>
                    <strong>Nearest Pickup Trackings:</strong>
                    <ul style={{ color: '#007bff' }}>
                      {getTopTrackingIds(agent.location, pickupTracking, 'pickup').map((tracking, index) => (
                        <li key={index}>{tracking}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {pickupTracking.map(pickup => (
          pickup.pickupInfo.location && pickup.pickupInfo.location.latitude && pickup.pickupInfo.location.longitude && (
            <Marker
              key={pickup.trackingId}
              position={[parseFloat(pickup.pickupInfo.location.latitude), parseFloat(pickup.pickupInfo.location.longitude)]}
              icon={vehicleIcons.pickupTracking}
              eventHandlers={{
                click: (e) => {
                 
                  const popup = e.target.getPopup();
                  popup.setLatLng(e.latlng).openOn(e.target._map);
                  setSelectedInfo({ ...pickup, markerType: 'pickup' });
                }
              }}
            >
              <Popup>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  Pickup ID: {pickup.pickupInfo.pickupId}<br />
                  Address: {pickup.pickupInfo.address || 'No Address'}<br />
                  nearestInventoryId: {pickup.nearestInventoryId}<br />
                  <strong>Nearest Agents:</strong><br />
                  <div style={{ color: '#007bff' }}>
                    {getTopAgents(pickup.pickupInfo.location, agents, ['pickup', 'both']).map((agent, index) => (
                      <div key={index}>{agent}</div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {deliveryTracking.map(delivery => (
          delivery.destination && delivery.destination.latitude && delivery.destination.longitude && (
            <Marker
              key={delivery.trackingId}
              position={[parseFloat(delivery.destination.latitude), parseFloat(delivery.destination.longitude)]}
              icon={vehicleIcons.deliveryTracking}
              eventHandlers={{
                click: (e) => {
                  const popup = e.target.getPopup();
                  popup.setLatLng(e.latlng).openOn(e.target._map);
                  setSelectedInfo({ ...delivery, markerType: 'delivery' });
                }
              }}
            >
              <Popup>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  Delivery Package ID: {delivery.package.packageId}<br />
                  Destination: {delivery.destination.address || 'No Address'}<br />
                  <strong>Nearest Agents:</strong>
                  <div style={{ color: '#007bff' }}>
                    {getTopAgents(delivery.destination, agents, ['e_commerce', 'both']).map((agent, index) => (
                      <div key={index}>{agent}</div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {sellers.map(seller => (
          seller.location && seller.location.latitude && seller.location.longitude && (
            <Marker
              key={seller._id}
              position={[parseFloat(seller.location.latitude), parseFloat(seller.location.longitude)]}
              icon={vehicleIcons.seller}
              eventHandlers={{
                click: (e) => {
                  const popup = e.target.getPopup();
                  popup.setLatLng(e.latlng).openOn(e.target._map);
                }
              }}
            >
              <Popup>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  <strong>{seller.name}</strong><br />
                  Contact: {seller.contact}<br />
                  Address: {seller.address || 'No Address'}<br />
                  <strong>Products:</strong><br />
                  <ul>
                    {seller.products && seller.products.length > 0 ? seller.products.map((product, index) => (
                      <li key={index}>{product.name} - {product.quantity} units</li>
                    )) : <li>No Products Available</li>}
                  </ul>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {inventories.map(inventory => (
          inventory.location && inventory.location.latitude && inventory.location.longitude && (
            <Marker
              key={inventory.id}
              position={[parseFloat(inventory.location.latitude), parseFloat(inventory.location.longitude)]}
              icon={vehicleIcons.inventory}
              eventHandlers={{ click: () => handleMarkerClick(inventory, 'inventory') }}
            >
              <Popup>
                <div style={{ fontSize: '12px', color: '#333' }}>
                  <strong>{inventory.name}</strong><br />
                  ID: {inventory.id}<br />
                  Inventory Manager: {inventory.inventoryManager}<br />
                  Type: {inventory.type}<br />
                  Total Capacity: {inventory.totalCapacity}<br />
                  Capacity Filled: {inventory.totalCapacityFilled}<br />
                  Total Inventory Value: {inventory.totalInventoryValue}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {selectedInfo && (
        <div className="position-absolute top-0 end-0 p-3" style={{ width: '350px', height: 'calc(100% - 40px)', overflowY: 'auto', zIndex: 1000 }}>
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="mb-0" style={{fontSize: '19px' }}>Detailed {selectedInfo.type} Info</h2>
              <button className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="card-body" style={{backgroundColor: '#e2f3fc'}}>
              {selectedInfo.markerType === 'agent' && (
                <>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{ textAlign: 'left'}} >ID </strong> <span>{selectedInfo.id}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{textAlign: 'left'}}>Name </strong>  <span style={{fontSize: '12px'}}>{selectedInfo.name}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{textAlign: 'left'}}>Contact</strong>  <span style={{fontSize: '13px'}}>{selectedInfo.contactNumber}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{textAlign: 'left'}}>Vehicle Capacity </strong>  <span style={{fontSize: '18 px', color: "#139be6", fontWeight:'bold'}}>{selectedInfo.vehicleCapacity} Kgs</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{textAlign: 'left'}}>Type</strong> <span>{selectedInfo.type}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{textAlign: 'left'}}>Capacity Filled </strong>  <span style={{fontSize: '18px', fontWeight:'bold', color: '#6ca10d'}}>{selectedInfo.capacityFilled} Kgs</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{textAlign: 'left'}}>Current Orders</strong>  <span style={{fontSize: '13px'}}>{selectedInfo.orders}</span></p>
                </>
              )}
              {selectedInfo.markerType === 'pickup' && (
                <>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Tracking ID:</strong>  <span style={{fontSize: '12px'}}>{selectedInfo.trackingId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Pickup ID:</strong>  <span style={{fontSize: '12px'}}>{selectedInfo.pickupInfo.pickupId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Customer ID:</strong> <span>{selectedInfo.pickupInfo.customerId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Address:</strong> <span style={{fontSize: '10px'}}>{selectedInfo.pickupInfo.address}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Scheduled Date:</strong>  <span style={{fontSize: '12px'}}>{new Date(selectedInfo.pickupInfo.scheduledDate).toLocaleString()}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Weight:</strong> <span style={{ fontWeight:'bold', color: "#139be6"}}>{selectedInfo.pickupInfo.totalWeight} Kgs</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >NearestInventory ID:</strong>  <span>{selectedInfo.nearestInventoryId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Agent ID:</strong>  <span>{selectedInfo.agentId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >Status:</strong>  <span style={{fontSize: '12px'}}>{selectedInfo.status}</span></p>
                  {selectedInfo.currentLocation && (
                    <>
                      <p><strong>Current Location:</strong> Latitude: {selectedInfo.currentLocation.latitude}, Longitude: {selectedInfo.currentLocation.longitude}</p>
                    </>
                  )}
                </>
              )}
              {selectedInfo.markerType === 'delivery' && (
                <>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Tracking ID:</strong>  <span>{selectedInfo.trackingId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Package ID:</strong>  <span>{selectedInfo.package.packageId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >SellerId:</strong>  <span>{selectedInfo.package.sellerId}</span></p>
                  {selectedInfo.package.products && selectedInfo.package.products.map((product, index) => (
                    <div key={index} className="ms-3" style={{backgroundColor:'white',borderRadius:'10px',margin:'10px', padding:'30px'}}>
                      <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Product:</strong> <span style={{fontSize: '12px'}}> {product.name}</span></p>
                      <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Quantity:</strong> <span  style={{fontSize: '12px', fontWeight:'bold'}}>{product.quantity}</span></p>
                      <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Price:</strong> <span  style={{fontSize: '12px', fontWeight:'bold'}}> {product.price}</span></p>
                    </div>
                  ))}
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}><strong style={{ textAlign: 'left',fontSize: '12px' }} >NearestInventory ID:</strong>  <span>{selectedInfo.nearestInventoryId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Delivery Agent ID:</strong>  <span>{selectedInfo.package.deliveryAgentId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Customer ID:</strong>  <span>{selectedInfo.package.customerId}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Weight:</strong>  <span>{selectedInfo.package.weight}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between',fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Status:</strong>  <span>{selectedInfo.package.status}</span></p>
                  {selectedInfo.currentLocation && (
                    <>
                      <p><strong>Current Location:</strong> Latitude: {selectedInfo.currentLocation.latitude}, Longitude: {selectedInfo.currentLocation.longitude}</p>
                    </>
                  )}
                </>
              )}
              {selectedInfo.markerType === 'seller' && (
                <>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Seller ID:</strong>  <span>{selectedInfo._id}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Name:</strong>  <span>{selectedInfo.name}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Contact:</strong>  <span>{selectedInfo.contact}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Address:</strong>  <span>{selectedInfo.address || 'No Address'}</span></p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Products:</strong></p>
                  <ul>
                    {selectedInfo.products.map((product, index) => (
                      <li key={index}>{product.name} - {product.quantity} units</li>
                    ))}
                  </ul>
                </>
              )}

                  {selectedInfo.markerType === 'inventory' && (
                    <>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >ID:</strong> {selectedInfo.id}</p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Name:</strong> {selectedInfo.name}</p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Inventory Manager:</strong> {selectedInfo.inventoryManager}</p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Type:</strong> {selectedInfo.type}</p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Total Capacity:</strong> {selectedInfo.totalCapacity}</p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Capacity Filled:</strong> {selectedInfo.totalCapacityFilled}</p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}><strong style={{ textAlign: 'left'}} >Total Inventory Value:</strong> {selectedInfo.totalInventoryValue}</p>
                    </>
                    )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMapManagement;
