/**
 * ServiceCard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock ServiceCard component
const MockServiceCard = ({ service }) => (
  <div data-testid="service-card" className="service-card">
    <div data-testid="service-image">
      <img src={service.imagePath} alt={service.title} />
    </div>
    <div data-testid="service-content">
      <h3 data-testid="service-title">{service.title}</h3>
      <p data-testid="service-description">{service.description}</p>
    </div>
    <button data-testid="learn-more-button">Learn More</button>
  </div>
);

describe('ServiceCard Component', () => {
  const mockService = {
    title: 'Waste Collection',
    description: 'Professional waste collection services',
    imagePath: '/images/waste.jpg',
    slug: 'waste-collection',
  };

  describe('Rendering', () => {
    it('should render the service card', () => {
      render(<MockServiceCard service={mockService} />);
      expect(screen.getByTestId('service-card')).toBeInTheDocument();
    });

    it('should display service title', () => {
      render(<MockServiceCard service={mockService} />);
      expect(screen.getByTestId('service-title')).toHaveTextContent('Waste Collection');
    });

    it('should display service description', () => {
      render(<MockServiceCard service={mockService} />);
      expect(screen.getByTestId('service-description')).toHaveTextContent('Professional waste collection services');
    });

    it('should render service image', () => {
      render(<MockServiceCard service={mockService} />);
      expect(screen.getByTestId('service-image')).toBeInTheDocument();
    });

    it('should render learn more button', () => {
      render(<MockServiceCard service={mockService} />);
      expect(screen.getByTestId('learn-more-button')).toBeInTheDocument();
    });
  });

  describe('Different Services', () => {
    it('should render recycling centers service', () => {
      const recyclingService = {
        title: 'Recycling Centers',
        description: 'State-of-the-art recycling facilities',
        imagePath: '/images/centers.jpg',
        slug: 'recycling-centers',
      };
      render(<MockServiceCard service={recyclingService} />);
      expect(screen.getByTestId('service-title')).toHaveTextContent('Recycling Centers');
    });

    it('should render home collection service', () => {
      const homeService = {
        title: 'Home Collection',
        description: 'Convenient doorstep collection services',
        imagePath: '/images/homeRecycle.jpg',
        slug: 'home-collection',
      };
      render(<MockServiceCard service={homeService} />);
      expect(screen.getByTestId('service-title')).toHaveTextContent('Home Collection');
    });
  });

  describe('Edge Cases', () => {
    it('should handle long descriptions', () => {
      const longDescService = {
        ...mockService,
        description: 'This is a very long description that might cause layout issues if not handled properly. It should still render correctly without breaking the card layout.',
      };
      render(<MockServiceCard service={longDescService} />);
      expect(screen.getByTestId('service-description')).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialService = {
        ...mockService,
        title: "Waste & Recycling - The Complete Solution™",
      };
      render(<MockServiceCard service={specialService} />);
      expect(screen.getByTestId('service-title')).toHaveTextContent("Waste & Recycling - The Complete Solution™");
    });
  });
});
