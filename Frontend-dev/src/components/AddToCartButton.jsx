import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { FaPlus, FaMinus, FaShoppingCart, FaBolt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddToCartButton = ({
  productId,
  quantity = 0,
  onAddToCart,
  onQuantityChange,
  onRemoveFromCart,
  showCartButtons = true,
  size = "sm"
}) => {
  const navigate = useNavigate();

  const handleAddClick = () => onAddToCart(productId);

  const handleQuantityAdjust = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity < 1) {
      onRemoveFromCart(productId);
    } else {
      onQuantityChange(productId, change); 
    }
  };

  const handleBuyNow = () => {
    if (quantity === 0) {
      handleAddClick(); 
    }
    navigate("/checkout");
  };

  return (
    <div className="mt-auto d-flex flex-column gap-2 w-100">
      <style>{`
        @media (max-width: 576px) {
          .responsive-cart-btn {
            font-size: 0.85rem !important;
            padding: 0.375rem 0.5rem !important;
          }
          .responsive-cart-icon {
            font-size: 1rem !important;
          }
        }
        @media (min-width: 577px) and (max-width: 991px) {
          .responsive-cart-btn {
            font-size: 1rem !important;
            padding: 0.5rem 0.75rem !important;
          }
          .responsive-cart-icon {
            font-size: 1.15rem !important;
          }
        }
        @media (min-width: 992px) {
          .responsive-cart-btn {
            font-size: 1.1rem !important;
            padding: 0.5rem 1.25rem !important;
          }
          .responsive-cart-icon {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
      {quantity > 0 ? (
        <>
          <ButtonGroup size={size} className="w-100">
            <Button
              variant="outline-success"
              onClick={() => handleQuantityAdjust(-1)}
              disabled={quantity <= 0}
            >
              <FaMinus />
            </Button>
            <Button variant="outline-success" className="px-3" disabled>
              {quantity}
            </Button>
            <Button
              variant="outline-success"
              onClick={() => handleQuantityAdjust(1)}
            >
              <FaPlus />
            </Button>
          </ButtonGroup>

          {/* {showCartButtons && (
            <div className="d-flex flex-column flex-sm-row gap-2 w-100">
              <Button
                variant="outline-success"
                size={size}
                onClick={() => navigate("/cart")}
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-1 responsive-cart-btn"
              >
                <FaShoppingCart className="responsive-cart-icon" /> Go to Cart
              </Button>
              <Button
                variant="success"
                size={size}
                onClick={handleBuyNow}
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-1 responsive-cart-btn"
              >
                <FaBolt className="responsive-cart-icon" /> Buy Now
              </Button>
            </div>
          )} */}
        </>
      ) : (
        <Button
          variant="success"
          size={size}
          className="w-100 responsive-cart-btn"
          onClick={handleAddClick}
        >
          Add to Cart
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
