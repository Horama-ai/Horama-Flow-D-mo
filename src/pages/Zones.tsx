import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { X } from 'lucide-react';
import type { Event, Zone } from '../data/events';
import { Tabs, Badge, Button, StatusDot, Progress } from '../components/ui';

interface ZonesProps {
  event: Event;
}

export function Zones({ event }: ZonesProps) {
  const [filter, setFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const filteredZones = event.zones.filter(zone => {
    if (filter === 'critical') return zone.status === 'saturé' || zone.status === 'dense';
    if (filter === 'normal') return zone.status === 'fluide' || zone.status === 'modéré';
    return true;
  });

  const criticalCount = event.zones.filter(z => z.status === 'saturé' || z.status === 'dense').length;

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Zones</h1>
          <p className="text-sm text-gray-500 mt-1">{event.zones.length} zones • {event.zones.reduce((acc, z) => acc + z.cameras, 0)} caméras</p>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <Tabs
            tabs={[
              { id: 'all', label: 'Toutes', count: event.zones.length },
              { id: 'critical', label: 'Critiques', count: criticalCount },
              { id: 'normal', label: 'Normales' }
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      {/* Summary Cards - Seamless Tile Grid */}
      <div className="rounded-2xl overflow-hidden mb-6 lg:mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
          <div className="bg-white p-4 lg:p-6 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 lg:h-12 bg-gray-900 rounded-r" />
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2 pl-3 lg:pl-4">Densité moyenne</p>
            <p className="text-2xl lg:text-4xl font-extralight text-gray-900 tabular-nums pl-3 lg:pl-4">
              {Math.round(event.zones.reduce((acc, z) => acc + z.density, 0) / event.zones.length)}
              <span className="text-sm lg:text-lg text-gray-400 ml-1">%</span>
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6">
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2">Attente moy.</p>
            <p className="text-2xl lg:text-4xl font-extralight text-gray-900 tabular-nums">
              {Math.round(event.zones.reduce((acc, z) => acc + z.waitTime, 0) / event.zones.length)}
              <span className="text-sm lg:text-lg text-gray-400 ml-1">min</span>
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6">
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2">Saturées</p>
            <p className="text-2xl lg:text-4xl font-extralight text-rose-500 tabular-nums">
              {event.zones.filter(z => z.status === 'saturé').length}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6">
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2">Denses</p>
            <p className="text-2xl lg:text-4xl font-extralight text-amber-500 tabular-nums">
              {event.zones.filter(z => z.status === 'dense').length}
            </p>
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {filteredZones.map((zone, idx) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <div
              onClick={() => setSelectedZone(zone)}
              className="p-4 lg:p-5 rounded-2xl border border-gray-200 bg-white cursor-pointer transition-all hover:shadow-lg hover:border-gray-300 active:scale-[0.98]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 lg:mb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusDot status={zone.status} size="md" />
                    <span className="text-sm lg:text-base font-semibold text-gray-900 truncate">{zone.shortName}</span>
                    <Badge
                      variant={zone.status === 'saturé' ? 'red' : zone.status === 'dense' ? 'yellow' : zone.status === 'fluide' ? 'success' : 'default'}
                      size="sm"
                    >
                      {zone.status}
                    </Badge>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500 truncate">{zone.name}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-2xl lg:text-3xl font-extralight text-gray-900 tabular-nums">{zone.density}%</span>
                  <p className="text-[10px] lg:text-xs text-gray-400">densité</p>
                </div>
              </div>

              {/* Progress */}
              <Progress value={zone.density} size="md" className="mb-3 lg:mb-4" />

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 lg:gap-3">
                <div>
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Attente</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900">{zone.waitTime}<span className="text-xs lg:text-sm font-normal text-gray-400"> min</span></p>
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Passage</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900">{zone.passageTime}<span className="text-xs lg:text-sm font-normal text-gray-400"> min</span></p>
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Présents</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900">{zone.currentCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Caméras</p>
                  <p className="text-sm lg:text-lg font-semibold text-gray-900">{zone.cameras}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Zone Detail Modal - Full screen on mobile, centered on desktop */}
      <AnimatePresence>
        {selectedZone && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedZone(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50"
            >
              <div className="w-full lg:w-auto lg:max-w-4xl bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="border-b border-gray-100 px-4 lg:px-8 py-4 lg:py-5 flex-shrink-0">
                  {/* Handle for mobile */}
                  <div className="flex justify-center mb-3 lg:hidden">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 lg:gap-3 mb-1">
                        <StatusDot status={selectedZone.status} size="md" />
                        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{selectedZone.shortName}</h2>
                        <Badge variant={selectedZone.status === 'saturé' ? 'red' : selectedZone.status === 'dense' ? 'yellow' : selectedZone.status === 'fluide' ? 'success' : 'default'}>
                          {selectedZone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{selectedZone.name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                  {/* KPIs Row */}
                  <div className="rounded-xl overflow-hidden mb-4 lg:mb-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
                      <div className="p-3 lg:p-4 bg-gray-50">
                        <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Densité</p>
                        <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedZone.density}%</p>
                      </div>
                      <div className="p-3 lg:p-4 bg-gray-50">
                        <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Temps d'attente</p>
                        <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedZone.waitTime} min</p>
                      </div>
                      <div className="p-3 lg:p-4 bg-gray-50">
                        <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Temps de passage</p>
                        <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedZone.passageTime} min</p>
                      </div>
                      <div className="p-3 lg:p-4 bg-gray-50">
                        <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Saturation</p>
                        <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedZone.saturation}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="mb-4 lg:mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Évolution sur la journée</h3>
                    <div className="h-40 lg:h-44 bg-gray-50 rounded-xl p-3 lg:p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedZone.history}>
                          <defs>
                            <linearGradient id="zoneGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0c7ff2" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#0c7ff2" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#9ca3af' }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#9ca3af' }}
                            width={25}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '11px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#0c7ff2"
                            strokeWidth={2}
                            fill="url(#zoneGradient)"
                            name="Densité %"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Capacity & Flux */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 lg:mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Capacité</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Présents</span>
                          <span className="font-semibold text-gray-900">{selectedZone.currentCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Capacité max</span>
                          <span className="font-semibold text-gray-900">{selectedZone.capacity.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Occupation</span>
                          <span className="font-semibold text-gray-900">{Math.round((selectedZone.currentCount / selectedZone.capacity) * 100)}%</span>
                        </div>
                        <Progress value={selectedZone.currentCount} max={selectedZone.capacity} size="md" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Flux</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Débit actuel</span>
                          <span className="font-semibold text-gray-900">{selectedZone.flow} pers/min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Caméras</span>
                          <span className="font-semibold text-gray-900">{selectedZone.cameras} actives</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alert Thresholds */}
                  <div className="p-3 lg:p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Seuils d'alerte</h3>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Densité critique</span>
                        <span className="font-semibold text-gray-900">80%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Attente max</span>
                        <span className="font-semibold text-gray-900">15 min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Saturation</span>
                        <span className="font-semibold text-gray-900">85%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Flux minimum</span>
                        <span className="font-semibold text-gray-900">50 pers/min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions - Fixed at bottom */}
                <div className="flex gap-3 p-4 lg:p-6 border-t border-gray-100 flex-shrink-0 safe-area-bottom">
                  <Button variant="secondary" className="flex-1" onClick={() => setSelectedZone(null)}>
                    Fermer
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Configurer
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
