import Link from 'next/link';
import { Compass } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/calculator', label: '真实成本计算' },
  { href: '/commute', label: '通勤反向搜索' },
  { href: '/insights', label: '租金洞察' },
  { href: '/map', label: '区域地图' },
  { href: '/about', label: '关于数据' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Compass className="h-6 w-6 text-primary" />
          <span>
            RentSense <span className="text-primary">HK</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" size="sm">
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/calculator">
            <Button size="sm">开始计算</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
