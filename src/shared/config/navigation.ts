export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

export type NavIcon = 'layoutDashboard' | 'calendarDays' | 'users' | 'scissors';

export const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'layoutDashboard' },
  { label: 'Appointments', href: '/appointments', icon: 'calendarDays' },
  { label: 'Clients', href: '/clients', icon: 'users' },
  { label: 'Services', href: '/services', icon: 'scissors' },
];
