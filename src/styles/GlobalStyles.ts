import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background: linear-gradient(135deg, #0B0C1B, #0E122A);
    font-family: 'Poppins', sans-serif;
    color: #fff;
  }
  * {
    scroll-behavior: smooth;
  }
`;
