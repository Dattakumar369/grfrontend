import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import { addProduct } from "../../services/productService";

const AddProductPage = ({ onClose }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    quantityType: "50 grams",
    status: "Active",
    categoryId: "",
    subCategory: "",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cats = sessionStorage.getItem("categories");
    if (cats) {
      const parsedCategories = JSON.parse(cats);
      setCategories(parsedCategories);
    }
  }, []);

  useEffect(() => {
    if (product.categoryId) {
      const selectedCategory = categories.find(cat => cat.id == product.categoryId);
      if (selectedCategory && selectedCategory.subCategories) {
        setSubCategories(selectedCategory.subCategories);
      } else {
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
    }
    // Reset subcategory when category changes
    setProduct(prev => ({ ...prev, subCategory: "" }));
  }, [product.categoryId, categories]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!product.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (product.name.length < 2 || product.name.length > 100) {
      newErrors.name = "Product name must be between 2 and 100 characters";
    }

    // Description validation
    if (!product.description.trim()) {
      newErrors.description = "Description is required";
    } else if (product.description.length < 10 || product.description.length > 1000) {
      newErrors.description = "Description must be between 10 and 1000 characters";
    }

    // Price validation
    if (!product.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(product.price) || parseFloat(product.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    // Quantity validation
    if (!product.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(product.quantity) || parseInt(product.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    // Quantity Type validation
    if (!product.quantityType) {
      newErrors.quantityType = "Quantity type is required";
    }

    // Status validation
    if (!product.status) {
      newErrors.status = "Status is required";
    }

    // Category validation
    if (!product.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    // Subcategory validation (only if subcategories exist)
    if (subCategories.length > 0 && !product.subCategory) {
      newErrors.subCategory = "Subcategory is required";
    }

    // Image validation
    if (product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        if (product.images[i].size > 1024 * 1024 * 5) {
          newErrors.images = `Image ${i + 1} is too large (max 5MB)`;
          break;
        }
        if (!product.images[i].type.match('image.*')) {
          newErrors.images = `File ${i + 1} is not an image`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "images") {
      setProduct({ ...product, images: Array.from(files) });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", product.price);
      formData.append("quantity", product.quantity);
      formData.append("quantityType", product.quantityType);
      formData.append("status", product.status);
      formData.append("categoryId", product.categoryId);
      formData.append("subCategory", product.subCategory);

      for (let i = 0; i < product.images.length; i++) {
        formData.append("images", product.images[i]);
      }

      await addProduct(formData);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" controlId="productName">
        <Form.Label>Product Name *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter product name"
          name="name"
          value={product.name}
          onChange={handleChange}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="productDescription">
        <Form.Label>Description *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter product description"
          name="description"
          value={product.description}
          onChange={handleChange}
          isInvalid={!!errors.description}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description}
        </Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="productPrice">
            <Form.Label>Price *</Form.Label>
            <Form.Control
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Price"
              name="price"
              value={product.price}
              onChange={handleChange}
              isInvalid={!!errors.price}
            />
            <Form.Control.Feedback type="invalid">
              {errors.price}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3" controlId="productQuantity">
            <Form.Label>Quantity *</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Quantity"
              name="quantity"
              value={product.quantity}
              onChange={handleChange}
              isInvalid={!!errors.quantity}
            />
            <Form.Control.Feedback type="invalid">
              {errors.quantity}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="productQuantityType">
            <Form.Label>Quantity Type *</Form.Label>
            <Form.Select
              name="quantityType"
              value={product.quantityType}
              onChange={handleChange}
              isInvalid={!!errors.quantityType}
            >
              <option value="50 grams">50 Grams</option>
              <option value="100 grams">100 Grams</option>
              <option value="250 grams">250 Grams</option>
              <option value="500 grams">500 Grams</option>
              <option value="1kg">1 Kilogram</option>
              <option value="1litre">1 Litre</option>
              <option value="lbs">Pounds</option>
              <option value="pieces">Pieces</option>
              <option value="dozens">Dozens</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.quantityType}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3" controlId="productStatus">
            <Form.Label>Status *</Form.Label>
            <Form.Select 
              name="status" 
              value={product.status} 
              onChange={handleChange}
              isInvalid={!!errors.status}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.status}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="productCategory">
        <Form.Label>Category *</Form.Label>
        <Form.Select
          name="categoryId"
          value={product.categoryId}
          onChange={handleChange}
          isInvalid={!!errors.categoryId}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.categoryId}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="productSubCategory">
        <Form.Label>
          Sub Category {subCategories.length > 0 && '*'}
        </Form.Label>
        <Form.Select
          name="subCategory"
          value={product.subCategory}
          onChange={handleChange}
          disabled={!product.categoryId || subCategories.length === 0}
          isInvalid={!!errors.subCategory}
        >
          <option value="">
            {subCategories.length === 0 
              ? product.categoryId 
                ? "No subcategories available" 
                : "Select a category first"
              : "Select Sub Category"}
          </option>
          {subCategories.map((subCat, index) => (
            <option key={index} value={subCat}>
              {subCat}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.subCategory}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="productImages">
        <Form.Label>Upload Images (Max 5)</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*"
          name="images"
          onChange={handleChange}
          isInvalid={!!errors.images}
        />
        <Form.Text muted>
          You can upload up to 5 images (max 5MB each)
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errors.images}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Saving...</span>
            </>
          ) : (
            "Save Product"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddProductPage;