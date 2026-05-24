import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl mb-2">找不到此頁面</p>
      <p className="text-muted-foreground mb-8">可能已被移除或網址輸入錯誤</p>
      <Link href="/">
        <Button>返回首頁</Button>
      </Link>
    </div>
  );
}
