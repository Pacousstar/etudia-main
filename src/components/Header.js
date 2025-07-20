import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Target, Users, FileText } from 'lucide-react';

function Header() {
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
          <Target className="me-2" size={32} style={{ color: '#667eea' }} />
          Solution360°
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={location.pathname === '/' ? 'active fw-bold' : ''}
            >
              <FileText className="me-1" size={18} />
              Soumettre un projet
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/admin" 
              className={location.pathname.includes('/admin') ? 'active fw-bold' : ''}
            >
              <Users className="me-1" size={18} />
              Administration
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;