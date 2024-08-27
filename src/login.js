import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Perform login logic here
    navigate('/dashboard');
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#d873f5',
  };

  const logoContainerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
  };

  const logoImageStyle = {
    width: '100px',
  };

  const logoTextStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '2em',
    color: '#ffffff',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '300px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
  };

  const labelStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '1em',
    marginBottom: '5px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #cccccc',
    borderRadius: '5px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#a5ff84',
    border: 'none',
    borderRadius: '5px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '1em',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={logoContainerStyle}>
        <img src="logo.png" alt="Scrapgod Logo" style={logoImageStyle} />
        <h1 style={logoTextStyle}>GreenCycle</h1>
      </div>
      <div style={formStyle}>
        <label htmlFor="username" style={labelStyle}>UserName</label>
        <input type="text" id="username" name="username" style={inputStyle} />
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input type="password" id="password" name="password" style={inputStyle} />
        <button type="button" style={buttonStyle} onClick={handleLogin}>Log In</button>
      </div>
    </div>
  );
};

export default Login;
