'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/kalender', label: 'Kalender', icon: '📅' },
  { href: '/bestof', label: 'Best of', icon: '⭐' },
  { href: '/einstellungen', label: 'Mehr', icon: '⚙️' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-stone-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[4rem] ${
                isActive
                  ? 'text-honey-600 bg-honey-50'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
