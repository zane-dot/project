import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <h4 className="font-bold mb-3">
            FlatHunt <span className="text-primary">HK</span>
          </h4>
          <p className="text-muted-foreground">
            基于政府开放数据的香港租房决策平台。 数据透明、來源可考、永不爬虫。
          </p>
        </div>
        <div>
          <h5 className="font-semibold mb-3">產品</h5>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/search" className="hover:text-foreground">搜索房源</Link></li>
            <li><Link href="/insights" className="hover:text-foreground">租金洞察</Link></li>
            <li><Link href="/map" className="hover:text-foreground">地图模式</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-3">數據來源</h5>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="https://data.gov.hk" target="_blank" rel="noreferrer" className="hover:text-foreground">data.gov.hk</a></li>
            <li><a href="https://www.rvd.gov.hk" target="_blank" rel="noreferrer" className="hover:text-foreground">差饷物业估价署</a></li>
            <li><a href="https://www.mtr.com.hk" target="_blank" rel="noreferrer" className="hover:text-foreground">港铁 MTR</a></li>
            <li><a href="https://www.edb.gov.hk" target="_blank" rel="noreferrer" className="hover:text-foreground">教育局</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-3">关于</h5>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">數據透明聲明</Link></li>
            <li><a href="https://github.com/zane-dot/project" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FlatHunt HK · Open Source · Made for 香港
      </div>
    </footer>
  );
}
