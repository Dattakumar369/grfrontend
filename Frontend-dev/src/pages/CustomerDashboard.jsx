import React from "react";
import Header from "../components/Header";
import { useNavigate, Outlet } from "react-router-dom"; 
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const cards = [
    {
      title: "Orders",
      text: "View all your past and current orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-bag" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={32} height={32}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      borderColor: "primary",
      bgColor: "primary-bg-subtle",
      textColor: "primary",
      onClick: () => navigate("/customer/dashboard/my-orders"),
    },
    {
      title: "Wishlist",
      text: "See your saved favorite products",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-heart" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={32} height={32}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      borderColor: "danger",
      bgColor: "danger-bg-subtle",
      textColor: "danger",
      onClick: () => navigate("/customer/dashboard/wishlist"),
    },
    {
      title: "Addresses",
      text: "Manage your delivery addresses",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-geo-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={32} height={32}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      borderColor: "success",
      bgColor: "success-bg-subtle",
      textColor: "success",
      onClick: () => navigate("/customer/dashboard/addresses"),
    },
    // {
    //   title: "Account Settings",
    //   text: "Update your personal information",
    //   icon: (
    //     <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-person-gear" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={32} height={32}>
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   borderColor: "info",
    //   bgColor: "info-bg-subtle",
    //   textColor: "info",
    //   onClick: () => navigate("/customer/dashboard/settings"),
    // },
    // {
    //   title: "Help Center",
    //   text: "Get support for any issues",
    //   icon: (
    //     <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-question-circle" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={32} height={32}>
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //     </svg>
    //   ),
    //   borderColor: "warning",
    //   bgColor: "warning-bg-subtle",
    //   textColor: "warning",
    //   onClick: () => navigate("/customer/dashboard/help"),
    // },
    {
      title: "Logout",
      text: "Sign out from your account",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-box-arrow-right" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={32} height={32}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      borderColor: "info",
      bgColor: "info-bg-subtle",
      textColor: "info",
      onClick: () => {
        sessionStorage.clear();
        navigate("/");
      },
    },
  ];

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/'); 
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Header />

      <Container className="py-3" style={{ maxWidth: "1200px" }}>
        <Button
          variant="link"
          className="mb-4 d-flex align-items-center text-decoration-none"
          onClick={handleBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="me-1" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1 text-dark">Welcome back,</h2>
            <h1 className="fw-bold text-primary">{firstName} {lastName}</h1>
          </div>
          {/* <div className="bg-primary bg-opacity-10 text-primary rounded-pill px-4 py-2">
            Customer Dashboard
          </div> */}
        </div>

        <p className="mb-5 text-muted">Manage your account, orders, and preferences</p>

        <Row xs={1} sm={2} lg={3} className="g-4">
          {cards.map(({ title, text, icon, borderColor, bgColor, textColor, onClick }, idx) => (
            <Col key={idx}>
              <Card
                onClick={onClick}
                className={`h-100 border-${borderColor} cursor-pointer shadow-sm-hover`}
                style={{ 
                  transition: "transform 0.2s, box-shadow 0.2s",
                  borderWidth: "2px"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)", e.currentTarget.classList.add("shadow-sm"))}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)", e.currentTarget.classList.remove("shadow-sm"))}
              >
                <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                  <div
                    className={`mb-3 rounded-circle bg-${bgColor} p-3 d-flex align-items-center justify-content-center`}
                    style={{
                      width: "64px",
                      height: "64px",
                    }}
                  >
                    {React.cloneElement(icon, { className: `text-${textColor}` })}
                  </div>
                  <Card.Title className={`text-${textColor} fw-bold mb-2`}>{title}</Card.Title>
                  <Card.Text className="text-muted small">{text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* The Outlet renders nested routes here */}
        <div className="mt-5">
          <Outlet />
        </div>
      </Container>
    </div>
  );
};

export default CustomerDashboard;