import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProjectCard({
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: ProjectCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
      )}
      onClick={onSelect}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
