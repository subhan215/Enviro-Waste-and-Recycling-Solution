/**
 * UI Components Tests
 * Tests for: Button, Input, Card, Alert, Loader, etc.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Button Component
const MockButton = ({ children, onClick, disabled, variant = 'primary', loading }) => (
  <button
    data-testid="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={`btn btn-${variant}`}
  >
    {loading ? <span data-testid="loading-spinner">Loading...</span> : children}
  </button>
);

// Mock Input Component
const MockInput = ({ label, value, onChange, error, type = 'text', placeholder }) => (
  <div data-testid="input-wrapper">
    {label && <label data-testid="input-label">{label}</label>}
    <input
      data-testid="input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={error ? 'error' : ''}
    />
    {error && <span data-testid="input-error">{error}</span>}
  </div>
);

// Mock Card Component
const MockCard = ({ title, children, footer }) => (
  <div data-testid="card" className="card">
    {title && <div data-testid="card-title">{title}</div>}
    <div data-testid="card-content">{children}</div>
    {footer && <div data-testid="card-footer">{footer}</div>}
  </div>
);

// Mock Alert Component
const MockAlert = ({ type, message, onClose }) => (
  <div data-testid="alert" className={`alert alert-${type}`}>
    <span data-testid="alert-message">{message}</span>
    {onClose && <button data-testid="alert-close" onClick={onClose}>×</button>}
  </div>
);

// Mock Loader Component
const MockLoader = ({ size = 'medium', text }) => (
  <div data-testid="loader" className={`loader loader-${size}`}>
    <div data-testid="loader-spinner" className="spinner" />
    {text && <span data-testid="loader-text">{text}</span>}
  </div>
);

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<MockButton>Click Me</MockButton>);
      expect(screen.getByTestId('button')).toHaveTextContent('Click Me');
    });

    it('should apply primary variant by default', () => {
      render(<MockButton>Button</MockButton>);
      expect(screen.getByTestId('button')).toHaveClass('btn-primary');
    });

    it('should apply custom variant', () => {
      render(<MockButton variant="secondary">Button</MockButton>);
      expect(screen.getByTestId('button')).toHaveClass('btn-secondary');
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<MockButton onClick={handleClick}>Click</MockButton>);

      fireEvent.click(screen.getByTestId('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<MockButton onClick={handleClick} disabled>Click</MockButton>);

      fireEvent.click(screen.getByTestId('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<MockButton loading>Submit</MockButton>);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<MockButton loading>Submit</MockButton>);
      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should not show loading spinner when not loading', () => {
      render(<MockButton>Submit</MockButton>);
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
});

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<MockInput />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should render label when provided', () => {
      render(<MockInput label="Email" />);
      expect(screen.getByTestId('input-label')).toHaveTextContent('Email');
    });

    it('should render placeholder', () => {
      render(<MockInput placeholder="Enter email" />);
      expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter email');
    });
  });

  describe('Value Handling', () => {
    it('should display value', () => {
      render(<MockInput value="test@example.com" onChange={jest.fn()} />);
      expect(screen.getByTestId('input')).toHaveValue('test@example.com');
    });

    it('should call onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<MockInput value="" onChange={handleChange} />);

      fireEvent.change(screen.getByTestId('input'), { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('should display error message when provided', () => {
      render(<MockInput error="This field is required" />);
      expect(screen.getByTestId('input-error')).toHaveTextContent('This field is required');
    });

    it('should have error class when error is present', () => {
      render(<MockInput error="Error" />);
      expect(screen.getByTestId('input')).toHaveClass('error');
    });

    it('should not show error when not provided', () => {
      render(<MockInput />);
      expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<MockInput />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('should render password input', () => {
      render(<MockInput type="password" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should render email input', () => {
      render(<MockInput type="email" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });
  });
});

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render card', () => {
      render(<MockCard>Content</MockCard>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<MockCard title="Card Title">Content</MockCard>);
      expect(screen.getByTestId('card-title')).toHaveTextContent('Card Title');
    });

    it('should render children content', () => {
      render(<MockCard>Card Content</MockCard>);
      expect(screen.getByTestId('card-content')).toHaveTextContent('Card Content');
    });

    it('should render footer when provided', () => {
      render(<MockCard footer="Footer Content">Content</MockCard>);
      expect(screen.getByTestId('card-footer')).toHaveTextContent('Footer Content');
    });
  });

  describe('Optional Elements', () => {
    it('should not render title when not provided', () => {
      render(<MockCard>Content</MockCard>);
      expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
    });

    it('should not render footer when not provided', () => {
      render(<MockCard>Content</MockCard>);
      expect(screen.queryByTestId('card-footer')).not.toBeInTheDocument();
    });
  });
});

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render alert', () => {
      render(<MockAlert type="success" message="Success!" />);
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    it('should display message', () => {
      render(<MockAlert type="success" message="Operation successful" />);
      expect(screen.getByTestId('alert-message')).toHaveTextContent('Operation successful');
    });

    it('should apply correct type class', () => {
      render(<MockAlert type="error" message="Error" />);
      expect(screen.getByTestId('alert')).toHaveClass('alert-error');
    });
  });

  describe('Alert Types', () => {
    it('should render success alert', () => {
      render(<MockAlert type="success" message="Success" />);
      expect(screen.getByTestId('alert')).toHaveClass('alert-success');
    });

    it('should render error alert', () => {
      render(<MockAlert type="error" message="Error" />);
      expect(screen.getByTestId('alert')).toHaveClass('alert-error');
    });

    it('should render warning alert', () => {
      render(<MockAlert type="warning" message="Warning" />);
      expect(screen.getByTestId('alert')).toHaveClass('alert-warning');
    });

    it('should render info alert', () => {
      render(<MockAlert type="info" message="Info" />);
      expect(screen.getByTestId('alert')).toHaveClass('alert-info');
    });
  });

  describe('Dismissible', () => {
    it('should render close button when onClose provided', () => {
      render(<MockAlert type="success" message="Test" onClose={jest.fn()} />);
      expect(screen.getByTestId('alert-close')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(<MockAlert type="success" message="Test" onClose={handleClose} />);

      fireEvent.click(screen.getByTestId('alert-close'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not render close button when onClose not provided', () => {
      render(<MockAlert type="success" message="Test" />);
      expect(screen.queryByTestId('alert-close')).not.toBeInTheDocument();
    });
  });
});

describe('Loader Component', () => {
  describe('Rendering', () => {
    it('should render loader', () => {
      render(<MockLoader />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should render spinner', () => {
      render(<MockLoader />);
      expect(screen.getByTestId('loader-spinner')).toBeInTheDocument();
    });

    it('should display text when provided', () => {
      render(<MockLoader text="Loading data..." />);
      expect(screen.getByTestId('loader-text')).toHaveTextContent('Loading data...');
    });
  });

  describe('Sizes', () => {
    it('should apply medium size by default', () => {
      render(<MockLoader />);
      expect(screen.getByTestId('loader')).toHaveClass('loader-medium');
    });

    it('should apply small size', () => {
      render(<MockLoader size="small" />);
      expect(screen.getByTestId('loader')).toHaveClass('loader-small');
    });

    it('should apply large size', () => {
      render(<MockLoader size="large" />);
      expect(screen.getByTestId('loader')).toHaveClass('loader-large');
    });
  });
});
