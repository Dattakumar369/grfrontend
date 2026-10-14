import React, { useEffect, useState } from "react";
import { Navbar, Nav, Dropdown, Container } from "react-bootstrap";
import { FaBell, FaUser } from "react-icons/fa";

export default function AppNavbar() {
  const [initial, setInitial] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const firstName = parsedUser.firstName || "";
        setInitial(firstName.charAt(0).toUpperCase());
        setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
      } catch (err) {
        console.error("Error parsing user from sessionStorage", err);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm px-3 px-md-4 py-3 fixed-top">
      <Container fluid className="justify-content-end px-0">
        <Nav className="align-items-center gap-3">
          {/* Notification Bell */}
          <div className="position-relative">
            <FaBell size={18} className="text-secondary" />
            
          </div>
          
          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              className="d-flex align-items-center gap-2 border-0 bg-transparent"
            >
              {initial ? (
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#22c55e",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}
                >
                  {initial}
                </div>
              ) : (
                <FaUser className="text-secondary" size={18} />
              )}
              <span className="d-none d-lg-inline text-dark">{userName}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-2 border-0 shadow-sm">
              <Dropdown.Header className="text-muted small">
                Signed in as {userName}
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={handleLogout} 
                className="text-danger fw-medium"
              >
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}