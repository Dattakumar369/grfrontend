import React, { useEffect, useState } from "react";
import { getWishlistByUser, removeProductFromWishlist, moveToCart } from "../../services/wishlistService";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Col, Container, Row, Image, Breadcrumb } from "react-bootstrap";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user?.id) {
      fetchWishlist(user.id);
    }
  }, []);

  const fetchWishlist = async (userId) => {
    try {
      const data = await getWishlistByUser(userId);
      setWishlist(data);
      console.log("Wishlist loaded:", data);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  };

  const removeFromWishlist = async (userId, productId) => {
    try {
      await removeProductFromWishlist(userId, productId);
      fetchWishlist(userId);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const handleMoveToCart = async (userId, productId) => {
    try {
      await moveToCart(userId, productId);
      // Remove from wishlist after moving to cart
      await removeProductFromWishlist(userId, productId);
      // Refresh wishlist
      fetchWishlist(userId);
      // Navigate to cart page
      navigate("/cart");
    } catch (err) {
      console.error("Error moving to cart:", err);
    }
  };

  return (
    <Container className="py-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Wishlist</Breadcrumb.Item>
      </Breadcrumb>

      <h4 className="mb-4">My Wishlist</h4>

      {wishlist.length === 0 ? (
        <p className="text-muted text-center">Your wishlist is empty.</p>
      ) : (
        <Row>
          {wishlist.map((item) => (
            <Col key={item.productId} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="h-100">
                <Image
                  src={item.productImage || "/placeholder-product.jpg"}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title className="fs-6">{item.productName}</Card.Title>
                    <Card.Text className="text-success fw-bold">
                      ${item.productPrice?.toFixed(2)}
                    </Card.Text>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <Button
                        as={Link}
                        to={`/product/${item.productId}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          removeFromWishlist(item.userId, item.productId)
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMoveToCart(item.userId, item.productId)}
                    >
                      Move to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Wishlist;