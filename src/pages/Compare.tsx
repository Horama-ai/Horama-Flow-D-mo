import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Event } from '../data/events';
import { Card, Badge, EmptyState, Button } from '../components/ui';

interface CompareProps {
  events: Event[];
}

export function Compare({ events }: CompareProps) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const comparableEvents = events.filter(e => e.status === 'completed' || e.status === 'live');

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, eventId];
    });
  };

  const selected = comparableEvents.filter(e => selectedEvents.includes(e.id));

  const comparisonData = selected.length >= 2 ? [
    {
      metric: 'Fluidité (%)',
      ...Object.fromEntries(selected.map(e => [e.name.substring(0, 15), e.globalFluidityScore]))
    },
    {
      metric: 'Fréquentation (k)',
      ...Object.fromEntries(selected.map(e => [e.name.substring(0, 15), Math.round(e.currentAttendance / 1000)]))
    },
    {
      metric: 'Attente moy. (min)',
      ...Object.fromEntries(selected.map(e => [e.name.substring(0, 15), e.avgWaitTime]))
    },
    {
      metric: 'Densité moy. (%)',
      ...Object.fromEntries(selected.map(e => [e.name.substring(0, 15), e.avgDensity]))
    },
    {
      metric: 'Saturation (%)',
      ...Object.fromEntries(selected.map(e => [e.name.substring(0, 15), e.avgSaturation]))
    }
  ] : [];

  const colors = ['#0c7ff2', '#0062d1', '#014ea8'];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Comparaison</h1>
          <p className="text-sm text-gray-500 mt-1">Comparez les performances entre événements</p>
        </div>
        {selected.length >= 2 && (
          <Badge variant="blue">{selected.length} événements sélectionnés</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Event Selection */}
        <div className="flex flex-col lg:h-[calc(100vh-200px)]">
          <Card className="p-4 lg:p-6 flex-1 flex flex-col">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">Événements</h2>
            <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-6">Sélectionnez 2 à 3 événements</p>

            {/* Scrollable list - takes available space */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-[300px] lg:max-h-none">
              {comparableEvents.map((event) => {
                const isSelected = selectedEvents.includes(event.id);
                return (
                  <motion.button
                    key={event.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleEvent(event.id)}
                    className={`w-full p-3 lg:p-4 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-gray-900' : 'bg-gray-100 border-2 border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs lg:text-sm font-medium truncate text-gray-900">
                          {event.name}
                        </p>
                        <p className="text-[10px] lg:text-xs text-gray-500 truncate">
                          {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {event.subtitle.substring(0, 20)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Reset button - always at bottom */}
            {selectedEvents.length > 0 && (
              <div className="pt-3 lg:pt-4 mt-3 lg:mt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => setSelectedEvents([])}
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Comparison Results */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {selected.length < 2 ? (
            <Card className="p-6 lg:p-8">
              <EmptyState
                title="Sélectionnez des événements"
                description="Choisissez au moins 2 événements pour voir la comparaison"
              />
            </Card>
          ) : (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {selected.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={selected.length === 3 && idx === 2 ? 'col-span-2 lg:col-span-1' : ''}
                  >
                    <Card className="p-3 lg:p-5 relative overflow-hidden">
                      {/* Colored top bar */}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: colors[idx] }} />
                      <p className="text-[10px] lg:text-xs text-gray-500 mb-2 lg:mb-3 truncate">{event.name}</p>
                      <p className="text-[10px] lg:text-xs text-gray-400 mb-3 lg:mb-4">
                        {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                        <div>
                          <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Fluidité</p>
                          <p className="text-lg lg:text-2xl font-extralight text-gray-900">{event.globalFluidityScore}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Fréquentation</p>
                          <p className="text-lg lg:text-2xl font-extralight text-gray-900">{(event.currentAttendance / 1000).toFixed(0)}k</p>
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Attente</p>
                          <p className="text-lg lg:text-2xl font-extralight text-gray-900">{event.avgWaitTime} min</p>
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">Zones</p>
                          <p className="text-lg lg:text-2xl font-extralight text-gray-900">{event.zones.length}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Chart - Hidden on mobile, too complex */}
              <Card className="p-4 lg:p-6 hidden lg:block">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparaison visuelle</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical">
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                      />
                      <YAxis
                        dataKey="metric"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      {selected.map((event, idx) => (
                        <Bar
                          key={event.id}
                          dataKey={event.name.substring(0, 15)}
                          fill={colors[idx]}
                          radius={[0, 4, 4, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Zone Comparison Table */}
              <Card className="p-3 lg:p-6 overflow-hidden">
                <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-6">Comparaison par zone</h3>
                <div className="overflow-x-auto -mx-3 px-3 lg:mx-0 lg:px-0">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider py-2 lg:py-3 px-2 lg:px-4">
                          Zone
                        </th>
                        {selected.map((event, idx) => (
                          <th key={event.id} className="text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider py-2 lg:py-3 px-2 lg:px-4">
                            <div className="flex items-center justify-center gap-1 lg:gap-2">
                              <span className="w-2 h-2 lg:w-3 lg:h-3 rounded" style={{ backgroundColor: colors[idx] }} />
                              <span className="hidden lg:inline">{event.name.substring(0, 12)}</span>
                              <span className="lg:hidden">{idx + 1}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected[0]?.zones.slice(0, 5).map((zone, zoneIdx) => (
                        <tr key={zone.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2 lg:py-4 px-2 lg:px-4">
                            <span className="text-xs lg:text-sm font-medium text-gray-900">{zone.shortName}</span>
                          </td>
                          {selected.map((event) => {
                            const z = event.zones[zoneIdx];
                            return (
                              <td key={event.id} className="py-2 lg:py-4 px-2 lg:px-4 text-center">
                                <div>
                                  <span className="text-xs lg:text-sm font-semibold text-gray-900">
                                    {z?.saturation || '-'}%
                                  </span>
                                  <p className="text-[10px] lg:text-xs text-gray-400">{z?.waitTime || '-'} min</p>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
