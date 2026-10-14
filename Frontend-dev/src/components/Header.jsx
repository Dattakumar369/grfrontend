import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Form,
  FormControl,
  Container,
  Button,
  Badge,
  Dropdown,
} from "react-bootstrap";
import { FaShoppingCart, FaUser, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeaderLogo from "../assets/HeaderLogo.png";
import CategoriesSection from "./CategoriesSection";

const Header = ({ cartCount }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  const isLoggedIn = !!sessionStorage.getItem("jwtToken");

  let user = null;
  try {
    const userStr = sessionStorage.getItem("user");
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    console.error("Failed to parse user from sessionStorage", e);
  }

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      navigate("/signin");
    }
  };

  const initial = user?.firstName?.charAt(0).toUpperCase() || "";
  const userName = user ? `${user.firstName} ${user.lastName}` : "";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/view-all?search=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery("");
    }
  };

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
    setDropdownTimeout(timeout);
  };

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1030 }}>
        <Navbar bg="light" expand="md" className="py-2">
          <Container style={{ maxWidth: "1200px" }}>
            {/* Mobile Navbar */}
            <div className="d-flex align-items-center justify-content-between w-100 d-md-none">
              <Navbar.Brand href="/">
                <img
                  src={HeaderLogo}
                  alt="Logo"
                  className="d-inline-block align-top"
                  style={{ height: "50px", width: "auto", borderRadius: "20px" }}
                  onClick={() => navigate("/")}
                />
              </Navbar.Brand>

              <Nav className="d-flex flex-row align-items-center">
                <Nav.Item className="mx-2 text-center">
                  {isLoggedIn && user?.firstName ? (
                    <Dropdown 
                      show={showDropdown}
                      onToggle={(isOpen) => setShowDropdown(isOpen)}
                    >
                      <Dropdown.Toggle
                        variant="link"
                        id="dropdown-user-mobile"
                        style={{
                          cursor: "pointer",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#28a745",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "18px",
                          userSelect: "none",
                          marginBottom: 0,
                        }}
                      >
                        {initial}
                      </Dropdown.Toggle>

                      <Dropdown.Menu 
                        style={{ 
                          zIndex: 1050,
                          marginTop: "5px"
                        }}
                      >
                        <Dropdown.Item onClick={() => navigate("/customer/dashboard/my-orders")}>
                          My Orders
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/customer/dashboard/addresses")}>
                          My Addresses
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate("/customer/dashboard/wishlist")}>
                          My Wishlist
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>
                          Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <Button
                      variant="link"
                      className="text-decoration-none p-0"
                      onClick={handleLoginClick}
                    >
                      <FaUser size={20} className="text-dark" />
                    </Button>
                  )}
                </Nav.Item>

                <Nav.Item
                  className="mx-2 position-relative"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/cart")}
                  aria-label="Go to Cart"
                >
                  <FaShoppingCart size={20} className="text-dark" />
                  {cartCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Item>
              </Nav>
            </div>

            {/* Mobile Search Bar */}
            <div className="d-md-none w-100 mt-2">
              <Form className="mx-0 px-2" onSubmit={handleSearch}>
                <div className="position-relative w-100">
                  <FaSearch
                    size={16}
                    className="position-absolute"
                    style={{
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      pointerEvents: "none",
                    }}
                  />
                  <FormControl
                    type="search"
                    placeholder="Search products..."
                    className="ps-5 py-2 rounded-pill border-0 shadow-sm mb-1"
                    style={{ width: "100%" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </Form>
            </div>

            {/* Desktop Navbar Collapse */}
            <Navbar.Collapse
              id="navbar-search"
              className="justify-content-between align-items-center"
            >
              <Navbar.Brand href="#" className="d-none d-md-flex me-4">
                <img
                  src={HeaderLogo}
                  alt="Logo"
                  className="d-inline-block align-top"
                  style={{ height: "50px", width: "auto", borderRadius: "20px" }}
                  onClick={() => navigate("/")}
                />
              </Navbar.Brand>

              {/* Desktop Search Bar */}
              <Form
                className="my-3 my-md-0 mx-md-4 flex-grow-1 d-none d-md-block"
                style={{ maxWidth: "600px" }}
                onSubmit={handleSearch}
              >
                <div className="position-relative w-100">
                  <FaSearch
                    size={16}
                    className="position-absolute"
                    style={{
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      pointerEvents: "none",
                    }}
                  />
                  <FormControl
                    type="search"
                    placeholder="Search products..."
                    className="ps-5 py-2 rounded-pill border-0 shadow-sm"
                    style={{ width: "100%" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </Form>

              <Nav className="d-none d-md-flex align-items-center">
                <Nav.Item className="mx-2 text-center">
                  {isLoggedIn && user?.firstName ? (
                    <div 
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Dropdown 
                        show={showDropdown}
                        onToggle={(isOpen) => setShowDropdown(isOpen)}
                      >
                        <Dropdown.Toggle
                          variant="link"
                          id="dropdown-user"
                          className="d-flex align-items-center gap-2 text-decoration-none"
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: "36px",
                              height: "36px",
                              backgroundColor: "#28a745",
                              color: "#fff",
                              fontWeight: "600",
                              fontSize: "18px",
                            }}
                          >
                            {initial}
                          </div>
                          <span className="text-dark">{userName}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu 
                          style={{ 
                            zIndex: 1050,
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <Dropdown.Item onClick={() => navigate("/customer/dashboard/my-orders")}>
                            My Orders
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => navigate("/customer/dashboard/addresses")}>
                            My Addresses
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => navigate("/customer/dashboard/wishlist")}>
                            My Wishlist
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={handleLogout}>
                            Logout
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ) : (
                    <Button
                      variant="link"
                      className="text-decoration-none p-0"
                      onClick={handleLoginClick}
                    >
                      <FaUser size={20} className="text-dark" />
                    </Button>
                  )}
                </Nav.Item>

                <Nav.Item
                  className="mx-2 position-relative"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/cart")}
                  aria-label="Go to Cart"
                >
                  <FaShoppingCart size={20} className="text-dark" />
                  {cartCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        
        {/* Categories Section - fixed below header */}
        <div style={{ 
          position: "sticky", 
          top: "80px", 
          zIndex: 1020,
        }}>
          <Container style={{ maxWidth: "1200px" }}>
             <CategoriesSection />
          </Container>
        </div>
      </div>
    </>
  );
};

export default Header;