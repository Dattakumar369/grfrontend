import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartService from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";
import { getProductById } from "../services/productService";
import { FaPlus, FaMinus, FaTrash, FaInfoCircle } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Image,
  Breadcrumb,
  Modal,
  Spinner,
  Alert,
  Badge,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isGuestCart, setIsGuestCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom styles
  const styles = {
    card: {
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      border: "none",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
      }
    },
    quantityControl: {
      border: "1px solid #dee2e6",
      borderRadius: "8px",
      padding: "0.25rem",
      display: "inline-flex",
      alignItems: "center"
    },
    summaryCard: {
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      border: "none",
      position: "sticky",
      top: "20px"
    },
    productImage: {
      width: "100px",
      height: "100px",
      objectFit: "cover",
      borderRadius: "8px"
    },
    removeBtn: {
      color: "#dc3545",
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline"
      }
    },
    priceHighlight: {
      color: "#28a745",
      fontWeight: "600"
    },
    discountBadge: {
      backgroundColor: "#ffc107",
      color: "#212529",
      fontSize: "0.75rem",
      marginLeft: "0.5rem"
    }
  };

  const isLoggedIn = () => {
    const jwt = sessionStorage.getItem("jwtToken");
    return !!jwt;
  };

  useEffect(() => {
    initializeCart();
  }, []);

  useEffect(() => {
    if (isLoggedIn() && sessionStorage.getItem("guestSessionId") && !isMerging) {
      handleMergeAfterLogin();
    }
  }, [isLoggedIn()]);

  const initializeCart = async () => {
    setLoading(true);
    setMergeError(null);
    try {
      if (isLoggedIn()) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        await fetchUserCart(user.id);
        setIsGuestCart(false);
      } else {
        let guestSessionId = sessionStorage.getItem("guestSessionId");
        if (!guestSessionId) {
          guestSessionId = await CartService.createNewSession();
          sessionStorage.setItem("guestSessionId", guestSessionId);
        }
        await fetchGuestCart(guestSessionId);
        setIsGuestCart(true);
      }
    } catch (err) {
      setMergeError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCart = async (userId) => {
    const cartData = await CartService.getCartByUserId(userId);
    setCartItems(await enrichCartItems(cartData));
  };

  const fetchGuestCart = async (sessionId) => {
    const cartData = await CartService.getGuestCart(sessionId);
    setCartItems(await enrichCartItems(cartData));
  };

  const enrichCartItems = async (cartData) => {
    return await Promise.all(
      cartData.map(async (item) => {
        try {
          const product = await getProductById(item.productId);
          return { ...item, product };
        } catch {
          return { ...item, product: null };
        }
      })
    );
  };

  const updateQuantity = async (cartId, newQty) => {
    if (newQty < 1) return;
    try {
      if (isLoggedIn()) {
        await CartService.updateCartItem(cartId, newQty);
        const user = JSON.parse(sessionStorage.getItem("user"));
        fetchUserCart(user.id);
      } else {
        const guestSessionId = sessionStorage.getItem("guestSessionId");
        await CartService.updateCartItem(cartId, newQty, guestSessionId);
        fetchGuestCart(guestSessionId);
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const removeItem = async (cartId) => {
    try {
      if (isLoggedIn()) {
        await CartService.removeFromCart(cartId);
        const user = JSON.parse(sessionStorage.getItem("user"));
        fetchUserCart(user.id);
      } else {
        const guestSessionId = sessionStorage.getItem("guestSessionId");
        await CartService.removeFromCart(cartId, guestSessionId);
        fetchGuestCart(guestSessionId);
      }
      setSelectedItems((prev) => prev.filter((id) => id !== cartId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const clearSelected = async () => {
    try {
      if (isLoggedIn()) {
        await Promise.all(selectedItems.map((id) => CartService.removeFromCart(id)));
        const user = JSON.parse(sessionStorage.getItem("user"));
        fetchUserCart(user.id);
      } else {
        const guestSessionId = sessionStorage.getItem("guestSessionId");
        await Promise.all(selectedItems.map((id) => CartService.removeFromCart(id, guestSessionId)));
        fetchGuestCart(guestSessionId);
      }
      setSelectedItems([]);
    } catch (err) {
      console.error("Failed to clear selected items:", err);
    }
  };

  const handleSelect = (cartItemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(cartItemId)
        ? prevSelected.filter((id) => id !== cartItemId)
        : [...prevSelected, cartItemId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const selectedCartItems = cartItems.filter(
    (item) =>
      selectedItems.includes(item.id) &&
      item.product &&
      typeof item.product.price === "number"
  );

  const { itemTotal,finalAmount } = useMemo(() => {
    const itemTotal = selectedCartItems.reduce(
      (acc, item) => acc + item.product.price * item.productQuantity,
      0
    );
    // const discount = itemTotal * 0.15; // 15% discount
    // const tax = (itemTotal - discount) * 0.18; // 18% tax on discounted amount
    const finalAmount = itemTotal 
    return { itemTotal, finalAmount };
  }, [selectedCartItems]);

  const handleProceedToCheckout = async () => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    const guestSessionId = sessionStorage.getItem("guestSessionId");
    if (guestSessionId) {
      await handleMergeAfterLogin();
    } else {
      proceedToCheckout();
    }
  };

  const handleMergeAfterLogin = async () => {
    setIsMerging(true);
    setMergeError(null);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const guestSessionId = sessionStorage.getItem("guestSessionId");
      if (user?.id && guestSessionId) {
        await CartService.mergeGuestCartWithUserCart(guestSessionId, user.id);
        sessionStorage.removeItem("guestSessionId");
        await fetchUserCart(user.id);
      }
      proceedToCheckout();
    } catch (err) {
      setMergeError("Failed to merge guest cart. Please try again.");
    } finally {
      setIsMerging(false);
      setShowLoginModal(false);
    }
  };

  const proceedToCheckout = async () => {
    if (selectedCartItems.length === 0) return;
    const user = JSON.parse(sessionStorage.getItem("user"));
    const unselectedItems = cartItems.filter(
      (item) => !selectedItems.includes(item.id)
    );
    try {
      await Promise.all(
        unselectedItems.map(async (item) => {
          await addToWishlist({
            userId: user.id,
            productId: item.productId,
          });
          await CartService.removeFromCart(item.id);
        })
      );
    } catch (error) {
      console.error("Failed to move items to wishlist:", error);
    }
    navigate("/checkout", {
      state: {
        selectedItems: selectedCartItems,
        totalAmount: finalAmount,
      },
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your cart...</p>
      </Container>
    );
  }

  const renderTooltip = (props) => (
    <Tooltip id="discount-tooltip" {...props}>
      You get 15% discount on all items!
    </Tooltip>
  );

  return (
    <Container fluid className="py-4 px-md-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Cart</Breadcrumb.Item>
      </Breadcrumb>

      {mergeError && (
        <Alert variant="danger" className="mb-4" onClose={() => setMergeError(null)} dismissible>
          {mergeError}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Your Cart {isGuestCart && <Badge bg="secondary" className="ms-2">Guest</Badge>}</h3>
            {cartItems.length > 0 && (
              <div className="d-flex align-items-center gap-3">
                <Form.Check
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={handleSelectAll}
                  label={<span className="fw-medium">Select All</span>}
                />
                {selectedItems.length > 0 && (
                  <Button variant="outline-danger" size="sm" onClick={clearSelected}>
                    <FaTrash className="me-1" /> Remove Selected
                  </Button>
                )}
              </div>
            )}
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center p-5" style={styles.card}>
              {/* <div className="mb-4">
                <Image src="/empty-cart.svg" alt="Empty cart" fluid style={{ maxWidth: "200px" }} />
              </div> */}
              <h5 className="mb-3">Your cart is empty</h5>
              <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
              <Button as={Link} to="/" variant="success" size="lg">
                Start Shopping
              </Button>
            </Card>
          ) : (
            cartItems.map((item) =>
              item.product ? (
                <Card className="mb-3 p-3" key={item.id} style={styles.card}>
                  <Row className="g-3 align-items-center">
                    <Col xs={12} md={1} className="text-center">
                      <Form.Check
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                        aria-label={`Select ${item.product.name}`}
                      />
                    </Col>
                    <Col xs={12} md={3} className="text-center">
                      <Image
                        src={item.product.imageUrls?.[0] || "/placeholder-product.jpg"}
                        rounded
                        fluid
                        style={styles.productImage}
                        alt={item.product.name}
                      />
                    </Col>
                    <Col xs={12} md={5}>
                      <div>
                        <h6 className="mb-1 fw-bold">{item.product.name}</h6>
                        <p className="text-muted mb-2 small">
                          {item.product.description?.slice(0, 100)}...
                        </p>
                        <div className="d-flex align-items-center gap-3">
                          <div style={styles.quantityControl}>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="px-2"
                              disabled={item.productQuantity === 1}
                              onClick={() =>
                                updateQuantity(item.id, item.productQuantity - 1)
                              }
                            >
                              <FaMinus size={12} />
                            </Button>
                            <span className="px-3">{item.productQuantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="px-2"
                              onClick={() =>
                                updateQuantity(item.id, item.productQuantity + 1)
                              }
                            >
                              <FaPlus size={12} />
                            </Button>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => removeItem(item.id)}
                            style={styles.removeBtn}
                          >
                            <FaTrash size={14} className="me-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={3} className="text-md-end">
                      <div className="d-flex flex-column">
                        <span className="fw-bold" style={styles.priceHighlight}>
                          ${(item.product.price * item.productQuantity).toFixed(2)}
                        </span>
                        <small className="text-muted">
                          ${item.product.price.toFixed(2)} each
                        </small>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ) : (
                <Card className="mb-3 border-danger" key={item.id}>
                  <Card.Body className="bg-danger bg-opacity-10 text-danger d-flex justify-content-between align-items-center">
                    <div>
                      <FaInfoCircle className="me-2" />
                      Error loading product details for item ID: {item.id}
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash /> Remove
                    </Button>
                  </Card.Body>
                </Card>
              )
            )
          )}
        </Col>

        {cartItems.length > 0 && (
          <Col lg={4}>
            <Card className="p-3 mb-4" style={styles.summaryCard}>
              <Card.Body>
                <Card.Title className="mb-3">Order Summary</Card.Title>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Subtotal ({selectedCartItems.length} items)</span>
                    <span>${itemTotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1 text-success">
                    {/* <span>
                      Discount 
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip}
                      >
                        <span className="ms-1">
                          <FaInfoCircle size={14} />
                        </span>
                      </OverlayTrigger>
                    </span> */}
                    {/* <span>-${discount.toFixed(2)}</span> */}
                  </div>
                  {/* <div className="d-flex justify-content-between mb-1">
                    <span>Tax (18%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div> */}
                </div>
                
                <hr className="my-2" />
                
                <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                  <span>Total Amount</span>
                  <span style={styles.priceHighlight}>${finalAmount.toFixed(2)}</span>
                </div>
                
                <Button
                  variant={selectedCartItems.length > 0 ? "success" : "secondary"}
                  size="lg"
                  disabled={selectedCartItems.length === 0}
                  onClick={handleProceedToCheckout}
                  className="w-100 py-2"
                >
                  {selectedCartItems.length > 0
                    ? `Proceed to Pay $${finalAmount.toFixed(2)}`
                    : "Select items to checkout"}
                </Button>
                
                {isGuestCart && (
                  <p className="text-muted small mt-3 text-center">
                    You're shopping as a guest. <Link to="/signin">Login</Link> to save your cart.
                  </p>
                )}
                
                {/* <div className="mt-3 small text-muted">
                  <p className="mb-1">
                    <FaInfoCircle className="me-1" />
                    Your 15% discount has been applied to all items.
                  </p>
                  <p className="mb-0">
                    Tax is calculated on the discounted amount.
                  </p>
                </div> */}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showLoginModal} onHide={() => !isMerging && setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isMerging ? "Merging Your Cart" : "Login Required"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isMerging ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="success" className="mb-3" />
              <p>Please wait while we merge your cart items...</p>
            </div>
          ) : (
            <>
              <p>You need to login to proceed to checkout.</p>
              {/* <p>Your cart items will be saved to your account.</p> */}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLoginModal(false)}
            disabled={isMerging}
          >
            Continue Shopping
          </Button>
          <Button
            variant="success"
            onClick={() => {
              navigate("/signin", {
                state: {
                  from: "/cart",
                  needsMerge: true,
                  itemCount: cartItems.length,
                },
                replace: true,
              });
            }}
            disabled={isMerging}
          >
            {isMerging ? "Processing..." : "Login Now"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CartPage;