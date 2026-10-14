import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaArrowRight, FaArrowLeft, FaHeart, FaRegHeart, FaCheck } from "react-icons/fa";
import { getAllProducts, getAllProductsBySubCategory } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import CartService from "../services/cartService";
import { addToWishlist, getWishlistByUser, removeProductFromWishlist } from "../services/wishlistService";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import AddToCartButton from "./AddToCartButton";

const ProductSection = () => {
  const { setCartCount } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [screenLimit, setScreenLimit] = useState(4);
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const scrollRefs = useRef({});

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
    const updateLimit = () => {
      const width = window.innerWidth;
      if (width < 576) setScreenLimit(2);
      else if (width < 768) setScreenLimit(3);
      else if (width < 992) setScreenLimit(4);
      else setScreenLimit(6);
    };
    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCartAndWishlist = async () => {
      try {
        let cart = [];
        if (sessionStorage.getItem("jwtToken")) {
          const user = JSON.parse(sessionStorage.getItem("user"));
          cart = await CartService.getCartByUserId(user.id);
          
          try {
            const wishlist = await getWishlistByUser(user.id);
            setWishlistItems(wishlist);
          } catch (wishlistError) {
            console.error("Error fetching wishlist:", wishlistError);
          }
        } else if (sessionStorage.getItem("guestSessionId")) {
          try {
            cart = await CartService.getGuestCart(sessionStorage.getItem("guestSessionId"));
          } catch (cartError) {
            console.error("Error fetching guest cart:", cartError);
          }
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
        console.error("Error in fetchCartAndWishlist:", err);
      }
    };
    fetchCartAndWishlist();
  }, [setCartCount]);

  const isLoggedIn = () => !!sessionStorage.getItem("jwtToken");

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

  const handleAddToCartClick = async (productId) => {
    const product = products.find((p) => p.id === productId);
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

      await refreshCartAndQuantities();
      showToastMessage("An item has been added to your cart successfully");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToastMessage("Failed to add to cart");
    }
  };

  const handleQuantityChange = async (productId, change) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const guestSessionId = sessionStorage.getItem("guestSessionId");
    const cartItem = cartItems.find((item) => item.productId === productId);
    if (!cartItem) return;

    const newQuantity = (quantities[productId] || cartItem.productQuantity || 1) + change;

    if (newQuantity < 1) {
      try {
        if (user) {
          await CartService.removeFromCart(cartItem.id);
        } else {
          await CartService.removeFromCart(cartItem.id, guestSessionId || sessionId);
        }
        await refreshCartAndQuantities();
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
      await refreshCartAndQuantities();
    } catch (err) {
      console.error("Error updating cart item:", err);
    }
  };

  const refreshCartAndQuantities = async () => {
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
      console.error("Error refreshing cart:", err);
    }
  };

  const groupProductsBySubCategory = () => {
    return categories.flatMap((category) => {
      return category.subCategories.map((subCategory) => {
        const subCategoryProducts = products.filter(
          (product) => 
            product.categoryId === category.id && 
            product.subCategory === subCategory &&
            product.status === "Active" // Only show active products
        );
        
        return {
          id: `${category.id}-${subCategory}`,
          categoryId: category.id,
          categoryName: category.name,
          subCategory: subCategory,
          products: subCategoryProducts,
          visibleCount: Math.min(screenLimit, subCategoryProducts.length),
          totalCount: subCategoryProducts.length
        };
      }).filter(group => group.products.length > 0);
    });
  };

  const scrollProducts = (subCategoryId, direction) => {
    const container = scrollRefs.current[subCategoryId];
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const groupedBySubCategory = groupProductsBySubCategory();

  return (
    <Container fluid className="px-0 bg-white">
      <style>
        {`
          .product-row-container {
            overflow-x: auto;
            scroll-behavior: smooth;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 10px;
          }
          .product-row-container::-webkit-scrollbar {
            display: none;
          }
          .scroll-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2;
            background: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: none;
            opacity: 0.9;
            transition: all 0.3s ease;
          }
          .scroll-arrow:hover {
            background: #f8f9fa;
            transform: translateY(-50%) scale(1.1);
          }
          .scroll-arrow.left {
            left: 0;
          }
          .scroll-arrow.right {
            right: 0;
          }
          .product-card {
            transition: transform 0.3s ease;
          }
          .product-card:hover {
            transform: translateY(-5px);
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
          .inactive-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.1);
            z-index: 1;
            pointer-events: none;
          }
          @media (max-width: 768px) {
            .scroll-arrow {
              display: none;
            }
          }
        `}
      </style>

      {/* Toast Notification */}
      {showToast && (
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
            backgroundColor: 'rgba(40, 167, 69, 0.9)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {/* <FaCheck style={{ fontSize: '1.2rem' }} /> */}
          <span style={{ fontWeight: '500' }}>{toastMessage}</span>
        </div>
      )}

      {groupedBySubCategory.map((group) => (
        <div key={group.id} className="m-0 px-3 p-3 position-relative">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="text-success mb-0">{group.subCategory}</h4>
            </div>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => navigate(`/category/${group.categoryId}`, {
                state: { subCategoryFilter: group.subCategory }
              })}
              className="d-flex align-items-center"
            >
              View All <FaArrowRight className="ms-2" />
            </Button>
          </div>

          <div className="position-relative">
            {group.totalCount > group.visibleCount && (
              <>
                <button 
                  className="scroll-arrow left d-none d-md-flex"
                  onClick={() => scrollProducts(group.id, 'left')}
                >
                  <FaArrowLeft />
                </button>
                <button 
                  className="scroll-arrow right d-none d-md-flex"
                  onClick={() => scrollProducts(group.id, 'right')}
                >
                  <FaArrowRight />
                </button>
              </>
            )}

            <div 
              ref={(el) => (scrollRefs.current[group.id] = el)}
              className="product-row-container"
            >
              <div className="d-flex" style={{ gap: '1rem' }}>
                {group.products.map((product) => (
                  <div 
                    key={product.id}
                    className="flex-shrink-0 position-relative"
                    style={{ width: '200px' }}
                  >
                    {/* Out of Stock Badge */}
                    {product.quantity <= 0 && (
                      <div className="out-of-stock-badge">
                        Out of Stock
                      </div>
                    )}

                    <Card className="h-100 shadow-sm product-card">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={product.imageUrls?.[0] || '/placeholder-product.jpg'}
                          onClick={() => navigate(`/product/${product.id}`)}
                          style={{
                            height: "180px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          className="border-bottom"
                        />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title 
                          className="fs-6 mb-1 text-truncate"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </Card.Title>
                         <p className="fs-11 mb-1 text-truncate">Quantity: {product.quantityType}</p>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Card.Text className="fw-bold text-success mb-0">
                            ${product.price.toFixed(2)}
                          </Card.Text>
                          <Button 
                            variant="link" 
                            className="p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlistClick(product.id);
                            }}
                          >
                            {isInWishlist(product.id) ? (
                              <FaHeart className="text-danger" size={18} />
                            ) : (
                              <FaRegHeart className="text-secondary" size={18} />
                            )}
                          </Button>
                        </div>

                        <AddToCartButton
                          productId={product.id}
                          quantity={quantities[product.id] || 0}
                          stock={product.quantity}
                          isLoggedIn={isLoggedIn}
                          onAddToCart={handleAddToCartClick}
                          onQuantityChange={handleQuantityChange}
                          onRemoveFromCart={(productId) => {
                            const cartItem = cartItems.find(item => item.productId === productId);
                            if (cartItem) {
                              handleQuantityChange(productId, -quantities[product.id]);
                              showToastMessage("Removed from cart");
                            }
                          }}
                          showCartButtons={true}
                          size="sm"
                          disabled={product.quantity <= 0}
                        />
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default ProductSection;