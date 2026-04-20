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
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Comparaison</h1>
          <p className="text-gray-500 mt-1">Comparez les performances entre événements</p>
        </div>
        {selected.length >= 2 && (
          <Badge variant="blue">{selected.length} événements sélectionnés</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Event Selection */}
        <div className="flex flex-col h-[calc(100vh-200px)]">
          <Card className="p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Événements</h2>
            <p className="text-sm text-gray-500 mb-6">Sélectionnez 2 à 3 événements à comparer</p>

            {/* Scrollable list - takes available space */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {comparableEvents.map((event) => {
                const isSelected = selectedEvents.includes(event.id);
                return (
                  <motion.button
                    key={event.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleEvent(event.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-gray-900' : 'bg-gray-100 border-2 border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900">
                          {event.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.subtitle.substring(0, 30)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Reset button - always at bottom */}
            {selectedEvents.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSelectedEvents([])}
                >
                  Réinitialiser la sélection
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Comparison Results */}
        <div className="col-span-2 space-y-6">
          {selected.length < 2 ? (
            <Card className="p-8">
              <EmptyState
                title="Sélectionnez des événements"
                description="Choisissez au moins 2 événements pour voir la comparaison"
              />
            </Card>
          ) : (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-3 gap-4">
                {selected.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-5 relative overflow-hidden">
                      {/* Colored top bar */}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: colors[idx] }} />
                      <p className="text-xs text-gray-500 mb-3 truncate">{event.name}</p>
                      <p className="text-xs text-gray-400 mb-4">
                        {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Fluidité</p>
                          <p className="text-2xl font-extralight text-gray-900">{event.globalFluidityScore}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Fréquentation</p>
                          <p className="text-2xl font-extralight text-gray-900">{event.currentAttendance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Attente moy.</p>
                          <p className="text-2xl font-extralight text-gray-900">{event.avgWaitTime} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Zones</p>
                          <p className="text-2xl font-extralight text-gray-900">{event.zones.length}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <Card className="p-6">
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
              <Card className="p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparaison par zone</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                          Zone
                        </th>
                        {selected.map((event, idx) => (
                          <th key={event.id} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-3 h-3 rounded" style={{ backgroundColor: colors[idx] }} />
                              {event.name.substring(0, 12)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected[0]?.zones.slice(0, 6).map((zone, zoneIdx) => (
                        <tr key={zone.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-gray-900">{zone.shortName}</span>
                          </td>
                          {selected.map((event) => {
                            const z = event.zones[zoneIdx];
                            return (
                              <td key={event.id} className="py-4 px-4 text-center">
                                <div>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {z?.saturation || '-'}%
                                  </span>
                                  <p className="text-xs text-gray-400">{z?.waitTime || '-'} min</p>
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
