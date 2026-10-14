import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, Link, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { getAllProducts, searchProducts } from "../services/productService";
import { getCategoryById, getAllCategories } from "../services/categoryService";
import CartService from "../services/cartService";
import { Container, Row, Col, Card, Spinner, Alert, Breadcrumb, Toast, Button, Form, Badge } from "react-bootstrap";
import AddToCartButton from "../components/AddToCartButton";
import { FaHeart, FaRegHeart, FaCheck, FaFilter, FaTimes } from "react-icons/fa";
import { addToWishlist, getWishlistByUser, removeProductFromWishlist } from "../services/wishlistService";

const ViewAllPage = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setCartCount } = useOutletContext();
  
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState(sessionStorage.getItem("guestSessionId") || null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [subCategoryFilter, setSubCategoryFilter] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    rating: '',
    sortBy: 'relevant'
  });

  // Initialize guest session if needed
  useEffect(() => {
    const initializeGuestSession = async () => {
      if (!sessionStorage.getItem("jwtToken") && !sessionStorage.getItem("guestSessionId")) {
        try {
          const newSessionId = await CartService.createNewSession();
          sessionStorage.setItem("guestSessionId", newSessionId);
          setSessionId(newSessionId);
        } catch (error) {
          console.error("Failed to create guest session:", error);
        }
      }
    };
    initializeGuestSession();
  }, []);

  useEffect(() => {
    if (location.state?.subCategoryFilter) {
      setSubCategoryFilter(location.state.subCategoryFilter);
    }
  }, [location.state]);

  // Fetch all products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const searchQuery = searchParams.get('search');
        const [productsData, categories] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        
        // Filter out inactive products
        const activeProducts = productsData.filter(product => product.status === "Active");
        setAllProducts(activeProducts);
        setAllCategories(categories);

        if (categoryId) {
          const categoryData = await getCategoryById(categoryId);
          setCategory(categoryData);
          
          // Initial filter by category and subcategory if present
          const filtered = activeProducts.filter(p => 
            String(p.categoryId) === String(categoryId) &&
            (!subCategoryFilter || p.subCategory === subCategoryFilter)
          );
          setDisplayedProducts(filtered);
        } else if (searchQuery) {
          const filtered = activeProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setDisplayedProducts(filtered);
          setCategory({ 
            name: `Search Results for "${searchQuery}"`,
            id: 'search'
          });
        } else {
          setDisplayedProducts(activeProducts);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, searchParams, subCategoryFilter]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let result = [...displayedProducts];
    
    // Apply price filters
    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }
    
    // Apply rating filter
    if (filters.rating) {
      result = result.filter(p => p.rating >= Number(filters.rating));
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        // Default sorting (relevant)
        break;
    }
    
    return result;
  }, [displayedProducts, filters]);

  // Fetch cart items and update count
  const fetchCart = async () => {
    try {
      let cart = [];
      if (sessionStorage.getItem("jwtToken")) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        cart = await CartService.getCartByUserId(user.id);
      } else if (sessionStorage.getItem("guestSessionId")) {
        cart = await CartService.getGuestCart(sessionStorage.getItem("guestSessionId"));
      }
      
      setCartItems(cart);
      if (setCartCount) {
        const totalQuantity = cart.reduce((acc, item) => acc + (item.productQuantity || 0), 0);
        setCartCount(totalQuantity);
      }
      
      const qtyMap = {};
      cart.forEach((item) => {
        qtyMap[item.productId] = item.productQuantity;
      });
      setQuantities(qtyMap);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

  // Fetch wishlist for logged-in users
  useEffect(() => {
    const fetchWishlist = async () => {
      if (sessionStorage.getItem("jwtToken")) {
        try {
          const user = JSON.parse(sessionStorage.getItem("user"));
          const wishlist = await getWishlistByUser(user.id);
          setWishlistItems(wishlist);
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    };
    fetchWishlist();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const isLoggedIn = () =>
    !!sessionStorage.getItem("jwtToken") || !!sessionStorage.getItem("guestSessionId");

  // Toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const handleWishlistClick = async (productId) => {
    if (!isLoggedIn()) {
      showToastMessage("Please login to add items to your wishlist");
      navigate("/signin");
      return;
    }

    const user = JSON.parse(sessionStorage.getItem("user"));
    try {
      if (isInWishlist(productId)) {
        await removeProductFromWishlist(user.id, productId);
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        showToastMessage("Removed from wishlist");
      } else {
        const wishlistRequestDTO = {
          userId: user.id,
          productId: productId
        };
        const addedItem = await addToWishlist(wishlistRequestDTO);
        setWishlistItems(prev => [...prev, addedItem]);
        showToastMessage("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showToastMessage(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      category: '',
      rating: '',
      sortBy: 'relevant'
    });
    setSubCategoryFilter(null);
  };

  // Clear just the subcategory filter
  const clearSubCategoryFilter = () => {
    setSubCategoryFilter(null);
    navigate(`/category/${categoryId}`, { replace: true });
  };

  // Cart functions
  const handleAddToCart = async (productId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) {
      showToastMessage("Product not found");
      return;
    }

    if (product.quantity <= 0) {
      showToastMessage("This product is out of stock");
      return;
    }

    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const guestSessionId = sessionStorage.getItem("guestSessionId");

      const existingItem = cartItems.find(item => item.productId === productId);

      if (existingItem) {
        await handleQuantityChange(productId, 1);
        return;
      }

      if (user) {
        const cartDTO = { 
          userId: user.id, 
          productId: product.id, 
          productQuantity: 1 
        };
        await CartService.addToCart(cartDTO);
      } else {
        if (!guestSessionId) {
          const newSessionId = await CartService.createNewSession();
          sessionStorage.setItem("guestSessionId", newSessionId);
          setSessionId(newSessionId);
        }
        const cartDTO = { 
          productId: product.id, 
          productQuantity: 1 
        };
        await CartService.addToCart(cartDTO, guestSessionId || sessionId);
      }
      showToastMessage("An item has been added to your cart successfully");
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));

      let updatedCart = [];
      if (user) {
        updatedCart = await CartService.getCartByUserId(user.id);
      } else if (guestSessionId || sessionId) {
        updatedCart = await CartService.getGuestCart(guestSessionId || sessionId);
      }

      setCartItems(updatedCart);
      const totalQuantity = updatedCart.reduce((acc, item) => acc + (item.productQuantity || 0), 0);
      setCartCount(totalQuantity);
    } catch (err) {
      showToastMessage("Failed to add to cart");
      console.error("Error adding to cart:", err);
      if (err.response?.status === 500) {
        const existingItem = cartItems.find(item => item.productId === productId);
        if (existingItem) {
          await handleQuantityChange(productId, 1);
        }
      }
    }
  };

  const handleQuantityChange = async (productId, change) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const guestSessionId = sessionStorage.getItem("guestSessionId");
    const cartItem = cartItems.find((item) => item.productId === productId);
    if (!cartItem) return;

    const newQuantity = (quantities[productId] || 1) + change;

    if (newQuantity < 1) {
      try {
        if (user) {
          await CartService.removeFromCart(cartItem.id);
        } else {
          await CartService.removeFromCart(cartItem.id, guestSessionId || sessionId);
        }

        setQuantities((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });

        let updatedCart = [];
        if (user) {
          updatedCart = await CartService.getCartByUserId(user.id);
        } else if (guestSessionId || sessionId) {
          updatedCart = await CartService.getGuestCart(guestSessionId || sessionId);
        }

        setCartItems(updatedCart);
        if (setCartCount) {
          const totalQuantity = updatedCart.reduce((acc, item) => acc + (item.productQuantity || 0), 0);
          setCartCount(totalQuantity);
        }
      } catch (err) {
        console.error("Error removing from cart:", err);  
      }
      return;
    }

    try {
      if (user) {
        await CartService.updateCartItem(cartItem.id, newQuantity);
      } else {
        await CartService.updateCartItem(cartItem.id, newQuantity, guestSessionId || sessionId);
      }

      setQuantities((prev) => ({ ...prev, [productId]: newQuantity }));

      let updatedCart = [];
      if (user) {
        updatedCart = await CartService.getCartByUserId(user.id);
      } else if (guestSessionId || sessionId) {
        updatedCart = await CartService.getGuestCart(guestSessionId || sessionId);
      }

      setCartItems(updatedCart);
      if (setCartCount) {
        const totalQuantity = updatedCart.reduce((acc, item) => acc + (item.productQuantity || 0), 0);
        setCartCount(totalQuantity);
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const cartItem = cartItems.find(item => item.productId === productId);
    if (cartItem) {
      await handleQuantityChange(productId, -quantities[productId]);
      showToastMessage("Removed from cart");
    }
  };

  return (
    <>
      <style>{`
        .product-col.mb-4.mb-0 {
          margin-bottom: 0 !important;
        }
        .no-extra-padding {
          padding-bottom: 0 !important;
        }
        .custom-breadcrumb {
          color: #28a745 !important;
          text-decoration: underline !important;
          text-decoration-color: #28a745 !important;
          font-weight: 500;
        }
        .custom-breadcrumb:hover {
          color: #218838 !important;
          text-decoration-thickness: 2px !important;
        }
        .filter-section {
          transition: all 0.3s ease;
        }
        .subcategory-badge {
          font-size: 0.9rem;
          padding: 0.35em 0.65em;
        }
        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .out-of-stock-badge {
          position: absolute;
          top: 10px;
          left: 0;
          width: 100%;
          background-color: rgba(220, 53, 69, 0.9);
          color: white;
          text-align: center;
          padding: 3px 0;
          font-size: 0.8rem;
          z-index: 1;
        }
        .card-img-overlay {
          background-color: rgba(0,0,0,0.03);
        }
        @media (max-width: 576px) {
          .product-card {
            max-width: 100%;
          }
          .card-img {
            height: 160px !important;
          }
        }
      `}</style>

      {/* Toast Notification with blur effect */}
      {showToast && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(2px)',
              zIndex: 9998,
              transition: 'opacity 0.3s ease'
            }}
          />
          <div 
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #28a745',
              color: '#28a745',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            {/* <FaCheck style={{ fontSize: '1.2rem' }} /> */}
            <span style={{ fontWeight: '500' }}>{toastMessage}</span>
          </div>
        </>
      )}

      <div className="d-flex flex-column min-vh-100">
        <Container fluid className="flex-grow-1 pt-2 pb-0 no-extra-padding">
          {/* Filters Section */}
          <div className="mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowFilters(!showFilters)}
              className="d-md-none mb-2"
            >
              {showFilters ? <FaTimes className="me-1" /> : <FaFilter className="me-1" />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <div className={`filter-section ${showFilters ? 'd-block' : 'd-none d-md-block'} bg-light p-3 rounded`}>
              <h5 className="d-flex justify-content-between align-items-center">
                <span>Filters</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={resetFilters}
                  className="text-danger"
                >
                  Reset All
                </Button>
              </h5>
              
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Price Range</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                      <span className="mx-2">-</span>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                {!categoryId && (
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Categories</option>
                        {allCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
                
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Minimum Rating</Form.Label>
                    <Form.Select
                      name="rating"
                      value={filters.rating}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Star</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Sort By</Form.Label>
                    <Form.Select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest Arrivals</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>

          {/* Breadcrumb and Title */}
          <Breadcrumb>
            <Breadcrumb.Item
              linkAs={Link}
              linkProps={{ to: "/" }}
              className="custom-breadcrumb"
            >
              Home
            </Breadcrumb.Item>
            {category && (
              <Breadcrumb.Item active>
                {category.name}
                {subCategoryFilter && `: ${subCategoryFilter}`}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>

          {category && (
            <h2 className="text-success mb-4">
              {category.name}
              {subCategoryFilter && (
                <span className="text-muted">: {subCategoryFilter}</span>
              )}
            </h2>
          )}

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="success" />
              <p className="mt-3">Loading products...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center mt-5">
              Error: {error}
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-muted my-4">
              <p>No products found matching your criteria.</p>
              <Button variant="outline-success" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <Row className="gx-3 gy-4">
              {filteredProducts.map((product, index) => {
                const isLastRows = index >= filteredProducts.length - 2;
                const isOutOfStock = product.quantity <= 0;
                
                return (
                  <Col
                    key={product.id}
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    className={`mb-3 product-col ${isLastRows ? "mb-0" : ""}`}
                  >
                    <Card className="h-100 shadow-sm product-card">
                      <div className="position-relative">
                        {isOutOfStock && (
                          <div className="out-of-stock-badge">
                            Out of Stock
                          </div>
                        )}
                        <Card.Img
                          variant="top"
                          src={product.imageUrls?.[0] || "/placeholder-product.jpg"}
                          onClick={() => handleProductClick(product.id)}
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            cursor: "pointer",
                            opacity: isOutOfStock ? 0.7 : 1
                          }}
                          className="border-bottom card-img"
                        />
                      </div>
                      <Card.Body className="d-flex flex-column p-2">
                        <Card.Title 
                          className="fs-6 text-truncate" 
                          title={product.name}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleProductClick(product.id)}
                        >
                          {product.name}
                        </Card.Title>
                        <Card.Text className="text-muted small mb-1">
                          {product.subCategory}
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Card.Text className="fw-bold text-success mb-0">
                            ${product.price.toFixed(2)}
                          </Card.Text>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={e => {
                              e.stopPropagation();
                              handleWishlistClick(product.id);
                            }}
                          >
                            {isInWishlist(product.id) ? (
                              <FaHeart className="text-danger" size={20} />
                            ) : (
                              <FaRegHeart className="text-secondary" size={20} />
                            )}
                          </Button>
                        </div>
                        <AddToCartButton
                          productId={product.id}
                          quantity={quantities[product.id] || 0}
                          stock={product.quantity}
                          isLoggedIn={isLoggedIn}
                          onAddToCart={handleAddToCart}
                          onQuantityChange={handleQuantityChange}
                          onRemoveFromCart={handleRemoveFromCart}
                          showCartButtons={true}
                          size="sm"
                          disabled={isOutOfStock}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default ViewAllPage;