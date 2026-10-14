import React from "react";
import CarouselComponent from "../components/CarouselComponent";
import ProductSection from "../components/ProductSection";
import { Container } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";

const HomePage = () => {
  const { setCartCount } = useOutletContext();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <main className="d-flex flex-column flex-grow-1">
        <Container fluid className="p-0 m-0">
          <CarouselComponent />
        </Container>
        <Container fluid className="p-0 mt-0">
          <ProductSection setCartCount={setCartCount} />
        </Container>
      </main>
    </div>
  );
};

export default HomePage;
