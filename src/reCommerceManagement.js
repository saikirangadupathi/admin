import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'react-calendar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'react-calendar/dist/Calendar.css';
import Sidebar from './sidebarComponent';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import OrderDetailsModal from './orderDetailsModal';
import { useDropzone } from 'react-dropzone';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, LineElement, BarElement } from 'chart.js';


import ProductList from './ecommerceProductList';

Chart.register(ArcElement, Tooltip, Legend, LineElement, BarElement);

const ReCommerceOrderManagement = () => {
  const [date, setDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState([51.505, -0.09]);
  const [activeLink, setActiveLink] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productEcoFriendly, setProductEcoFriendly] = useState(false);
  const [productGreenPoints, setProductGreenPoints] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [productStock, setProductStock] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [oldImageURLs, setOldImageURLs] = useState([]);


  // const [newImageURLs, setNewImageURLs] = useState([]);
  // const [uploadedImages, setUploadedImages] = useState([]);



  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [productUploadSuccess, setProductUploadSuccess] = useState(false);
  const [productWeight, setProductWeight] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [productSpecification, setProductSpecification] = useState('');
  const [aboutTheBrand, setAboutTheBrand] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [couponId, setCouponId] = useState('');
  const [couponName, setCouponName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [couponGreenPoints, setCouponGreenPoints] = useState(0);
  const [couponExpiryDate, setCouponExpiryDate] = useState('');
  const [couponCategory, setCouponCategory] = useState('');
  const [collectionsByDate, setCollectionsByDate] = useState({});
  const [toggleView, setToggleView] = useState('orderManagement');
  const [sellers, setSellers] = useState([]);

  const [allcoupons, setallCoupons] = useState([]);

  const [thirdPartySeller, setThirdPartySeller] = useState('');
  const [deliveryTracking, setDeliveryTracking] = useState('');
  const [attributeSize, setAttributeSize] = useState('');
  const [attributeColor, setAttributeColor] = useState('');
  const [attributeMaterial, setAttributeMaterial] = useState('');
  const [attributeDimensions, setAttributeDimensions] = useState('');
  const [attributeVariants, setAttributeVariants] = useState([]);
  const [shippingDimensions, setShippingDimensions] = useState('');
  const [shippingOptionsStandard, setShippingOptionsStandard] = useState(true);
  const [shippingOptionsExpress, setShippingOptionsExpress] = useState(false);
  const [shippingFulfillment, setShippingFulfillment] = useState('');
  const [performanceViews, setPerformanceViews] = useState(0);
  const [performanceConversionRates, setPerformanceConversionRates] = useState(0);
  const [performanceSalesData, setPerformanceSalesData] = useState(0);
  const [complianceCertifications, setComplianceCertifications] = useState([]);
  const [complianceRegulations, setComplianceRegulations] = useState([]);
  const [analyticsCustomerBehavior, setAnalyticsCustomerBehavior] = useState([]);
  const [analyticsRewards, setAnalyticsRewards] = useState(0);
  const [analyticsAdvertising, setAnalyticsAdvertising] = useState(false);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [newImageURLs, setNewImageURLs] = useState([]);
  const [validUrls, setValidUrls] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [couponCategories, setcouponCategories] = useState([]);




  const [customers, setCustomers] = useState([]);

  const mapRef = useRef();

  const handleLinkClick = (link) => {
    console.log('linkk',activeLink);
    setActiveLink(link);
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  const fetchSellers = async () => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/sellers');
      setSellers(response.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };


  // uploaded coupons dropdown selection....
  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    const uniqueCategories = ['All', ...new Set(allcoupons.map(coupon => coupon.category))];
    setcouponCategories(uniqueCategories);
  }, [allcoupons]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredCoupons = selectedCategory === 'All'
  ? allcoupons
  : allcoupons.filter(coupon => coupon.category === selectedCategory);

  
  

  // Fetch coupons from the backend
  const fetchallCoupons = async () => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/coupons');
      setallCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  // Fetch coupons when the component mounts
  useEffect(() => {
    fetchallCoupons();
  }, []);

  const fetchOrders = async (selectedDate) => {
    try {
      setDate(selectedDate);
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const response = await axios.get(`https://recycle-backend-lflh.onrender.com/getreCommerceOrders?date=${formattedDate}`);
      const data = response.data.orderslist;
      const orders = Array.isArray(data) ? data.map(order => ({
        id: order._id,
        username: order.name,
        date: order.date,
        address: order.location.address,
        lat: parseFloat(order.location.lat),
        lng: parseFloat(order.location.lng),
        price: order.totalPrice,
        contact: order.contact,
        items: order.cart,
        status: order.status
      })) : [];
      setOrders(orders);
      setMapLocations(orders.map(order => ({ lat: order.lat, lng: order.lng })));
      setFilteredOrders(orders.filter(order => order.status !== 'completed'));
      const ordersByDate = orders.reduce((acc, order) => {
        const date = new Date(order.date).toDateString();
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
      }, {});
      setCollectionsByDate(ordersByDate);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchAllCompletedOrders = async () => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/getAllCompletedOrders');
      const data = response.data.orderslist;
      const completedOrders = Array.isArray(data) ? data.map(order => ({
        id: order._id,
        username: order.name,
        date: order.date,
        address: order.location.address,
        lat: parseFloat(order.location.lat),
        lng: parseFloat(order.location.lng),
        price: order.totalPrice,
        contact: order.contact,
        items: order.cart,
        status: order.status
      })) : [];
      return completedOrders;
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchOrders(date);
      const completedOrders = await fetchAllCompletedOrders();
      setFilteredOrders(prevOrders => [...prevOrders, ...completedOrders]);
    };
    fetchData();
  }, [date]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/getPurchasedVouchers');
      setCoupons(response.data.vouchers);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://recycle-backend-lflh.onrender.com/api/users');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
    fetchCoupons();
    fetchProducts();
  }, []);

  

  const handleCouponUpload = async () => {
    const newCoupon = {
      id: couponId,
      name: couponName,
      code: couponCode,
      description: couponDescription,
      greenPoints: parseInt(couponGreenPoints, 10),
      expiryDate: new Date(couponExpiryDate),
      category: couponCategory,
      imageUrl: validUrls[0] || '', // Assuming you want to use the first uploaded image
    };
  
    try {
      let response;
      if (couponId) {
        response = await axios.put(`https://recycle-backend-lflh.onrender.com/api/coupons/${couponId}`, newCoupon);
      } else {
        response = await axios.post('https://recycle-backend-lflh.onrender.com/api/upload-coupons', newCoupon);
      }
  
      setUploadMessage(response.data.message);
  
      setCouponId('');
      setCouponName('');
      setCouponCode('');
      setCouponDescription('');
      setCouponGreenPoints(0);
      setCouponExpiryDate('');
      setCouponCategory('');
      setValidUrls([]);
      fetchallCoupons(); // Refresh the coupon list
    } catch (error) {
      console.error('Error uploading coupon:', error);
      setUploadMessage('Error uploading coupon');
    }
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
    setSelectedOrder(order);
    setModalIsOpen(true);
  };

  const handleStartOrder = async (order) => {
    if (order) {
      try {
        const response = await axios.post('https://recycle-backend-lflh.onrender.com/startDelivery', {
          id: order.id,
          status: 'in progress'
        });
        if (response.status === 200) {
          setOrders(prevOrders => prevOrders.map(ord =>
            ord.id === order.id ? { ...ord, status: 'in progress' } : ord
          ));
          setFilteredOrders(prevOrders => prevOrders.map(ord =>
            ord.id === order.id ? { ...ord, status: 'in progress' } : ord
          ));
          setModalIsOpen(false);
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
          setFilteredOrders(prevOrders => prevOrders.map(ord =>
            ord.id === selectedOrder.id ? { ...ord, status: 'completed', items: updatedItems } : ord
          ));
          setModalIsOpen(false);
        }
      } catch (error) {
        console.error("Error completing order:", error);
      }
    }
  };


  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = coupons.filter(
      (coupon) =>
        coupon.name.toLowerCase().includes(lowercasedQuery) ||
        coupon.id.toString().includes(lowercasedQuery) ||
        coupon.code.toLowerCase().includes(lowercasedQuery)
    );
    setCoupons(filtered);
  };

  const activeOrders = filteredOrders.filter(order => order.status !== 'completed');
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');

  const deliveredCount = completedOrders.length;

  const categories = [
    { name: 'All', subCategories: [] },
    { name: 'Electronics', subCategories: ['headphones', 'smartwatch', 'cameraAccessories', 'smartGadgets', 'musicalInstruments', 'Speakers'] },
    { name: 'Fashion', subCategories: ['Men', 'women', 'kids', 'footwear', 'premiumEdits'] },
    { name: 'Home', subCategories: ['ApplianceCookware', 'toolsHomeImprovements', 'fitnessSports'] },
    { name: 'Beauty', subCategories: [] },
    { name: 'HomeLiving', subCategories: [] },
    { name: 'PersonalCare', subCategories: [] },
    { name: 'Stationery', subCategories: [] },
    { name: 'BathroomEssentials', subCategories: [] },
    { name: 'Cleaning', subCategories: [] },
    { name: 'Kitchenware', subCategories: [] }
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category.name);
    setActiveSubCategory('');
  };

  const handleSubCategoryClick = (subCategory) => {
    setActiveSubCategory(subCategory);
  };


  const handleEditCoupon = (coupon) => {
    setCouponId(coupon.id);
    setCouponName(coupon.name);
    setCouponCode(coupon.code);
    setCouponDescription(coupon.description);
    setCouponGreenPoints(coupon.greenPoints);
    const formattedDate = new Date(coupon.expiryDate).toISOString().split('T')[0];
    setCouponExpiryDate(formattedDate);
    setCouponCategory(coupon.category);
    setUploadMessage('');
  };
  
  const handleDeleteCoupon = async (couponId) => {
    try {
      const response = await axios.delete(`https://recycle-backend-lflh.onrender.com/api/coupons/${couponId}`);
      if (response.status === 200) {
        setUploadMessage('Coupon deleted successfully');
        fetchallCoupons(); // Refetch the coupons to re-render the "Uploaded Coupons" section
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setUploadMessage('Error deleting coupon');
    }
  };
  


  //  upload image into aws s3
  const uploadImagesToS3 = async () => {
    if (uploadedImages.length === 0) {
      alert('No images to upload.');
      return;
    }
    const uploadPromises = uploadedImages.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await axios.post('https://recycle-backend-lflh.onrender.com/upload', formData);
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

  const removeImage = (index) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
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

  const getColorByStock = (stock) => {
    if (stock > 50) {
      return '#8ce08a';
    } else if (stock > 20) {
      return '#f5e08a';
    } else {
      return '#f58a8a';
    }
  };

  const preparePieChartData = (products, metric) => {
    const labels = products.map(product => product.name);
    const data = products.map(product => product[metric]);
    let colors = [];
    if (metric === 'stock') {
      colors = products.map(product => getColorByStock(product.stock));
    } else if (metric === 'price') {
      colors = products.map((product, index) => {
        const hue = (index * 18) % 360;
        return `hsl(${hue}, 80%, 60%)`;
      });
    }
    return {
      labels,
      datasets: [{
        label: metric,
        data,
        backgroundColor: colors,
      }]
    };
  };

  // const stockData = preparePieChartData(filteredProducts, 'stock');
  // const priceData = preparePieChartData(filteredProducts, 'price');

  const totalSellers = sellers.length;
  const totalRevenue = sellers.reduce((acc, seller) => acc + seller.revenue, 0);
  const totalOrdersProcessed = sellers.reduce((acc, seller) => acc + seller.salesVolume, 0);

  const salesVolumeTrends = {
    labels: sellers.map(seller => seller.name),
    datasets: [{
      label: 'Sales Volume',
      data: sellers.map(seller => seller.salesVolume),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
    }]
  };

  const revenueTrends = {
    labels: sellers.map(seller => seller.name),
    datasets: [{
      label: 'Revenue',
      data: sellers.map(seller => seller.revenue),
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.4)',
    }]
  };

  const returnRateData = {
    labels: sellers.map(seller => seller.name),
    datasets: [{
      label: 'Return Rate',
      data: sellers.map(seller => seller.returnRate),
      backgroundColor: sellers.map(() => 'rgba(255, 159, 64, 0.4)'),
      borderColor: sellers.map(() => 'rgba(255, 159, 64, 1)'),
      borderWidth: 1,
    }]
  };

  const customerRatingsData = {
    labels: sellers.map(seller => seller.name),
    datasets: [{
      label: 'Customer Ratings',
      data: sellers.map(seller => seller.customerRatings),
      backgroundColor: sellers.map(() => 'rgba(54, 162, 235, 0.4)'),
      borderColor: sellers.map(() => 'rgba(54, 162, 235, 1)'),
      borderWidth: 1,
    }]
  };

  const fulfillmentPerformanceData = {
    labels: sellers.map(seller => seller.name),
    datasets: [
      {
        label: 'Order Processing Time',
        data: sellers.map(seller => seller.orderProcessingTime),
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.4)',
      },
      {
        label: 'Shipping Time',
        data: sellers.map(seller => seller.shippingTime),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.4)',
      }
    ]
  };

  const financialPerformanceData = {
    labels: sellers.map(seller => seller.name),
    datasets: [
      {
        label: 'Commission Earned',
        data: sellers.map(seller => seller.commissionEarned),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
      },
      {
        label: 'Payout Timelines',
        data: sellers.map(seller => seller.payoutTimelines),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.4)',
      }
    ]
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
              style={{ ...toggleButtonStyle, backgroundColor: toggleView === 'orderManagement' ? '#8ce08a' : '#ffffff' }}
              onClick={() => setToggleView('orderManagement')}
            >
              Order Management
            </button>
            <button
              style={{ ...toggleButtonStyle, backgroundColor: toggleView === 'inventoryManagement' ? '#8ce08a' : '#ffffff' }}
              onClick={() => setToggleView('inventoryManagement')}
            >
              Inventory Management
            </button>
          </div>

          {toggleView === 'orderManagement' && (
            <>
              <h2>Dashboard Overview</h2>
                  <div style={dashboardStyle}>
                    <div style={realTimeSalesDataStyle}>
                      <h3>Real-Time Sales Data</h3>
                      <div style={chartContainerStyle}>
                        {/* Insert bar graphs or line charts here */}
                      </div>
                      <div style={kpiCardsContainerStyle}>
                        <div style={kpiCardStyle}>Total Sales: $XX,XXX</div>
                        <div style={kpiCardStyle}>Total Orders: XXX</div>
                        <div style={kpiCardStyle}>Average Order Value: $XXX</div>
                        <div style={kpiCardStyle}>Top-Selling Products: Product A, Product B</div>
                      </div>
                    </div>
                    <div style={orderSummaryStyle}>
                      <h3>Order Summary</h3>
                      <div style={orderStatusCardsContainerStyle}>
                        <div style={orderStatusCardStyle}>Pending: XX</div>
                        <div style={orderStatusCardStyle}>Processing: XX</div>
                        <div style={orderStatusCardStyle}>Shipped: XX</div>
                        <div style={orderStatusCardStyle}>Delivered: {deliveredCount}</div>
                        <div style={orderStatusCardStyle}>Cancelled: XX</div>
                      </div>
                      <div style={filtersContainerStyle}>
                        <input type="date" style={filterInputStyle} />
                        <select style={filterInputStyle}>
                          <option value="all">All</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <select style={filterInputStyle}>
                          <option value="all">All Payments</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </div>
                    </div>
                    <div style={notificationsStyle}>
                      <div style={notificationIconStyle}>🔔<span style={notificationBadgeStyle}>3</span></div>
                      <div style={dropdownNotificationsStyle}>
                        {/* Notification items go here */}
                      </div>
                    </div>
                  </div>

                  <h2>Customer Management</h2>
                  <div style={customerManagementStyle}>
                    <div style={customerListStyle}>
                      <h3>Customer List</h3>
                      <input type="text" placeholder="Search by name or email" style={searchInputStyle} />
                      <table style={tableStyle}>
                        <thead style={tableHeaderStyle}>
                          <tr>
                            <th style={tableCellStyle}>Name</th>
                            <th style={tableCellStyle}>Email</th>
                            <th style={tableCellStyle}>Phone</th>
                            <th style={tableCellStyle}>Total Orders</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((customer) => (
                            <tr key={customer.id} style={tableRowStyle}>
                              <td style={tableCellStyle}>{customer.name}</td>
                              <td style={tableCellStyle}>{customer.email}</td>
                              <td style={tableCellStyle}>{customer.phone}</td>
                              <td style={tableCellStyle}>{customer.totalOrders}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={customerProfileStyle}>
                      <h3>Customer Profile</h3>
                      <div style={profileTabsStyle}>
                        <div style={profileTabStyle}>Personal Information</div>
                        <div style={profileTabStyle}>Order History</div>
                        <div style={profileTabStyle}>Communication Logs</div>
                      </div>
                      <div style={activityTimelineStyle}>
                        {/* Timeline of customer activities */}
                      </div>
                      <div style={communicationToolsStyle}>
                        <h4>Send a Message</h4>
                        <textarea style={messageInputStyle}></textarea>
                        <button style={sendMessageButtonStyle}>Send</button>
                      </div>
                    </div>
                  </div>

                  {/* <h2>Order Management</h2>
                  <div style={viewStyle}>
                    <div style={calendarStyle}>
                      <h3>Calendar View</h3>
                      <Calendar
                        onChange={handleDateChange}
                        value={date}
                        tileContent={renderTileContent}
                      />
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

                                // Validate latitude and longitude
                                if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                                  console.warn(`Invalid LatLng object: (${lat}, ${lng})`);
                                  return null; // Skip this marker if invalid
                                }

                                return (
                                  <Marker key={index} position={[lat, lng]}>
                                    <Popup>{`Location: ${lat}, ${lng}`}</Popup>
                                  </Marker>
                                );
                              })}
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
                          <th style={tableCellStyle}>Name</th>
                          <th style={tableCellStyle}>Address</th>
                          <th style={tableCellStyle}>Date</th>
                          <th style={tableCellStyle}>Total Price</th>
                          <th style={tableCellStyle}>Contact</th>
                          <th style={tableCellStyle}>Status</th>
                          <th style={tableCellStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrders.map((order) => (
                          <tr key={order.id} style={tableRowStyle}>
                            <td style={tableCellStyle}>{order.id}</td>
                            <td style={tableCellStyle}>{order.username}</td>
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
                          <th style={tableCellStyle}>UserName</th>
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
                            <td style={tableCellStyle}>{order.username}</td>
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
                  </div> */}
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

            </>
          )}

          {toggleView === 'inventoryManagement' && (
            <>
              <h2>Seller Overview</h2>
              <div style={overviewContainerStyle}>
                <p>Total Sellers: {totalSellers}</p>
                <p>Total Revenue: ₹{totalRevenue}</p>
                <p>Total Orders Processed: {totalOrdersProcessed}</p>
              </div>

              <h2>Detailed Seller Performance</h2>
              <div style={searchContainerStyle}>
                <input
                  type="text"
                  placeholder="Search by seller name"
                  style={searchInputStyle}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button style={searchButtonStyle} onClick={{handleSearch}}>🔍</button>
              </div>
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead style={tableHeaderStyle}>
                    <tr>
                      <th style={tableCellStyle}>Seller ID</th>
                      <th style={tableCellStyle}>Seller Name</th>
                      <th style={tableCellStyle}>Sales Volume</th>
                      <th style={tableCellStyle}>Revenue</th>
                      <th style={tableCellStyle}>Return Rate</th>
                      <th style={tableCellStyle}>Customer Ratings</th>
                      <th style={tableCellStyle}>Customer Complaints</th>
                      <th style={tableCellStyle}>Product Views</th>
                      <th style={tableCellStyle}>Conversion Rate</th>
                      <th style={tableCellStyle}>Stock Levels</th>
                      <th style={tableCellStyle}>Order Processing Time</th>
                      <th style={tableCellStyle}>Shipping Time</th>
                      <th style={tableCellStyle}>Fulfillment Accuracy</th>
                      <th style={tableCellStyle}>Commission Earned</th>
                      <th style={tableCellStyle}>Payout Timelines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((seller) => (
                      <tr key={seller.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>{seller.id}</td>
                        <td style={tableCellStyle}>{seller.name}</td>
                        <td style={tableCellStyle}>{seller.salesVolume}</td>
                        <td style={tableCellStyle}>₹{seller.revenue}</td>
                        <td style={tableCellStyle}>{seller.returnRate}%</td>
                        <td style={tableCellStyle}>{seller.customerRatings}</td>
                        <td style={tableCellStyle}>{seller.customerComplaints}</td>
                        <td style={tableCellStyle}>{seller.productViews}</td>
                        <td style={tableCellStyle}>{seller.conversionRate}%</td>
                        <td style={tableCellStyle}>{seller.stockLevels}</td>
                        <td style={tableCellStyle}>{seller.orderProcessingTime} mins</td>
                        <td style={tableCellStyle}>{seller.shippingTime} mins</td>
                        <td style={tableCellStyle}>{seller.fulfillmentAccuracy}%</td>
                        <td style={tableCellStyle}>₹{seller.commissionEarned}</td>
                        <td style={tableCellStyle}>{seller.payoutTimelines} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2>Graphical Representation</h2>
              <div style={chartContainerStyle}>
                <div style={chartStyle}>
                  <h3>Sales Volume Trends</h3>
                  <Line data={salesVolumeTrends} />
                </div>
                <div style={chartStyle}>
                  <h3>Revenue Trends</h3>
                  <Line data={revenueTrends} />
                </div>
                <div style={chartStyle}>
                  <h3>Return Rate</h3>
                  <Pie data={returnRateData} />
                </div>
                <div style={chartStyle}>
                  <h3>Customer Ratings</h3>
                  <Pie data={customerRatingsData} />
                </div>
                <div style={chartStyle}>
                  <h3>Fulfillment Performance</h3>
                  <Bar data={fulfillmentPerformanceData} />
                </div>
                <div style={chartStyle}>
                  <h3>Financial Performance</h3>
                  <Line data={financialPerformanceData} />
                </div>
              </div>

              <div style={uploadContainerStyle}>
                <h2>Individual Seller Performance</h2>
                <div style={sellerContainerStyle}>
                  {sellers.map((seller) => (
                    <div key={seller.id} style={sellerCardStyle}>
                      <h3>{seller.name}</h3>
                      <p><strong>Seller ID:</strong> {seller.id}</p>
                      <p><strong>Sales Volume:</strong> {seller.salesVolume}</p>
                      <p><strong>Revenue:</strong> ₹{seller.revenue}</p>
                      <p><strong>Return Rate:</strong> {seller.returnRate}%</p>
                      <p><strong>Customer Ratings:</strong> {seller.customerRatings}</p>
                      <p><strong>Customer Complaints:</strong> {seller.customerComplaints}</p>
                      <p><strong>Product Views:</strong> {seller.productViews}</p>
                      <p><strong>Conversion Rate:</strong> {seller.conversionRate}%</p>
                      <p><strong>Stock Levels:</strong> {seller.stockLevels}</p>
                      <p><strong>Order Processing Time:</strong> {seller.orderProcessingTime} mins</p>
                      <p><strong>Shipping Time:</strong> {seller.shippingTime} mins</p>
                      <p><strong>Fulfillment Accuracy:</strong> {seller.fulfillmentAccuracy}%</p>
                      <p><strong>Commission Earned:</strong> ₹{seller.commissionEarned}</p>
                      <p><strong>Payout Timelines:</strong> {seller.payoutTimelines} days</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* <div style={uploadContainerStyle}>
                <h3>Inventory Management</h3>
                <div style={categoryButtonsContainerStyle}>
                {categories.map((category) => (
                      <div key={category.name} style={{ marginBottom: '20px' }}>
                        <button
                          onClick={() => handleCategoryClick(category)}
                          style={{
                            ...categoryButtonStyle,
                            backgroundColor: activeCategory === category.name ? '#8ce08a' : '#ffffff'
                          }}
                        >
                          {category.name}
                        </button>
                        {activeCategory === category.name && category.subCategories.length > 0 && (
                          <div style={subCategoryButtonsContainerStyle}>
                            {category.subCategories.map((subCategory) => (
                              <button
                                key={subCategory}
                                onClick={() => handleSubCategoryClick(subCategory)}
                                style={{
                                  ...subCategoryButtonStyle,
                                  backgroundColor: activeSubCategory === subCategory ? '#8ce08a' : '#ffffff'
                                }}
                              >
                                {subCategory}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                </div>

                {activeSubCategory ? (
                  <>
                    <h3>{activeCategory} / {activeSubCategory}</h3>
                    <div style={chartContainerStyle}>
                      <Pie data={stockData} style={chartStyle}/>
                    </div>
                    <div>
                      <Pie data={priceData} style={chartStyle}/>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={chartContainerStyle}>
                      <Pie data={stockData} style={chartStyle}/>
                    </div>
                    <div>
                      <Pie data={priceData} style={chartStyle}/>
                    </div>
                  </>
                )}
              </div> */}

              {/* <div style={uploadContainerStyle}>
                <h3>Upload Product Details</h3>
                <label style={labelStyle1}>
                  Category:
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                {productCategory && categories.find(category => category.name === productCategory)?.subCategories.length > 0 && (
                  <label style={labelStyle1}>
                    Sub-Category:
                    <select
                      value={activeSubCategory}
                      onChange={(e) => setActiveSubCategory(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    >
                      <option value="">Select Sub-Category</option>
                      {categories.find(category => category.name === productCategory).subCategories.map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label style={labelStyle1}>
                  Name:
                  <input
                    type="text"
                    placeholder="Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Price:
                  <input
                    type="number"
                    placeholder="Price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Weight:
                  <input
                    type="text"
                    placeholder="Weight"
                    value={productWeight}
                    onChange={(e) => setProductWeight(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <div style={descriptionContainerStyle}>
                  <h4>Description</h4>
                  <label style={labelStyle}>
                    Product Details:
                    <input
                      type="text"
                      placeholder="Product Details"
                      value={productDetails}
                      onChange={(e) => setProductDetails(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Product Specification:
                    <input
                      type="text"
                      placeholder="Product Specification"
                      value={productSpecification}
                      onChange={(e) => setProductSpecification(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    About the Brand:
                    <input
                      type="text"
                      placeholder="About the Brand"
                      value={aboutTheBrand}
                      onChange={(e) => setAboutTheBrand(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Additional Details:
                    <input
                      type="text"
                      placeholder="Additional Details"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                </div>
                <label style={labelStyle1}>
                  Third-Party Seller:
                  <input
                    type="text"
                    placeholder="Third-Party Seller"
                    value={thirdPartySeller}
                    onChange={(e) => setThirdPartySeller(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Delivery Tracking:
                  <input
                    type="text"
                    placeholder="Delivery Tracking"
                    value={deliveryTracking}
                    onChange={(e) => setDeliveryTracking(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <div style={descriptionContainerStyle}>
                  <h4>Attributes</h4>
                  <label style={labelStyle}>
                    Size:
                    <input
                      type="text"
                      placeholder="Size"
                      value={attributeSize}
                      onChange={(e) => setAttributeSize(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Color:
                    <input
                      type="text"
                      placeholder="Color"
                      value={attributeColor}
                      onChange={(e) => setAttributeColor(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Material:
                    <input
                      type="text"
                      placeholder="Material"
                      value={attributeMaterial}
                      onChange={(e) => setAttributeMaterial(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Dimensions:
                    <input
                      type="text"
                      placeholder="Dimensions"
                      value={attributeDimensions}
                      onChange={(e) => setAttributeDimensions(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Variants:
                    <input
                      type="text"
                      placeholder="Variants (comma-separated)"
                      value={attributeVariants.join(', ')}
                      onChange={(e) => setAttributeVariants(e.target.value.split(',').map(variant => variant.trim()))}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                </div>
                <div style={descriptionContainerStyle}>
                  <h4>Shipping</h4>
                  <label style={labelStyle}>
                    Dimensions:
                    <input
                      type="text"
                      placeholder="Shipping Dimensions"
                      value={shippingDimensions}
                      onChange={(e) => setShippingDimensions(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Standard Shipping:
                    <input
                      type="checkbox"
                      checked={shippingOptionsStandard}
                      onChange={(e) => setShippingOptionsStandard(e.target.checked)}
                    />
                  </label>
                  <label style={labelStyle}>
                    Express Shipping:
                    <input
                      type="checkbox"
                      checked={shippingOptionsExpress}
                      onChange={(e) => setShippingOptionsExpress(e.target.checked)}
                    />
                  </label>
                  <label style={labelStyle1}>
                    Fulfillment:
                    <input
                      type="text"
                      placeholder="Fulfillment"
                      value={shippingFulfillment}
                      onChange={(e) => setShippingFulfillment(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                </div>
                <div style={descriptionContainerStyle}>
                  <h4>Performance</h4>
                  <label style={labelStyle1}>
                    Views:
                    <input
                      type="number"
                      placeholder="Views"
                      value={performanceViews}
                      onChange={(e) => setPerformanceViews(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle1}>
                    Conversion Rates:
                    <input
                      type="number"
                      placeholder="Conversion Rates"
                      value={performanceConversionRates}
                      onChange={(e) => setPerformanceConversionRates(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle1}>
                    Sales Data:
                    <input
                      type="number"
                      placeholder="Sales Data"
                      value={performanceSalesData}
                      onChange={(e) => setPerformanceSalesData(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                </div>
                <div style={descriptionContainerStyle}>
                  <h4>Compliance</h4>
                  <label style={labelStyle1}>
                    Certifications:
                    <input
                      type="text"
                      placeholder="Certifications (comma-separated)"
                      value={complianceCertifications.join(', ')}
                      onChange={(e) => setComplianceCertifications(e.target.value.split(',').map(cert => cert.trim()))}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle1}>
                    Regulations:
                    <input
                      type="text"
                      placeholder="Regulations (comma-separated)"
                      value={complianceRegulations.join(', ')}
                      onChange={(e) => setComplianceRegulations(e.target.value.split(',').map(reg => reg.trim()))}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                </div>
                <div style={descriptionContainerStyle}>
                  <h4>Analytics</h4>
                  <label style={labelStyle1}>
                    Customer Behavior:
                    <input
                      type="text"
                      placeholder="Customer Behavior (comma-separated)"
                      value={analyticsCustomerBehavior.join(', ')}
                      onChange={(e) => setAnalyticsCustomerBehavior(e.target.value.split(',').map(behavior => behavior.trim()))}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle1}>
                    Rewards:
                    <input
                      type="number"
                      placeholder="Rewards"
                      value={analyticsRewards}
                      onChange={(e) => setAnalyticsRewards(e.target.value)}
                      style={{ ...uploadInputStyle, width: '200px' }}
                    />
                  </label>
                  <label style={labelStyle1}>
                    Advertising:
                    <input
                      type="checkbox"
                      checked={analyticsAdvertising}
                      onChange={(e) => setAnalyticsAdvertising(e.target.checked)}
                    />
                  </label>
                </div>
                <label style={labelStyle}>
                  Eco-Friendly:
                  <input
                    type="checkbox"
                    checked={productEcoFriendly}
                    onChange={(e) => setProductEcoFriendly(e.target.checked)}
                  />
                </label>
                <label style={labelStyle1}>
                  Green Points:
                  <input
                    type="number"
                    placeholder="Green Points"
                    value={productGreenPoints}
                    onChange={(e) => setProductGreenPoints(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Discount:
                  <input
                    type="number"
                    placeholder="Discount"
                    value={productDiscount}
                    onChange={(e) => setProductDiscount(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Stock:
                  <input
                    type="number"
                    placeholder="Stock"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle}>
                  Images (comma-separated URLs):
                  <input
                    type="text"
                    placeholder="Images (comma-separated URLs)"
                    value={oldImageURLs.join(', ')}
                    onChange={(e) => setOldImageURLs(e.target.value.split(',').map(url => url.trim()))}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                
                <div {...getRootProps()} style={dragDropStyle}>
                  <input {...getInputProps()} />
                  <p>Drag & drop some images here, or click to select files</p>
                  <div style={previewContainerStyle}>
                    
                  </div>
                </div>

                <div style={imagePreviewContainerStyle}>
                  <h4>Old Images</h4>
                    {oldImageURLs.map((url, index) => (
                      <div key={index} style={imagePreviewStyle}>
                        <img src={url} alt={`Preview ${index}`} style={imageThumbnailStyle} />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          style={removeImageButtonStyle}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={imagePreviewContainerStyle}>
                  <h4>New Images</h4>
                    {productImages.map((img, index) => (
                      <div key={index} style={imagePreviewStyle}>
                        <img src={img.url} alt={`Preview ${index}`} style={imageThumbnailStyle} />
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
                <button onClick={uploadImagesToS3} style={uploadButtonStyle}>Upload Images {imageUploadSuccess && <span style={checkIconStyle}>✔️</span>}</button>
                <button onClick={handleProductUpload} style={uploadButtonStyle}>Upload Product</button>
                {productUploadSuccess && <span style={checkIconStyle}>✔️</span>}
                {uploadMessage && <p>{uploadMessage}</p>}

                <div style={urlContainerStyle}>
                  <h4>New Image URLs</h4>
                  {newImageURLs.map((url, index) => (
                    <p key={index}>{url}</p>
                  ))}
                </div>

                <div style={urlContainerStyle}>
                  <h4>Final URLs</h4>
                  {[...oldImageURLs, ...newImageURLs].map((url, index) => (
                    <p key={index}>{url}</p>
                  ))}
                </div>
              </div> */}
            
              <div style={uploadContainerStyle}>
                <h3>Upload Coupon Details</h3>
                <label style={labelStyle1}>
                  Coupon ID:
                  <input
                    type="text"
                    placeholder="Coupon ID"
                    value={couponId}
                    onChange={(e) => setCouponId(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Name:
                  <input
                    type="text"
                    placeholder="Name"
                    value={couponName}
                    onChange={(e) => setCouponName(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Code:
                  <input
                    type="text"
                    placeholder="Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle}>
                  Description:
                  <input
                    type="text"
                    placeholder="Description"
                    value={couponDescription}
                    onChange={(e) => setCouponDescription(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Green Points:
                  <input
                    type="number"
                    placeholder="Green Points"
                    value={couponGreenPoints}
                    onChange={(e) => setCouponGreenPoints(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Expiry Date:
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={couponExpiryDate}
                    onChange={(e) => setCouponExpiryDate(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>
                <label style={labelStyle1}>
                  Category:
                  <input
                    type="text"
                    placeholder="Category"
                    value={couponCategory}
                    onChange={(e) => setCouponCategory(e.target.value)}
                    style={{ ...uploadInputStyle, width: '200px' }}
                  />
                </label>

                <div {...getRootProps()} style={dragDropStyle}>
                    <input {...getInputProps()} />
                    <p>Drag & drop some images here, or click to select files</p>
                  </div>

                  <div style={imagePreviewContainerStyle}>
                    {uploadedImages.map((file, index) => (
                      <div key={index} style={imagePreviewStyle}>
                        <img src={file.preview} alt={`Preview ${index}`} style={imageThumbnailStyle} />
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

                  {/* Display the URLs of the uploaded images */}
                  {validUrls.length > 0 && (
                    <div style={urlContainerStyle}>
                      <h4>Uploaded Image URLs</h4>
                      {validUrls.map((url, index) => (
                        <p key={index}>{url}</p>
                      ))}
                    </div>
                  )}

                  <button onClick={handleCouponUpload} style={uploadButtonStyle}>Upload Coupon</button>

                
                {uploadMessage && <p>{uploadMessage}</p>}
              </div>


              <div style={uploadContainerStyle}>
                  <h3>Uploaded Coupons</h3>
                  {/* Category Dropdown */}
                  <select value={selectedCategory} onChange={handleCategoryChange} style={dropdownStyle}>
                    {couponCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div style={couponCardsContainerStyle}>
                    {filteredCoupons.map((coupon) => (
                      <div key={coupon.id} style={couponCardStyle}>
                        {/* Display the coupon image */}
                          {coupon.imageUrl && (
                            <img src={coupon.imageUrl} alt={coupon.name} style={couponImageStyle} />
                          )}
                        <h4>{coupon.name}</h4>
                        <p><strong>ID:</strong> {coupon.id}</p>
                        <p><strong>Code:</strong> {coupon.code}</p>
                        <p><strong>Green Points:</strong> {coupon.greenPoints}</p>
                        <p><strong>Expiry Date:</strong> {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                        <p><strong>Category:</strong> {coupon.category}</p>
                        
                        <button style={editButtonStyle} onClick={() => handleEditCoupon(coupon)}>Edit</button>
                        <button style={deleteButtonStyle} onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>

              {/* <div style={categoryButtonsContainerStyle}>
                {categories.map((category) => (
                  <div key={category.name} style={{ marginBottom: '20px' }}>
                    <button
                      onClick={() => handleCategoryClick(category)}
                      style={{
                        ...categoryButtonStyle,
                        backgroundColor: activeCategory === category.name ? '#8ce08a' : '#ffffff'
                      }}
                    >
                      {category.name}
                    </button>
                    {activeCategory === category.name && category.subCategories.length > 0 && (
                      <div style={subCategoryButtonsContainerStyle}>
                        {category.subCategories.map((subCategory) => (
                          <button
                            key={subCategory}
                            onClick={() => handleSubCategoryClick(subCategory)}
                            style={{
                              ...subCategoryButtonStyle,
                              backgroundColor: activeSubCategory === subCategory ? '#8ce08a' : '#ffffff'
                            }}
                          >
                            {subCategory}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div> */}

              {/* <div style={productsContainerStyle}>
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          style={{
                            ...productCardStyle,
                            borderColor: selectedProductId === product._id ? '#8a8af5' : '#dddddd'
                          }}
                        >
                          <h4 style={productTitleStyle}>{product.name}</h4>
                          <ul style={productListStyle}>
                            <li>Category: {product.category}</li>
                            <li>Price: ${product.price}</li>
                            <li>Eco-Friendly: {product.ecoFriendly ? 'Yes' : 'No'}</li>
                            <li>Green Points: {product.greenPoints}</li>
                            <li>Discount: {product.discount}%</li>
                            <li>Stock: {product.stock}</li>
                            <li>Weight: {product.weight}</li>
                            <li>Third-Party Seller: {product.thirdPartySeller}</li>
                            <li>Delivery Tracking: {product.deliveryTracking}</li>
                            <li>Views: {product.performance?.views || 0}</li>
                            <li>Conversion Rates: {product.performance?.conversionRates || 0}</li>
                            <li>Sales Data: {product.performance?.salesData || 0}</li>
                          </ul>
                          <div style={imageContainerStyle}>
                            {product.images.map((img, index) => (
                              <img key={index} src={img} alt={product.name} style={productImageStyle} />
                            ))}
                          </div>
                          <button onClick={() => handleEditProduct(product)} style={editButtonStyle}>Edit</button>
                          <button onClick={() => handleDeleteProduct(product._id)} style={deleteButtonStyle}>Delete</button>
                        </div>
                      ))}
                </div> */}

            </>
          )}
        </main>
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
            address: `Lat: ${selectedOrder.address.lat}, Lng: ${selectedOrder.address.lng}`, 
            scheduleDate: selectedOrder.date, 
            items: selectedOrder.items,
            status: selectedOrder.status 
          }}
          onStartOrder={() => handleStartOrder(selectedOrder)}
          onCompleteOrder={handleCompleteOrder}
        />
      )}
    </div>
  );
};


const productsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  padding: '20px',
  backgroundColor: '#f9f9f9',
};

const productCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  border: '2px solid #dddddd',
  transition: 'transform 0.3s, box-shadow 0.3s',
};

const productTitleStyle = {
  backgroundColor: '#D6CDF6',
  borderRadius: '10px',
  padding: '10px',
  marginBottom: '10px',
  color: 'black',
};

const productListStyle = {
  listStyleType: 'none',
  padding: 0,
  margin: '10px 0',
  textAlign: 'left',
};

const imageContainerStyle = {
  display: 'flex',
  overflowX: 'auto',
  gap: '10px',
  padding: '10px 0'
};

const productImageStyle = {
  height: '100px',
  width: 'auto',
  objectFit: 'cover',
  borderRadius: '5px',
  flexShrink: 0
};

const editButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  margin: '10px 5px',
  transition: 'background-color 0.3s',
};

const deleteButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#f58a8a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  margin: '10px 5px',
  transition: 'background-color 0.3s',
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: '#ffffff',
};

const headerStyle = {
  display: 'flex',
  padding: '10px',
  width: '100%',
  justifyContent: 'space-between',
  position: 'fixed',
  alignItems: 'center',
  top: '0',
  backgroundColor: '#D6CDF6',
  color: 'black',
  fontFamily: 'Arial, sans-serif',
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
  flex: '1',
  marginTop: '40px',
};

const contentStyle = {
  flex: 1,
  backgroundColor: '#e0f7da',
  padding: '20px',
  marginLeft: '290px',
  overflowY: 'auto',
  height: 'calc(100vh - 60px)',
  paddingTop: '20px',
};


const dashboardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const realTimeSalesDataStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};


const kpiCardsContainerStyle = {
  display: 'flex',
  gap: '10px'
};

const kpiCardStyle = {
  flex: 1,
  padding: '10px',
  background: '#fff',
  borderRadius: '5px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const orderSummaryStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const orderStatusCardsContainerStyle = {
  display: 'flex',
  gap: '10px'
};

const orderStatusCardStyle = {
  flex: 1,
  padding: '10px',
  background: '#fff',
  borderRadius: '5px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const filtersContainerStyle = {
  display: 'flex',
  gap: '10px'
};

const filterInputStyle = {
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ddd'
};

const notificationsStyle = {
  position: 'relative'
};

const notificationIconStyle = {
  fontSize: '24px',
  cursor: 'pointer'
};

const notificationBadgeStyle = {
  position: 'absolute',
  top: '-5px',
  right: '-5px',
  background: 'red',
  borderRadius: '50%',
  color: 'white',
  padding: '5px',
  fontSize: '12px'
};

const dropdownNotificationsStyle = {
  position: 'absolute',
  top: '30px',
  right: '0',
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderRadius: '5px',
  width: '200px',
  zIndex: '1000'
};

const customerManagementStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const customerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const customerProfileStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const profileTabsStyle = {
  display: 'flex',
  gap: '10px'
};

const profileTabStyle = {
  padding: '10px',
  cursor: 'pointer',
  background: '#f5f5f5',
  borderRadius: '5px'
};

const activityTimelineStyle = {
  height: '200px',
  background: '#f5f5f5',
  borderRadius: '5px',
  padding: '10px'
};

const communicationToolsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const messageInputStyle = {
  width: '100%',
  height: '100px',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd'
};

const sendMessageButtonStyle = {
  padding: '10px 20px',
  background: 'blue',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
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

const labelStyle = {
  display: 'block',
  marginBottom: '10px',
  padding: '5px'
};
const labelStyle1 = {
  marginBottom: '30px',
  padding: '20px'
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

const dropdownStyle = {
  marginBottom: '20px',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};



const couponCardsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
  marginTop: '20px'
};

const couponCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  width: '300px',
};

const couponImageStyle = {
  width: '100%',      // Make the image take the full width of its container
  height: 'auto',     // Maintain the aspect ratio
  maxHeight: '150px', // Limit the height to avoid overly large images
  objectFit: 'cover', // Ensure the image covers the area without distortion
  borderRadius: '8px', // Apply slight rounding to the corners
  marginBottom: '10px' // Add some space below the image
};

const previewContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '10px'
};

const previewStyle = {
  position: 'relative',
  display: 'inline-block'
};

const cancelButtonStyle = {
  position: 'absolute',
  top: '0',
  right: '0',
  background: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer'
};

const uploadInputStyle = {
  marginBottom: '5px',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #cccccc',
  width: 'calc(100% - 20px)',
};

const uploadButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#8ce08a',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  margin: '10px'
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

const categoryButtonsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: '20px',
};

const categoryButtonStyle = {
  padding: '10px 20px',
  margin: '5px',
  borderRadius: '5px',
  cursor: 'pointer',
  border: '1px solid #cccccc',
};

const subCategoryButtonsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '10px',
  marginLeft: '20px'
};

const subCategoryButtonStyle = {
  padding: '5px 10px',
  margin: '5px',
  borderRadius: '5px',
  cursor: 'pointer',
  border: '1px solid #cccccc',
};

const dragDropStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '10px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '10px',
};

const imagePreviewContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '10px',
};

const imagePreviewStyle = {
  position: 'relative',
  display: 'inline-block',
};

const imageThumbnailStyle = {
  width: '50px',
  height: '50px',
  objectFit: 'cover',
  borderRadius: '5px',
};

const removeImageButtonStyle = {
  position: 'absolute',
  top: '0px',
  right: '0px',
  background: '#f58a8a',
  border: 'none',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  color: '#ffffff',
  cursor: 'pointer',
};

const checkIconStyle = {
  marginLeft: '5px',
  color: 'green',
  fontSize: '1.2em'
};

const urlContainerStyle = {
  marginTop: '10px'
};

const descriptionContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  marginBottom: '10px'
};

const tileContentStyle = {
  backgroundColor: '#8ce08a',
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
};

const chartContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  gap: '20px',
  marginTop: '20px'
};

const chartStyle = {
  width: '45%',
};

const sellerContainerStyle = {
  display: 'flex',
  overflowX: 'auto',
  gap: '20px',
  marginTop: '20px'
};

const sellerCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  minWidth: '300px',
  textAlign: 'left'
};

const overviewContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '20px'
};

const toggleButtonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const toggleButtonStyle = {
  padding: '10px 20px',
  margin: '0 10px',
  borderRadius: '5px',
  cursor: 'pointer',
  border: '1px solid #cccccc',
};




export default ReCommerceOrderManagement;
