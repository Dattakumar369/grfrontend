import React, { useEffect, useState, useMemo } from "react";
import { FaPlus, FaPencilAlt, FaTrash, FaUpload, FaSearch } from "react-icons/fa";
import { Button, Table, Modal, Form, Badge, Spinner, Alert, InputGroup } from "react-bootstrap";
import AddProductPage from "./AddProductPage";
import EditProductPage from "./EditProductPage";

import {
  getAllProducts,
  deleteProduct,
  bulkUploadProducts
} from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [zipFile, setZipFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      sessionStorage.setItem("categories", JSON.stringify(data));
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    fetchProducts();
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product);
    setDeleteError("");
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const getSubCategoriesForCategory = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.subCategories || [] : [];
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteProduct(selectedProduct.id);
      setProducts(products.filter((product) => product.id !== selectedProduct.id));
      handleCloseDeleteModal();
    } catch (error) {
      setDeleteError("Failed to delete product. Please try again.");
      console.error("Error deleting product:", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenUploadModal = () => setShowUploadModal(true);
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setZipFile(null);
    setUploadStatus("");
    setIsUploading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file);
      setUploadStatus("Ready to upload: " + file.name);
    } else {
      setUploadStatus("Please select a .zip file");
      setZipFile(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!zipFile) return;

    try {
      setIsUploading(true);
      setUploadStatus("Uploading...");

      const formData = new FormData();
      formData.append("zipFile", zipFile);

      const response = await bulkUploadProducts(formData);

      setUploadStatus(`Successfully uploaded ${response.length} products`);
      setTimeout(() => {
        handleCloseUploadModal();
        fetchProducts();
      }, 1500);
    } catch (error) {
      setUploadStatus(`Error: ${error.message || "Failed to upload products"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const categoryMatch = getCategoryName(product.categoryId).toLowerCase().includes(searchLower);
      const subCategoryMatch = product.subCategory?.toLowerCase().includes(searchLower) || false;
      
      return nameMatch || categoryMatch || subCategoryMatch;
    });
  }, [searchTerm, products, categories]);

  return (
    <div className="p-4">
      {/* Header with Search */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-5 flex-wrap gap-3">
        <h3 className="mb-0 fw-semibold">Product Management</h3>

        <InputGroup style={{ maxWidth: "300px" }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleOpenUploadModal} className="d-flex align-items-center gap-2">
            <FaUpload /> Upload Products
          </Button>
          <Button variant="success" onClick={handleOpenAddModal} className="d-flex align-items-center gap-2">
            <FaPlus /> Add Product
          </Button>
        </div>
      </div>

      {/* Product Table */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-primary">
          <tr>
            <th style={{ width: "50px" }}>S.No</th>
            <th>Product</th>
            <th style={{ width: "140px" }}>Product ID</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th style={{ minWidth: "80px" }}>Price</th>
            <th style={{ minWidth: "70px" }}>Stock</th>
            <th>Status</th>
            <th style={{ minWidth: "140px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.id}</td>
                <td>{product.categoryName || getCategoryName(product.categoryId)}</td>
                <td>{product.subCategory || "-"}</td>
                <td>${product.price?.toFixed(2)}</td>
                <td>{product.quantity}</td>
                <td>
                  <Badge bg={(product.status === "In Stock" || product.status === "Active") ? "success" : "danger"}>
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleOpenEditModal(product)}
                    className="me-2"
                    title="Edit"
                  >
                    <FaPencilAlt />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenDeleteModal(product)}
                    title="Delete"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-4">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add Product Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <AddProductPage onClose={handleCloseAddModal} />
        </Modal.Body>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedProduct && (
            <EditProductPage
              onClose={handleCloseEditModal}
              productData={selectedProduct}
              categories={categories}
              onSave={fetchProducts}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Product Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          Are you sure you want to delete <strong>{selectedProduct ? selectedProduct.name : ""}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal show={showUploadModal} onHide={handleCloseUploadModal} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Upload Products</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <p>Upload a ZIP file containing product data in JSON format.</p>
          <Form.Group controlId="formZipFile" className="mb-3">
            <Form.Label>Select ZIP File</Form.Label>
            <Form.Control
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Form.Group>

          {uploadStatus && (
            <div
              className={`p-2 rounded ${
                uploadStatus.includes("Error")
                  ? "bg-danger text-white"
                  : "bg-light text-dark"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUploadModal} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkUpload}
            disabled={!zipFile || isUploading}
          >
            {isUploading && <Spinner animation="border" size="sm" className="me-2" />}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductListPage;