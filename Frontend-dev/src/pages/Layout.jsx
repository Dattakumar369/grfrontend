import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Container } from "react-bootstrap";
import CartService from "../services/cartService";

const Layout = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      let totalQuantity = 0;
      const user = JSON.parse(sessionStorage.getItem("user"));
      const guestSessionId = sessionStorage.getItem("guestSessionId");

      try {
        let cartItems = [];
        if (user) {
          cartItems = await CartService.getCartByUserId(user.id);
        } else if (guestSessionId) {
          cartItems = await CartService.getGuestCart(guestSessionId);
        }
        totalQuantity = cartItems.reduce(
          (acc, item) => acc + (item.productQuantity || 0),
          0
        );
      } catch (error) {
        console.error("Failed to fetch cart count", error);
      }
      setCartCount(totalQuantity);
    };

    fetchCartCount();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#ffffff" }}>
  <Header cartCount={cartCount}/>

  <main className="flex-grow-1 d-flex justify-content-center" style={{ backgroundColor: "#ffffff" }}>
    <Container className="px-3" style={{ maxWidth: '1200px'}}>
      <Outlet context={{ setCartCount }} />
    </Container>
  </main>

  <Footer style={{ backgroundColor: "#ffffff" }} />
</div>
  );
};

export default Layout;
