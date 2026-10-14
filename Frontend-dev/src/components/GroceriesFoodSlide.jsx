import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import BannerTemplate3 from "../assets/BannerTemplate3.png";

const GroceriesFoodSlide = ({ isActive, setActiveIndex }) => {
  return (
    <div 
      className="bg-warning bg-gradient position-relative"
      style={{
        paddingTop: "1rem",
        paddingBottom: "3rem", // Extra space for indicators
        minHeight: "150px", // Base mobile height
        // Responsive heights
        height: {
          xs: "150px",
          sm: "180px",
          md: "220px",
          lg: "250px",
          xl: "280px"
        }
      }}
    >
      <Container fluid className="h-100">
        <Row className="align-items-center h-100">
          {/* Text Column */}
          <Col xs={6} className="text-white px-3 px-md-5 text-start">
            <h2
              className="fw-bold mb-3"
              style={{
                fontSize: "1.5rem", // base for mobile
              }}
            >
              <span className="d-block d-md-none">Groceries & Food</span>
              <span className="d-none d-md-block" style={{ fontSize: "3rem" }}>
               Fresh Produce, Meat & More
              </span>
            </h2>
            <p
              className="fw-medium"
              style={{
                fontSize: "1rem",
              }}
            >
              <span className="d-block d-md-none">Fresh Fruits, Veggies, Meat & More</span>
              <span className="d-none d-md-block" style={{ fontSize: "1.5rem" }}>
                Fresh Fruits, Veggies, Meat & More
              </span>
            </p>
          </Col>

          {/* Image Column */}
          <Col xs={6} className="text-center px-3 px-md-5 h-100">
            <img
              src={BannerTemplate3}
              alt="Food Items"
              className="img-fluid h-100"
              style={{
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Col>
        </Row>

        {/* Indicators */}
        {/* <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`rounded-circle bg-white ${
                isActive === index ? "" : "opacity-50"
              }`}
              style={{
                width: "12px",
                height: "12px",
                cursor: "pointer",
              }}
            ></span>
          ))}
        </div> */}
      </Container>
    </div>
  );
};

export default GroceriesFoodSlide;