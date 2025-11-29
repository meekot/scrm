'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Scissors, Users } from 'lucide-react';
import type { NavIcon, NavItem } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/utils';

interface MainNavProps {
  items: NavItem[];
  orientation: 'sidebar' | 'bottom';
}

const iconMap: Record<NavIcon, ComponentType<{ className?: string }>> = {
  layoutDashboard: LayoutDashboard,
  calendarDays: CalendarDays,
  users: Users,
  scissors: Scissors,
};

export function MainNav({ items, orientation }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex gap-1',
        orientation === 'sidebar' && 'flex-col px-4 py-2',
        orientation === 'bottom' && 'w-full'
      )}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = iconMap[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              orientation === 'sidebar'
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'flex-1 flex-col items-center justify-center rounded-none border-t-2 border-transparent py-2 text-xs',
              isActive &&
                (orientation === 'sidebar'
                  ? 'bg-accent text-accent-foreground'
                  : 'border-primary text-primary')
            )}
          >
            <Icon
              className={cn(
                'size-5 transition-colors',
                orientation === 'bottom' && 'size-4',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <span
              className={cn(
                'transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
                orientation === 'bottom' ? 'text-xs' : 'text-sm'
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
