import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { updateCategory } from '../../services/categoryService';

const EditCategory = ({ onClose, categoryData, onSave }) => {
  const [formData, setFormData] = useState({
    name: categoryData.name || '',
    description: categoryData.description || '',
    subCategories: categoryData.subCategories || [],
    status: categoryData.status || 'ACTIVE'
  });

  const [subCategoriesInput, setSubCategoriesInput] = useState(
    categoryData.subCategories ? categoryData.subCategories.join(", ") : ""
  );

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }

    if (formData.description.length > 255) {
      newErrors.description = "Description must be less than 255 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubCategoriesChange = (e) => {
    const value = e.target.value;
    setSubCategoriesInput(value);
    
    const subCategoriesArray = value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    
    setFormData(prev => ({
      ...prev,
      subCategories: subCategoriesArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategory(categoryData.id, formData);
      onSave();
      onClose();
    } catch (error) {
      setApiError(error.response?.data?.message || "Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {apiError && <Alert variant="danger">{apiError}</Alert>}

      <Form.Group className="mb-3" controlId="formCategoryName">
        <Form.Label>Category Name *</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          isInvalid={!!errors.name}
          maxLength={50}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
        <Form.Text muted>Maximum 50 characters</Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          isInvalid={!!errors.description}
          maxLength={255}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description}
        </Form.Control.Feedback>
        <Form.Text muted>Maximum 255 characters</Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formSubCategories">
        <Form.Label>Sub Categories (comma separated)</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Fresh Fruits, Asian Vegetables, Organic Greens"
          value={subCategoriesInput}
          onChange={handleSubCategoriesChange}
        />
        <Form.Text muted>
          Current sub-categories: {formData.subCategories.join(", ")}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formStatus">
        <Form.Label>Status *</Form.Label>
        <Form.Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
      </Form.Group>

      <div className="text-end">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Form>
  );
};

export default EditCategory;