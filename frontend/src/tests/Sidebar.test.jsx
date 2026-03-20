import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Sidebar Component', () => {
  it('renders standard navigation links correctly', () => {
    // Render the component inside a Router since it uses <Link> and <NavLink>
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Assert that the brand name and expected links are present
    expect(screen.getByText('DialysisCare')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText("Today's Sessions")).toBeInTheDocument();
    expect(screen.getByText('Add Patient')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
  });
});
