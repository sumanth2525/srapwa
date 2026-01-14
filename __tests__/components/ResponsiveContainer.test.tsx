import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ResponsiveContainer } from '../components/ResponsiveContainer';

describe('ResponsiveContainer Component', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveContainer>
        <div>Test Content</div>
      </ResponsiveContainer>
    );
    
    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('applies default className', () => {
    const { getByTestId } = render(
      <ResponsiveContainer testID="container">
        <div>Test</div>
      </ResponsiveContainer>
    );
    
    const container = getByTestId('container');
    expect(container.props.className).toContain('w-full');
    expect(container.props.className).toContain('max-w-xl');
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <ResponsiveContainer testID="container" className="custom-class">
        <div>Test</div>
      </ResponsiveContainer>
    );
    
    const container = getByTestId('container');
    expect(container.props.className).toContain('custom-class');
  });

  it('applies different maxWidth values', () => {
    const { getByTestId } = render(
      <ResponsiveContainer testID="container" maxWidth="sm">
        <div>Test</div>
      </ResponsiveContainer>
    );
    
    const container = getByTestId('container');
    expect(container.props.className).toContain('max-w-sm');
  });

  it('handles center prop correctly', () => {
    const { getByTestId } = render(
      <ResponsiveContainer testID="container" center={false}>
        <div>Test</div>
      </ResponsiveContainer>
    );
    
    const container = getByTestId('container');
    expect(container.props.className).not.toContain('mx-auto');
  });

  it('passes through additional props', () => {
    const { getByTestId } = render(
      <ResponsiveContainer testID="container" data-test="custom">
        <div>Test</div>
      </ResponsiveContainer>
    );
    
    const container = getByTestId('container');
    expect(container.props['data-test']).toBe('custom');
  });
});
