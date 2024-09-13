import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Sidebar from './sidebarComponent';
import { BrowserRouter as Router, Route, Switch, Link, useLocation } from 'react-router-dom';
import ReactPaginate from 'react-paginate';


const ProductList = () => {
  const [productCategory, setProductCategory] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [productSpecification, setProductSpecification] = useState('');
  const [aboutTheBrand, setAboutTheBrand] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [thirdPartySeller, setThirdPartySeller] = useState('');
  const [deliveryTracking, setDeliveryTracking] = useState('');
  const [attributeSize, setAttributeSize] = useState('');
  const [attributeColor, setAttributeColor] = useState('');
  const [attributeMaterial, setAttributeMaterial] = useState('');
  const [attributeDimensions, setAttributeDimensions] = useState('');
  const [attributeVariants, setAttributeVariants] = useState([]);
  const [attributeKeywords, setAttributeKeywords] = useState([]);

  const [keywordInput, setKeywordInput] = useState(''); // State to hold the input value temporarily

  const [shippingDimensions, setShippingDimensions] = useState('');
  const [shippingOptionsStandard, setShippingOptionsStandard] = useState(false);
  const [shippingOptionsExpress, setShippingOptionsExpress] = useState(false);
  const [shippingFulfillment, setShippingFulfillment] = useState('');
  const [performanceViews, setPerformanceViews] = useState('');
  const [performanceConversionRates, setPerformanceConversionRates] = useState('');
  const [performanceSalesData, setPerformanceSalesData] = useState('');
  const [complianceCertifications, setComplianceCertifications] = useState([]);
  const [complianceRegulations, setComplianceRegulations] = useState([]);
  const [analyticsCustomerBehavior, setAnalyticsCustomerBehavior] = useState([]);
  const [analyticsRewards, setAnalyticsRewards] = useState('');
  const [analyticsAdvertising, setAnalyticsAdvertising] = useState(false);
  const [productEcoFriendly, setProductEcoFriendly] = useState(false);
  const [productGreenPoints, setProductGreenPoints] = useState('');
  const [productDiscount, setProductDiscount] = useState('');
  const [productStock, setProductStock] = useState('');
  const [oldImageURLs, setOldImageURLs] = useState([]);
  const [newImageURLs, setNewImageURLs] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [productUploadSuccess, setProductUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showUploadContainer, setShowUploadContainer] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStock, setFilterStock] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 10;


  const [activeLink, setActiveLink] = useState(null);

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

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://recycle-backend-apao.onrender.com/api/products');
      setFilteredProducts(response.data);
      console.log('filtered..', response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductUpload = async () => {
    const categoryPath = activeSubCategory ? `${productCategory}/${activeSubCategory}` : productCategory;
    const newProduct = {
      category: categoryPath,
      name: productName,
      price: parseFloat(productPrice),
      ecoFriendly: productEcoFriendly,
      greenPoints: parseInt(productGreenPoints, 10),
      discount: parseInt(productDiscount, 10),
      stock: parseInt(productStock, 10),
      images: [...oldImageURLs, ...newImageURLs],
      weight: productWeight,
      description: [
        productDetails,
        productSpecification,
        aboutTheBrand,
        additionalDetails
      ],
      reviews: [],
      thirdPartySeller,
      deliveryTracking,
      attributes: {
        size: attributeSize,
        color: attributeColor,
        material: attributeMaterial,
        dimensions: attributeDimensions,
        variants: attributeVariants,
      },
      keywords: attributeKeywords,
      shipping: {
        weight: productWeight,
        dimensions: shippingDimensions,
        options: {
          standard: shippingOptionsStandard,
          express: shippingOptionsExpress
        },
        fulfillment: shippingFulfillment
      },
      performance: {
        views: performanceViews,
        conversionRates: performanceConversionRates,
        salesData: performanceSalesData
      },
      compliance: {
        certifications: complianceCertifications,
        regulations: complianceRegulations
      },
      analytics: {
        customerBehavior: analyticsCustomerBehavior,
        rewards: analyticsRewards,
        advertising: analyticsAdvertising
      }
    };
    try {
      let response;
      if (selectedProductId) {
        response = await axios.put(`https://recycle-backend-apao.onrender.com/api/products/${selectedProductId}`, newProduct);
        setUploadMessage('Product updated successfully!');
        setSelectedProductId(null);
      } else {
        response = await axios.post('https://recycle-backend-apao.onrender.com/api/products', newProduct);
        setUploadMessage(response.data.message);
      }
      setImageUploadSuccess(false);
      resetForm();
      setProductUploadSuccess(true);
      fetchProducts();
      setShowUploadContainer(false);
    } catch (error) {
      console.error('Error uploading product:', error);
      setUploadMessage('Error uploading product');
    }
  };

  const resetForm = () => {
    setProductCategory('');
    setActiveSubCategory('');
    setProductName('');
    setProductPrice('');
    setProductWeight('');
    setProductDetails('');
    setProductSpecification('');
    setAboutTheBrand('');
    setAdditionalDetails('');
    setThirdPartySeller('');
    setDeliveryTracking('');
    setAttributeSize('');
    setAttributeColor('');
    setAttributeMaterial('');
    setAttributeDimensions('');
    setAttributeVariants([]);
    setAttributeKeywords([]);
    setShippingDimensions('');
    setShippingOptionsStandard(false);
    setShippingOptionsExpress(false);
    setShippingFulfillment('');
    setPerformanceViews('');
    setPerformanceConversionRates('');
    setPerformanceSalesData('');
    setComplianceCertifications([]);
    setComplianceRegulations([]);
    setAnalyticsCustomerBehavior([]);
    setAnalyticsRewards('');
    setAnalyticsAdvertising(false);
    setProductEcoFriendly(false);
    setProductGreenPoints('');
    setProductDiscount('');
    setProductStock('');
    setOldImageURLs([]);
    setNewImageURLs([]);
    setProductImages([]);
    setUploadedImages([]);
  };

  const handleEditProduct = (product) => {
    setSelectedProductId(product._id);
    const [category, subCategory] = product.category.split('/');
    setProductCategory(category);
    setActiveSubCategory(subCategory || '');
    setProductName(product.name);
    setProductPrice(product.price);
    setProductEcoFriendly(product.ecoFriendly);
    setProductGreenPoints(product.greenPoints);
    setProductDiscount(product.discount);
    setProductStock(product.stock);
    setOldImageURLs(product.images || []);
    setNewImageURLs([]);
    setProductImages([]);
    setProductWeight(product.weight);
    setProductDetails(product.description[0] || '');
    setProductSpecification(product.description[1] || '');
    setAboutTheBrand(product.description[2] || '');
    setAdditionalDetails(product.description[3] || '');
    setThirdPartySeller(product.thirdPartySeller || '');
    setDeliveryTracking(product.deliveryTracking || '');
    setAttributeSize(product.attributes?.size || '');
    setAttributeColor(product.attributes?.color || '');
    setAttributeMaterial(product.attributes?.material || '');
    setAttributeDimensions(product.attributes?.dimensions || '');
    setAttributeVariants(product.attributes?.variants || []);
    setAttributeKeywords(product.keywords || []);
    setShippingDimensions(product.shipping?.dimensions || '');
    setShippingOptionsStandard(product.shipping?.options?.standard || false);
    setShippingOptionsExpress(product.shipping?.options?.express || false);
    setShippingFulfillment(product.shipping?.fulfillment || '');
    setPerformanceViews(product.performance?.views || '');
    setPerformanceConversionRates(product.performance?.conversionRates || '');
    setPerformanceSalesData(product.performance?.salesData || '');
    setComplianceCertifications(product.compliance?.certifications || []);
    setComplianceRegulations(product.compliance?.regulations || []);
    setAnalyticsCustomerBehavior(product.analytics?.customerBehavior || []);
    setAnalyticsRewards(product.analytics?.rewards || '');
    setAnalyticsAdvertising(product.analytics?.advertising || false);
    setUploadMessage('');
    setProductUploadSuccess(false);
    setShowUploadContainer(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`https://recycle-backend-apao.onrender.com/api/products/${productId}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
  };

  const closeViewProduct = () => {
    setViewProduct(null);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setProductImages(newFiles);
    setUploadedImages(acceptedFiles);
    setImageUploadSuccess(false);
  };

  const removeImage = (index, isOld = false) => {
    if (isOld) {
      setOldImageURLs(prevURLs => prevURLs.filter((_, i) => i !== index));
    } else {
      setProductImages(prevImages => prevImages.filter((_, i) => i !== index));
      setUploadedImages(prevFiles => prevFiles.filter((_, i) => i !== index));
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
    setNewImageURLs(validUrls);
    setProductImages([]);
    setUploadedImages([]);
    setImageUploadSuccess(true);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFilterCategory(value);
    } else if (name === 'status') {
      setFilterStatus(value);
    } else if (name === 'stock') {
      setFilterStock(value);
    }
  };

  const getFilteredProducts = () => {
    const filtered = filteredProducts.filter((product) => {
      const matchesCategory = filterCategory === '' || product.category.includes(filterCategory);
      const matchesStatus = filterStatus === '' || (filterStatus === 'Available' ? product.stock > 0 : product.stock === 0);
      const matchesStock = filterStock === '' || (filterStock === 'In Stock' ? product.stock > 0 : product.stock === 0);
      return matchesCategory && matchesStatus && matchesStock;
    });
    const offset = currentPage * productsPerPage;
    return filtered.slice(offset, offset + productsPerPage);
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

  const searchBarStyle = {
    marginBottom: '20px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const dashboardStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px',
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

  const dashboardItemStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '14px',
    textAlign: 'center',
    width: '22%',
    backgroundColor: '#e7e7ff',
  };

  const filterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  };

  const filterSelectStyle = {
    width: '30%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };

  const productsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const productCardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '10px',
    backgroundColor: '#ffffff',
  };

  const productImageStyle = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px',
  };

  const productDetailsStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginRight: '10px',
  };

  const productTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '10px',
  };

  const productListStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    padding: '0',
    margin: '0',
    listStyleType: 'none',
  };

  const pagination = {
    display: 'flex',
    justifyContent: 'center',
    listStyleType: 'none',
    padding: '0',
  }
  
  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    listStyleType: 'none',
    padding: '0',
  }

  const paginationItemStyle = {
    display: 'inline',
    margin: '0 5px',
  };

  const paginationLinkStyle = {
    textDecoration: 'none',
    color: 'black',
    border: '1px solid #ddd',
    padding: '5px 10px',
    borderRadius: '4px',
  };

  const paginationActiveLinkStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: '1px solid #007bff',
  };
  

  const productListItemStyle = {
    marginRight: '20px',
  };

  const addButtonStyle = {
    marginLeft: '20px',
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  };

  const editButtonStyle = {
    padding: '5px 10px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const deleteButtonStyle = {
    padding: '5px 10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const viewButtonStyle = {
    padding: '5px 10px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
  };

  const modalStyle = {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '90%',
    height: '80%',
    overflow: 'auto',
    backgroundColor: 'white',
    position: 'fixed',
    top: '10%',
    left: '5%',
    zIndex: 1000,
  };

  const overlayStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  };

  const labelStyle1 = {
    margin: '20px',
    display: 'block',
    marginBottom: '10px',
  };

  const uploadInputStyle = {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const descriptionContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '20px',
  };


  const removeKeywordButtonStyle = {
    marginLeft: '10px',
    padding: '2px 5px',
    backgroundColor: 'whitesmoke',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  };


  
  const labelStyle = {
    margin: '20px',
    display: 'block',
    marginBottom: '10px',
  };

  const dragDropStyle = {
    border: '2px dashed #ccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px',
  };

  const previewContainerStyle = {
    margin: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '20px',
  };

  const imagePreviewContainerStyle = {
    marginBottom: '20px',
  };

  const imagePreviewStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const imageThumbnailStyle = {
    width: '50px',
    height: '50px',
    marginRight: '10px',
  };

  const removeImageButtonStyle = {
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '5px 10px',
  };

  const uploadButtonStyle = {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  };

  const checkIconStyle = {
    marginLeft: '10px',
    color: 'green',
  };

  const imageContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px',
  };

  const urlContainerStyle = {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '20px',
  };

  const addButtonStyle2 = {
    padding: '5px 10px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };
  
  const clearButtonStyle = {
    padding: '5px 10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };
  
  const addedKeywordsContainerStyle = {
    marginTop: '20px',
  };
  
  const addedKeywordsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
  };
  
  const keywordTagStyle = {
    padding: '5px 10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#333',
  };
  


  const productDetailsHeaderStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
    letterSpacing: '1.2px',
  };
  
  const upgradedProductListStyle = {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.8',
  };
  
  const upgradedImageContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    gap: '10px',
    flexWrap: 'wrap',
  };
  
  const upgradedProductImageStyle = {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  };
  

  const detailsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f4f4f9',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  };
  
  const detailCardStyle = {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    width: '30%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.5',
  };
  
  const upgradedCloseButtonStyle = {
    display: 'block',
    margin: '20px auto',
    padding: '12px 20px',
    backgroundColor: '#ff4757',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  };
  
  upgradedCloseButtonStyle[':hover'] = {
    backgroundColor: '#e84118',
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
          <input type="text" placeholder="Search..." style={searchBarStyle} />
          <div style={dashboardStyle}>
            <div style={dashboardItemStyle}>
              <h3>Website Sales</h3>
              <p>₹ 674,347.12</p>
              <p>21k orders</p>
            </div>
            <div style={dashboardItemStyle}>
              <h3>Discount</h3>
              <p>₹ 14,235.12</p>
              <p>6k orders</p>
            </div>
            <div style={dashboardItemStyle}>
              <h3>Affiliate</h3>
              <p>₹ 8,345.23</p>
              <p>150 orders</p>
            </div>
          </div>
          
          <div style={filterStyle}>
            <select name="status" value={filterStatus} onChange={handleFilterChange} style={{...filterSelectStyle,margin: '10px'}}>
              <option value="">Status</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
            <select name="category" value={filterCategory} onChange={handleFilterChange} style={{...filterSelectStyle,margin: '10px'}}>
              <option value="">Category</option>
              {[...new Set(filteredProducts.map(product => product.category.split('/')[0]))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select name="stock" value={filterStock} onChange={handleFilterChange} style={{...filterSelectStyle,margin: '10px'}}>
              <option value="">Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <button
                    style={addButtonStyle}
                    onClick={() => {
                    setShowUploadContainer(true);
                    resetForm();
                    }}
                >
                    Add Product
            </button>
          </div>
          <div style={productsContainerStyle}>
            {getFilteredProducts().map((product) => (
              <div
                key={product._id}
                style={productCardStyle}
              >
                <div style={productDetailsStyle}>
                  <img src={product.images[0]} alt={product.name} style={productImageStyle} />
                  <h4 style={productTitleStyle}>{product.name}</h4>
                  <ul style={productListStyle}>
                    <li style={productListItemStyle}>Category: {product.category}</li>
                    <li style={productListItemStyle}>Price: ₹ {product.price}</li>
                    <li style={productListItemStyle}>Stock: {product.stock}</li>
                  </ul>
                </div>
                <div>
                  <button onClick={() => handleViewProduct(product)} style={viewButtonStyle}>View</button>
                  <button onClick={() => handleEditProduct(product)} style={editButtonStyle}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product._id)} style={deleteButtonStyle}>Delete</button>
                </div>
              </div>
            ))}
          </div>
                    <ReactPaginate
                    previousLabel={'Previous'}
                    nextLabel={'Next'}
                    breakLabel={'...'}
                    pageCount={Math.ceil(filteredProducts.length / productsPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                    pageClassName={paginationItemStyle}
                    pageLinkClassName={paginationLinkStyle}
                    activeLinkClassName={paginationActiveLinkStyle}
                    previousClassName={paginationItemStyle}
                    nextClassName={paginationItemStyle}
                    previousLinkClassName={paginationLinkStyle}
                    nextLinkClassName={paginationLinkStyle}
                    breakClassName={paginationItemStyle}
                    breakLinkClassName={paginationLinkStyle}
                />


          {(viewProduct || showUploadContainer) && (
            <>
              <div style={overlayStyle} onClick={() => {
                setViewProduct(null);
                setShowUploadContainer(false);
              }}></div>
              <div style={modalStyle}>
                {viewProduct && (
                  <>
                    <h3 style={productDetailsHeaderStyle}>Product Details</h3>
                    <div style={detailsContainerStyle}>
                            <div style={detailCardStyle}>
                              <strong>Name:</strong> {viewProduct.name}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Category:</strong> {viewProduct.category}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Price:</strong> ₹ {viewProduct.price}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Eco-Friendly:</strong> {viewProduct.ecoFriendly ? 'Yes' : 'No'}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Green Points:</strong> {viewProduct.greenPoints}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Discount:</strong> {viewProduct.discount}%
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Stock:</strong> {viewProduct.stock}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Weight:</strong> {viewProduct.weight}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Third-Party Seller:</strong> {viewProduct.thirdPartySeller}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Delivery Tracking:</strong> {viewProduct.deliveryTracking}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Views:</strong> {viewProduct.performance?.views || 0}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Conversion Rates:</strong> {viewProduct.performance?.conversionRates || 0}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Sales Data:</strong> {viewProduct.performance?.salesData || 0}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Product Details:</strong> {viewProduct.description[0]}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Product Specification:</strong> {viewProduct.description[1]}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>About the Brand:</strong> {viewProduct.description[2]}
                            </div>
                            <div style={detailCardStyle}>
                              <strong>Additional Details:</strong> {viewProduct.description[3]}
                            </div>
                          </div>

                      <div style={upgradedImageContainerStyle}>
                        {viewProduct.images.map((img, index) => (
                          <img key={index} src={img} alt={viewProduct.name} style={upgradedProductImageStyle} />
                        ))}
                      </div>
                      <button onClick={() => setViewProduct(null)} style={upgradedCloseButtonStyle}>Close</button>
                  </>
          )}

          {showUploadContainer && (
            <>
              <div style={overlayStyle} onClick={() => setShowUploadContainer(false)}></div>
              <div style={modalStyle}>
                <h4>Product Information</h4>
                <div style={descriptionContainerStyle}>
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
                </div>
                <h4>Description</h4>
                <div style={descriptionContainerStyle}>
                  
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
                <h4>Attributes</h4>
                <div style={descriptionContainerStyle}>
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

                      <label style={labelStyle}>
                            Keywords (comma-separated):
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="text"
                                placeholder="Enter keywords"
                                value={keywordInput} 
                                onChange={(e) => setKeywordInput(e.target.value)} 
                                style={{ ...uploadInputStyle, width: '200px' }}
                              />
                              <button
                                style={addButtonStyle}
                                onClick={() => {
                                  const inputKeywords = keywordInput.split(',').map(kw => kw.trim()).filter(kw => kw); // Split and trim input
                                  const newKeywords = [...attributeKeywords, ...inputKeywords].filter((kw, index, self) => self.indexOf(kw) === index); // Remove duplicates
                                  setAttributeKeywords(newKeywords); 
                                  setKeywordInput('');
                                }}
                              >
                                Add
                              </button>
                              <button
                                style={clearButtonStyle}
                                onClick={() => setAttributeKeywords([])}
                              >
                                Clear
                              </button>
                            </div>
                          </label>

                          <div style={addedKeywordsContainerStyle}>
                              <h4>Added Keywords:</h4>
                              <div style={addedKeywordsStyle}>
                                {attributeKeywords.length > 0 ? (
                                  attributeKeywords.map((keyword, index) => (
                                    <div key={index} style={keywordTagStyle}>
                                      {keyword}
                                      <button
                                        style={removeKeywordButtonStyle}
                                        onClick={() => {
                                          const updatedKeywords = attributeKeywords.filter((_, i) => i !== index);
                                          setAttributeKeywords(updatedKeywords);
                                        }}
                                      >
                                        ❌
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p>No keywords added.</p>
                                )}
                              </div>
                            </div>
                    </div>

                <h4>Shipping</h4>
                <div style={descriptionContainerStyle}>
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
                <h4>Compliance</h4>
                <div style={descriptionContainerStyle}>
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
              </div>
            </>
          )}
          </div>
        </>
      )}
 
        </div>
      </div>
    </div>
  );
};

export default ProductList;