import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Chart } from '../components/Chart';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Chart Component', () => {
  const mockData = [
    { x: 'Jan', y: 100 },
    { x: 'Feb', y: 200 },
    { x: 'Mar', y: 150 },
  ];

  it('renders line chart correctly', () => {
    render(
      <TestWrapper>
        <Chart data={mockData} type="line" title="Test Chart" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Chart')).toBeTruthy();
  });

  it('renders bar chart correctly', () => {
    render(
      <TestWrapper>
        <Chart data={mockData} type="bar" title="Bar Chart" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Bar Chart')).toBeTruthy();
  });

  it('renders pie chart correctly', () => {
    render(
      <TestWrapper>
        <Chart data={mockData} type="pie" title="Pie Chart" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Pie Chart')).toBeTruthy();
  });

  it('handles empty data gracefully', () => {
    render(
      <TestWrapper>
        <Chart data={[]} type="line" title="Empty Chart" />
      </TestWrapper>
    );
    
    expect(screen.getByText('Empty Chart')).toBeTruthy();
  });

  it('applies custom colors correctly', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];
    render(
      <TestWrapper>
        <Chart 
          data={mockData} 
          type="pie" 
          title="Colored Chart" 
          colors={customColors}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Colored Chart')).toBeTruthy();
  });

  it('displays labels correctly', () => {
    render(
      <TestWrapper>
        <Chart 
          data={mockData} 
          type="line" 
          title="Chart with Labels"
          xLabel="Months"
          yLabel="Values"
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('Chart with Labels')).toBeTruthy();
    expect(screen.getByText('Months')).toBeTruthy();
    expect(screen.getByText('Values')).toBeTruthy();
  });
});
