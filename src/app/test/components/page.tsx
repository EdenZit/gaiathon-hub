import { Button, IconButton } from '@/components/ui/buttons';
import { Metadata } from 'next';
import { FiPlus, FiTrash, FiEdit, FiHeart } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Component Testing - GAIAthon Hub',
  description: 'Test page for UI components',
};

export default function ComponentTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Component Testing</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Icon Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <IconButton>
            <FiPlus className="h-4 w-4" />
          </IconButton>
          <IconButton variant="secondary">
            <FiTrash className="h-4 w-4" />
          </IconButton>
          <IconButton variant="outline">
            <FiEdit className="h-4 w-4" />
          </IconButton>
          <IconButton variant="ghost">
            <FiHeart className="h-4 w-4" />
          </IconButton>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <IconButton size="sm">
            <FiPlus className="h-3 w-3" />
          </IconButton>
          <IconButton size="md">
            <FiPlus className="h-4 w-4" />
          </IconButton>
          <IconButton size="lg">
            <FiPlus className="h-5 w-5" />
          </IconButton>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <IconButton isLoading />
          <IconButton disabled>
            <FiPlus className="h-4 w-4" />
          </IconButton>
        </div>
      </section>
    </div>
  );
} 