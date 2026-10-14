import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Badge, Container, Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch } from "react-icons/fa";
import AddCategory from './AddCategory';
import { getAllCategories } from '../../services/categoryService';
import EditCategory from './EditCategory';
import DeleteCategory from './DeleteCategory';

const CategoriesList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    fetchCategories();
  };

  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const handleOpenDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const searchLower = searchTerm.toLowerCase();
    const idString = cat.id.toString().toLowerCase();
    
    return (
      cat.name.toLowerCase().includes(searchLower) ||
      cat.description.toLowerCase().includes(searchLower) ||
      idString.includes(searchLower) || // Search by ID
      (cat.subCategories && 
        cat.subCategories.some(subCat => 
          subCat.toLowerCase().includes(searchLower)
      )
    ));
  });

  const displaySubCategories = (subCategories) => {
    if (!subCategories || subCategories.length === 0) return '-';
    return Array.isArray(subCategories) 
      ? subCategories.join(', ') 
      : subCategories;
  };

  return (
    <Container fluid className="py-5 px-4">
      <Row className="align-items-center mb-4 mt-5 flex-wrap gap-3">
        <Col>
          <h3 className="fw-semibold mb-0">Category Management</h3>
        </Col>
        <Col xs="12" md="4">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search by name, ID, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs="12" md="auto" className="text-md-end">
          <Button
            variant="success"
            onClick={handleOpenAddModal}
            className="d-inline-flex align-items-center gap-2"
          >
            <FaPlus /> Add Category
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive bordered hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-3 py-3" style={{ width: '60px' }}>S.No</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3" style={{ width: '140px' }}>Category ID</th>
                <th className="px-3 py-3">Sub Categories</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td className="align-middle px-3 py-2">{index + 1}</td>
                    <td className="align-middle px-3 py-2">{cat.name}</td>
                    <td className="align-middle px-3 py-2">{cat.id}</td>
                    <td className="align-middle px-3 py-2">
                      {displaySubCategories(cat.subCategories)}
                    </td>
                    <td className="align-middle px-3 py-2">{cat.description}</td>
                    <td className="align-middle px-3 py-2">
                      <Badge bg={cat.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {cat.status}
                      </Badge>
                    </td>
                    <td className="align-middle px-3 py-2">
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleOpenEditModal(cat)}
                        >
                          <FaPencilAlt />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(cat)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modals remain the same */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddCategory onClose={handleCloseAddModal} />
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <EditCategory
              onClose={handleCloseEditModal}
              categoryData={selectedCategory}
              onSave={fetchCategories}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <DeleteCategory
              onClose={handleCloseDeleteModal}
              categoryId={selectedCategory.id}
              onSave={fetchCategories}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CategoriesList;