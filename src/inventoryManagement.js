import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './sidebarComponent';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import CollectionDetailsModalInventory from './collectionDetailsModal';


Chart.register(...registerables);

const Inventory = () => {
  const [activeLink, setActiveLink] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [scrapItems, setScrapItems] = useState([]);
  const [inventoryNames, setInventoryNames] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState(0);
  const [scheduledOrders, setScheduledOrders] = useState(0);
  const [inProgressOrders, setInProgressOrders] = useState(0);
  const [receivedOrders, setReceivedOrders] = useState(0);
  const hasAutoSelected = useRef(false); // Ref to track if auto-selection has been done
  const [matchedPickupTracking, setMatchedPickupTracking] = useState([]);

  // Existing state declarations...
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);



  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const responseScrap = await axios.get('https://recycle-backend-lflh.onrender.com/api/inventories/type/scrap');
        const responseBoth = await axios.get('https://recycle-backend-lflh.onrender.com/api/inventories/type/both');
        const inventories = [...responseScrap.data, ...responseBoth.data];
        setInventoryNames(inventories.map(inventory => ({ id: inventory.id, name: inventory.name })));

        // Automatically select the first inventory only once
        if (inventories.length > 0 && !hasAutoSelected.current) {
          handleInventoryChange({ target: { value: inventories[0].id } });
          hasAutoSelected.current = true; // Mark as auto-selected
        }
      } catch (error) {
        console.error('Error fetching inventories:', error);
      }
    };

    

    fetchInventories();

  }, [inventoryNames]);


  const fetchPickupTracking = async (selectedInventoryId) => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/pickuptracking');
      const pickupTracking = response.data;
  
      let approvedCount = 0;
      let scheduledCount = 0;
      let inProgressCount = 0;
      let receivedCount = 0;
      const matchedTracking = []; // To store matched pickup tracking data
    
      pickupTracking.forEach((tracking) => {
        
        if (tracking.nearestInventoryId === selectedInventoryId) {
          matchedTracking.push(tracking); // Store matched tracking data
          if (tracking.status === 'Pending') {
            approvedCount++;
          }
          if (tracking.status === 'scheduled') {
            scheduledCount++;
          }
          if (tracking.status === 'In Progress') {
            inProgressCount++;
          }
          if (tracking.status === 'Completed') {
            receivedCount++;
          }
        }
      });
  
      setApprovedOrders(approvedCount);
      setScheduledOrders(scheduledCount);
      setInProgressOrders(inProgressCount);
      setReceivedOrders(receivedCount);
      setMatchedPickupTracking(matchedTracking); // Update state with matched tracking data
      console.log('pickupyracking..',matchedTracking);
    } catch (error) {
      console.error('Error fetching pickup tracking:', error);
    }
  };


  const handleCompleteOrder = async (trackingId) => {
    try {
      // Make the API call to update the status to "Completed"
      const response = await axios.put(`https://recycle-backend-lflh.onrender.com/api/pickuptracking/${trackingId}`, {
        status: 'Completed',
      });
  
      if (response.status === 200) {
        // Update the local state to reflect the change
        setMatchedPickupTracking((prevTracking) =>
          prevTracking.map((tracking) =>
            tracking.trackingId === trackingId ? { ...tracking, status: 'Completed' } : tracking
          )
        );
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };
  
  

  const handleInventoryChange = async (event) => {
    const inventoryId = event.target.value;
    try {
      const response = await axios.get(`https://recycle-backend-lflh.onrender.com/api/inventoryid/${inventoryId}`);
      const selectedInventory = response.data;
      setSelectedInventory(selectedInventory);
      setScrapItems(selectedInventory.scrap.items);
      fetchPickupTracking(inventoryId); // Pass the selected inventory ID to fetchPickupTracking
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleAssignPrice = async (tracking) => {
    try {
      // Fetch order by tracking Id (which maps to order Id)
      const response = await axios.get(`https://recycle-backend-lflh.onrender.com/getorderbyid/${tracking.pickupInfo.pickupId}`);
      const order = response.data;
      console.log('result..',order);
      if (order) {
        setSelectedOrder(order); // Store the order data
        setSelectedTracking(tracking); // Store the tracking data
        setModalIsOpen(true); // Open the modal
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleSaveAssignedPrice = async (updatedItems) => {
    if (selectedOrder) {
      try {
        const response = await axios.put('https://recycle-backend-lflh.onrender.com/completepickup', {
          id: selectedOrder.Id,
          status: 'Completed', 
          items: updatedItems, // Save the updated items with prices
        });

        if (response.status === 200) {
          // Update the local state with the new prices
          setMatchedPickupTracking((prevTracking) =>
            prevTracking.map((tracking) =>
              tracking.trackingId === selectedTracking.trackingId
                ? { ...tracking, items: updatedItems }
                : tracking
            )
          );
          setModalIsOpen(false); // Close the modal
          console.log('selectedOrder',response.data);
          console.log('selectedOrder',matchedPickupTracking);
        }
      } catch (error) {
        console.error('Error saving assigned price:', error);
      }
    }
  };

 

  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#e0f7da',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
  };

  const mainContentStyle = {
    flex: 1,
    padding: '20px',
    marginLeft: '280px',
    marginTop: '30px',
    overflowY: 'auto',
    height: 'calc(100vh - 60px)',
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

  const sectionStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2c6e36',
  };

  const processScrapData = () => {
    const data = {};
    scrapItems.forEach(item => {
      const category = item.category;
      if (!data[category]) {
        data[category] = {
          totalWeight: 0,
          totalPrice: 0,
          subCategories: {}
        };
      }
      data[category].totalWeight += item.weight;
      data[category].totalPrice += item.AmntPaid;
      if (!data[category].subCategories[item.name]) {
        data[category].subCategories[item.name] = {
          weight: 0,
          paidAmount: 0
        };
      }
      data[category].subCategories[item.name].weight += item.weight;
      data[category].subCategories[item.name].paidAmount += item.AmntPaid;
    });
    return data;
  };

  const processedData = processScrapData();
  const categories = Object.keys(processedData);
  const subCategories = [...new Set(categories.flatMap(category => Object.keys(processedData[category].subCategories)))];

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#66FF66', '#FF66B2', '#6666FF', '#00BFFF', '#FF4500', '#DA70D6'
  ];

  const chartData = {
    labels: categories,
    datasets: subCategories.map((subCategory, index) => {
      const color = colors[index % colors.length];

      return {
        label: subCategory,
        data: categories.map(category => processedData[category].subCategories[subCategory]?.weight || 0),
        backgroundColor: color,
      };
    })
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const category = context.dataset.label;
            const subCategory = context.label;
            const weight = context.raw;
            const price = processedData[subCategory]?.subCategories[category]?.paidAmount || 0;
            return `${category}: ${weight}kg (Price: $${price})`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      }
    }
  };

  const dashboardTileStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    marginBottom: '20px',
  };

  const tileStyle = {
    backgroundColor: '#D6CDF6',
    padding: '20px',
    borderRadius: '10px',
    flex: 1,
    textAlign: 'center',
    margin: '0 10px',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '18px',
  };

  return (
    <div>
      <header style={headerStyle}>
        <div style={{ fontSize: '1.5em' }}>Logo</div>
      </header>
      <div style={containerStyle}>
        <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
        <div style={mainContentStyle}>
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Select Inventory</div>
            <select onChange={handleInventoryChange} value={selectedInventory?.id || ''} style={{ padding: '10px', fontSize: '16px' }}>
              {inventoryNames.map(inventory => (
                <option key={inventory.id} value={inventory.id}>{inventory.name}</option>
              ))}
            </select>
          </div>

          <div style={dashboardTileStyle}>
            <div style={tileStyle}>Approved Orders: {approvedOrders}</div>
            <div style={tileStyle}>Scheduled Orders: {scheduledOrders}</div>
            <div style={tileStyle}>In-Progress Orders: {inProgressOrders}</div>
            <div style={tileStyle}>Received Orders: {receivedOrders}</div>
          </div>

          {matchedPickupTracking.length > 0 && (
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Pickup Tracking</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Tracking ID</th>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Status</th>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Address</th>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Weight</th>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Scheduled Date</th>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th> {/* Add an Actions column */}
                    </tr>
                  </thead>
                  <tbody>
                    {matchedPickupTracking.map((tracking) => (
                      <tr key={tracking.trackingId}>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{tracking.trackingId}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{tracking.status}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{tracking.pickupInfo.address}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{tracking.pickupInfo.totalWeight} Kgs</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>{tracking.pickupInfo.scheduledDate}</td>
                        <td style={{ border: '1px solid black', padding: '8px' }}>
                        {tracking.status === 'In Progress' && (
                              <>
                                <button onClick={() => handleCompleteOrder(tracking.trackingId)}>Complete Order</button>
                                <button onClick={() => handleAssignPrice(tracking)}>Assign Price</button> {/* New Button */}
                              </>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

              {selectedOrder && (
                      <CollectionDetailsModalInventory
                        isOpen={modalIsOpen}
                        onRequestClose={() => setModalIsOpen(false)}
                        userInfo={{
                          name: selectedOrder.name,
                          contact: selectedOrder.contact,
                          userId: selectedOrder.customerId,
                        }}
                        pickupInfo={{
                          imageURLs: selectedOrder.images,
                          location: `Lat: ${selectedOrder.location.latitude}, Lng: ${selectedOrder.location.longitude}`,
                          address: selectedOrder.location.address,
                          scheduleDate: selectedOrder.schedulePickup,
                          cart: selectedOrder.cart,
                          status: selectedOrder.status,
                          nearestInventoryId: selectedOrder.receivedInventoryId,
                          nearestInventoryName: selectedTracking.nearestInventoryId, // Assuming nearestInventoryName is available in tracking data
                        }}
                        onCompletePickup={handleSaveAssignedPrice} // Use this to save the assigned prices
                      />
                    )}


          {scrapItems.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Inventory Overview</div>
              <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'whitesmoke' }}>
                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#ccc', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd' }}>Category</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#ffffff' }}>
                  {categories.map(category => (
                    <div key={category} style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd', borderLeft: '1px solid black' }}>{category}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#ffffff' }}>
                  {categories.map(category => (
                    <div key={category} style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd', borderLeft: '1px solid black' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, fontSize: '13px', textAlign: 'center' }}>Name</div>
                        <div style={{ flex: 1, fontSize: '13px', textAlign: 'center' }}>Weight</div>
                        <div style={{ flex: 1, fontSize: '13px', textAlign: 'center' }}>Amount Paid</div>
                      </div>
                      {Object.entries(processedData[category].subCategories).map(([subCategory, values], index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1, fontSize: '12px', textAlign: 'center' }}>{subCategory}</div>
                          <div style={{ flex: 1, fontSize: '12px', textAlign: 'center' }}>{values.weight}</div>
                          <div style={{ flex: 1, fontSize: '12px', textAlign: 'center' }}>{values.paidAmount}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#ffffff' }}>
                  {categories.map(category => (
                    <div key={category} style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd', borderLeft: '1px solid black' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>Total Weight</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>Total Price</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>{processedData[category].totalWeight}</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>{processedData[category].totalPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <Bar data={chartData} options={options} />
              </div>
            </div>
          )}
          {scrapItems.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Completed Orders</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Item ID</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Weight</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Amount Paid</th>
                    <th style={{ border: '1px solid black', padding: '8px' }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {scrapItems.map(item => (
                    <tr key={item.itemid}>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{item.itemid}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{item.name}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{item.weight}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{item.AmntPaid}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{item.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
























// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import Sidebar from './sidebarComponent';
// import { Bar } from 'react-chartjs-2';
// import { Chart, registerables } from 'chart.js';

// Chart.register(...registerables);

// const categoryMappings = {
//   plastic: [
//     'Plastic Packaging Wraps', 'Tetrapacks', 'Milk Pouches', 'MLP Wrappers', 'HDPE', 'Shampoo', 'Bottles', 'Containers', 'Toys', 'PET Bottles', 'PP', 'PVC', 'PE Banner'
//   ],
//   paper: [
//     'Office Paper', 'Newspapers', 'CardBoards', 'Printed Books', 'Mix Paper Waste', 'Used Notebooks'
//   ],
//   wood: ['Hard Wood'],
//   metal: [
//     'Cans', 'Coke Pepsi Tins', 'Light Aluminium', 'Low Iron', 'Brass', 'Steel', 'Hard Aluminium', 'Oil Tin', 'Copper', 'Heavy Iron', 'Aluminium Containers (vessels)'
//   ],
//   E_waste: [
//     'CPU', 'Monitor', 'LCD', 'Wires (copper)', 'Keyboard/Mouse/Wires', 'Mobile Phones', 'Printer', 'LED', 'Laptop', 'Batteries', 'Old Circuit Boards', 'Aluminium Wires (cable)'
//   ],
//   fabric: [
//     'Mix Cloth', 'Jute Bori Bags', 'Denim Jeans Cloth Waste'
//   ],
//   glass: ['Glass'],
//   rubber: ['Rubber'],
//   appliances: [
//     'Office Chair', 'AC', 'Washing Machine', 'Oven', 'Refrigerator'
//   ],
//   others: [
//     'Shoes', 'School/Travel Bags'
//   ]
// };

// const getCategoryBySubCategory = (subCategory) => {
//   for (const [category, subCategories] of Object.entries(categoryMappings)) {
//     if (subCategories.includes(subCategory)) {
//       return category;
//     }
//   }
//   return 'others';
// };

// const fetchData = async (endpoint) => {
//   const data = {
//     inventoryOverview: [
//       { id: 1, category: 'Electronics', quantity: 100, storageLocation: 'Warehouse A' },
//       { id: 2, category: 'Furniture', quantity: 50, storageLocation: 'Warehouse B' },
//     ],
//     detailedView: [
//       { subCategory: 'Mobile Phones', quantity: 60, storageLocation: 'Shelf 1', status: 'Processing' },
//       { subCategory: 'Laptops', quantity: 40, storageLocation: 'Shelf 2', status: 'Completed' },
//     ],
//     inventoryHistory: [
//       { date: '2024-07-01', action: 'Added', category: 'Electronics', quantity: 100, status: 'Processing' },
//       { date: '2024-06-25', action: 'Shipped', category: 'Furniture', quantity: 50, status: 'Completed' },
//     ],
//   };
//   return data[endpoint];
// };

// const Inventory = () => {
//   const [activeLink, setActiveLink] = useState(null);
//   const [selectedRecordId, setSelectedRecordId] = useState(null);
//   const [completedOrders, setCompletedOrders] = useState([]);
//   const [inventoryData, setInventoryData] = useState([]);
//   const [processedData, setProcessedData] = useState({});

//   const handleLinkClick = (link) => {
//     setActiveLink(link);
//   };

//   const containerStyle = {
//     display: 'flex',
//     flexDirection: 'row',
//     backgroundColor: '#e0f7da',
//     fontFamily: 'Arial, sans-serif',
//     minHeight: '100vh',
//   };

//   const sidebarItemStyle = {
//     marginBottom: '10px',
//     cursor: 'pointer',
//     display: 'block',
//     color: 'white',
//     textDecoration: 'none',
//     fontWeight: 'bold'
//   };

//   const mainContentStyle = {
//     flex: 1,
//     padding: '20px',
//     marginLeft: '280px', // Adjust according to the sidebar width
//     marginTop: '30px', // Adjust according to the header height
//     overflowY: 'auto',
//     height: 'calc(100vh - 60px)' // Adjust according to the header height
// };

//   const headerStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#D6CDF6',
//     padding: '10px 20px',
//     color: 'black',
//     fontFamily: 'Arial, sans-serif',
//     position: 'fixed',
//     top: '0',
//     left: '0',
//     width: '100%',
//     zIndex: '1000',
// };
  
//   const logoStyle = {
//     fontSize: '1.5em',
//   };
  
//   const navStyle = {
//     display: 'flex',
//     gap: '20px',
//   };
  
//   const linkStyle = {
//     color: '#ffffff',
//     textDecoration: 'none',
//   };

//   const sectionStyle = {
//     backgroundColor: 'white',
//     padding: '20px',
//     borderRadius: '10px',
//     marginBottom: '20px',
//   };

//   const sectionTitleStyle = {
//     fontSize: '20px',
//     fontWeight: 'bold',
//     marginBottom: '10px',
//     color: '#2c6e36',
//   };

//   const handleRecordClick = (recordId) => {
//     if (selectedRecordId === recordId) {
//       setSelectedRecordId(null);
//     } else {
//       setSelectedRecordId(recordId);
//     }
//   };

//   const processCompletedOrders = (orders) => {
//     const data = {};
//     orders.forEach(order => {
//       order.cart.forEach(item => {
//         const category = getCategoryBySubCategory(item.name);
//         if (!data[category]) {
//           data[category] = {
//             totalWeight: 0,
//             totalPrice: 0,
//             subCategories: {}
//           };
//         }
//         data[category].totalWeight += item.quantity;
//         data[category].totalPrice += parseInt(item.paidAmnt, 10); // Ensuring price is treated as integer
//         if (!data[category].subCategories[item.name]) {
//           data[category].subCategories[item.name] = {
//             weight: 0,
//             paidAmount: 0
//           };
//         }
//         data[category].subCategories[item.name].weight += item.quantity;
//         data[category].subCategories[item.name].paidAmount += parseInt(item.paidAmnt, 10); // Ensuring price is treated as integer
//       });
//     });
//     setProcessedData(data);
//   };

//   useEffect(() => {
//     const fetchCompletedOrders = async () => {
//       try {
//         const response = await axios.get('https://recycle-backend-lflh.onrender.com/getorders');
//         const completedOrders = response.data.orderslist.filter(order => order.status === 'completed');
//         setCompletedOrders(completedOrders);
//         processCompletedOrders(completedOrders);

//         if (completedOrders.length > 0) {
//           await axios.post('https://recycle-backend-lflh.onrender.com/addcompletedorders', { orders: completedOrders });
//         }
//       } catch (error) {
//         console.error('Error fetching completed orders:', error);
//       }
//     };

//     const fetchInventoryData = async () => {
//       try {
//         const response = await axios.get('https://recycle-backend-lflh.onrender.com/getinventory');
//         setInventoryData(response.data.inventory);
//       } catch (error) {
//         console.error('Error fetching inventory data:', error);
//       }
//     };

//     fetchCompletedOrders();
//     fetchInventoryData();
//     const interval = setInterval(() => {
//       fetchCompletedOrders();
//       fetchInventoryData();
//     }, 60000); // Poll every 1 minute

//     return () => clearInterval(interval); // Cleanup interval on component unmount
//   }, []);

//   const groupCompletedOrders = (orders) => {
//     const groupedOrders = orders.reduce((acc, order) => {
//       const key = `${order.Id}-${order.schedulePickup}`;
//       if (!acc[key]) {
//         acc[key] = {
//           ...order,
//           cart: [...order.cart]
//         };
//       } else {
//         acc[key].cart.push(...order.cart);
//       }
//       return acc;
//     }, {});

//     return Object.values(groupedOrders);
//   };

//   return (
//     <div>
//       <header style={headerStyle}>
//         <div style={logoStyle}>Logo</div>
//         <nav style={navStyle}>
//           <a href="/dashboard" style={linkStyle}>Dashboard</a>
//           <a href="#" style={linkStyle}>User Profile</a>
//           <a href="#" style={linkStyle}>Settings</a>
//           <a href="#" style={linkStyle}>Log Out</a>
//         </nav>
//       </header>
//       <div style={containerStyle}>
//         <Sidebar activeLink={activeLink} onLinkClick={handleLinkClick} />
//         <div style={mainContentStyle}>
//           <InventoryOverview
//             sectionStyle={sectionStyle}
//             sectionTitleStyle={sectionTitleStyle}
//             handleRecordClick={handleRecordClick}
//             selectedRecordId={selectedRecordId}
//             processedData={processedData}
//           />
//           {selectedRecordId && (
//             <DetailedView
//               sectionStyle={sectionStyle}
//               sectionTitleStyle={sectionTitleStyle}
//               recordId={selectedRecordId}
//             />
//           )}
//           <InventoryHistory sectionStyle={sectionStyle} sectionTitleStyle={sectionTitleStyle} />
//           {completedOrders.length > 0 && (
//             <div style={sectionStyle}>
//               <div style={sectionTitleStyle}>Completed Orders</div>
//               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                 <thead>
//                   <tr>
//                     <th style={{ border: '1px solid black', padding: '8px' }}>ID</th>
//                     <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
//                     <th style={{ border: '1px solid black', padding: '8px' }}>Paid Amount</th>
//                     <th style={{ border: '1px solid black', padding: '8px' }}>Quantity</th>
//                     <th style={{ border: '1px solid black', padding: '8px' }}>Location</th>
//                     <th style={{ border: '1px solid black', padding: '8px' }}>Scheduled Pickup</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupCompletedOrders(completedOrders).map(order => (
//                     <React.Fragment key={`${order.Id}-${order.schedulePickup}`}>
//                       <tr>
//                         <td style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }} rowSpan={order.cart.length}>{order.Id}</td>
//                         <td style={{ border: '1px solid black', padding: '8px', verticalAlign: 'top' }} rowSpan={order.cart.length}>{order.schedulePickup}</td>
//                         <td style={{ border: '1px solid black', padding: '8px' }}>{order.cart[0].name}</td>
//                         <td style={{ border: '1px solid black', padding: '8px' }}>{order.cart[0].paidAmnt}</td>
//                         <td style={{ border: '1px solid black', padding: '8px' }}>{order.cart[0].quantity}</td>
//                         <td style={{ border: '1px solid black', padding: '8px' }}>{order.location.lat}, {order.location.lng}</td>
//                       </tr>
//                       {order.cart.slice(1).map((item, index) => (
//                         <tr key={`${order.Id}-${item.name}-${index}`}>
//                           <td style={{ border: '1px solid black', padding: '8px' }}>{item.name}</td>
//                           <td style={{ border: '1px solid black', padding: '8px' }}>{item.paidAmnt}</td>
//                           <td style={{ border: '1px solid black', padding: '8px' }}>{item.quantity}</td>
//                           <td style={{ border: '1px solid black', padding: '8px' }}>{order.location.lat}, {order.location.lng}</td>
//                         </tr>
//                       ))}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const InventoryOverview = ({ sectionStyle, sectionTitleStyle, handleRecordClick, selectedRecordId, processedData }) => {
//   const tableHeaderStyle = {
//     display: 'flex',
//     justifyContent: 'center',
//     backgroundColor: '#ccc',
//     padding: '10px',
//     borderRadius: '5px',
//   };

//   const tableRowStyle = (isHeader) => ({
//     display: 'flex',
//     justifyContent: 'center',
//     padding: '10px',
//     backgroundColor: isHeader ? '#ffffff' : '#ffffff',
//   });

//   const tableCellStyle = {
//     flex: 1,
//     textAlign: 'center',
//     padding: '8px',
//     border: '1px solid #ddd',
//   };

  // Prepare data for the stacked bar chart
  // const categories = Object.keys(processedData);
  // const subCategories = [...new Set(categories.flatMap(category => Object.keys(processedData[category].subCategories)))];

  // const colors = [
  //   '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#66FF66', '#FF66B2', '#6666FF', '#00BFFF', '#FF4500', '#DA70D6'
  // ];

  // const chartData = {
  //   labels: categories,
  //   datasets: subCategories.map((subCategory, index) => {
  //     const color = colors[index % colors.length]; // Cycle through the color list

  //     return {
  //       label: subCategory,
  //       data: categories.map(category => processedData[category].subCategories[subCategory]?.weight || 0),
  //       backgroundColor: color,
  //     };
  //   })
  // };

  // const options = {
  //   plugins: {
  //     tooltip: {
  //       callbacks: {
  //         label: function (context) {
  //           const category = context.dataset.label;
  //           const subCategory = context.label;
  //           const weight = context.raw;
  //           const price = processedData[subCategory]?.subCategories[category]?.paidAmount || 0;
  //           return `${category}: ${weight}kg (Price: $${price})`;
  //         }
  //       }
  //     }
  //   },
  //   scales: {
  //     x: {
  //       stacked: true,
  //     },
  //     y: {
  //       stacked: true,
  //     }
  //   }
  // };

//   // Find the maximum number of subcategories for any category
//   const maxSubCategoriesLength = Math.max(...categories.map(category => Object.keys(processedData[category].subCategories).length));

  // return (
  //   <div style={sectionStyle}>
  //     <div style={sectionTitleStyle}>Inventory Overview</div>
  //     <div style={{ display: 'flex', flexDirection: 'column',backgroundColor: 'whitesmoke' }}>
  //       <div style={tableHeaderStyle}>
  //         <div style={tableCellStyle}>Category</div>
  //       </div>
  //       <div style={tableRowStyle(true)}>
  //         {categories.map(category => (
  //           <div key={category} style={{ ...tableCellStyle, borderLeft: '1px solid black' }}>{category}</div>
  //         ))}
  //       </div>
  //       <div style={tableRowStyle(true)}>
  //         {categories.map(category => (
  //           <div key={category} style={{ ...tableCellStyle, borderLeft: '1px solid black' }}>
  //             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
  //               <div style={{...tableCellStyle, fontSize: '13px'}}>SubCategory</div>
  //               <div style={{...tableCellStyle, fontSize: '13px'}}>Weight</div>
  //               <div style={{...tableCellStyle, fontSize: '13px'}}>Paid Amnt</div>
  //             </div>
  //             {Object.entries(processedData[category].subCategories).map(([subCategory, values], index) => (
  //               <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
  //                 <div style={{...tableCellStyle, fontSize: '12px'}}>{subCategory}</div>
  //                 <div style={{...tableCellStyle, fontSize: '12px'}}>{values.weight}</div>
  //                 <div style={{...tableCellStyle, fontSize: '12px'}}>{values.paidAmount}</div>
  //               </div>
  //             ))}
  //             {[...Array(maxSubCategoriesLength - Object.keys(processedData[category].subCategories).length)].map((_, index) => (
  //               <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
  //                 <div style={tableCellStyle}>&nbsp;</div>
  //                 <div style={tableCellStyle}>&nbsp;</div>
  //                 <div style={tableCellStyle}>&nbsp;</div>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //       </div>
  //       <div style={tableRowStyle(true)}>
  //         {categories.map(category => (
  //           <div key={category} style={{ ...tableCellStyle, borderLeft: '1px solid black' }}>
  //             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
  //               <div style={tableCellStyle}>Total Weight</div>
  //               <div style={tableCellStyle}>Total Price</div>
  //             </div>
  //             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
  //               <div style={tableCellStyle}>{processedData[category].totalWeight}</div>
  //               <div style={tableCellStyle}>{processedData[category].totalPrice}</div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //     <div style={{ marginTop: '20px' }}>
  //       <Bar data={chartData} options={options} />
  //     </div>
  //   </div>
  // );
// };

// const DetailedView = ({ sectionStyle, sectionTitleStyle, recordId }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchDataAsync = async () => {
//       const result = await fetchData('detailedView');
//       setData(result);
//     };
//     fetchDataAsync();
//   }, [recordId]);

//   const tableHeaderStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     backgroundColor: '#ccc',
//     padding: '10px',
//     borderRadius: '5px',
//   };

//   const tableRowStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     padding: '10px',
//   };

//   return (
//     <div style={sectionStyle}>
//       <div style={sectionTitleStyle}>Detailed view</div>
//       <div style={tableHeaderStyle}>
//         <div>Sub-Category</div>
//         <div>Quantity</div>
//         <div>Storage Location</div>
//         <div>Status</div>
//       </div>
//       {data.map((detail, index) => (
//         <div key={index} style={tableRowStyle}>
//           <div>{detail.subCategory}</div>
//           <div>{detail.quantity}</div>
//           <div>{detail.storageLocation}</div>
//           <div>{detail.status}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// const InventoryHistory = ({ sectionStyle, sectionTitleStyle }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchDataAsync = async () => {
//       const result = await fetchData('inventoryHistory');
//       setData(result);
//     };
//     fetchDataAsync();
//   }, []);

//   const tableHeaderStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     backgroundColor: '#ccc',
//     padding: '10px',
//     borderRadius: '5px',
//   };

//   const tableRowStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     padding: '10px',
//   };

//   return (
//     <div style={sectionStyle}>
//       <div style={sectionTitleStyle}>Inventory History</div>
//       <div style={tableHeaderStyle}>
//         <div>Date</div>
//         <div>Action</div>
//         <div>Category</div>
//         <div>Quantity</div>
//         <div>Status</div>
//       </div>
//       {data.map((history, index) => (
//         <div key={index} style={tableRowStyle}>
//           <div>{history.date}</div>
//           <div>{history.action}</div>
//           <div>{history.category}</div>
//           <div>{history.quantity}</div>
//           <div>{history.status}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Inventory;
