import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Spinner,
  Alert,
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import { getAllCategories } from "../services/categoryService";
import { FiChevronDown } from "react-icons/fi";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const handleSubcategoryClick = (subcategory, categoryId) => {
    navigate(`/category/${categoryId}`, {
      state: { subCategoryFilter: subcategory }
    });
  };

  const isMouseOverPopover = useRef(false);

  const handleMouseEnterCategory = (categoryId) => {
    clearTimeout(timeoutRef.current);
    setHoveredCategory(categoryId);
    setShowPopover(true);
    isMouseOverPopover.current = false;
  };

  const handleMouseLeaveCategory = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isMouseOverPopover.current) {
        setShowPopover(false);
        setHoveredCategory(null);
      }
    }, 300);
  };

  const handleMouseEnterPopover = () => {
    clearTimeout(timeoutRef.current);
    isMouseOverPopover.current = true;
    setShowPopover(true);
  };

  const handleMouseLeavePopover = () => {
    isMouseOverPopover.current = false;
    timeoutRef.current = setTimeout(() => {
      if (!isMouseOverPopover.current) {
        setShowPopover(false);
        setHoveredCategory(null);
      }
    }, 300);
  };

  // Modern styles
  const colors = {
    primary: '#2A5702',       // Main green shade
    primaryLight: '#3D7D0B',  // Lighter green
    primaryLighter: '#5E9F2F', // Even lighter green
    primaryDark: '#1C3A01',   // Darker green
    secondary: '#F8F8F8',     // Off-white background
    light: '#E8F5E9',        // Very light green
    dark: '#1A1A1A',         // Dark text
    white: '#FFFFFF',
    accent: '#FFC107',       // Amber for highlights
    danger: '#D32F2F'        // Red for errors
  };

  // Modern styles with the new color palette
  const styles = {
    section: {
      position: 'sticky',
      top: '82px',
      zIndex: 1020,
      backgroundColor: colors.white,
      padding: '0.75rem 0',
      borderBottom: `1px solid ${colors.light}`,
      boxShadow: '0 2px 8px rgba(42, 87, 2, 0.1)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    },
    scrollContainer: {
      display: 'flex',
      flexGrow: 1,
      overflowX: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      '&::WebkitScrollbar': { display: 'none' },
      paddingBottom: '4px',
      gap: '8px'
    },
    categoryItem: {
      cursor: 'pointer',
      padding: '0.6rem 1.5rem',
      backgroundColor: colors.white,
      borderRadius: '9999px',
      whiteSpace: 'nowrap',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      border: `1px solid ${colors.primaryLight}`,
      color: colors.primaryDark,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      '&:hover': {
        backgroundColor: colors.primary,
        color: colors.white,
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 6px -1px rgba(42, 87, 2, 0.2), 0 2px 4px -1px rgba(42, 87, 2, 0.12)`,
        borderColor: colors.primary
      },
      '&:active': {
        transform: 'translateY(0)',
        backgroundColor: colors.primaryDark
      }
    },
    popover: {
      borderRadius: '12px',
      border: `1px solid ${colors.primaryLight}`,
      boxShadow: '0 10px 15px -3px rgba(42, 87, 2, 0.1), 0 4px 6px -2px rgba(42, 87, 2, 0.05)',
      padding: '0.5rem 0',
      minWidth: '220px',
      overflow: 'hidden'
    },
    popoverItem: {
      padding: '0.6rem 1.5rem',
      cursor: 'pointer',
      color: colors.primaryDark,
      fontWeight: '500',
      transition: 'all 0.15s ease',
      '&:hover': {
        backgroundColor: colors.primaryLighter,
        color: colors.white
      }
    },
    loadingContainer: {
      padding: '0.75rem 0',
      textAlign: 'center'
    },
    errorContainer: {
      padding: '0.75rem 0',
      textAlign: 'center'
    },
    spinner: {
      color: colors.primary
    },
    alert: {
      backgroundColor: '#FFEBEE',
      color: colors.danger,
      borderColor: '#FFCDD2',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      fontWeight: '500'
    },
    chevronIcon: {
      transition: 'transform 0.2s ease',
      transform: showPopover ? 'rotate(180deg)' : 'rotate(0deg)'
    }
  };

  if (loading) return (
    <div style={styles.section}>
      <Container fluid="lg">
        <div style={styles.loadingContainer}>
          <Spinner animation="border" size="sm" style={styles.spinner} />
          <span className="ms-2" style={{ color: colors.primary, fontWeight: '500' }}>
            Loading categories...
          </span>
        </div>
      </Container>
    </div>
  );

  if (error) return (
    <div style={styles.section}>
      <Container fluid="lg">
        <div style={styles.errorContainer}>
          <Alert variant="danger" className="py-1 my-0" style={styles.alert}>
            Error loading categories: {error}
          </Alert>
        </div>
      </Container>
    </div>
  );

  // Subcategories popover component
  const SubcategoriesPopover = (category) => (
    <Popover
      id={`popover-${category.id}`} 
      style={styles.popover}
      onMouseEnter={handleMouseEnterPopover}
      onMouseLeave={handleMouseLeavePopover}
      ref={popoverRef}
    >
      <Popover.Body
        style={{ padding: '0' }}
        onMouseEnter={handleMouseEnterPopover}
      >
        {category.subCategories?.map((subcategory, index) => (
          <div
            key={index}
            style={styles.popoverItem}
            onClick={(e) => {
              e.stopPropagation();
              handleSubcategoryClick(subcategory, category.id);
            }}
            onMouseEnter={handleMouseEnterPopover}
            onMouseLeave={handleMouseLeavePopover}
          >
            {subcategory}
          </div>
        ))}
      </Popover.Body>
    </Popover>
  );

  return (
    <div style={styles.section}>
      <Container fluid="lg">
        <Row>
          <Col>
            <div style={styles.scrollContainer}>
              {categories.map((category) => (
                <OverlayTrigger
                  key={category.id}
                  trigger={['hover', 'focus']}
                  placement="bottom"
                  overlay={SubcategoriesPopover(category)}
                  show={hoveredCategory === category.id && showPopover}
                  onToggle={(show) => {
                    if (show) {
                      handleMouseEnterCategory(category.id);
                    } else {
                      handleMouseLeaveCategory();
                    }
                  }}
                >
                  <button
                    style={{
                      ...styles.categoryItem,
                      backgroundColor: hoveredCategory === category.id ? colors.primary : colors.white,
                      color: hoveredCategory === category.id ? colors.white : colors.primaryDark
                    }}
                    onClick={() => handleCategoryClick(category.id)}
                    className="category-item"
                    onMouseEnter={() => handleMouseEnterCategory(category.id)}
                    onMouseLeave={handleMouseLeaveCategory}
                  >
                    {category.name}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <FiChevronDown size={16} style={styles.chevronIcon} />
                    )}
                  </button>
                </OverlayTrigger>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CategoriesSection;
