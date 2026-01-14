import React from 'react';
import { View, ViewProps } from 'react-native';
import { Platform } from 'react-native';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  center?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = 'xl',
  center = true,
  ...props 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const containerClasses = [
    'w-full',
    maxWidthClasses[maxWidth],
    center ? 'mx-auto' : '',
    Platform.OS === 'web' ? 'px-4' : 'px-4',
    className,
  ].filter(Boolean).join(' ');

  return (
    <View 
      style={Platform.OS === 'web' ? { className: containerClasses } : {}}
      {...props}
    >
      {children}
    </View>
  );
}