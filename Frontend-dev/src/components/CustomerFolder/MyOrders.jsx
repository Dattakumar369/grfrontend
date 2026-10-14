import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Badge, Row, Col, Card, Button, Modal, Image, ListGroup, Form, ProgressBar } from 'react-bootstrap';
import { getOrdersByUser } from '../../services/orderService';
import { Star, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import ReviewService from '../../services/reviewService';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const userId = JSON.parse(sessionStorage.getItem('user'))?.id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userId) {
          throw new Error('User not logged in');
        }

        const response = await getOrdersByUser(userId);
        
        if (!response || !response.data) {
          throw new Error('Invalid response from server');
        }

        // Sort orders by date (newest first)
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'N/A' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    } catch {
      return 'N/A';
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const openProductModal = async (product, order, forRating = false) => {
    try {
      const productData = {
        id: product.productId,
        name: product.productName,
        description: product.productName,
        price: product.price,
        imageUrls: [product.image1].filter(Boolean),
        categoryName: "Masalas",
        quantity: product.quantity,
        status: "Active"
      };
      
      setSelectedProduct(productData);
      setSelectedOrder(order);
      setShowProductModal(true);
      
      if (forRating) {
        setRating(0);
        setHoverRating(0);
        setReviewText('');
      }
    } catch (error) {
      console.error("Error opening product modal:", error);
      setError('Failed to load product details.');
    }
  };

  const renderRatingStars = (currentRating, interactive = false) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={
              star <= (hoverRating || rating || currentRating || 0)
                ? "text-warning fill-warning"
                : "text-secondary"
            }
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              marginRight: '4px'
            }}
          />
        ))}
        {interactive && (
          <span className="ms-2 text-muted">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Rate this'}
          </span>
        )}
      </div>
    );
  };

  const submitReview = async () => {
    if (!selectedProduct || !userId || !selectedOrder) {
      setError('Missing required information');
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    setSubmittingReview(true);
    setError(null);

    try {
      const reviewDTO = {
        productId: selectedProduct.id,
        userId: userId,
        star: rating,
        review: reviewText || null
      };

      await ReviewService.addReview(reviewDTO);
      
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setShowProductModal(false);
      
      setError('Review submitted successfully!');
      setTimeout(() => setError(null), 3000);

    } catch (error) {
      console.error('Review submission error:', error);
      setError(error.response?.data || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusIcons = {
      'DELIVERED': <CheckCircle size={16} className="me-1" />,
      'OUT_FOR_DELIVERY': <Truck size={16} className="me-1" />,
      'PAYMENT_PENDING': <Clock size={16} className="me-1" />,
      'CANCELLED': <AlertCircle size={16} className="me-1" />,
      'PROCESSING': <Clock size={16} className="me-1" />,
      'SHIPPED': <Truck size={16} className="me-1" />
    };

    const statusClasses = {
      'DELIVERED': 'bg-success bg-opacity-10 text-success',
      'OUT_FOR_DELIVERY': 'bg-info bg-opacity-10 text-info',
      'PAYMENT_PENDING': 'bg-warning bg-opacity-10 text-warning',
      'CANCELLED': 'bg-danger bg-opacity-10 text-danger',
      'PROCESSING': 'bg-warning bg-opacity-10 text-warning',
      'SHIPPED': 'bg-info bg-opacity-10 text-info'
    };

    return (
      <Badge className={`${statusClasses[status] || 'bg-secondary'} px-3 py-2 rounded-pill d-flex align-items-center`}>
        {statusIcons[status] || null}
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getOrderProgress = (status) => {
    const steps = [
      { label: 'Ordered', status: 'PAYMENT_PENDING' },
      { label: 'Processing', status: 'PROCESSING' },
      { label: 'Shipped', status: 'SHIPPED' },
      { label: 'Out For Delivery', status: 'OUT_FOR_DELIVERY'},
      { label: 'Delivered', status: 'DELIVERED' }
    ];
    
    const currentIndex = steps.findIndex(step => step.status === status);
    const progress = ((currentIndex + 1) / steps.length) * 100;
    
    return (
      <div className="mt-3">
        <ProgressBar now={progress} className="mb-2" style={{ height: '6px' }} />
        <div className="d-flex justify-content-between small text-muted">
          {steps.map((step, index) => (
            <span 
              key={step.label} 
              className={`${index <= currentIndex ? 'text-primary fw-bold' : ''}`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error && !error.includes('success')) {
    return (
      <Container className="my-4">
        <Alert variant="danger" className="shadow-sm">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Orders</h2>
        <div className="text-muted">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
      </div>

      {error && !error.includes('success') && (
        <Alert variant="danger" className="rounded-lg shadow-sm border-0 mb-4">
          {error}
        </Alert>
      )}

      {error && error.includes('success') && (
        <Alert variant="success" className="rounded-lg shadow-sm border-0 mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-lg overflow-hidden">
          <Card.Body className="text-center p-5">
            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
              <Truck size={32} className="text-muted" />
            </div>
            <h4 className="fw-bold mb-2">No Orders Yet</h4>
            <p className="text-muted mb-4">You haven't placed any orders. Start shopping to see your orders here.</p>
            <Button variant="primary" size="lg" href="/" className="px-4">
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} lg={2} className="g-4">
          {orders.map((order, index) => (
            <Col key={order.id}>
              <Card className="h-100 border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                  <div className="p-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">S.No: {index + 1}</h5>
                        <small className="text-muted">Order ID: {order.id}</small>
                        <div className="text-muted small">{formatDate(order.createdAt)}</div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    {getOrderProgress(order.status)}
                  </div>
                  
                  <div className="p-4">
                    {(order.items || []).map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        <div className="d-flex align-items-center mb-3">
                          <div className="position-relative me-3">
                            <Image 
                              src={item.image1 || '/placeholder-product.jpg'} 
                              width={80}
                              height={80}
                              className="rounded-3 border object-fit-cover"
                            />
                            <Badge 
                              bg="light" 
                              className="position-absolute top-0 start-100 translate-middle rounded-circle text-dark border"
                              style={{fontSize: '0.75rem'}}
                            >
                              {item.quantity}
                            </Badge>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold">{item.product?.name || item.productName}</h6>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-primary">₹{item.product?.price || item.price}</span>
                              {order.status === 'DELIVERED' ? (
                                <Button 
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openProductModal(item, order, true)}
                                  className="px-3 py-1"
                                >
                                  Rate Product
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openProductModal(item, order)}
                                  className="px-3 py-1"
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {(itemIndex < (order.items || []).length - 1) && <hr className="my-3" />}
                      </React.Fragment>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Product Details Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold">
            {selectedProduct?.name || 'Product Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-0 pb-4">
          {selectedProduct ? (
            <Row>
              <Col md={6} className="d-flex flex-column">
                <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light rounded-3 p-4 mb-3">
                  <Image 
                    src={selectedProduct.imageUrls?.[0] || '/placeholder-product.jpg'} 
                    fluid 
                    className="img-fluid"
                    style={{maxHeight: '300px', objectFit: 'contain'}}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h4 className="fw-bold mb-0">{selectedProduct.name}</h4>
                  <h3 className="text-primary mb-0">₹{selectedProduct.price}</h3>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 small me-2">
                    {selectedProduct.categoryName || 'General'}
                  </div>
                </div>
                
                <p className="mb-4">{selectedProduct.description || 'No description available'}</p>
                
                <ListGroup variant="flush" className="mb-4 bg-light rounded-3">
                  <ListGroup.Item className="d-flex border-0 px-3 py-2">
                    <span className="text-muted me-2">Ordered on:</span>
                    <span>{formatDate(selectedOrder?.createdAt)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex border-0 px-3 py-2">
                    <span className="text-muted me-2">Quantity:</span>
                    <span>{selectedProduct.quantity}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex border-0 px-3 py-2">
                    <span className="text-muted me-2">Status:</span>
                    <span>{getStatusBadge(selectedOrder?.status)}</span>
                  </ListGroup.Item>
                </ListGroup>

                {selectedOrder?.status === 'DELIVERED' && (
                  <div className="border-top pt-4">
                    <h5 className="mb-3 fw-bold">Rate your experience</h5>
                    <div className="mb-4">
                      {renderRatingStars(rating, true)}
                      {rating === 0 && (
                        <small className="text-danger d-block mt-1">Please select a rating</small>
                      )}
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Share your thoughts</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="What did you like about this product? Any suggestions for improvement?"
                        className="border-2 rounded-3"
                      />
                    </Form.Group>

                    {error && (
                      <Alert variant={error.includes('success') ? 'success' : 'danger'} className="mt-2">
                        {error}
                      </Alert>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowProductModal(false)}
                        className="px-4 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={submitReview}
                        disabled={rating === 0 || submittingReview}
                        className="px-4 py-2"
                      >
                        {submittingReview ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading product details...</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MyOrders;