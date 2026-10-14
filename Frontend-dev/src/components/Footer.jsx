// import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
// import HeaderLogo from "../assets/HeaderLogo.png";

// const Footer = () => {
//   return (
//     <div style={{ backgroundColor: '#ffffff', padding: '2rem 1rem' }}>
//       <Container style={{ maxWidth: '1200px',backgroundColor: '#2A5702'}}>
//         <Row className="gy-4 justify-content-between text-center text-md-start">
//           <Col xs={12} md={3}>
//             <img
//               src={HeaderLogo}
//               alt="logo"
//               className="img-fluid mb-3"
//               style={{ height: '100px', width: 'auto', borderRadius: '30px' }}
//             />
//           </Col>

//           {/* <Col xs={6} md={2}>
//             <h5 className="text-white fs-6">Products</h5>
//             <p className="text-white mb-1 small">Frozen</p>
//             <p className="text-white mb-1 small">Oil & Ghee</p>
//             <p className="text-white mb-1 small">Snacks</p>
//           </Col> */}

//           <Col xs={6} md={2}>
//             <h5 className="text-white fs-6">Our Company</h5>
//             <p className="text-white mb-1 small">About Us</p>
//             <p className="text-white mb-1 small">Careers</p>
//             <p className="text-white mb-1 small">Blogs</p>
//             <p className="text-white mb-1 small">FAQ's</p>
//           </Col>

//           {/* <Col xs={6} md={2}>
//             <h5 className="text-white fs-6">Quick Links</h5>
//             <p className="text-white mb-1 small">Warranty</p>
//             <p className="text-white mb-1 small">Terms & Conditions</p>
//             <p className="text-white mb-1 small">Privacy Policy</p>
//           </Col> */}
//         </Row>

//         <hr className="border-secondary my-4" />

//         <div className="text-center text-white small">
//           © Groceryol. All rights reserved.
//         </div>
//       </Container>
//     </div>
//   );
// };

// export default Footer;


import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import HeaderLogo from "../assets/HeaderLogo.png";

const Footer = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '2rem 1rem' }}>
      <Container style={{ maxWidth: '1200px', backgroundColor: '#2A5702' }}>
        <Row className="gy-4 align-items-center justify-content-between"> {/* Added align-items-center */}
          {/* Logo Column - Added padding right and margin bottom */}
          <Col xs={12} md={3} className="mb-4 mb-md-0 pe-md-4"> 
            <img
              src={HeaderLogo}
              alt="logo"
              className="img-fluid"
              style={{ 
                height: '100px', 
                width: 'auto', 
                borderRadius: '30px',
                maxWidth: '100%' // Ensures image doesn't overflow
              }}
            />
          </Col>

          {/* Links Column - Added padding left */}
          <Col xs={6} md={2} className="ps-md-4">
            <h5 className="text-white fs-6 mb-3">Our Company</h5> {/* Added mb-3 for spacing below heading */}
            <div className="d-flex flex-column gap-2"> {/* Added gap between links */}
              <p className="text-white mb-0 small">About Us</p>
              <p className="text-white mb-0 small">Careers</p>
              <p className="text-white mb-0 small">Blogs</p>
              <p className="text-white mb-0 small">FAQ's</p>
            </div>
          </Col>
        </Row>

        <hr className="border-secondary my-4" />

        <div className="text-center text-white small">
          © Groceryol. All rights reserved.
        </div>
      </Container>
    </div>
  );
};

export default Footer;