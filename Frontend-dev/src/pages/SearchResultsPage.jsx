import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { searchProducts } from "../services/productService";
import CartService from "../services/cartService";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Spinner, 
  Alert, 
  Breadcrumb,
  Button,
  Badge
} from "react-bootstrap";
import AddToCartButton from "../components/AddToCartButton";

const SearchResultsPage = ({ setCartCount }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    setSearchQuery(query || '');

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (query && query.trim().length > 0) {
          const productsData = await searchProducts(query.trim());
          setProducts(productsData);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.search]);

  // Initialize cart quantities and items
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isLoggedIn()) {
        setQuantities({});
        setCartCount(0);
        return;
      }
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const cart = await CartService.getCartByUserId(user.id);
        setCartItems(cart);
        
        const initialQuantities = {};
        cart.forEach(item => {
          initialQuantities[item.productId] = item.productQuantity;
        });
        setQuantities(initialQuantities);
        setCartCount(cart.length);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCartItems();
  }, [setCartCount]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const isLoggedIn = () => !!sessionStorage.getItem("jwtToken");

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn()) return navigate("/signin");
    const user = JSON.parse(sessionStorage.getItem("user"));
    const product = products.find((p) => p.id === productId);
    if (!product) return alert("Product not found");

    const cartDTO = {
      userId: user.id,
      productId: product.id,
      productQuantity: 1,
    };

    try {
      await CartService.addToCart(cartDTO);
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
      const updatedCart = await CartService.getCartByUserId(user.id);
      setCartItems(updatedCart);
      setCartCount(updatedCart.length);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleQuantityChange = async (productId, change) => {
    if (!isLoggedIn()) return navigate("/signin");
    const user = JSON.parse(sessionStorage.getItem("user"));
    const cartItem = cartItems.find((item) => item.productId === productId);
    if (!cartItem) return;

    const newQuantity = (quantities[productId] || 0) + change;
    
    if (newQuantity < 1) {
      try {
        await CartService.removeFromCart(cartItem.id);
        setQuantities((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        const updatedCart = await CartService.getCartByUserId(user.id);
        setCartItems(updatedCart);
        setCartCount(updatedCart.length);
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
      return;
    }

    try {
      await CartService.updateCartItem(cartItem.id, newQuantity);
      setQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
      const updatedCart = await CartService.getCartByUserId(user.id);
      setCartItems(updatedCart);
      setCartCount(updatedCart.length);
    } catch (err) {
      console.error("Error updating cart item:", err);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!isLoggedIn()) return navigate("/signin");
    const user = JSON.parse(sessionStorage.getItem("user"));
    const cartItem = cartItems.find((item) => item.productId === productId);
    if (!cartItem) return;

    try {
      await CartService.removeFromCart(cartItem.id);
      setQuantities((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
      const updatedCart = await CartService.getCartByUserId(user.id);
      setCartItems(updatedCart);
      setCartCount(updatedCart.length);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
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
      `}</style>

      <Container className="flex-grow-1 pt-3 pb-0 no-extra-padding">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-3">Searching products...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center mt-5">
            Error: {error}
            <Button variant="link" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Alert>
        ) : (
          <>
            <Breadcrumb>
              <Breadcrumb.Item
                linkAs={Link}
                linkProps={{ to: "/" }}
                className="custom-breadcrumb"
              >
                Home
              </Breadcrumb.Item>
              <Breadcrumb.Item active>
                Search Results
              </Breadcrumb.Item>
            </Breadcrumb>

            <h2 className="text-success mb-4">
              {products.length > 0 
                ? `Found ${products.length} results for "${searchQuery}"`
                : `No results found for "${searchQuery}"`}
            </h2>

            {products.length === 0 && !loading ? (
              <div className="text-center text-muted my-4">
                <p>No products match your search criteria.</p>
                <Button variant="success" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <Row>
                {products.map((product, index) => {
                  const isLastRows = index >= products.length - 2;
                  return (
                    <Col
                      key={product.id}
                      xs={6}
                      sm={4}
                      md={3}
                      lg={2}
                      className={`product-col mb-4 ${isLastRows ? "mb-0" : ""}`}
                    >
                      <Card className="h-100">
                        <div
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ height: "150px", cursor: "pointer" }}
                          onClick={() => handleProductClick(product.id)}
                        >
                          <Card.Img
                            variant="top"
                            src={
                              product.imageUrls?.[0] ||
                              "/placeholder-product.jpg"
                            }
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title
                            className="text-truncate"
                            title={product.name}
                          >
                            {product.name}
                          </Card.Title>
                          <Card.Text className="text-success font-weight-bold">
                            ${product.price.toFixed(2)}
                          </Card.Text>

                          <AddToCartButton
                            productId={product.id}
                            quantity={quantities[product.id] || 0}
                            isLoggedIn={isLoggedIn}
                            onAddToCart={handleAddToCart}
                            onQuantityChange={handleQuantityChange}
                            onRemoveFromCart={handleRemoveFromCart}
                            showCartButtons={true}
                            size="sm"
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default SearchResultsPage;