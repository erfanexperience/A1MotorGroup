import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import adminLogo from '../../assests/logo-admin-page.png';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const validUsers = {
    'Hamid': 'Domain345!',
    'Erfan': 'Domain345!',
    'Nick': 'Domain345!'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validUsers[username] === password) {
      login(username);
      navigate('/admin/inventory');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Container>
      <AuthBox>
        <LogoContainer>
          <Logo src={adminLogo} alt="A1 Motor Group Admin" />
        </LogoContainer>
        <Title>Dealership Portal</Title>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <InputGroup>
            <Label>Username</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </InputGroup>
          <Button type="submit">Login</Button>
        </Form>
      </AuthBox>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;
  padding: 1rem;
`;

const AuthBox = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 1rem;

  @media (max-width: 600px) {
    padding: 2rem 1.5rem;
    margin: 0.5rem;
    border-radius: 16px;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    margin-bottom: 1.5rem;
  }
`;

const Logo = styled.img`
  max-width: 200px;
  height: auto;

  @media (max-width: 600px) {
    max-width: 160px;
  }
`;

const Title = styled.h1`
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 600px) {
    gap: 1.25rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }

  @media (max-width: 600px) {
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
`;

const Button = styled.button`
  background: #3182ce;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2b6cb0;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.5);
  }

  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 1.1rem;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background: #fff5f5;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
`;

export default AdminAuth; 