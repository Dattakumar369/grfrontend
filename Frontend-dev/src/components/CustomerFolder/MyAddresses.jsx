import { useState, useEffect } from 'react';
import {   addAddress,   getUserAddresses,   getDefaultAddress,   setDefaultAddress,   deactivateAddress } from '../../services/addressService';
import {  Container,  Row,  Col,  Card,  Button,  Form,  Spinner,  Alert,  Badge,  Modal} from 'react-bootstrap';

const MyAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  

  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    label: 'Home', 
    makeDefault: false
  });

  const user = JSON.parse(sessionStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const [addressList, defaultAddr] = await Promise.all([
          getUserAddresses(userId),
          getDefaultAddress(userId).catch(() => null)
        ]);

        const mappedAddresses = (addressList || []).map(addr => ({
          _id: addr.id, 
          street: addr.address?.street || "",
          city: addr.address?.city || "",
          state: addr.address?.state || "",
          postalCode: addr.address?.postalCode || "",
          country: addr.address?.country || "",
          label: addr.addressLabel || "Home",
          isDefault: addr.isDefault,
          active: addr.active
        }));

        setAddresses(mappedAddresses);
        setDefaultAddressId(defaultAddr ? defaultAddr.id : null);
      } catch (err) {
        setError('Failed to load addresses. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { makeDefault, label, ...addressData } = newAddress;
      const addedAddress = await addAddress(
        userId, 
        addressData, 
        label, 
        makeDefault
      );

      // Flatten the added address
      const flatAdded = {
        _id: addedAddress.id,
        street: addedAddress.address?.street || "",
        city: addedAddress.address?.city || "",
        state: addedAddress.address?.state || "",
        postalCode: addedAddress.address?.postalCode || "",
        country: addedAddress.address?.country || "",
        label: addedAddress.addressLabel || "Home",
        isDefault: addedAddress.isDefault,
        active: addedAddress.active
      };

      setAddresses(prev => [...prev, flatAdded]);
      if (makeDefault) {
        setDefaultAddressId(flatAdded._id);
      }

      setNewAddress({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        label: 'Home',
        makeDefault: false
      });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add address. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setIsLoading(true);
      await setDefaultAddress(userId, addressId);
      setDefaultAddressId(addressId);
    } catch (err) {
      setError('Failed to set default address. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (addressId) => {
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  };

  const handleDeleteAddress = async () => {
    try {
      setIsLoading(true);
      await deactivateAddress(userId, addressToDelete);
      setAddresses(prev => prev.filter(addr => addr._id !== addressToDelete));
      if (defaultAddressId === addressToDelete) {
        setDefaultAddressId(null);
      }
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete address. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setAddressToDelete(null);
    }
  };

  if (isLoading && addresses.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">My Addresses</h2>
        </Col>
      </Row>
      
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      
      {/* Address List */}
      <Row className="mb-4">
        <Col>
          {addresses.length === 0 ? (
            <p className="text-muted">You haven't added any addresses yet.</p>
          ) : (
            <div className="d-grid gap-3">
              {addresses.map(address => (
                <Card 
                  key={address._id} 
                  className={defaultAddressId === address._id ? 'border-primary' : ''}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        {defaultAddressId === address._id && (
                          <Badge bg="primary" className="mb-2">Default</Badge>
                        )}
                        <Card.Title className="text-capitalize">{address.label}</Card.Title>
                        <Card.Text>
                          {address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}
                        </Card.Text>
                      </div>
                      
                      <div className="d-flex gap-2">
                        {defaultAddressId !== address._id && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleSetDefault(address._id)}
                            disabled={isLoading}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => confirmDelete(address._id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
      
      {/* Add Address Button */}
      {!showAddForm && (
        <Row>
          <Col>
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
              disabled={isLoading}
            >
              + Add New Address
            </Button>
          </Col>
        </Row>
      )}
      
      {/* Add Address Form */}
      {showAddForm && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Add New Address</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="label">
                    <Form.Label>Label</Form.Label>
                    <Form.Select
                      name="label"
                      value={newAddress.label}
                      onChange={handleInputChange}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Form.Group controlId="makeDefault" className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Set as default address"
                      name="makeDefault"
                      checked={newAddress.makeDefault}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group controlId="street">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      value={newAddress.street}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="state">
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group controlId="postalCode">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={newAddress.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={newAddress.country}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowAddForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Saving...</span>
                    </>
                  ) : 'Save Address'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this address? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAddress} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyAddresses;