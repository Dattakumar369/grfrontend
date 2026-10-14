// src/pages/AvailableOrdersPage.jsx
import React, { useEffect, useState } from "react";
import { Container, Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import {
  getAvailableOrdersForDelivery,
  acceptOrderByDeliveryPerson,
  getOrderById,
} from "../services/orderService";

const AvailableOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const deliveryPersonId = JSON.parse(sessionStorage.getItem("user"))?.id;

  useEffect(() => {
    loadAvailableOrders();
  }, []);

  const loadAvailableOrders = async () => {
    try {
      const res = await getAvailableOrdersForDelivery();
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching available orders:", error);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await acceptOrderByDeliveryPerson(orderId, deliveryPersonId);
      alert("Order accepted!");
      loadAvailableOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleView = async (orderId) => {
    setModalLoading(true);
    setShowModal(true);
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

  return (
    <Container className="p-4 mt-5">
      <h4 className="mb-4">Available Orders (Processing)</h4>
      <Card>
        <Card.Body className="table-responsive">
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user?.firstName} {order.user?.lastName}</td>
                  <td>{order.user?.mobileNo}</td>
                  <td>
                    {`${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state}, ${order.shippingAddress?.country}, ${order.shippingAddress?.postalCode}`}
                  </td>
                  <td>
                    <Button size="sm" variant="primary" onClick={() => handleView(order.id)}>
                      View
                    </Button>{" "}
                    <Button size="sm" variant="success" onClick={() => handleAccept(order.id)}>
                      Accept
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
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
                    <td>{selectedOrderDetail.status}</td>
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
      </Modal>
    </Container>
  );
};

export default AvailableOrdersPage;
