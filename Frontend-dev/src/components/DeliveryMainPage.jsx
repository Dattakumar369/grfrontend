import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Spinner
} from "react-bootstrap";
import {
  getOrdersByDeliveryPerson,
  updateOrderStatus,
  getOrderById,
} from "../services/orderService";

const DeliveryMainPage = () => {
  const [orders, setOrders] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transitionError, setTransitionError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));
  const deliveryPersonId = user?.id;

  useEffect(() => {
    if (deliveryPersonId) loadOrders();
  }, [deliveryPersonId]);

  const loadOrders = async () => {
    try {
      const res = await getOrdersByDeliveryPerson(deliveryPersonId);
      setOrders(res.data);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Failed to load orders. Please try again.");
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNotes("");
    setError("");
    setSuccess("");
    setShowStatusModal(true);
  };

  const handleView = async (orderId) => {
    setModalLoading(true);
    setShowDetailsModal(true);
    try {
      const res = await getOrderById(orderId);
      setSelectedOrderDetail(res.data);
    } catch (error) {
      setSelectedOrderDetail(null);
      console.error("Error fetching order details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'N/A' 
        : date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return 'N/A';
    }
  };

  const formatAmount = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return typeof num === 'number' ? num.toFixed(2) : '0.00';
  };

  const getValidTransitions = (currentStatus) => {
    const statusFlow = [
      "ACCEPTED_BY_DELIVERY",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED"
    ];
    
    const rejectionFlow = [
      "ACCEPTED_BY_DELIVERY",
      "REJECTED_BY_DELIVERY"
    ];

    if (currentStatus === "REJECTED_BY_DELIVERY" || currentStatus === "DELIVERED") {
      return [];
    }

    const currentIndex = statusFlow.indexOf(currentStatus);

    if (currentIndex >= 0) {
      const nextStatus = statusFlow[currentIndex + 1];
      return nextStatus ? [nextStatus, "REJECTED_BY_DELIVERY"] : [];
    }

    if (rejectionFlow.includes(currentStatus)) {
      const currentRejectIndex = rejectionFlow.indexOf(currentStatus);
      const nextRejectStatus = rejectionFlow[currentRejectIndex + 1];
      return nextRejectStatus ? [nextRejectStatus] : [];
    }

    return [];
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      setTransitionError("");

      if (selectedOrder.status === newStatus && !notes) {
        setSuccess("No changes detected.");
        setTimeout(() => setShowStatusModal(false), 1000);
        return;
      }

      const validTransitions = getValidTransitions(selectedOrder.status);
      if (selectedOrder.status !== newStatus && !validTransitions.includes(newStatus)) {
        setTransitionError(`Invalid status transition from ${statusDisplayName(selectedOrder.status)} to ${statusDisplayName(newStatus)}. 
        Allowed next statuses: ${validTransitions.map(s => statusDisplayName(s)).join(", ")}`);
        return;
      }

      try {
        await updateOrderStatus(selectedOrder.id, newStatus, notes);
        setSuccess("Order status updated successfully!");
        setTimeout(() => {
          setShowStatusModal(false);
          loadOrders();
        }, 1000);
      } catch (error) {
        if (error.response && error.response.status === 500) {
          const errorMsg = error.response.data.message || 
            `Cannot change from ${statusDisplayName(selectedOrder.status)} to ${statusDisplayName(newStatus)}`;
          setTransitionError(errorMsg);
          setTimeout(() => setError(""), 5000);
        } else {
          const errorMsg = error.message || "An unexpected error occurred";
          setError(errorMsg);
          setTimeout(() => setError(""), 5000);
        }
        console.error("Failed to update status", error);
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
      console.error("Error:", error);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "success";
      case "OUT_FOR_DELIVERY": return "primary";
      case "SHIPPED": return "info";
      case "ACCEPTED_BY_DELIVERY": return "warning";
      case "REJECTED_BY_DELIVERY": return "danger";
      default: return "secondary";
    }
  };

  const statusDisplayName = (status) => {
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Container fluid className="p-4">
      <h4 className="mb-4">Assigned Orders</h4>
      <Row className="mb-4">
        <Col sm={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <h3>{orders.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Pending</Card.Title>
              <h3>{orders.filter((o) => o.status !== "DELIVERED" && o.status !== "REJECTED_BY_DELIVERY").length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={4}>
          <Card className="text-center mb-3">
            <Card.Body>
              <Card.Title>Completed</Card.Title>
              <h3>{orders.filter((o) => o.status === "DELIVERED" || o.status === "REJECTED_BY_DELIVERY").length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>Assigned Orders</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user?.firstName} {order.user?.lastName}</td>
                  <td>{order.user?.mobileNo || order.user?.email}</td>
                  <td>{`${order.shippingAddress?.street}, ${order.shippingAddress?.city}`}</td>
                  <td>
                    <span className={`badge bg-${statusColor(order.status)}`}>
                      {statusDisplayName(order.status)}
                    </span>
                  </td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      onClick={() => handleView(order.id)}
                      className="me-2"
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-success" 
                      onClick={() => handleEdit(order)}
                      disabled={order.status === "DELIVERED" || order.status === "REJECTED_BY_DELIVERY"}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Status</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedOrder ? statusDisplayName(selectedOrder.status) : ''} 
                readOnly 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value={selectedOrder?.status}>
                  {selectedOrder ? statusDisplayName(selectedOrder.status) : 'Select status'}
                </option>
                {selectedOrder && 
                  getValidTransitions(selectedOrder.status).map(status => (
                    <option key={status} value={status}>
                      {statusDisplayName(status)}
                    </option>
                  ))
                }
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>
          </Form>
          
          {transitionError && (
            <Alert variant="danger" className="mt-3">
              {transitionError}
            </Alert>
          )}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Order #{selectedOrderDetail?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading details...</p>
            </div>
          ) : selectedOrderDetail ? (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="bg-light fw-semibold">Order Date</td>
                    <td>{formatDate(selectedOrderDetail.createdAt)}</td>
                    <td className="bg-light fw-semibold">Status</td>
                    <td>
                      <span className={`badge bg-${statusColor(selectedOrderDetail.status)}`}>
                        {statusDisplayName(selectedOrderDetail.status)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Shipping Address</td>
                    <td colSpan={3}>
                      {selectedOrderDetail.shippingAddress?.street},<br />
                      {selectedOrderDetail.shippingAddress?.city},<br />
                      {selectedOrderDetail.shippingAddress?.state} - {selectedOrderDetail.shippingAddress?.postalCode},<br />
                      {selectedOrderDetail.shippingAddress?.country}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Customer</td>
                    <td colSpan={3}>
                      {selectedOrderDetail.user?.firstName} {selectedOrderDetail.user?.lastName} <br />
                      {selectedOrderDetail.user?.mobileNo}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <p className="text-muted mb-2 mt-3">Order Items</p>
              <Table bordered responsive>
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrderDetail.items || []).map((item) => (
                    <tr key={`${item?.productId}-${item?.quantity}`}>
                      <td>{item?.productName || "Unknown"}</td>
                      <td className="text-center">{item?.quantity || 1}</td>
                      <td className="text-end">${formatAmount(item?.price)}</td>
                      <td className="text-end">
                        ${formatAmount(item?.totalPrice || (item?.price * (item?.quantity || 1)))}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-secondary fw-semibold">
                    <td colSpan={3} className="text-end">Total</td>
                    <td className="text-end">
                      ${formatAmount(selectedOrderDetail.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center py-4">
              <p>Order details not available.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeliveryMainPage;