import React from 'react';
import { Button } from 'react-bootstrap';
import { deleteCategory } from '../../services/categoryService';

const DeleteCategory = ({ onClose, categoryId, onSave }) => {
  const handleDelete = async () => {
    try {
      await deleteCategory(categoryId);
      onSave();  // Refresh the list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error deleting category:", error.message);
    }
  };

  return (
    <>
      <p>Are you sure you want to delete this category?</p>
      <div className="text-end">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </>
  );
};

export default DeleteCategory;
