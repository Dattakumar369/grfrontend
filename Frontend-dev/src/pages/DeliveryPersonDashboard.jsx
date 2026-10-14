import React from "react";
import { Outlet } from "react-router-dom";
import DeliverySidebar from "../components/DeliverySiderBar";
import Navbar from "../components/Navbar";
import { Container } from "react-bootstrap";

const DeliveryPersonDashboard = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        style={{
          width: "240px",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          backgroundColor: "#fff",
          zIndex: 1031, 
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <DeliverySidebar />
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "240px", // match sidebar width
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <Navbar />
        <Container fluid className="pt-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default DeliveryPersonDashboard;

