import React, { useEffect, useState } from "react";
import { getAllOrderHistory, getOrderHistory } from "../../services/orderService";
import { Eye, Search } from "lucide-react";
import { Table, Button, Modal, Spinner, Alert, Form, InputGroup } from "react-bootstrap";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const statusOptions = [
    { value: "ALL", label: "All Orders" },
    { value: "PROCESSING", label: "Processing" },
    { value: "ACCEPTED_BY_DELIVERY", label: "Accepted by Delivery" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "REJECTED_BY_DELIVERY", label: "Rejected by Delivery" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const dateOptions = [
    { value: "ALL", label: "All Time" },
    { value: "TODAY", label: "Today" },
    { value: "YESTERDAY", label: "Yesterday" },
    { value: "LAST_7_DAYS", label: "Last 7 Days" },
    { value: "LAST_30_DAYS", label: "Last 30 Days" },
    { value: "THIS_MONTH", label: "This Month" },
    { value: "LAST_MONTH", label: "Last Month" },
    { value: "CUSTOM", label: "Custom Range" },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, dateFilter, customStartDate, customEndDate, orders, searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllOrderHistory();
      let allOrders = response.data;
      console.log("Fetched orders:", allOrders);

      const ordersMap = new Map();

      await Promise.all(
        allOrders.map(async (order) => {
          try {
            if (ordersMap.has(order.orderId)) return;

            const detailResponse = await getOrderHistory(order.orderId);
            const detailData = detailResponse.data[0] || detailResponse.data;
          
            if (!detailData) return;

            const orderData = {
              orderId: detailData.orderId,
              customerName: detailData.user?.firstName || "",
              lastName: detailData.user?.lastName || "",
              phoneNumber: detailData.user?.mobileNo ? detailData.user.mobileNo.toString() : "N/A",
              email: detailData.user?.email || "N/A",
              totalAmount: detailData.totalAmount || 0,
              date: detailData.createdAt || "N/A",
              status: (detailData.status || "").toUpperCase(),
              rawData: detailData,
            };
    
            if (!ordersMap.has(orderData.orderId)) {
              ordersMap.set(orderData.orderId, orderData);
            }
          } catch (error) {
            console.error(`Error fetching order ${order.orderId}:`, error);
          }
        })
      );

      const uniqueOrders = Array.from(ordersMap.values()).sort((a, b) => {
        const numA = parseInt(a.orderId.toString().replace(/\D/g, ''), 10);
        const numB = parseInt(b.orderId.toString().replace(/\D/g, ''), 10);
        return numA - numB;
      });

      setOrders(uniqueOrders);
    } catch (fetchError) {
      setError("Failed to fetch orders. Please try again later.");
      console.error("Error fetching orders:", fetchError);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(order => 
        order.status && order.status.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Apply date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      let startDate = new Date();

      switch(dateFilter) {
        case "TODAY":
          startDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.date) >= startDate);
          break;
        case "YESTERDAY":
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate < endDate;
          });
          break;
        case "LAST_7_DAYS":
          startDate.setDate(startDate.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.date) >= startDate);
          break;
        case "LAST_30_DAYS":
          startDate.setDate(startDate.getDate() - 30);
          filtered = filtered.filter(order => new Date(order.date) >= startDate);
          break;
        case "THIS_MONTH":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(order => new Date(order.date) >= startDate);
          break;
        case "LAST_MONTH":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startDate && orderDate <= endOfLastMonth;
          });
          break;
        case "CUSTOM":
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.date);
              return orderDate >= start && orderDate <= end;
            });
          }
          break;
        default:
          break;
      }
    }

    
    if (searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(order => {
      const phoneNumber = order.phoneNumber ? order.phoneNumber.toLowerCase() : "";
      const email = order.email ? order.email.toLowerCase() : "";
      const fullName = `${order.customerName || ""} ${order.lastName || ""}`.toLowerCase().trim();
      const orderIdStr = order.orderId.toString().toLowerCase();
      const displayedOrderId = `ord ${orderIdStr}`;
      
      return (
        orderIdStr.includes(query) || 
        displayedOrderId.includes(query) || 
        fullName.includes(query) ||
        phoneNumber.includes(query) ||
        email.includes(query)
      );
    });
  }

  setFilteredOrders(filtered);
};

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setShowCustomDatePicker(value === "CUSTOM");
  };

  const openOrderModal = (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    if (order?.rawData) {
      setSelectedOrderDetail(order.rawData);
      setShowModal(true);
    }
  };

  const formatAmount = (amount) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return typeof num === "number" ? num.toFixed(2) : "0.00";
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? "N/A" 
        : date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status) => {
    const statusText = status || "N/A";
    let badgeClass = "bg-secondary";
    
    switch(statusText) {
      case "COMPLETED":
      case "CAPTURED":
      case "DELIVERED":
        badgeClass = "bg-success";
        break;
      case "PENDING":
      case "PAYMENT_PENDING":
      case "PROCESSING":
        badgeClass = "bg-warning text-dark";
        break;
      case "ACCEPTED_BY_DELIVERY":
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        badgeClass = "bg-info text-dark";
        break;
      case "CANCELLED":
      case "FAILED":
      case "REJECTED_BY_DELIVERY":
        badgeClass = "bg-danger";
        break;
      default:
        badgeClass = "bg-secondary";
    }
    
    return (
      <span className={`badge ${badgeClass}`}>
        {statusText.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 mt-5 fw-semibold">All Orders</h3>

      <div className="mb-4">
        <div className="row mb-3">
          <div className="col-md-4">
            <Form.Group controlId="statusFilter">
              <Form.Label className="fw-semibold">Status</Form.Label>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          
          <div className="col-md-8">
            <Form.Group controlId="searchOrders">
              <Form.Label className="fw-semibold">Search Orders</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Order ID, Name, Phone or Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="dateFilter">
              <Form.Label className="fw-semibold">Date Range</Form.Label>
              <Form.Select 
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value)}
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          {showCustomDatePicker && (
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group controlId="customStartDate">
                    <Form.Label>From</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="customEndDate">
                    <Form.Label>To</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <Button variant="outline-secondary" onClick={fetchOrders}>
            Refresh Orders
          </Button>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center mb-3">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Loading orders...</span>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-secondary">
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <tr key={`${order.orderId}-${index}`}>
                <td>ORD {order.orderId}</td>
                <td>{[order.customerName, order.lastName].filter(Boolean).join(" ") || "N/A"}</td>
                <td>{order.phoneNumber || "N/A"}</td>
                <td>{formatDate(order.date || order.createdAt)}</td>
                <td>${formatAmount(order.totalAmount)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <Button
                    variant="link"
                    onClick={() => openOrderModal(order.orderId)}
                    className="p-0"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                {loading ? "Loading..." : "No orders found with selected filter"}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>ORD {selectedOrderDetail?.order?.id || selectedOrderDetail?.orderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderDetail ? (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="bg-light fw-semibold">Order Date</td>
                    <td>{formatDate(selectedOrderDetail.createdAt)}</td>
                    <td className="bg-light fw-semibold">Status</td>
                    <td>{getStatusBadge(selectedOrderDetail.status)}</td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Customer</td>
                    <td>
                      {selectedOrderDetail.user?.firstName} {selectedOrderDetail.user?.lastName}
                    </td>
                    <td className="bg-light fw-semibold">Phone</td>
                    <td>
                      {selectedOrderDetail.user?.mobileNo || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Email</td>
                    <td>
                      {selectedOrderDetail.user?.emailId || "N/A"}
                    </td>
                    <td className="bg-light fw-semibold">Address</td>
                    <td>
                      {selectedOrderDetail.shippingAddress?.street}, {selectedOrderDetail.shippingAddress?.city}
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
                  {(selectedOrderDetail.order?.items || selectedOrderDetail.items || []).map((item) => (
                    <tr key={`${item.product?.id || item.productId || 'unknown'}-${item.quantity}`}>
                      <td>{item.product?.name || item.productName || "Unknown"}</td>
                      <td className="text-center">{item.quantity || 1}</td>
                      <td className="text-end">${formatAmount(item.product?.price || item.price)}</td>
                      <td className="text-end">
                        ${formatAmount(item.totalPrice || (item.price * (item.quantity || 1)))}
                      </td>
                    </tr>
                  ))}
                  <tr className="table-secondary fw-semibold">
                    <td colSpan={3} className="text-end">Total</td>
                    <td className="text-end">
                      ${formatAmount(
                        selectedOrderDetail.order?.totalAmount || 
                        selectedOrderDetail.totalAmount
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading details...</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Orders;  