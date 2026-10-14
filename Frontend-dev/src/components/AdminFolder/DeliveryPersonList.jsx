import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Table, Modal, Form, Alert, Image } from 'react-bootstrap';
import { FaPlus, FaPencilAlt, FaTrash, FaEye, FaExternalLinkAlt } from 'react-icons/fa';
import userService from '../../services/userService';

const DeliveryPersonList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const [currentPersonImages, setCurrentPersonImages] = useState({});
  const [imageMap, setImageMap] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    vehicleType: '',
    licenseNumber: '',
    vehicleRegistration: '',
    email: '',
    password: '',
    status: 'ACTIVE'
  });
  const [imagePreviews, setImagePreviews] = useState({
    licenseFrontImage: null,
    licenseBackImage: null,
    vehicleImage: null,
    profileImage: null
  });
  const [imageFiles, setImageFiles] = useState({
    licenseFrontImage: null,
    licenseBackImage: null,
    vehicleImage: null,
    profileImage: null
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const fetchDeliveryPersons = async () => {
    try {
      const response = await userService.getAllDeliveryPersons();
      const persons = response.data.data;
      setDeliveryPersons(persons);
      persons.forEach((person) => fetchImagesForPerson(person.id));
    } catch (error) {
      console.error("Error fetching delivery persons:", error.message);
    }
  };

  const fetchImagesForPerson = async (id) => {
    try {
      const res = await userService.getDeliveryPersonImages(id);
      console.log("Fetched images for person", id, res.data);
      const images = {
        licenseFrontImage: res.data.data.licenseFrontImageUrl,
        licenseBackImage: res.data.data.licenseBackImageUrl,
        vehicleImage: res.data.data.vehicleImageUrl,
        profileImage: res.data.data.profileImageUrl
      };
      setImageMap(prev => ({ ...prev, [id]: images }));
    } catch (err) {
      console.error("Failed to fetch images for person", id, err.message);
    }
  };

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFiles(prev => ({ ...prev, [imageType]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => ({ ...prev, [imageType]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number (10-15 digits)';
    }

    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = 'Vehicle type is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.length < 5 || formData.licenseNumber.length > 20) {
      newErrors.licenseNumber = 'License number must be between 5 and 20 characters';
    }

    if (!formData.vehicleRegistration.trim()) {
      newErrors.vehicleRegistration = 'Vehicle registration is required';
    } else if (formData.vehicleRegistration.length < 5 || formData.vehicleRegistration.length > 20) {
      newErrors.vehicleRegistration = 'Vehicle registration must be between 5 and 20 characters';
    }

    if (showAddModal) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else if (formData.email.length > 100) {
        newErrors.email = 'Email must be less than 100 characters';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8 || formData.password.length > 100) {
        newErrors.password = 'Password must be between 8 and 100 characters';
      }

      if (!imageFiles.profileImage) {
        newErrors.profileImage = 'Profile image is required';
      }
      if (!imageFiles.licenseFrontImage) {
        newErrors.licenseFrontImage = 'License front image is required';
      }
      if (!imageFiles.licenseBackImage) {
        newErrors.licenseBackImage = 'License back image is required';
      }
      if (!imageFiles.vehicleImage) {
        newErrors.vehicleImage = 'Vehicle image is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      formDataToSend.append('vehicleType', formData.vehicleType);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('vehicleRegistration', formData.vehicleRegistration);
      formDataToSend.append('licenseFrontImage', imageFiles.licenseFrontImage);
      formDataToSend.append('licenseBackImage', imageFiles.licenseBackImage);
      formDataToSend.append('vehicleImage', imageFiles.vehicleImage);
      formDataToSend.append('profileImage', imageFiles.profileImage);

      await userService.registerDeliveryPerson(formDataToSend);
      fetchDeliveryPersons();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to add delivery person');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      formDataToSend.append('vehicleType', formData.vehicleType);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('vehicleRegistration', formData.vehicleRegistration);
      formDataToSend.append('status', formData.status);
      
      // Handle all images - append if new file exists
      const imageTypes = ['licenseFrontImage', 'licenseBackImage', 'vehicleImage', 'profileImage'];
      imageTypes.forEach(type => {
        if (imageFiles[type]) {
          formDataToSend.append(type, imageFiles[type]);
        }
      });

      await userService.updateDeliveryPerson(selectedDeliveryPerson.id, formDataToSend);
      fetchDeliveryPersons();
      setShowEditModal(false);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update delivery person');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', mobileNumber: '',
      vehicleType: '', licenseNumber: '', vehicleRegistration: '',
      email: '', password: '', status: 'ACTIVE'
    });
    setImagePreviews({
      licenseFrontImage: null,
      licenseBackImage: null,
      vehicleImage: null,
      profileImage: null
    });
    setImageFiles({
      licenseFrontImage: null,
      licenseBackImage: null,
      vehicleImage: null,
      profileImage: null
    });
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      await userService.deleteDeliveryPerson(selectedDeliveryPerson.id);
      fetchDeliveryPersons();
      setShowDeleteModal(false);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to delete delivery person');
    }
  };

  const openAddModal = () => {
    resetForm();
    setApiError('');
    setShowAddModal(true);
  };

  const openEditModal = (dp) => {
    setSelectedDeliveryPerson(dp);
    setFormData({
      firstName: dp.firstName,
      lastName: dp.lastName,
      mobileNumber: dp.mobileNumber?.toString(),
      vehicleType: dp.vehicleType,
      licenseNumber: dp.licenseNumber,
      vehicleRegistration: dp.vehicleRegistration,
      email: dp.email,
      password: '',
      status: dp.status
    });
    
    const images = imageMap[dp.id] || {};
    setImagePreviews({
      licenseFrontImage: images.licenseFrontImage || null,
      licenseBackImage: images.licenseBackImage || null,
      vehicleImage: images.vehicleImage || null,
      profileImage: images.profileImage || null
    });
    
    setImageFiles({
      licenseFrontImage: null,
      licenseBackImage: null,
      vehicleImage: null,
      profileImage: null
    });
    
    setErrors({});
    setApiError('');
    setShowEditModal(true);
  };

  const openDeleteModal = (dp) => {
    setSelectedDeliveryPerson(dp);
    setApiError('');
    setShowDeleteModal(true);
  };

  const openImageModal = (dp) => {
    setSelectedDeliveryPerson(dp);
    setCurrentPersonImages(imageMap[dp.id] || {});
    setShowImageModal(true);
  };

  return (
    <Container className="my-4 p-4">
      {apiError && !showAddModal && !showEditModal && !showDeleteModal && (
        <Alert variant="danger" onClose={() => setApiError('')} dismissible>
          {apiError}
        </Alert>
      )}

      <Row className="d-flex justify-content-between align-items-center mb-4 mt-4">
        <Col>
          <h4 className='fw-semibold'>Delivery Person Management</h4>
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={openAddModal}>
            <FaPlus className="me-2" /> Add Delivery Person
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-secondary">
          <tr>
            <th style={{ width: "50px" }}>S.No</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Mobile Number</th>
            <th>Vehicle Type</th>
            <th>License Number</th>
            <th>Vehicle Registration</th>
            <th>Status</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deliveryPersons.length > 0 ? deliveryPersons.map((dp, index) => (
            <tr key={dp.id}>
              <td>{index + 1}</td>
              <td>{dp.firstName}</td>
              <td>{dp.lastName}</td>
              <td>{dp.email}</td>
              <td>{dp.mobileNumber}</td>
              <td>{dp.vehicleType}</td>
              <td>{dp.licenseNumber}</td>
              <td>{dp.vehicleRegistration}</td>
              <td>{dp.status}</td>
              <td>
                <Button 
                  variant="info" 
                  size="sm" 
                  className="me-2" 
                  onClick={() => openImageModal(dp)}
                >
                  <FaEye />
                </Button></td>
              <td>
                <Button 
                  variant="warning" 
                  size="sm" 
                  className="me-2" 
                  onClick={() => openEditModal(dp)}
                >
                  <FaPencilAlt />
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => openDeleteModal(dp)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="10" className="text-center">No delivery persons found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Delivery Person</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {apiError && <Alert variant="danger">{apiError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="firstName">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.firstName}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="lastName">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.lastName}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="mobileNumber">
                  <Form.Label>Mobile Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.mobileNumber}
                  />
                  <Form.Control.Feedback type="invalid">{errors.mobileNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="vehicleType">
                  <Form.Label>Vehicle Type *</Form.Label>
                  <Form.Select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    isInvalid={!!errors.vehicleType}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="BIKE">Bike</option>
                    <option value="CAR">Car</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="TRUCK">Truck</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.vehicleType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="licenseNumber">
                  <Form.Label>License Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.licenseNumber}
                    maxLength={20}
                  />
                  <Form.Control.Feedback type="invalid">{errors.licenseNumber}</Form.Control.Feedback>
                  <Form.Text muted>5-20 characters</Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="vehicleRegistration">
                  <Form.Label>Vehicle Registration *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleRegistration"
                    value={formData.vehicleRegistration}
                    onChange={handleInputChange}
                    isInvalid={!!errors.vehicleRegistration}
                    maxLength={20}
                  />
                  <Form.Control.Feedback type="invalid">{errors.vehicleRegistration}</Form.Control.Feedback>
                  <Form.Text muted>5-20 characters</Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="email">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="password">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  <Form.Text muted>8-100 characters</Form.Text>
                </Form.Group>
              </Col>

              {/* Image Uploads */}
              <Col md={6} className="mb-3">
                <Form.Group controlId="profileImage">
                  <Form.Label>Profile Image *</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'profileImage')}
                    isInvalid={!!errors.profileImage}
                  />
                  <Form.Control.Feedback type="invalid">{errors.profileImage}</Form.Control.Feedback>
                  {imagePreviews.profileImage && (
                    <Image src={imagePreviews.profileImage} thumbnail className="mt-2" width={100} />
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="licenseFrontImage">
                  <Form.Label>License Front Image *</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'licenseFrontImage')}
                    isInvalid={!!errors.licenseFrontImage}
                  />
                  <Form.Control.Feedback type="invalid">{errors.licenseFrontImage}</Form.Control.Feedback>
                  {imagePreviews.licenseFrontImage && (
                    <Image src={imagePreviews.licenseFrontImage} thumbnail className="mt-2" width={100} />
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="licenseBackImage">
                  <Form.Label>License Back Image *</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'licenseBackImage')}
                    isInvalid={!!errors.licenseBackImage}
                  />
                  <Form.Control.Feedback type="invalid">{errors.licenseBackImage}</Form.Control.Feedback>
                  {imagePreviews.licenseBackImage && (
                    <Image src={imagePreviews.licenseBackImage} thumbnail className="mt-2" width={100} />
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="vehicleImage">
                  <Form.Label>Vehicle Image *</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'vehicleImage')}
                    isInvalid={!!errors.vehicleImage}
                  />
                  <Form.Control.Feedback type="invalid">{errors.vehicleImage}</Form.Control.Feedback>
                  {imagePreviews.vehicleImage && (
                    <Image src={imagePreviews.vehicleImage} thumbnail className="mt-2" width={100} />
                  )}
                </Form.Group>
              </Col>
            </Row>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">Cancel</Button>
              <Button type="submit" variant="success">Add</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Delivery Person</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {apiError && <Alert variant="danger">{apiError}</Alert>}
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="editFirstName">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.firstName}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editLastName">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.lastName}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editMobileNumber">
                  <Form.Label>Mobile Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.mobileNumber}
                  />
                  <Form.Control.Feedback type="invalid">{errors.mobileNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editVehicleType">
                  <Form.Label>Vehicle Type *</Form.Label>
                  <Form.Select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    isInvalid={!!errors.vehicleType}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="BIKE">Bike</option>
                    <option value="CAR">Car</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="TRUCK">Truck</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.vehicleType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editLicenseNumber">
                  <Form.Label>License Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.licenseNumber}
                    maxLength={20}
                  />
                  <Form.Control.Feedback type="invalid">{errors.licenseNumber}</Form.Control.Feedback>
                  <Form.Text muted>5-20 characters</Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editVehicleRegistration">
                  <Form.Label>Vehicle Registration *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleRegistration"
                    value={formData.vehicleRegistration}
                    onChange={handleInputChange}
                    isInvalid={!!errors.vehicleRegistration}
                    maxLength={20}
                  />
                  <Form.Control.Feedback type="invalid">{errors.vehicleRegistration}</Form.Control.Feedback>
                  <Form.Text muted>5-20 characters</Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editEmail">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    maxLength={100}
                    disabled
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group controlId="editStatus">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Image Uploads for Edit */}
              <Col md={6} className="mb-3">
                <Form.Group controlId="editProfileImage">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'profileImage')}
                  />
                  {imagePreviews.profileImage ? (
                    <div className="mt-2">
                      <span className="text-success">Select New Image</span>
                    </div>
                  ) : imageMap[selectedDeliveryPerson?.id]?.profileImage && (
                    <div className="mt-2">
                      <span>Current image: </span>
                      <a href={imageMap[selectedDeliveryPerson?.id]?.profileImage} 
                        target="_blank" 
                        rel="noopener noreferrer">
                        View
                      </a>
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="editLicenseFrontImage">
                  <Form.Label>License Front Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'licenseFrontImage')}
                  />
                  {imagePreviews.licenseFrontImage ? (
                    <div className="mt-2">
                      <span className="text-success">Select New Image</span>
                    </div>
                  ) : imageMap[selectedDeliveryPerson?.id]?.licenseFrontImage && (
                    <div className="mt-2">
                      <span>Current image: </span>
                      <a href={imageMap[selectedDeliveryPerson?.id]?.licenseFrontImage} 
                        target="_blank" 
                        rel="noopener noreferrer">
                        View
                      </a>
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="editLicenseBackImage">
                  <Form.Label>License Back Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'licenseBackImage')}
                  />
                  {imagePreviews.licenseBackImage ? (
                    <div className="mt-2">
                      <span className="text-success">Select New Image</span>
                    </div>
                  ) : imageMap[selectedDeliveryPerson?.id]?.licenseBackImage && (
                    <div className="mt-2">
                      <span>Current image: </span>
                      <a href={imageMap[selectedDeliveryPerson?.id]?.licenseBackImage} 
                        target="_blank" 
                        rel="noopener noreferrer">
                        View
                      </a>
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group controlId="editVehicleImage">
                  <Form.Label>Vehicle Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'vehicleImage')}
                  />
                  {imagePreviews.vehicleImage ? (
                    <div className="mt-2">
                      <span className="text-success">Select New Image</span>
                    </div>
                  ) : imageMap[selectedDeliveryPerson?.id]?.vehicleImage && (
                    <div className="mt-2">
                      <span>Current image: </span>
                      <a href={imageMap[selectedDeliveryPerson?.id]?.vehicleImage} 
                        target="_blank" 
                        rel="noopener noreferrer">
                        View
                      </a>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Images for {selectedDeliveryPerson?.firstName} {selectedDeliveryPerson?.lastName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-4">
            {currentPersonImages.profileImage && (
              <Col md={6}>
                <div className="d-flex flex-column align-items-center">
                  <h5>Profile Image</h5>
                  <a href={currentPersonImages.profileImage} target="_blank" rel="noopener noreferrer">
                    <Image src={currentPersonImages.profileImage} thumbnail fluid />
                  </a>
                  <a href={currentPersonImages.profileImage} target="_blank" rel="noopener noreferrer" className="mt-2">
                    Open in new tab <FaExternalLinkAlt className="ms-1" />
                  </a>
                </div>
              </Col>
            )}
            
            {currentPersonImages.licenseFrontImage && (
              <Col md={6}>
                <div className="d-flex flex-column align-items-center">
                  <h5>License Front</h5>
                  <a href={currentPersonImages.licenseFrontImage} target="_blank" rel="noopener noreferrer">
                    <Image src={currentPersonImages.licenseFrontImage} thumbnail fluid />
                  </a>
                  <a href={currentPersonImages.licenseFrontImage} target="_blank" rel="noopener noreferrer" className="mt-2">
                    Open in new tab <FaExternalLinkAlt className="ms-1" />
                  </a>
                </div>
              </Col>
            )}
            
            {currentPersonImages.licenseBackImage && (
              <Col md={6}>
                <div className="d-flex flex-column align-items-center">
                  <h5>License Back</h5>
                  <a href={currentPersonImages.licenseBackImage} target="_blank" rel="noopener noreferrer">
                    <Image src={currentPersonImages.licenseBackImage} thumbnail fluid />
                  </a>
                  <a href={currentPersonImages.licenseBackImage} target="_blank" rel="noopener noreferrer" className="mt-2">
                    Open in new tab <FaExternalLinkAlt className="ms-1" />
                  </a>
                </div>
              </Col>
            )}
            
            {currentPersonImages.vehicleImage && (
              <Col md={6}>
                <div className="d-flex flex-column align-items-center">
                  <h5>Vehicle Image</h5>
                  <a href={currentPersonImages.vehicleImage} target="_blank" rel="noopener noreferrer">
                    <Image src={currentPersonImages.vehicleImage} thumbnail fluid />
                  </a>
                  <a href={currentPersonImages.vehicleImage} target="_blank" rel="noopener noreferrer" className="mt-2">
                    Open in new tab <FaExternalLinkAlt className="ms-1" />
                  </a>
                </div>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedDeliveryPerson?.firstName} {selectedDeliveryPerson?.lastName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeliveryPersonList;