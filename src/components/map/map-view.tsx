'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle, Popup } from 'react-leaflet';
import { MTR_STATIONS, LINE_COLORS } from '@/data/mtr-stations';
import { DISTRICTS } from '@/data/districts';
import { formatHKD } from '@/lib/utils';

export function MapView() {
  return (
    <MapContainer
      center={[22.32, 114.17]}
      zoom={11}
      scrollWheelZoom
      className="h-[70vh] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 18 区中心 - 用气泡大小表示呎租 */}
      {DISTRICTS.map((d) => (
        <Circle
          key={d.id}
          center={d.center}
          radius={Math.max(800, d.avgPsf * 50)}
          pathOptions={{
            color: 'hsl(12 88% 55%)',
            fillColor: 'hsl(12 88% 55%)',
            fillOpacity: 0.12,
            weight: 1,
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold text-base mb-1">{d.nameZh}</div>
              <div className="text-gray-600">{d.nameEn} · {d.region}</div>
              <hr className="my-2" />
              <div>平均月租：<b>{formatHKD(d.avgRent)}</b></div>
              <div>平均呎租：<b className="text-orange-600">{formatHKD(d.avgPsf)}/呎</b></div>
              <div>同比：<b className={d.yoy > 0 ? 'text-red-600' : 'text-green-600'}>{d.yoy > 0 ? '↑' : '↓'} {Math.abs(d.yoy)}%</b></div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* MTR 站点 */}
      {MTR_STATIONS.map((s) => (
        <CircleMarker
          key={s.code}
          center={[s.lat, s.lng]}
          radius={5}
          pathOptions={{
            color: LINE_COLORS[s.lines[0]],
            fillColor: LINE_COLORS[s.lines[0]],
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Tooltip>
            <div className="text-xs">
              <b>{s.nameZh}</b> {s.nameEn} ({s.code})
              <br />
              {s.lines.join(' · ')}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
