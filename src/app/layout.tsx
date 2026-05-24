import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: { default: 'RentSense HK · 香港租房决策中心', template: '%s · RentSense HK' },
  description:
    '挂牌价不等于真实月支出。代理佣金、差饷、管理费、通勤车费一键算清。Dijkstra 算法在港铁网络上从公司反向找住区。基于差估署 2026 Q1 数据。',
  keywords: ['香港租屋', '租金计算器', 'MTR 通勤', '租房决策', 'RentSense', 'HK rental cost'],
  openGraph: {
    title: 'RentSense HK · 先算账，再签约',
    description: '香港租房真实成本计算 + 通勤反向搜索',
    locale: 'zh_HK',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
