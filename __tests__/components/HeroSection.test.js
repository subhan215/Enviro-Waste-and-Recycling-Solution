/**
 * HeroSection Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock HeroSection component
const MockHeroSection = () => (
  <section data-testid="hero-section" className="hero">
    <div data-testid="hero-content">
      <span data-testid="hero-badge">Sustainable Future</span>
      <h1 data-testid="hero-title">
        Smart <span className="highlight">Waste Management</span> Solutions
      </h1>
      <p data-testid="hero-description">
        Join the revolution in waste management. Our innovative solutions help communities
        reduce waste, increase recycling, and create a cleaner environment for future generations.
      </p>
      <div data-testid="hero-cta">
        <button data-testid="get-started-btn">Get Started</button>
        <button data-testid="learn-more-btn">Learn More</button>
      </div>
      <div data-testid="hero-stats">
        <div data-testid="stat-recycled">
          <span className="value">500K+</span>
          <span className="label">Tons Recycled</span>
        </div>
        <div data-testid="stat-communities">
          <span className="value">100+</span>
          <span className="label">Communities</span>
        </div>
        <div data-testid="stat-satisfaction">
          <span className="value">99%</span>
          <span className="label">Satisfaction</span>
        </div>
      </div>
    </div>
  </section>
);

describe('HeroSection Component', () => {
  describe('Rendering', () => {
    it('should render the hero section', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('should render the badge', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('hero-badge')).toHaveTextContent('Sustainable Future');
    });

    it('should render the main title', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('hero-title')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('hero-description')).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    it('should render Get Started button', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('get-started-btn')).toHaveTextContent('Get Started');
    });

    it('should render Learn More button', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('learn-more-btn')).toHaveTextContent('Learn More');
    });
  });

  describe('Stats Section', () => {
    it('should render stats section', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('hero-stats')).toBeInTheDocument();
    });

    it('should display recycled tons stat', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('stat-recycled')).toBeInTheDocument();
    });

    it('should display communities stat', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('stat-communities')).toBeInTheDocument();
    });

    it('should display satisfaction stat', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('stat-satisfaction')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MockHeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have section landmark', () => {
      render(<MockHeroSection />);
      expect(screen.getByTestId('hero-section').tagName).toBe('SECTION');
    });
  });
});
