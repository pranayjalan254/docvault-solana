import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #000428 0%, #004e92 100%);
    color: #fff;
    scroll-behavior: smooth;
  }

  h1, h2, h3 {
    color: #fff;
  }

  a {
    text-decoration: none;
    color: #fff;
  }
`;
