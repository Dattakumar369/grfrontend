import React, { useEffect, useState } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  InputGroup,
  Card,
  Badge,
  Button,
  Modal,
} from "react-bootstrap";
import userService from "../../services/userService";
import { getOrdersByUser } from "../../services/orderService";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      const userList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      setLoadingOrders(true);
      const response = await getOrdersByUser(userId);
      setUserOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error.message);
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    await fetchUserOrders(user.id);
    setShowModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: "primary",
      user: "success",
      manager: "warning",
      staff: "info",
    };
    return (
      <Badge
        bg={roleColors[role.toLowerCase()] || "secondary"}
        className="text-capitalize"
      >
        {role}
      </Badge>
    );
  };

  // Calculate order statistics
  const calculateOrderStats = () => {
    if (!userOrders.length) return { totalOrders: 0, totalAmount: 0 };

    const totalOrders = userOrders.length;
    const totalAmount = userOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    return {
      totalOrders,
      totalAmount: totalAmount.toFixed(2),
    };
  };

  const { totalOrders, totalAmount } = calculateOrderStats();

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4 mt-5 p-2">
        <Col md={6}>
          <h4 className="fw-semibold">User Management</h4>
        </Col>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Card>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>S.No</th>
                <th>User</th>
                <th style={{ width: "80px" }}>User ID</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      {user.firstName} {user.lastName || ""}
                    </td>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.mobileNumber || "N/A"}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <FaEye /> View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {selectedUser && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Basic Information</h5>
                  <p>
                    <strong>Name:</strong> {selectedUser.firstName}{" "}
                    {selectedUser.lastName || ""}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedUser.mobileNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Role:</strong> {getRoleBadge(selectedUser.role)}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Order Statistics</h5>
                  {loadingOrders ? (
                    <p>Loading order data...</p>
                  ) : (
                    <>
                      <p>
                        <strong>Total Orders:</strong> {totalOrders}
                      </p>
                      <p>
                        <strong>Total Amount Spent:</strong> ${totalAmount}
                      </p>
                    </>
                  )}
                </Col>
              </Row>

              {userOrders.length > 0 && (
                <>
                  <h5 className="mt-4">Recent Orders</h5>
                  <Table striped bordered hover size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>${order.totalAmount.toFixed(2)}</td>
                          <td>
                            <Badge
                              bg={
                                order.status === "COMPLETED"
                                  ? "success"
                                  : order.status === "PROCESSING"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserListPage;
