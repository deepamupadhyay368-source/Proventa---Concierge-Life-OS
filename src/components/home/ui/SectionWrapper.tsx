import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div' | 'article';
}

export function SectionWrapper({ children, className, id, as: Tag = 'section' }: SectionWrapperProps) {
  return (
    <Tag id={id} className={cn('py-16 md:py-24', className)}>
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {children}
      </div>
    </Tag>
  );
}
