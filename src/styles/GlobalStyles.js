import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Inter', sans-serif;
    background-color: #f7fafc;
    color: #2d3748;
    line-height: 1.5;
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }

  button {
    font-family: 'Inter', sans-serif;
  }

  input {
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default GlobalStyles; 