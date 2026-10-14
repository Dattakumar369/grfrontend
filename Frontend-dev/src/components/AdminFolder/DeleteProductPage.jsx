import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { deleteProduct } from "../../services/productService";

const DeleteProductPage = ({ show, onClose, productId, onDeleted }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await deleteProduct(productId);
      onDeleted(); // notify parent that deletion succeeded (to refresh list etc)
      onClose();
    } catch (err) {
      setError("Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Product</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Are you sure you want to delete this product?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteProductPage;
