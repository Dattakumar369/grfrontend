import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Container, Row, Col, Card, Form, Spinner, Button, Modal } from "react-bootstrap";
import { 
  getTotalOrderCount, 
  getAllOrderHistory, 
  getTotalCompletedPaymentAmount, 
  getPendingDeliveryStatus,
  getCompletedDeliveries 
} from "../../services/orderService";
import userService from "../../services/userService";
import { getAllProducts } from "../../services/productService";
import { format, subDays, parseISO, isWithinInterval, eachDayOfInterval } from "date-fns";

export default function AdminMainPage() {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");
  const [chartType, setChartType] = useState("line");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDates, setCustomDates] = useState({
    start: format(subDays(new Date(), 6), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [allOrders, setAllOrders] = useState([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState({
    "ALL": 0,
    "PROCESSING": 0,
    "ACCEPTED_BY_DELIVERY": 0,
    "SHIPPED": 0,
    "OUT_FOR_DELIVERY": 0,
    "DELIVERED": 0
  });
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          totalOrdersRes,
          completedPaymentRes,
          usersRes,
          productsRes,
          ordersRes,
          pendingDeliveryRes,
          completedDeliveriesRes
        ] = await Promise.all([
          getTotalOrderCount(),
          getTotalCompletedPaymentAmount(),
          userService.getAllUsers(),
          getAllProducts(),
          getAllOrderHistory(),
          getPendingDeliveryStatus(),
          getCompletedDeliveries()
        ]);

        const totalOrders = !isNaN(Number(totalOrdersRes?.data))
          ? Number(totalOrdersRes.data)
          : totalOrdersRes?.data?.totalOrders || 0;
        const totalRevenue = !isNaN(Number(completedPaymentRes?.data))
          ? Number(completedPaymentRes.data)
          : Number(completedPaymentRes?.data?.totalRevenue) || 0;
        const users = Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [];
        const products = Array.isArray(productsRes) ? productsRes : [];
        const orders = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
        const pendingDeliveries = Array.isArray(pendingDeliveryRes?.data) ? pendingDeliveryRes.data : [];
        const completedDeliveries = Array.isArray(completedDeliveriesRes?.data) ? completedDeliveriesRes.data : [];

        setAllOrders(orders); // Store all orders for filtering

        const totalCustomers = users.filter((user) => user?.role === "Buyer").length;
        const totalProducts = products.length;

        // Process chart data with current time range
        processChartData(orders);

        const productCounts = {};
        orders.forEach((order) => {
          if (Array.isArray(order?.items)) {
            order.items.forEach((item) => {
              if (item?.productId) {
                productCounts[item.productId] =
                  (productCounts[item.productId] || 0) +
                  (item?.quantity || 0);
              }
            });
          }
        });

        const topProductsData = Object.entries(productCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([productId, count]) => {
            const product = products.find(
              (p) =>
                String(p?._id) === String(productId) ||
                String(p?.id) === String(productId) ||
                String(p?.productId) === String(productId)
            );

            return {
              id: productId,
              name: product?.productName || product?.name || "Unknown Product",
              count,
            };
          });

        const statusCounts = {
          "ALL": orders.length,
          "PROCESSING": 0,
          "ACCEPTED_BY_DELIVERY": 0,
          "SHIPPED": 0,
          "OUT_FOR_DELIVERY": 0,
          "DELIVERED": completedDeliveries.length
        };

        pendingDeliveries.forEach(order => {
          const status = order.status || 'PROCESSING';
          if (status === "PROCESSING") statusCounts.PROCESSING++;
          if (status === "ACCEPTED_BY_DELIVERY") statusCounts.ACCEPTED_BY_DELIVERY++;
          if (status === "SHIPPED") statusCounts.SHIPPED++;
          if (status === "OUT_FOR_DELIVERY") statusCounts.OUT_FOR_DELIVERY++;
        });

        setOrderStatusCounts(statusCounts);
        setFilteredOrders(orders);

        setSummary({
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalProducts,
        });
        setTopProducts(topProductsData);
      } catch (err) {
        console.error("Error fetching admin summary:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    if (allOrders.length > 0) {
      processChartData(allOrders);
    }
  }, [timeRange, customDates]);

  const processChartData = (orders) => {
    let startDate, endDate;
    const now = new Date();

    switch (timeRange) {
      case "custom":
        startDate = parseISO(customDates.start);
        endDate = parseISO(customDates.end);
        break;
      case "7days":
        startDate = subDays(now, 6);
        endDate = now;
        break;
      case "15days":
        startDate = subDays(now, 14);
        endDate = now;
        break;
      case "30days":
        startDate = subDays(now, 29);
        endDate = now;
        break;
      default:
        startDate = subDays(now, 6);
        endDate = now;
    }

    const dateRange = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const dailyData = {};
    dateRange.forEach(date => {
      const formattedDate = format(date, "MMM dd");
      dailyData[formattedDate] = {
        date: formattedDate,
        revenue: 0,
        orders: 0,
      };
    });

    const processedTransactions = new Set();
    let duplicateCount = 0;
    let ordersWithoutPayment = 0;

    orders.forEach((order, index) => {
      if (!order?.createdAt || !order?.totalAmount) {
        return;
      }

      if (!order.payment?.transactionId) {
        ordersWithoutPayment++;
        return;
      }

      const orderDate = new Date(order.createdAt);
      if (!isWithinInterval(orderDate, { start: startDate, end: endDate })) {
        return;
      }

      const transactionId = order.payment.transactionId;
      
      if (processedTransactions.has(transactionId)) {
        duplicateCount++;
        return;
      }

      processedTransactions.add(transactionId);

      const formattedDate = format(orderDate, "MMM dd");
      
      if (dailyData[formattedDate]) {
        if (order.payment?.status === 'COMPLETED') {
          dailyData[formattedDate].revenue += Number(order.totalAmount) || 0;
          dailyData[formattedDate].orders += 1;
        }
      }
    });
    const chartData = Object.values(dailyData).sort((a, b) => {
      return new Date(a.date + " " + new Date().getFullYear()) - 
             new Date(b.date + " " + new Date().getFullYear());
    });

    setChartData(chartData);
  };

  const handleStatusFilterChange = (status) => {
    setOrderStatusFilter(status);
    
    if (status === "ALL") {
      setFilteredOrders(allOrders);
    } else {
      const filtered = allOrders.filter(order => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  const handleCustomDateApply = () => {
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <Container
        fluid
        className="bg-light py-4 mt-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="bg-light py-4 mt-5">
        <Card className="shadow-sm">
          <Card.Body className="text-danger text-center">{error}</Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="bg-light py-4 mt-5">
      <Row className="mb-4">
        {[
          {
            label: "Total Orders",
            value: summary.totalOrders,
          },
          {
            label: "Total Revenue",
            value: `$${summary.totalRevenue.toFixed(2)}`,
          },
          {
            label: "Total Customers",
            value: summary.totalCustomers,
          },
          {
            label: "Total Products",
            value: summary.totalProducts,
          },
        ].map((item, idx) => (
          <Col key={idx} md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {item.label}
                </Card.Title>
                <h2>{item.value}</h2>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Revenue Overview</h5>
                <div className="d-flex gap-2">
                  <Form.Select 
                    size="sm" 
                    style={{ width: "150px" }}
                    value={timeRange}
                    onChange={(e) => {
                      setTimeRange(e.target.value);
                      if (e.target.value === "custom") {
                        setShowDatePicker(true);
                      }
                    }}
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="15days">Last 15 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="custom">Custom Dates</option>
                  </Form.Select>
                  <Form.Select
                    size="sm"
                    style={{ width: "120px" }}
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </Form.Select>
                </div>
              </div>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Order Status Summary</h5>
                <Form.Select 
                  size="sm" 
                  style={{ width: "180px" }}
                  value={orderStatusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  {/* <option value="ALL">All Statuses ({orderStatusCounts.ALL})</option> */}
                  <option value="ALL">All Statuses</option>
                  <option value="PROCESSING">Processing ({orderStatusCounts.PROCESSING})</option>
                  <option value="ACCEPTED_BY_DELIVERY">Accepted by Delivery ({orderStatusCounts.ACCEPTED_BY_DELIVERY})</option>
                  <option value="SHIPPED">Shipped ({orderStatusCounts.SHIPPED})</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery ({orderStatusCounts.OUT_FOR_DELIVERY})</option>
                  <option value="DELIVERED">Delivered ({orderStatusCounts.DELIVERED})</option>
                </Form.Select>
              </div>
              
              <div className="mb-3">
                {Object.entries(orderStatusCounts).map(([status, count]) => (
                  status !== "ALL" && (
                    <div 
                      key={status} 
                      className={`d-flex justify-content-between p-2 mb-1 rounded ${orderStatusFilter === status ? 'bg-primary text-white' : 'bg-light'}`}
                      onClick={() => handleStatusFilterChange(status)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{status.replace(/_/g, ' ')}</span>
                      <span>{count}</span>
                    </div>
                  )
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* <Col md={8} className="mb-4">
          {/* You can add another component here if needed */}
        {/* </Col> */} 
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Top Products</h5>
              {topProducts.length > 0 ? (
                <ul className="list-unstyled">
                  {topProducts.map((product, index) => (
                    <li key={product.id} className="mb-2 d-flex justify-content-between">
                      <span>
                        {index + 1}. {product.name}
                      </span>
                      <span className="text-muted">{product.count} sold</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No product data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Date Picker Modal */}
      <Modal show={showDatePicker} onHide={() => setShowDatePicker(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={customDates.start}
              max={customDates.end}
              onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={customDates.end}
              min={customDates.start}
              onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDatePicker(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCustomDateApply}>
            Apply Dates
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}