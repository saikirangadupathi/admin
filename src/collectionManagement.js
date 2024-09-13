import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './sidebarComponent';
import CollectionDetailsModal from './collectionDetailsModal';
import { Calendar } from 'react-calendar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'react-calendar/dist/Calendar.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PickupIcon from './recycleOrders.png'; // Ensure this path is correct
import Inventory from './inventory.png'
import { useDropzone } from 'react-dropzone'
import scrapBuyerIcon from './scrapBuyerIcon.png'

import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);


const CollectionManagement = () => {
  const [date, setDate] = useState(new Date());
  const [collections, setCollections] = useState([]);
  const [recyclingMaterials, setRecyclingMaterials] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [inventoryMapLocations,setinventoryMapLocations] = useState([]);
  const [nearestInventoryId, setnearestInventoryId] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [currentLocation, setCurrentLocation] = useState([51.505, -0.09]); // Default location
  const [activeLink, setActiveLink] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [collectionsByDate, setCollectionsByDate] = useState({});
  const calendarRef = useRef();
  const mapRef = useRef();
  const [selectedCell, setSelectedCell] = useState({ row: null, column: null });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [newImageURLs, setNewImageURLs] = useState([]);
  const [validUrls, setValidUrls] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [view, setView] = useState('collectionManagement'); // New state to track the current view

  const [scrapBuyers, setScrapBuyers] = useState([]);


  const [scrapBuyerId, setScrapBuyerId] = useState('');
  const [ Names, setNames] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [acceptedMaterials, setAcceptedMaterials] = useState('');
  const [pricing, setPricing] = useState('');
  const [currentOrders, setCurrentOrders] = useState('');
  const [balance, setBalance] = useState('');
  const [uploadMessages, setUploadMessages] = useState('');

  const [selectedScrapBuyer, setSelectedScrapBuyer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const [newOrderId, setNewOrderId] = useState('');
  const [newPickupDate, setNewPickupDate] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(""); // To track the selected category
  const [editSelectedCategory, setEditSelectedCategory] = useState("");

  const [updatedItemName, setUpdatedItemName] = useState("");
const [updatedItemPrice, setUpdatedItemPrice] = useState("");


  const [isItemEditModalOpen, setIsItemEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);


  // Add this state to manage the selected scrap buyer performance details
const [selectedScrapBuyerPerformance, setSelectedScrapBuyerPerformance] = useState(null);





  // Modify this function to set the performance data
const handleViewScrapBuyerPerformance = (buyer) => {
  setSelectedScrapBuyerPerformance(buyer);
};

  

  const handleEditScrapBuyer = (buyer) => {
    setSelectedScrapBuyer(buyer);
    setIsEditModalOpen(true);
  };
  

  const handleUpdateScrapBuyer = async (updatedData) => {
    try {
      const response = await axios.put(`https://recycle-backend-apao.onrender.com/api/scrap-buyers/${selectedScrapBuyer.scrapBuyerId}`, updatedData);
      setIsEditModalOpen(false);
      fetchScrapBuyers(); // Refresh the list
    } catch (error) {
      console.error('Error updating scrap buyer:', error);
    }
  };
  

  const handleDeleteScrapBuyer = async (scrapBuyerId) => {
    try {
      await axios.delete(`https://recycle-backend-apao.onrender.com/api/scrap-buyers/${scrapBuyerId}`);
      fetchScrapBuyers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting scrap buyer:', error);
    }
  };
  




  const fetchScrapBuyers = async () => {
    try {
      const response = await axios.get('https://recycle-backend-apao.onrender.com/api/scrap-buyers'); // Adjust URL as per your backend setup
      setScrapBuyers(response.data);
    } catch (error) {
      console.error('Error fetching scrap buyers:', error);
    }
  };
  
  useEffect(() => {
    if (view === 'scrapBuyers') {
      fetchScrapBuyers();
    }
  }, [view]);




  const handleCellClick = (rowIndex, columnId) => {
    const selectedItem = recyclingMaterials.find(category => category.id === columnId)?.items[rowIndex];
    setSelectedCell({ row: rowIndex, column: columnId });
    setEditingItem(selectedItem);
  };
  

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    fetchCollectionsByDate(selectedDate);
  };

  const fetchCollectionsByDate = async (selectedDate) => {
    try {
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const response = await axios.get(`https://recycle-backend-apao.onrender.com/getorders?date=${formattedDate}`);
      const data = response.data.orderslist;
      
      const collections = Array.isArray(data) ? data.map(order => {
        const location = order.location || { latitude: 0, longitude: 0, address: '' };
  
        return {
          id: order.Id,
          username: order.name,
          date: order.schedulePickup,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          imageURLs: order.images,
          totalWeight: order.totalWeight,
          contact: order.contact,
          cart: order.cart,
          status: order.status
        };
      }) : [];
      console.log('collections..', collections);
      setCollections(collections);
      setFilteredCollections(collections);
      setMapLocations(collections.map(collection => ({
        lat: collection.latitude !== undefined ? collection.latitude : 0,
        lng: collection.longitude !== undefined ? collection.longitude : 0
      })));
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const fetchScrapInventories = async () => {
    try {
      const responseScrap = await axios.get('https://recycle-backend-apao.onrender.com/api/inventories/type/scrap');
      const responseBoth = await axios.get('https://recycle-backend-apao.onrender.com/api/inventories/type/both');
      const inventories = [...responseScrap.data, ...responseBoth.data];

      // setScrapInventories(inventories);
      setinventoryMapLocations(inventories.map(inventory => ({
        id: inventory.id,
        lat: inventory.location.latitude,
        lng: inventory.location.longitude,
        name: inventory.name,
        address: inventory.location.address
      })));
    } catch (error) {
      console.error("Error fetching scrap inventories:", error);
    }
  };

  useEffect(() => {
    const fetchInitialCollections = async () => {
      try {
        const response = await axios.get('https://recycle-backend-apao.onrender.com/getorders');
        const data = response.data.orderslist;
        const collections = Array.isArray(data) ? data.map(order => {
          const location = order.location || { latitude: 0, longitude: 0, address: '' };
    
          return {
            id: order.Id,
            username: order.name,
            date: order.schedulePickup,
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            totalWeight: order.totalWeight,
            contact: order.contact,
            cart: order.cart,
            status: order.status
          };
        }) : [];
        console.log('collections..', collections);
        setCollections(collections);
        setFilteredCollections(collections);
    
        // Group collections by date
        const collectionsByDate = collections.reduce((acc, collection) => {
          const date = new Date(collection.date).toDateString();
          if (!acc[date]) acc[date] = 0;
          acc[date]++;
          return acc;
        }, {});
        setCollectionsByDate(collectionsByDate);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    const fetchRecyclingMaterials = async () => {
      try {
        const response = await axios.get('https://recycle-backend-apao.onrender.com/api/recycling-materials');
        setRecyclingMaterials(response.data);
        console.log('recycling..', response.data);
      } catch (error) {
        console.error('Error fetching recycling materials:', error);
      }
    };

    fetchInitialCollections();
    fetchRecyclingMaterials();
    fetchScrapInventories(); // Fetch scrap inventories on initial load
  }, []);




  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setPrice(editingItem.price.toString());
      setCategory(editingItem.category); // Assuming `category` is stored in each item, otherwise handle it differently.
    }
  }, [editingItem]);
  




  useEffect(() => {
    const updateBubblePositions = () => {
      const calendarElement = calendarRef.current;
      const tiles = calendarElement.querySelectorAll('.react-calendar__tile');
      const newPositions = {};

      tiles.forEach((tile) => {
        const date = tile.getAttribute('aria-label');
        const formattedDate = new Date(date).toDateString();
        const rect = tile.getBoundingClientRect();
        newPositions[formattedDate] = {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        };
      });

      setBubblePositions(newPositions);
    };

    updateBubblePositions();
    window.addEventListener('resize', updateBubblePositions);

    return () => {
      window.removeEventListener('resize', updateBubblePositions);
    };
  }, [collectionsByDate]);

  const [bubblePositions, setBubblePositions] = useState({});

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = collections.filter(
      (collection) =>
        collection.username.toLowerCase().includes(lowercasedQuery) ||
        collection.id.toString().includes(lowercasedQuery)
    );
    setFilteredCollections(filtered);
  };


  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => value * Math.PI / 180;
    const R = 6371; // Radius of the Earth in kilometers
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = R * c; // Distance in kilometers
  
    return distance;
  };

  
  const findNearestInventory = (lat, lng) => {
    let nearestInventory = null;
    let shortestDistance = Infinity;
  
    inventoryMapLocations.forEach(inventory => {
      const distance = calculateDistance(lat, lng, inventory.lat, inventory.lng);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestInventory = inventory;
      }
    });
  
    return nearestInventory;
  };
  

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setCurrentLocation(newLocation);
          const map = mapRef.current;
          if (map) {
            map.setView(newLocation, 13); // Adjust zoom level as needed
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

  const handleViewClick = (collection) => {
    const nearestInventory = findNearestInventory(collection.latitude, collection.longitude);
    
    const updatedCollection = {
      ...collection,
      nearestInventoryId: nearestInventory?.id || null,
      nearestInventoryName: nearestInventory?.name || 'N/A'
    };
    console.log('resultedViewClick..',updatedCollection);
    setSelectedCollection(updatedCollection);

    setModalIsOpen(true);
  };


  const handleItemEdit = () => {
    // Logic to handle the editing of a specific item
    const updatedMaterials = [...selectedScrapBuyer.acceptedMaterials];
    const { categoryIndex, itemIndex } = selectedItem;
  
    updatedMaterials[categoryIndex].items[itemIndex] = {
      ...updatedMaterials[categoryIndex].items[itemIndex],
      name: updatedItemName, // Updated item name
      buyerPrice: updatedItemPrice, // Updated buyer price
    };
  
    setSelectedScrapBuyer({ ...selectedScrapBuyer, acceptedMaterials: updatedMaterials });
    setIsItemEditModalOpen(false); // Close the item edit modal after saving
  };
  
  
  

  const handleStartPickup = async (collection) => {
    if (collection) {
      try {
        const response = await axios.post('https://recycle-backend-apao.onrender.com/startpickup', {
          id: collection.id,
          status: 'inProgress'
        });
        if (response.status === 200) {
          setCollections(prevCollections => prevCollections.map(col =>
            col.id === collection.id ? { ...col, status: 'inProgress' } : col
          ));
          setFilteredCollections(prevCollections => prevCollections.map(col =>
            col.id === collection.id ? { ...col, status: 'inProgress' } : col
          ));
          setModalIsOpen(false);
        }
      } catch (error) {
        console.error("Error starting pickup:", error);
      }
    }
  };

  const handleApprovePickup = async (updatedItems) => {
    if (selectedCollection) {
      try {
        const response = await axios.post('https://recycle-backend-apao.onrender.com/approvepickup', {
          id: selectedCollection.id,
          status: 'pickupApproved',
          items: updatedItems,
        });
  
        if (response.status === 200) {
          const trackingResponse = await axios.post('https://recycle-backend-apao.onrender.com/api/pickuptracking', {
            pickupInfo: {
              pickupId: selectedCollection.id,
              customerId: selectedCollection.userId,
              address: selectedCollection.address,
              location: {latitude: String(selectedCollection.latitude),longitude: String(selectedCollection.longitude)},
              scheduledDate: selectedCollection.date,
              totalWeight: selectedCollection.totalWeight
            },
            nearestInventoryId: selectedCollection.nearestInventoryId,
            status: 'Pending'
          });
  
          console.log('Pickup tracking created:', trackingResponse.data);
  
          setCollections(prevCollections => prevCollections.map(col =>
            col.id === selectedCollection.id ? { ...col, status: 'pickupApproved', items: updatedItems } : col
          ));
          setFilteredCollections(prevCollections => prevCollections.map(col =>
            col.id === selectedCollection.id ? { ...col, status: 'pickupApproved', items: updatedItems } : col
          ));
          setModalIsOpen(false);
        }
      } catch (error) {
        console.error("Error approving pickup:", error);
      }
    }
  };
  

  const handleCompletePickup = async (updatedItems) => {
    if (selectedCollection) {
      try {
        console.log('itemss...', updatedItems)
        const response = await axios.put('https://recycle-backend-apao.onrender.com/completepickup', {
          id: selectedCollection.id,
          status: 'completed',
          items: updatedItems
        });

        if (response.status === 200) {
          setCollections(prevCollections => prevCollections.map(col =>
            col.id === selectedCollection.id ? { ...col, status: 'completed', items: updatedItems } : col
          ));
          setFilteredCollections(prevCollections => prevCollections.map(col =>
            col.id === selectedCollection.id ? { ...col, status: 'completed', items: updatedItems } : col
          ));
          setModalIsOpen(false);
        }
      } catch (error) {
        console.error("Error completing pickup:", error);
      }
    }
  };

  const handleUploadRecyclingMaterial = async () => {
    const newMaterial = {
      name,
      price: parseFloat(price),
      imageUrl: validUrls.length > 0 ? validUrls[0] : editingItem?.imageUrl // Use the first valid URL or the existing one
    };
    console.log('editingItm...',editingItem)
    try {
      let response;
      if (editingItem) {
        // Update existing material
        response = await axios.put(`https://recycle-backend-apao.onrender.com/api/recycling-materials/${editingItem.itemId}`, newMaterial);
      } else {
        // Add new material
        const newMaterialData = { [category]: [newMaterial] };
        response = await axios.post('https://recycle-backend-apao.onrender.com/api/upload-recycling-materials', newMaterialData);
      }
  
      setUploadMessage(response.data.message);
      setName('');
      setPrice('');
      setCategory('');
      const fetchResponse = await axios.get('https://recycle-backend-apao.onrender.com/api/recycling-materials');
      setRecyclingMaterials(fetchResponse.data);
      setEditingItem(null);
      setValidUrls([]);
    } catch (error) {
      console.error('Error uploading recycling material:', error);
      setUploadMessage('Error uploading recycling material');
    }
  };
  


  const activeCollections = filteredCollections.filter(collection => collection.status !== 'completed');
  const completedCollections = filteredCollections.filter(collection => collection.status === 'completed');

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toDateString();
      const count = collectionsByDate[formattedDate] || 0;
      if (count > 0) {
        return (
          <div style={tileContentStyle}>
            {count}
          </div>
        );
      }
    }
    return null;
  };


  const handleEdit = () => {
    // Logic for editing the selected cell data
  };
  
  const handleDelete = () => {
    // Logic for deleting the selected cell data
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target.result;
        // Process the uploaded file (for instance, set it to state)
      };
      reader.readAsText(file);
    }
  };


  const uploadImagesToS3 = async () => {
    if (uploadedImages.length === 0) {
      alert('No images to upload.');
      return;
    }
    const uploadPromises = uploadedImages.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await axios.post('https://recycle-backend-apao.onrender.com/upload', formData);
        return response.data.imageUrl;
      } catch (error) {
        console.error('Error uploading the file', error);
        return null;
      }
    });
    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(url => url !== null);
    setValidUrls(validUrls);
    setUploadedImages([]);
    setNewImageURLs(validUrls);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const files = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setUploadedImages(prevImages => [...prevImages, ...files]);
    }
  });
  
  const removeImage = (index) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const tableCellStyle = (rowIndex, columnId) => {
    return {
      padding: '10px',
      border: '1px solid #dddddd',
      cursor: 'pointer',
      backgroundColor: 
        selectedCell.row === rowIndex && selectedCell.column === columnId ? '#D6CDF6' : '#f9f9f9',
    };
  };

  const handleUploadScrapBuyer = async () => {
    const newScrapBuyer = {
      scrapBuyerId,
      name,
      businessName,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
      },
      serviceAreas: serviceAreas.split(',').map(area => area.trim()),
      acceptedMaterials: acceptedMaterials.split(',').map(material => material.trim()),
      pricing: pricing.split(',').map(item => {
        const [materialType, price] = item.split(':');
        return { materialType, pricePerKg: parseFloat(price) };
      }),
      currentOrders: currentOrders.split(',').map(order => {
        const [orderId, pickupDate, status] = order.split(':');
        return { orderId, pickupDate: new Date(pickupDate), status };
      }),
      wallet: { balance: parseFloat(balance) },
    };
  
    try {
      const response = await axios.post('https://recycle-backend-apao.onrender.com/api/scrap-buyers', newScrapBuyer);
      setUploadMessages(response.data.message);
      setScrapBuyerId('');
      setNames('');
      setBusinessName('');
      setLatitude('');
      setLongitude('');
      setAddress('');
      setServiceAreas('');
      setAcceptedMaterials('');
      setPricing('');
      setCurrentOrders('');
      setBalance('');
      fetchScrapBuyers(); // Fetch the updated list
    } catch (error) {
      console.error('Error uploading scrap buyer:', error);
      setUploadMessage('Error uploading scrap buyer');
    }
  };



  
  
  
  
  

  return (
    <div style={containerStyle}>
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
        <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        <main style={contentStyle}>
          <div style={toggleButtonContainerStyle}>
              <button
                onClick={() => setView('collectionManagement')}
                style={view === 'collectionManagement' ? activeToggleButtonStyle : toggleButtonStyle}
              >
                Collection Management
              </button>
              <button
                onClick={() => setView('scrapBuyers')}
                style={view === 'scrapBuyers' ? activeToggleButtonStyle : toggleButtonStyle}
              >
                Third Party Scrap Buyers
              </button>
          </div>

          <h2>{view === 'collectionManagement' ? 'Collection Management' : 'Third Party Scrap Buyers'}</h2>
          {view === 'collectionManagement' && (
          <div>
          <div style={viewStyle}>
            <div style={calendarStyle}>
              <h3>Calendar View</h3>
              <div style={{ position: 'relative' }} ref={calendarRef}>
                <Calendar onChange={handleDateChange} value={date} tileContent={renderTileContent} />
                {Object.entries(collectionsByDate).map(([dateString, count]) => {
                  if (count > 0 && bubblePositions[dateString]) {
                    const { top, left, width, height } = bubblePositions[dateString];
                    return (
                      <div
                        key={dateString}
                        style={{
                          ...tileContentStyle,
                          position: 'absolute',
                          top: top - 20,
                          left: left + width / 2 - 10,
                        }}
                      >
                        {count}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <div style={mapStyle}>
              <h3>Map View</h3>
              <div style={mapContainerStyle}>
              <MapContainer center={scrapBuyers.length > 0 ? [scrapBuyers[0].location.latitude, scrapBuyers[0].location.longitude] : [0, 0]} zoom={13} style={mapInnerContainerStyle} ref={mapRef}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {mapLocations.map((location, index) => {
                        const nearestInventory = findNearestInventory(location.lat, location.lng);
                        return (
                          <Marker 
                            key={index} 
                            position={[location.lat, location.lng]} 
                            icon={markerIcons.pickupTracking}
                          >
                            <Popup>
                              {nearestInventory 
                                ? `Nearest Inventory: Id | ${nearestInventory.id} - ${nearestInventory.name} `
                                : `Location: ${location.lat}, ${location.lng}`}
                            </Popup>
                          </Marker>
                        );
                      })}
                      {inventoryMapLocations.map((inventory, index) => (
                        <Marker 
                          key={index} 
                          position={[inventory.lat, inventory.lng]} 
                          icon={inventoryIcons.Inventory}
                        >
                          <Popup>
                            {inventory.name ? `${inventory.id} | ${inventory.name} - ${inventory.address}` : `Location: ${inventory.lat}, ${inventory.lng}`}
                          </Popup>
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
          <div style={uploadContainerStyle}>
            <h3>{editingItem ? 'Edit Recycling Material' : 'Upload Recycling Materials'}</h3>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={uploadInputStyle}
            />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={uploadInputStyle}
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={uploadInputStyle}
              disabled={editingItem !== null} // Disable the input when editingItem is set
            />
              <div {...getRootProps()} style={{
                  border: '2px dashed #cccccc',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  cursor: 'pointer',
                }}>
                  <input {...getInputProps()} />
                  Drag & Drop files here or click to upload
                </div>

                <div style={imagePreviewContainerStyle}>
                  <h4>New Images</h4>
                  {uploadedImages.map((img, index) => (
                    <div key={index} style={imagePreviewStyle}>
                      <img src={img.preview} alt={`Preview ${index}`} style={imageThumbnailStyle} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={removeImageButtonStyle}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={uploadImagesToS3} style={uploadButtonStyle}>Upload Images</button>

                <div style={imagePreviewContainerStyle}>
                  <h4>Uploaded Image URLs</h4>
                  {validUrls.map((url, index) => (
                    <div key={index} style={imagePreviewStyle}>
                      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                    </div>
                  ))}
                </div>
              
                <button onClick={handleUploadRecyclingMaterial} style={uploadButtonStyle}>
                  {editingItem ? 'Update Material' : 'Upload'}
                </button>
            {uploadMessage && <p>{uploadMessage}</p>}
          </div>
          <div style={tableContainerStyle}>
            <h3>Recycling Materials</h3>
            <div style={{ marginBottom: '10px' }}>
                  <button
                    onClick={handleEdit}
                    style={actionButtonStyle}
                    disabled={!selectedCell.row && !selectedCell.column}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    style={actionButtonStyle}
                    disabled={!selectedCell.row && !selectedCell.column}
                  >
                    Delete
                  </button>
                </div>
            <div style={scrollableTableContainer}>
              <table style={recyclableTableStyle}>
                <thead style={tableHeaderStyle}>
                  <tr>
                    {recyclingMaterials.map((category) => (
                      <th key={category.id} style={tableCellStyle1}>{category.category}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                    {recyclingMaterials.length > 0 &&
                      recyclingMaterials[0].items.map((_, rowIndex) => (
                        <tr key={rowIndex} style={tableRowStyle}>
                          {recyclingMaterials.map((category) => (
                            <td
                              key={`${category.id}-${rowIndex}`}
                              style={tableCellStyle(rowIndex, category.id)}  // Ensure _id is a string
                              onClick={() => handleCellClick(rowIndex, category.id)}  // Convert _id to string
                            >
                              <div>{category.items[rowIndex] ? `${category.items[rowIndex].name}` : ''}</div>
                              <div>{category.items[rowIndex] ? ` ₹${category.items[rowIndex].price}` : ''}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          </div>
          <div style={tableContainerStyle}>
            <h3>Collection List</h3>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableCellStyle1}>Collection ID</th>
                  <th style={tableCellStyle1}>UserName</th>
                  <th style={tableCellStyle1}>Date</th>
                  <th style={tableCellStyle1}>Total Weight</th>
                  <th style={tableCellStyle1}>Contact</th>
                  <th style={tableCellStyle1}>Status</th>
                  <th style={tableCellStyle1}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCollections.map((collection) => (
                  <tr key={collection.id} style={tableRowStyle}>
                    <td style={tableCellStyle1}>{collection.id}</td>
                    <td style={tableCellStyle1}>{collection.username}</td>
                    <td style={tableCellStyle1}>{collection.date}</td>
                    <td style={tableCellStyle1}>{collection.totalWeight}</td>
                    <td style={tableCellStyle1}>{collection.contact}</td>
                    <td style={tableCellStyle1}>{collection.status}</td>
                    <td style={tableCellStyle1}>
                      <button style={actionButtonStyle} onClick={() => handleViewClick(collection)}>View</button>
                      <button style={actionButtonStyle}>Edit</button>
                      <button style={actionButtonStyle}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={tableContainerStyle}>
            <h3>Collection History</h3>
            <table style={tableStyle}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={tableCellStyle1}>Collection ID</th>
                  <th style={tableCellStyle1}>UserName</th>
                  <th style={tableCellStyle1}>Date</th>
                  <th style={tableCellStyle1}>Total Weight</th>
                  <th style={tableCellStyle1}>Contact</th>
                  <th style={tableCellStyle1}>Status</th>
                  <th style={tableCellStyle1}>Items</th>
                </tr>
              </thead>
              <tbody>
                {completedCollections.map((collection) => (
                  <tr key={collection.id} style={tableRowStyle}>
                    <td style={tableCellStyle1}>{collection.id}</td>
                    <td style={tableCellStyle1}>{collection.username}</td>
                    <td style={tableCellStyle1}>{collection.date}</td>
                    <td style={tableCellStyle1}>{collection.totalWeight}</td>
                    <td style={tableCellStyle1}>{collection.contact}</td>
                    <td style={tableCellStyle1}>{collection.status}</td>
                    <td style={tableCellStyle1}>
                      <ul>
                        {collection.cart.map((item, index) => (
                          <li key={index}>
                            {item.name} ({item.quantity}*1)kg - Price: {item.paidAmnt}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          )}
          {view === 'scrapBuyers' && (
                  <div>
                    <div style={mapContainerStyle}>
                    {scrapBuyers.length > 0 && (
                      <MapContainer center={currentLocation} zoom={13} style={mapInnerContainerStyle}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {scrapBuyers.map((buyer) => (
                          <Marker
                            key={buyer.scrapBuyerId}
                            position={[buyer.location.latitude, buyer.location.longitude]}
                            icon={L.icon({
                              iconUrl: scrapBuyerIcon, // Replace with the actual icon path
                              iconSize: [32, 32],
                              iconAnchor: [16, 32],
                              popupAnchor: [0, -32],
                            })}
                          >
                            <Popup>
                              <div>
                                <strong>{buyer.name}</strong><br />
                                {buyer.businessName}<br />
                                {buyer.location.address}<br />
                                Status: {buyer.availableStatus ? 'Available' : 'Not Available'}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                      )}
                    </div>

                    {selectedScrapBuyerPerformance && (
                            <div style={buyersPerformanceSectionStyle}>
                              <h2>{selectedScrapBuyerPerformance?.name} Performance Overview</h2>

                              {/* Inventory Categories and Items Volume */}
                              <div style={chartInventoryContainerStyle}>
                                  <div style={{ flex: 1 }}>
                                    <h3>Inventory Categories Volume</h3>
                                    <div style={{ width: '400px', height: '400px' }}>
                                      <Pie
                                        data={{
                                          labels: selectedScrapBuyerPerformance?.inventory?.map(category => category.category) || [],
                                          datasets: [
                                            {
                                              label: 'Category Volume',
                                              data: selectedScrapBuyerPerformance?.inventory?.map(category => 
                                                category.items?.reduce((acc, item) => acc + item.quantity, 0)
                                              ) || [],
                                              backgroundColor: ['#ffcc00', '#3366ff', '#33cc33', '#ff3300', '#cc99ff'], // Add more colors if needed
                                            },
                                          ],
                                        }}
                                        options={{
                                          responsive: true,
                                          onClick: (_, elements) => {
                                            if (elements.length > 0) {
                                              const categoryIndex = elements[0].index;
                                              setSelectedCategory(selectedScrapBuyerPerformance?.inventory[categoryIndex]);
                                            }
                                          },
                                        }}
                                      />
                                    </div>
                                  </div>
                                  {selectedCategory && (
                                    <div style={{ flex: 1, marginLeft: '20px' }}>
                                      <h4>{selectedCategory.category} Items Volume</h4>
                                      <div style={{ width: '45vw', height: '400px' }}>
                                        <Bar
                                          data={{
                                            labels: selectedCategory.items?.map(item => item.name) || [],
                                            datasets: [
                                              {
                                                label: `${selectedCategory.category} Items Volume`,
                                                data: selectedCategory.items?.map(item => item.quantity) || [],
                                                backgroundColor: '#3366ff',
                                              },
                                            ],
                                          }}
                                          options={{ responsive: true }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                        {/* Order Status Distribution */}
                        <div style={orderStatusContainerStyle}>
                                <h3>Order Status Distribution</h3>
                                <div style={cardGridStyle}>
                                  <div style={cardStyle}>
                                    <h4>Pending</h4>
                                    <p>{selectedScrapBuyerPerformance?.currentOrders?.filter(order => order.status === 'Pending').length || 0}</p>
                                  </div>
                                  <div style={cardStyle}>
                                    <h4>In Progress</h4>
                                    <p>{selectedScrapBuyerPerformance?.currentOrders?.filter(order => order.status === 'inProgress').length || 0}</p>
                                  </div>
                                  <div style={cardStyle}>
                                    <h4>Completed</h4>
                                    <p>{selectedScrapBuyerPerformance?.currentOrders?.filter(order => order.status === 'completed').length || 0}</p>
                                  </div>
                                  <div style={cardStyle}>
                                    <h4>Cancelled</h4>
                                    <p>{selectedScrapBuyerPerformance?.cancelledOrders?.length || 0}</p>
                                  </div>
                                  <div style={cardStyle}>
                                    <h4>Requested</h4>
                                    <p>{selectedScrapBuyerPerformance?.requestedOrders?.filter(order => order.status === 'accepted').length || 0}</p>
                                  </div>
                                </div>
                        </div>

                    {/* Pie Chart: Materials Accepted
                    <div style={chartContainerStyle}>
                      <h3>Accepted Materials</h3>
                      <Pie
                        data={{
                          labels: selectedScrapBuyerPerformance?.acceptedMaterials?.map(material => material.category) || [],
                          datasets: [
                            {
                              data: selectedScrapBuyerPerformance?.acceptedMaterials?.map(material =>
                                material.items?.reduce((acc, item) => acc + item.quantity, 0)
                              ) || [],
                              backgroundColor: ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'],
                            },
                          ],
                        }}
                        options={{ responsive: true }}
                      />
                    </div> */}
                
                  {/* Additional Info: Contact, Business PAN ID, Operational Hours */}
                  <div style={additionalInfoContainerStyle}>
                    <h3 style={infoTitleStyle}>Contact Information</h3>
                    <p style={infoTextStyle}><strong style={infoListItemHighlightStyle}>Phone:</strong> {selectedScrapBuyerPerformance?.contact?.phone}</p>
                    <p style={infoTextStyle}><strong style={infoListItemHighlightStyle}>Email:</strong> {selectedScrapBuyerPerformance?.contact?.email}</p>
                    <p style={infoTextStyle}><strong style={infoListItemHighlightStyle}>Business PAN ID:</strong> {selectedScrapBuyerPerformance?.businessPanId}</p>
                    <p style={infoTextStyle}><strong style={infoListItemHighlightStyle}>Operational Hours:</strong> {selectedScrapBuyerPerformance?.operationalHours}</p>
                  </div>

                                        {/* Reviews */}
                                        <div style={additionalInfoContainerStyle}>
                                          <h3 style={infoTitleStyle}>Platform Rating: {selectedScrapBuyerPerformance?.platformRating}/5</h3>
                                          <ul style={infoListStyle}>
                                            {selectedScrapBuyerPerformance?.reviews?.map((review, index) => (
                                              <li key={index} style={infoListItemStyle}>
                                                <strong style={infoListItemHighlightStyle}>{review.comment}:</strong> Rated {review.rating} stars on {new Date(review.date).toLocaleDateString()}
                                              </li>
                                            )) || <p style={infoTextStyle}>No reviews available.</p>}
                                          </ul>
                                        </div>

                                        {/* Current Orders */}
                                <div style={additionalInfoContainerStyle}>
                                          <h3 style={infoTitleStyle}>Current Orders</h3>
                                          {selectedScrapBuyerPerformance?.currentOrders?.length > 0 ? (
                                            <table style={currentOrdertableStyle}>
                                              <thead>
                                                <tr>
                                                  <th style={tableHeaderCellStyle}>Order ID</th>
                                                  <th style={tableHeaderCellStyle}>Pickup Date</th>
                                                  <th style={tableHeaderCellStyle}>Status</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {selectedScrapBuyerPerformance.currentOrders.map((order, index) => (
                                                  <tr key={index}>
                                                    <td style={tableCellStyle1}>{order.orderId}</td>
                                                    <td style={tableCellStyle1}>{new Date(order.pickupDate).toLocaleDateString()}</td>
                                                    <td style={tableCellStyle1}>{order.status}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          ) : (
                                            <p style={infoTextStyle}>No current orders.</p>
                                          )}
                                </div>

                                        {/* Completed Orders */}
                                        <div style={additionalInfoContainerStyle}>
                                            <h3 style={infoTitleStyle}>Completed Orders</h3>
                                            <ul style={infoListStyle}>
                                              {selectedScrapBuyerPerformance?.completedOrders?.map((order, index) => (
                                                <li key={index} style={infoListItemStyle}>
                                                  <strong style={infoListItemHighlightStyle}>Order ID:</strong> {order.orderId}, 
                                                  <strong style={infoListItemHighlightStyle}> Completed Date:</strong> {new Date(order.completedDate).toLocaleDateString()}, 
                                                  <strong style={infoListItemHighlightStyle}> Total Weight:</strong> {order.totalWeight} kg, 
                                                  <strong style={infoListItemHighlightStyle}> Total Price:</strong> ₹{order.totalPrice}
                                                </li>
                                              )) || <p style={infoTextStyle}>No completed orders.</p>}
                                            </ul>
                                          </div>

                                        {/* Cancelled Orders */}
                                        <div style={additionalInfoContainerStyle}>
                                          <h3 style={infoTitleStyle}>Cancelled Orders</h3>
                                          <ul style={infoListStyle}>
                                            {selectedScrapBuyerPerformance?.cancelledOrders?.map((order, index) => (
                                              <li key={index} style={infoListItemStyle}>
                                                <strong style={infoListItemHighlightStyle}>Order ID:</strong> {order.orderId}, 
                                                <strong style={infoListItemHighlightStyle}> Cancelled Date:</strong> {new Date(order.cancelledDate).toLocaleDateString()}, 
                                                <strong style={infoListItemHighlightStyle}> Reason:</strong> {order.reason}
                                              </li>
                                            )) || <p style={infoTextStyle}>No cancelled orders.</p>}
                                          </ul>
                                        </div>

                                        {/* Requested Orders */}
                                        <div style={additionalInfoContainerStyle}>
                                          <h3 style={infoTitleStyle}>Requested Orders</h3>
                                          <ul style={infoListStyle}>
                                            {selectedScrapBuyerPerformance?.requestedOrders?.map((order, index) => (
                                              <li key={index} style={infoListItemStyle}>
                                                <strong style={infoListItemHighlightStyle}>Order ID:</strong> {order.orderId}, 
                                                <strong style={infoListItemHighlightStyle}> Requested Date:</strong> {new Date(order.requestedDate).toLocaleDateString()}, 
                                                <strong style={infoListItemHighlightStyle}> Status:</strong> {order.status}
                                              </li>
                                            )) || <p style={infoTextStyle}>No requested orders.</p>}
                                          </ul>
                                        </div>

                                        {/* Wallet Information */}
                                        <div style={additionalInfoContainerStyle}>
                                          <h3 style={infoTitleStyle}>Wallet</h3>
                                          <p style={infoTextStyle}><strong style={infoListItemHighlightStyle}>Balance:</strong> ₹{selectedScrapBuyerPerformance?.wallet?.balance}</p>
                                          <h4 style={infoTitleStyle}>Transactions</h4>
                                          <ul style={infoListStyle}>
                                            {selectedScrapBuyerPerformance?.wallet?.transactions?.map((transaction, index) => (
                                              <li key={index} style={infoListItemStyle}>
                                                <strong style={infoListItemHighlightStyle}>Date:</strong> {new Date(transaction.date).toLocaleDateString()}, 
                                                <strong style={infoListItemHighlightStyle}> Amount:</strong> ₹{transaction.amount}, 
                                                <strong style={infoListItemHighlightStyle}> Remarks:</strong> {transaction.remarks}
                                              </li>
                                            )) || <p style={infoTextStyle}>No transactions available.</p>}
                                          </ul>
                                        </div>

                                        {/* Posted Offers */}
                                    <div style={additionalInfoContainerStyle}>
                                      <h3 style={infoTitleStyle}>Posted Offers</h3>
                                      <div style={offersContainerStyle}>
                                        {selectedScrapBuyerPerformance?.postedOffers?.map((offer, index) => (
                                          <div key={index} style={offerCardStyle}>
                                            <h4 style={offerTitleStyle}>Offer ID: {offer.offerId}</h4>
                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Material Type:</strong> {offer.materialType}</p>
                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Quantity Available:</strong> {offer.quantityAvailable}</p>
                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Price Per Unit:</strong> ₹{offer.pricePerUnit}</p>
                                            
                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Description:</strong> {offer.description}</p>
                                            
                                            <div style={imagePreviewContainerStyle}>
                                              {offer.images.map((image, imgIndex) => (
                                                <img key={imgIndex} src={image} alt={`Offer Image ${imgIndex + 1}`} style={imageThumbnailStyle} />
                                              ))}
                                            </div>

                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Views:</strong> {offer.views}</p>
                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Status:</strong> {offer.status}</p>
                                            <p style={offerTextStyle}><strong style={infoListItemHighlightStyle}>Posted Date:</strong> {new Date(offer.postedDate).toLocaleDateString()}</p>
                                            
                                            {offer.comments && offer.comments.length > 0 && (
                                              <div style={commentsContainerStyle}>
                                                <h4 style={commentsTitleStyle}>Comments:</h4>
                                                <ul style={commentsListStyle}>
                                                  {offer.comments.map((comment, commentIndex) => (
                                                    <li key={commentIndex} style={commentItemStyle}>
                                                      <p style={commentTextStyle}><strong>User:</strong> {comment.userId}</p>
                                                      <p style={commentTextStyle}><strong>Comment:</strong> {comment.text}</p>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        )) || <p style={infoTextStyle}>No offers posted.</p>}
                                      </div>
                                    </div>
                                        
                                </div>          
                )}


                    <div style={uploadContainerStyle}>
                      <h3>Upload Scrap Buyer</h3>
                      <input
                        type="text"
                        placeholder="Scrap Buyer ID"
                        value={scrapBuyerId}
                        onChange={(e) => setScrapBuyerId(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setNames(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Location (latitude)"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Location (longitude)"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Service Areas (comma-separated)"
                        value={serviceAreas}
                        onChange={(e) => setServiceAreas(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Accepted Materials (comma-separated)"
                        value={acceptedMaterials}
                        onChange={(e) => setAcceptedMaterials(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Pricing (Material:Price, comma-separated)"
                        value={pricing}
                        onChange={(e) => setPricing(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Current Orders (OrderId:PickupDate:Status, comma-separated)"
                        value={currentOrders}
                        onChange={(e) => setCurrentOrders(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Wallet Balance"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        style={uploadInputStyle}
                      />
                      <button onClick={handleUploadScrapBuyer} style={uploadButtonStyle}>Upload Scrap Buyer</button>
                      {uploadMessages && <p>{uploadMessages}</p>}
                    </div>

                        <div style={tableContainerStyle}>
                              <h3>Third Party Scrap Buyers</h3>
                              <table style={tableStyle}>
                                <thead style={tableHeaderStyle}>
                                  <tr>
                                    <th style={tableCellStyle1}>Scrap Buyer ID</th>
                                    <th style={tableCellStyle1}>Name</th>
                                    <th style={tableCellStyle1}>Business Name</th>
                                    <th style={tableCellStyle1}>Service Areas</th>
                                    <th style={tableCellStyle1}>Available Status</th>
                                    <th style={tableCellStyle1}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {scrapBuyers.map((buyer) => (
                                    <tr key={buyer.scrapBuyerId} style={tableRowStyle}>
                                      <td style={tableCellStyle1}>{buyer.scrapBuyerId}</td>
                                      <td style={tableCellStyle1}>{buyer.name}</td>
                                      <td style={tableCellStyle1}>{buyer.businessName}</td>
                                      <td style={tableCellStyle1}>{buyer.serviceAreas.join(', ')}</td>
                                      <td style={tableCellStyle1}>{buyer.availableStatus ? 'Available' : 'Not Available'}</td>
                                      <td style={tableCellStyle1}>
                                      <button style={actionButtonStyle} onClick={() => handleViewScrapBuyerPerformance(buyer)}>View Performance</button>
                                        <button style={actionButtonStyle} onClick={() => handleEditScrapBuyer(buyer)}>Update</button>
                                        <button style={actionButtonStyle} onClick={() => handleDeleteScrapBuyer(buyer.scrapBuyerId)}>Delete</button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
         

                        {isEditModalOpen && selectedScrapBuyer && (
                              <div style={modalOverlayStyleLarge}>
                                <div style={modalContentStyleLarge}>
                                  <h2>Update Scrap Buyer</h2>
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={selectedScrapBuyer.name}
                                    onChange={(e) => setSelectedScrapBuyer({ ...selectedScrapBuyer, name: e.target.value })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Business Name"
                                    value={selectedScrapBuyer.businessName}
                                    onChange={(e) => setSelectedScrapBuyer({ ...selectedScrapBuyer, businessName: e.target.value })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Phone"
                                    value={selectedScrapBuyer.contact.phone}
                                    onChange={(e) => setSelectedScrapBuyer({
                                      ...selectedScrapBuyer,
                                      contact: { ...selectedScrapBuyer.contact, phone: e.target.value }
                                    })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Email"
                                    value={selectedScrapBuyer.contact.email}
                                    onChange={(e) => setSelectedScrapBuyer({
                                      ...selectedScrapBuyer,
                                      contact: { ...selectedScrapBuyer.contact, email: e.target.value }
                                    })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Latitude"
                                    value={selectedScrapBuyer.location.latitude}
                                    onChange={(e) => setSelectedScrapBuyer({
                                      ...selectedScrapBuyer,
                                      location: { ...selectedScrapBuyer.location, latitude: parseFloat(e.target.value) }
                                    })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Longitude"
                                    value={selectedScrapBuyer.location.longitude}
                                    onChange={(e) => setSelectedScrapBuyer({
                                      ...selectedScrapBuyer,
                                      location: { ...selectedScrapBuyer.location, longitude: parseFloat(e.target.value) }
                                    })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Address"
                                    value={selectedScrapBuyer.location.address}
                                    onChange={(e) => setSelectedScrapBuyer({
                                      ...selectedScrapBuyer,
                                      location: { ...selectedScrapBuyer.location, address: e.target.value }
                                    })}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Service Areas"
                                    value={selectedScrapBuyer.serviceAreas.join(', ')}
                                    onChange={(e) => setSelectedScrapBuyer({
                                      ...selectedScrapBuyer,
                                      serviceAreas: e.target.value.split(',').map(area => area.trim())
                                    })}
                                    style={uploadInputStyle}
                                  />
                                  {/* Accepted Materials Category Dropdown */}
                                    <h3>Accepted Materials</h3>
                                    <select
                                      style={uploadInputStyle}
                                      onChange={(e) => {
                                        setEditSelectedCategory(e.target.value);
                                        setIsItemEditModalOpen(true); // Open the item edit modal when a category is selected
                                      }}
                                      value={selectedCategory}
                                    >
                                      <option value="">Select a category</option>
                                      {selectedScrapBuyer.acceptedMaterials.map((material, index) => (
                                        <option key={index} value={index}>
                                          {material.category}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Display items for the selected category */}
                                    {editSelectedCategory !== "" && (
                                        <div style={nestedModalStyle}>
                                          <button
                                                style={nestedModalCloseButtonStyle}
                                                onClick={() => setEditSelectedCategory("")} // Reset the selected category to close the modal
                                              >
                                                &times;
                                          </button>
                                          <div style={nestedModalHeaderStyle}>
                                            Items in {selectedScrapBuyer.acceptedMaterials[editSelectedCategory].category}
                                          </div>
                                          <ul style={nestedModalListStyle}>
                                            {selectedScrapBuyer.acceptedMaterials[editSelectedCategory].items.map((item, index) => (
                                              <li key={index} style={nestedModalItemStyle}>
                                                <span style={nestedItemNameStyle}>{item.name}</span>
                                                <span style={nestedItemPriceStyle}>₹{item.buyerPrice}/kg</span>
                                                <button
                                                  style={nestedEditButtonStyle}
                                                  onClick={() => {
                                                    const itemToEdit = selectedScrapBuyer.acceptedMaterials[editSelectedCategory].items[index];
                                                    setSelectedItem({ ...itemToEdit, categoryIndex: editSelectedCategory, itemIndex: index });
                                                    setUpdatedItemName(itemToEdit.name); // Populate with current name
                                                    setUpdatedItemPrice(itemToEdit.buyerPrice); // Populate with current price
                                                    setIsItemEditModalOpen(true); // Open the edit modal
                                                  }}
                                                >
                                                  Edit
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                  {/* Current Orders Section */}
                                  <h3>Current Orders</h3>
                                  <ul>
                                    {selectedScrapBuyer.currentOrders.map((order, index) => (
                                      <li key={index}>
                                        <strong>Order ID:</strong> {order.orderId}, 
                                        <strong> Pickup Date:</strong> {new Date(order.pickupDate).toLocaleDateString()}, 
                                        <strong> Status:</strong> {order.status}
                                      </li>
                                    ))}
                                  </ul>

                                  {/* Add New Order */}
                                  <input
                                    type="text"
                                    placeholder="Order ID"
                                    value={newOrderId}
                                    onChange={(e) => setNewOrderId(e.target.value)}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="date"
                                    placeholder="Pickup Date"
                                    value={newPickupDate}
                                    onChange={(e) => setNewPickupDate(e.target.value)}
                                    style={uploadInputStyle}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Status"
                                    value={newOrderStatus}
                                    onChange={(e) => setNewOrderStatus(e.target.value)}
                                    style={uploadInputStyle}
                                  />
                                  <button
                                    style={uploadButtonStyle}
                                    onClick={() => {
                                      setSelectedScrapBuyer({
                                        ...selectedScrapBuyer,
                                        currentOrders: [...selectedScrapBuyer.currentOrders, {
                                          orderId: newOrderId,
                                          pickupDate: newPickupDate,
                                          status: newOrderStatus
                                        }]
                                      });
                                      setNewOrderId('');
                                      setNewPickupDate('');
                                      setNewOrderStatus('');
                                    }}
                                  >
                                    Add Order
                                  </button>

                                  {/* Completed Orders Section */}
                                  <h3>Completed Orders</h3>
                                  <ul>
                                    {selectedScrapBuyer.completedOrders.map((order, index) => (
                                      <li key={index}>
                                        <strong>Order ID:</strong> {order.orderId}, 
                                        <strong> Completed Date:</strong> {new Date(order.completedDate).toLocaleDateString()}, 
                                        <strong> Total Weight:</strong> {order.totalWeight} kg, 
                                        <strong> Total Price:</strong> ₹{order.totalPrice}
                                      </li>
                                    ))}
                                  </ul>
                                  <button style={uploadButtonStyle} onClick={() => handleUpdateScrapBuyer(selectedScrapBuyer)}>Save</button>
                                  <button style={closeButtonStyle} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                </div>
                                {/* Small modal to display items of the selected category with edit button */}
                                            {isItemEditModalOpen && selectedItem && (
                                              <div style={itemEditModalStyle}>
                                                <h4>Edit {selectedItem.name}</h4>
                                                <input
                                                  type="text"
                                                  value={updatedItemName}
                                                  onChange={(e) => setUpdatedItemName(e.target.value)}
                                                  placeholder="Item Name"
                                                  style={uploadInputStyle}
                                                />
                                                <input
                                                  type="number"
                                                  value={updatedItemPrice}
                                                  onChange={(e) => setUpdatedItemPrice(e.target.value)}
                                                  placeholder="Buyer Price"
                                                  style={uploadInputStyle}
                                                />
                                                <button style={saveButtonStyle} onClick={handleItemEdit}>
                                                  Save
                                                </button>
                                                <button style={closeButtonStyle} onClick={() => setIsItemEditModalOpen(false)}>
                                                  Cancel
                                                </button>
                                              </div>
                                            )}
                              </div>
                            )}
                  </div>
                )}

        </main>
      </div>
      {selectedCollection && (
        <CollectionDetailsModal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          userInfo={{
            name: selectedCollection.username,
            contact: selectedCollection.contact,
            userId: selectedCollection.id
          }}
          pickupInfo={{
            imageURLs: selectedCollection.imageURLs,
            location: `Lat: ${selectedCollection.latitude}, Lng: ${selectedCollection.longitude}`,
            address: selectedCollection.address,
            scheduleDate: selectedCollection.date,
            cart: selectedCollection.cart,
            status: selectedCollection.status,
            nearestInventoryId: selectedCollection.nearestInventoryId,
            nearestInventoryName: selectedCollection.nearestInventoryName
          }}
          onStartPickup={() => handleStartPickup(selectedCollection)}
          onCompletePickup={handleCompletePickup}
          onApprovePickup={handleApprovePickup}
        />
      )}

    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  marginTop: '26px',
  backgroundColor: '#e0f7da',
  overflowX: 'hidden',
  overflowY: 'auto',
  height: '100vh',
  
};
const sidebarStyle = {
  backgroundColor: '#7cba72',
  padding: '20px',
  width: '250px',
  color: 'white',
  position: 'fixed',
  top: '0',
  left: '0',
  height: '100vh',
  overflowY: 'auto'
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

const toggleButtonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '20px',
};

const toggleButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  flex: '1',
  margin: '0 10px',
};

const activeToggleButtonStyle = {
  ...toggleButtonStyle,
  backgroundColor: '#4caf50',
  color: 'white',
};


const mainStyle = {
  display: 'flex',
  flexDirection: 'row',
  flex: '1',
  padding: '20px',
  marginLeft: '260px', 
  backgroundColor: '#e0f7da',
  overflowY: 'auto',
  height: 'calc(100vh - 60px)' // Adjust according to the header height
};


const contentStyle = {
  flex: '1',
  backgroundColor: '#e0f7da',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
};

const markerIcons = {
  pickupTracking: new L.Icon({ iconUrl: PickupIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32] }),
  scrapBuyerIcon: new L.Icon({ iconUrl: scrapBuyerIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32] }),
};

const inventoryIcons = {
  Inventory: new L.Icon({ iconUrl: Inventory,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32] }),
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
  marginBottom: '100px',
};

const scrollableTableContainer = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderStyle = {
  backgroundColor: '#D6CDF6',
  color: 'black',

};

const tableRowStyle = {
  backgroundColor: '#f9f9f9',
};

const tableCellStyle1 = {
  padding: '10px',
  border: '1px solid #dddddd',
};


const recyclableTableStyle = {
  Width: '150vh',
  overflowX: 'auto',
};

const imagePreviewContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginBottom: '20px',
};

const imagePreviewStyle = {
  position: 'relative',
  width: '100px',
  height: '100px',
};

const imageThumbnailStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '5px',
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
};

const removeImageButtonStyle = {
  position: 'absolute',
  top: '5px',
  right: '5px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  padding: '2px 6px',
  fontSize: '12px',
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

const uploadContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '20px',
};

const uploadInputStyle = {
  marginBottom: '10px',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #cccccc',
  width: 'calc(50% - 20px)',
};

const uploadButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4caf50',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  color: 'white',
  marginTop: '10px',
};

const viewStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const calendarStyle = {
  flex: '1',
  marginRight: '10px',
};

const mapStyle = {
  flex: '1',
  marginLeft: '10px',
};

const mapContainerStyle = {
  height: '500px',
  position: 'relative',
  marginBottom: '50px',
};

const mapInnerContainerStyle = {
  height: '100%',
  width: '100%',
  borderRadius: '10px',
};

const tileContentStyle = {
  backgroundColor: 'red',
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
};

const modalOverlayStyleLarge = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};




const modalContentStyleLarge = {
  height: '70%',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  width: '70%',
  overflowY: 'auto',
};


const itemModalStyle = {
  position: 'absolute',
  top: '60px',
  left: '420px', // Adjust this value according to your layout
  backgroundColor: '#fff',
  padding: '20px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  borderRadius: '12px',
  zIndex: 1000,
  maxWidth: '350px',
  color: '#333',
};

const itemListStyle = {
  listStyleType: 'none', // Remove bullet points
  padding: '0',
  margin: '10px 0 0 0',
};

const itemStyle = {
  padding: '10px 0',
  borderBottom: '1px solid #eaeaea',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '16px',
  fontWeight: '500',
};

const itemNameStyle = {
  flex: '1',
  textAlign: 'left',
  fontWeight: 'bold',
};

const itemPriceStyle = {
  fontWeight: 'normal',
  color: '#4caf50',
};

const currentOrdertableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '15px',
};

const tableHeaderCellStyle = {
  padding: '10px',
  backgroundColor: '#f4f4f4',
  borderBottom: '2px solid #ddd',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#333',
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
  color: '#555',
};


const buyersPerformanceSectionStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '20px',
};

const chartContainerStyle = {
  marginTop: '20px',
};

const orderStatusContainerStyle = {
  marginBottom: '20px',
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const cardGridStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
};

const cardStyle = {
  flex: 1,
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const cardTitleStyle = {
  fontSize: '18px',
  marginBottom: '10px',
};

const cardCountStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};



const chartInventoryContainerStyle = {
  display: 'flex',
  flexDirection: 'row', // Aligns children in a row (side by side)
  justifyContent: 'space-between', // Adds space between the charts
  alignItems: 'flex-start', // Aligns items to the top
  marginTop: '20px',
};

const additionalInfoContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const infoTitleStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '15px',
  borderBottom: '2px solid #eee',
  paddingBottom: '10px',
};

const infoTextStyle = {
  fontSize: '16px',
  color: '#666',
  marginBottom: '10px',
};

const infoListStyle = {
  listStyleType: 'none',
  padding: '0',
  margin: '0',
};

const infoListItemStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  fontSize: '16px',
  color: '#555',
};

const infoListItemHighlightStyle = {
  color: '#333',
  fontWeight: '600',
};

const offersContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
};

const offerCardStyle = {
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  padding: '15px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  width: 'calc(33.333% - 20px)', // Adjust based on the number of cards per row
  boxSizing: 'border-box',
  marginBottom: '20px',
};

const offerTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '10px',
};

const offerTextStyle = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '5px',
};

const commentsContainerStyle = {
  marginTop: '10px',
  padding: '10px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
};

const commentsTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '5px',
};

const commentsListStyle = {
  listStyleType: 'none',
  padding: '0',
  margin: '0',
};

const commentItemStyle = {
  padding: '5px 0',
  borderBottom: '1px solid #ddd',
};

const commentTextStyle = {
  fontSize: '14px',
  color: '#555',
  marginBottom: '5px',
};





const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  width: '400px',
  position: 'relative',
};




const editModalStyle = {
  position: 'absolute',
  top: '60px',
  left: '400px',
  backgroundColor: '#f9f9f9',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  zIndex: 1000,
  maxWidth: '400px',
  color: '#333',
};

const itemEditModalStyle = {
  position: 'absolute',
  top: '60px',
  left: '460px', // Adjust according to your layout
  backgroundColor: '#fff',
  padding: '25px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
  zIndex: 1100,
  maxWidth: '350px',
  color: '#333',
};

const editModalListStyle = {
  listStyleType: 'none',
  padding: '0',
  margin: '15px 0 0 0',
};

const editModalItemStyle = {
  padding: '10px 0',
  borderBottom: '1px solid #ddd',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '16px',
};

const editItemNameStyle = {
  flex: '1',
  textAlign: 'left',
  fontWeight: 'bold',
};

const editItemPriceStyle = {
  fontWeight: 'normal',
  color: '#3f51b5',
};

const editButtonStyle = {
  backgroundColor: '#ff9800',
  border: 'none',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '5px',
  cursor: 'pointer',
};

const saveButtonStyle = {
  backgroundColor: '#4caf50', // Green background for save action
  border: 'none',
  color: '#fff', // White text color
  padding: '8px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  marginTop: '10px',
  transition: 'background-color 0.3s ease',
};

const nestedModalStyle = {
  position: 'absolute',
  top: '60px', // Adjust to position relative to the parent modal
  left: '420px', // Adjust this value based on your layout
  backgroundColor: '#fff',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  borderRadius: '10px',
  zIndex: 1100,
  maxWidth: '400px',
  color: '#333',
};

const nestedModalHeaderStyle = {
  marginBottom: '15px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#4caf50',
};

const nestedModalListStyle = {
  listStyleType: 'none',
  padding: '0',
  margin: '0',
};

const nestedModalItemStyle = {
  padding: '10px 0',
  borderBottom: '1px solid #ddd',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '16px',
};

const nestedItemNameStyle = {
  flex: '1',
  textAlign: 'left',
  fontWeight: 'bold',
};

const nestedItemPriceStyle = {
  fontWeight: 'normal',
  color: '#3f51b5',
};

const nestedEditButtonStyle = {
  backgroundColor: '#ff9800',
  border: 'none',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  marginLeft: '10px',
};

const nestedModalCloseButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#999',
}



const closeButtonStyle = {
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  padding: '10px 20px',
  marginTop: '20px',
  display: 'block',
  width: '100%',
  textAlign: 'center',
};




export default CollectionManagement;
