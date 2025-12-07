import React from 'react';

// Simple utility for conditional classes
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: number;
  className?: string;
  children: React.ReactNode;
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  gap = 0,
  className,
  children,
  ...props
}) => {
  const directionClass = direction === 'column' ? 'flex-col' : 'flex-row';
  
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }[align];

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }[justify];

  // Tailwind gap utilities are discrete, but we can approximate or use style for precise gaps
  // Using standard tailwind gap classes for simplicity: gap-0 to gap-8
  const gapClass = `gap-${gap}`;

  return (
    <div 
      className={cn('flex', directionClass, alignClass, justifyClass, gapClass, className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);