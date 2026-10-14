import React, { useEffect, useState } from "react";
import { useParams, useLocation, useOutletContext, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image, ListGroup, Spinner, Alert } from "react-bootstrap";
import { getOrderById } from "../services/orderService";
import CartService from "../services/cartService";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setCartCount } = useOutletContext();
  const [order, setOrder] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(!location.state?.orderData);
  const [error, setError] = useState(null);


  useEffect(() => {
    const initializePage = async () => {
      try {
        
        await clearCart();

        if (!location.state?.orderData) {
          const response = await getOrderById(orderId);
          setOrder(response.data);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [orderId, location.state]);

  const clearCart = async () => {
    try {
      if (sessionStorage.getItem("jwtToken")) {
        const user = JSON.parse(sessionStorage.getItem("user"));
        await CartService.clearUserCart(user.id);
      } else if (sessionStorage.getItem("guestSessionId")) {
        await CartService.clearGuestCart(sessionStorage.getItem("guestSessionId"));
      }
      

      if (setCartCount) setCartCount(0);
      

      localStorage.removeItem('cartItems');
      sessionStorage.removeItem('cartItems');
    } catch (err) {
      console.error("Cart clearing error:", err);
    }
  };

  const getDeliveryInfo = (orderDate) => {
    const orderDateTime = new Date(orderDate);
    const orderHour = orderDateTime.getHours();
    
    
    const deliveryDate = new Date(orderDateTime);
    
    let deliveryTime = "by 8 PM";
    let deliveryDay = "";
    
    if (orderHour < 10) {
      deliveryDay = "today";
    } else {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      deliveryDay = "tomorrow";
    }

    const formattedDeliveryDate = deliveryDate.toLocaleDateString(undefined, {
      weekday: 'long',
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      date: formattedDeliveryDate,
      day: deliveryDay,
      time: deliveryTime,
      fullText: `Estimated Delivery: ${formattedDeliveryDate} ${deliveryTime}`
    };
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">
          <h4>Error loading order</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">
          <h4>Order not found</h4>
          <p>We couldn't find details for this order.</p>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            View Your Orders
          </Button>
        </Alert>
      </Container>
    );
  }

  // Calculate delivery info based on order time
  const deliveryInfo = getDeliveryInfo(order.createdAt);

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col xs={12} className="mb-4 text-center">
          <h2 className="text-success fw-semibold">✔️ Thank you for your Purchase!</h2>
          <p className="text-muted mt-2">
            Your purchase is confirmed. Your order will be delivered {deliveryInfo.day}.
          </p>
          <p className="text-dark fw-semibold">
            {deliveryInfo.fullText}
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Shipping Address</Card.Title>
              <Card.Text>
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </Card.Text>
              <Button variant="success">Track Your Order</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>

              <ListGroup variant="flush" className="mt-3">
                {order.items.map((item) => (
                  <ListGroup.Item
                    key={item.productId}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        src={item.image1 || "/placeholder-product.jpg"}
                        rounded
                        width={50}
                        height={50}
                        className="me-3"
                        alt={item.productName}
                      />
                      <div>
                        <div className="fw-medium">{item.productName}</div>
                        <div className="text-muted small">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="fw-semibold">₹{item.totalPrice.toFixed(2)}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <hr />

              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Mode</span>
                <span className="fw-semibold">{order.payment?.paymentType || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between mt-2 fs-5 fw-bold">
                <span>Total Price</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="text-center">
          <Button variant="outline-primary" className="me-2" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderConfirmationPage;