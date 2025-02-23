import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function useProtectedLink() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleProtectedLink = (href: string) => {
    if (!session) {
      router.push(`/register?callbackUrl=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  return handleProtectedLink;
}

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let closeTimeout: NodeJS.Timeout;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
  };

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    handleMouseLeave,
    handleMouseEnter,
  };
} 