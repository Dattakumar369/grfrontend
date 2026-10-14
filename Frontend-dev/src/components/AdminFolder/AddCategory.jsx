import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { addCategory } from "../../services/categoryService";

const initialCategory = {
  name: "",
  description: "",
  subCategories: [],
  status: "ACTIVE",
};

const AddCategory = ({ onClose }) => {
  const [formData, setFormData] = useState(initialCategory);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subCategoriesInput, setSubCategoriesInput] = useState("");

  const validateForm = () => {
    const newErrors = {};
    const { name, description, status } = formData;

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Category name is required";
    } else if (name.length > 50) {
      newErrors.name = "Category name must be less than 50 characters";
    }

    // Description validation
    if (description.length > 255) {
      newErrors.description = "Description must be less than 255 characters";
    }

    // Status validation
    if (!status) {
      newErrors.status = "Status is required";
    } else if (!["ACTIVE", "INACTIVE"].includes(status)) {
      newErrors.status = "Status must be ACTIVE or INACTIVE";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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
      await addCategory(formData);
      onClose(); 
    } catch (error) {
      setApiError(error.response?.data?.message || "Failed to add category. Please try again.");
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
          placeholder="Enter category name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          isInvalid={!!errors.name}
          maxLength={50}
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
          placeholder="Enter description"
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
      value={subCategoriesInput} // Use the display state
      onChange={handleSubCategoriesChange}
    />
    <Form.Text muted>
      Current sub-categories array: {JSON.stringify(formData.subCategories)}
    </Form.Text>
  </Form.Group>

      <Form.Group className="mb-3" controlId="formStatus">
        <Form.Label>Status *</Form.Label>
        <Form.Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          isInvalid={!!errors.status}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.status}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-end mt-4">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancel
        </Button>
        <Button 
          variant="success" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Category"}
        </Button>
      </div>
    </Form>
  );
};

export default AddCategory; 