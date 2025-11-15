import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from './Card';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  color?: string; // ex: "#00c758" ou une couleur tailwind comme "bg-green-500"
  className?: string;
}

export function StatCard({ icon: Icon, title, value, color = '#052648', className }: StatCardProps) {
  // Détecter si la couleur est une classe Tailwind (commence par bg-, text-, etc.)
  const isTailwindColor = /^(bg|text|border)-/.test(color);
  
  const iconBgStyle = isTailwindColor ? {} : { backgroundColor: `${color}1A` }; // ex: #00c7581A for 10% opacity
  const iconColorStyle = isTailwindColor ? {} : { color: color };
  const iconBgClass = isTailwindColor ? color.replace('bg-', 'bg-').replace(/-\d+$/, (match) => `-${parseInt(match.substring(1)) / 10}`) : ''; // bg-green-500 -> bg-green-50
  const iconColorClass = isTailwindColor ? color.replace('bg-', 'text-') : '';

  return (
    <Card className={cn("flex flex-row items-center gap-4 p-4 hover:-translate-y-1", className)}>
        <div 
          className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg", iconBgClass)} 
          style={iconBgStyle}
        >
          <Icon className={cn("h-6 w-6", iconColorClass)} style={iconColorStyle} />
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
    </Card>
  );
};