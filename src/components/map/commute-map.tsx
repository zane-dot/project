'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle } from 'react-leaflet';
import { MTR_STATIONS, type MtrStation } from '@/data/mtr-stations';

function colorForMins(mins: number): string {
  if (mins <= 15) return '#22c55e';
  if (mins <= 25) return '#84cc16';
  if (mins <= 40) return '#eab308';
  if (mins <= 60) return '#f97316';
  return '#ef4444';
}

export function CommuteMap({
  workStation,
  timeMap,
  maxMins,
}: {
  workStation: MtrStation;
  timeMap: Map<string, number>;
  maxMins: number;
}) {
  return (
    <MapContainer
      key={workStation.code}
      center={[22.32, 114.17]}
      zoom={11}
      scrollWheelZoom
      className="h-[500px] w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 工作站点的等时圈光环 */}
      {[15, 25, 40].map((t) => (
        <Circle
          key={t}
          center={[workStation.lat, workStation.lng]}
          radius={t * 400}
          pathOptions={{
            color: colorForMins(t),
            fillColor: colorForMins(t),
            fillOpacity: 0.04,
            weight: 1,
            dashArray: '4 6',
          }}
        />
      ))}

      {/* 工作站点（高亮） */}
      <CircleMarker
        center={[workStation.lat, workStation.lng]}
        radius={11}
        pathOptions={{
          color: '#fff',
          fillColor: 'hsl(12 88% 55%)',
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          <span className="font-bold">🏢 {workStation.nameZh}</span>
        </Tooltip>
      </CircleMarker>

      {/* 所有其他站点，按通勤时间着色 */}
      {MTR_STATIONS.filter((s) => s.code !== workStation.code).map((s) => {
        const mins = timeMap.get(s.code) ?? Infinity;
        const within = mins <= maxMins;
        const color = mins === Infinity ? '#94a3b8' : colorForMins(mins);
        return (
          <CircleMarker
            key={s.code}
            center={[s.lat, s.lng]}
            radius={within ? 7 : 4}
            pathOptions={{
              color: '#fff',
              fillColor: color,
              fillOpacity: within ? 0.9 : 0.35,
              weight: within ? 2 : 1,
            }}
          >
            <Tooltip>
              <div className="text-xs">
                <div className="font-semibold">{s.nameZh} · {s.nameEn}</div>
                <div>通勤约 <b>{mins === Infinity ? '—' : `${mins} 分钟`}</b></div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
