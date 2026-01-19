import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

// Custom components that can be used in MDX files

export const MDXComponents = {
  // Enhanced Image component with Next.js optimization
  Image: (props: any) => (
    <Image
      {...props}
      className="rounded-lg shadow-md my-8"
      width={props.width || 800}
      height={props.height || 600}
      alt={props.alt || ''}
    />
  ),

  // Callout components for different types of messages
  Callout: ({
    type = 'info',
    title,
    children,
  }: {
    type?: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    children: React.ReactNode;
  }) => {
    const icons = {
      info: <InfoIcon className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      success: <CheckCircle2 className="h-4 w-4" />,
    };

    const variants = {
      info: 'default',
      warning: 'default',
      error: 'destructive',
      success: 'default',
    } as const;

    return (
      <Alert variant={variants[type]} className="my-6">
        <div className="flex gap-2">
          {icons[type]}
          <div>
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{children}</AlertDescription>
          </div>
        </div>
      </Alert>
    );
  },

  // Card component for featured content
  FeatureCard: ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  ),

  // Code block with custom styling (syntax highlighting is handled by rehype-highlight)
  pre: (props: any) => (
    <pre
      {...props}
      className="rounded-none border border-white/20 p-6 overflow-x-auto my-8 bg-black"
    />
  ),

  code: (props: any) => {
    // Inline code
    if (!props.className) {
      return (
        <code
          {...props}
          className="px-2 py-1 border border-white/20 bg-white/5 text-sm font-mono"
        />
      );
    }
    // Code block (handled by pre)
    return <code {...props} />;
  },

  // Enhanced links
  a: (props: any) => (
    <a
      {...props}
      className="text-white underline hover:text-gray-300 transition-colors"
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    />
  ),

  // Blockquote styling
  blockquote: (props: any) => (
    <blockquote
      {...props}
      className="border-l-2 border-white/40 pl-6 italic my-8 text-gray-400 text-xl"
    />
  ),

  // Table styling
  table: (props: any) => (
    <div className="overflow-x-auto my-8">
      <table {...props} className="w-full border-collapse" />
    </div>
  ),

  th: (props: any) => (
    <th
      {...props}
      className="border border-white/20 bg-white/5 px-4 py-3 text-left font-bold"
    />
  ),

  td: (props: any) => (
    <td {...props} className="border border-white/20 px-4 py-3" />
  ),
};

export default MDXComponents;
