import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Offcanvas, Button, Nav, Navbar, Container } from "react-bootstrap";
import { FaUsers, FaHome, FaBoxOpen, FaCartPlus, FaBiking } from "react-icons/fa";
import HeaderLogo from "../assets/HeaderLogo.png"; // Adjust the path as necessary

const DeliverySidebar = () => {
  const [show, setShow] = useState(false);
  const toggleSidebar = () => setShow(!show);
  const closeSidebar = () => setShow(false);

  const navItems = [
    { to: "/delivery/dashboard", icon: <FaHome />, label: "Assigned Orders" },
    { to: "/delivery/dashboard/orders-available", icon: <FaBoxOpen />, label: "Available Orders" },
    // { to: "/admin/dashboard/products", icon: <FaBoxOpen />, label: "Products" },
    // { to: "/admin/dashboard/orders", icon: <FaCartPlus />, label: "Orders" },
    // { to: "/admin/dashboard/users", icon: <FaUsers />, label: "Users" },
    // { to: "/admin/dashboard/deliveryPersons", icon: <FaBiking />, label: "Delivery Agents" }
  ];

  return (
    <>
      {/* Mobile Navbar with Logo and Hamburger */}
      <Navbar bg="light" className="d-md-none" fixed="top" style={{ zIndex: 1040 }}>
        <Container fluid className="px-3">
          <Navbar.Brand>
            <img src={HeaderLogo} alt="Logo" height={50} style={{ borderRadius: '12px' }} />
          </Navbar.Brand>
          <Button 
            variant="outline-success" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </Button>
        </Container>
      </Navbar>

      {/* Offcanvas Sidebar for Mobile */}
      <Offcanvas 
        show={show} 
        onHide={closeSidebar} 
        responsive="md" 
        placement="start"
        className="d-md-none"
        style={{ zIndex: 1150 }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>
            <img src={HeaderLogo} alt="Logo" height={50} style={{ borderRadius: '12px' }} />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="px-0">
          <Nav className="flex-column">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.to}
                end={item.to === "/delivery/dashboard"} // exact matching only for Dashboard
                onClick={closeSidebar}
                style={{ textDecoration: "none" }}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-3 px-3 py-2 mx-2 rounded ${
                    isActive ? "bg-success text-white fw-semibold" : "text-secondary"
                  }`
                }
              >
                <span className="fs-5">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Permanent Sidebar for Desktop */}
      <div 
        className="d-none d-md-flex flex-column bg-white vh-100 p-3 shadow-sm position-fixed" 
        style={{ 
          width: "250px",
          zIndex: 1030 
        }}
      >
        <div className="mb-4 text-center">
          <img src={HeaderLogo} alt="Logo" height={50} style={{ borderRadius: '12px' }} />
        </div>
        <Nav className="flex-column">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              end={item.to === "/delivery/dashboard"} // exact matching only for Dashboard
              style={{ textDecoration: "none" }}
              className={({ isActive }) =>
                `d-flex align-items-center gap-3 px-3 py-2 mb-2 rounded ${
                  isActive ? "bg-success text-white fw-semibold" : "text-secondary"
                }`
              }
            >
              <span className="fs-5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Nav>
      </div>
    </>
  );
};

export default DeliverySidebar;
