// components/Alert.js
import React, { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

// Define keyframes for the slide-in and slide-out animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

// Styled component for the alert container
const AlertContainer = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.color};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${(props) => (props.isVisible ? css`${slideIn} 0.5s forwards` : css`${slideOut} 0.5s forwards`)};

  svg {
    margin-right: 8px;
  }
`;

const Alert = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 2 seconds

    return () => clearTimeout(timer); // Clear timeout if component is unmounted
  }, [onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return { bgColor: '#00ED64', color: '#001E2B' };
      case 'info':
        return { bgColor: '#BDE5F8', color: '#00529B' };
      case 'warning':
        return { bgColor: '#FEEFB3', color: '#9F6000' };
      case 'error':
        return { bgColor: '#FFBABA', color: '#D8000C' };
      default:
        return { bgColor: '#BDE5F8', color: '#00529B' };
    }
  };

  const { bgColor, color } = getAlertStyles();

  return (
    <AlertContainer bgColor={bgColor} color={color} isVisible={true}>
      <svg
        stroke="currentColor"
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        ></path>
      </svg>
      <p className="text-xs font-semibold">{message}</p>
    </AlertContainer>
  );
};

export default Alert;
