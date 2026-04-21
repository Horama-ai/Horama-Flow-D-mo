import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { TrendingUp, Users, Clock, Activity, Zap, ChevronDown, Check } from 'lucide-react';
import type { Event } from '../data/events';
import { Card, Badge, Button } from '../components/ui';

interface CompareProps {
  events: Event[];
}

// Color palette for events - cohérent avec la sidebar (gris + touches de bleu)
const eventColors = [
  { main: '#111827', light: '#f3f4f6', gradient: 'from-gray-800 to-gray-900' },  // gray-900
  { main: '#3b82f6', light: '#dbeafe', gradient: 'from-blue-500 to-blue-600' },  // blue-500
  { main: '#6b7280', light: '#f9fafb', gradient: 'from-gray-500 to-gray-600' },  // gray-500
  { main: '#1e40af', light: '#dbeafe', gradient: 'from-blue-800 to-blue-900' },  // blue-800
  { main: '#374151', light: '#f3f4f6', gradient: 'from-gray-700 to-gray-800' },  // gray-700
];

// Descriptions des métriques pour plus de clarté
const metricDescriptions: Record<string, string> = {
  'Fluidité': 'Qualité de circulation des visiteurs (0-100%)',
  'Capacité': 'Taux de remplissage par rapport à la capacité max',
  'Rapidité': 'Vitesse de passage aux points de contrôle',
  'Densité': 'Espace disponible par visiteur (inverse)',
  'Efficacité': 'Performance globale des zones (inverse saturation)',
  'Attente': 'Temps d\'attente moyen aux entrées',
  'Saturation': 'Niveau d\'occupation des zones critiques',
};

export function Compare({ events }: CompareProps) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showEventSelector, setShowEventSelector] = useState(false);
  const comparableEvents = events.filter(e => e.status === 'completed' || e.status === 'live');

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      }
      if (prev.length >= 5) return prev;
      return [...prev, eventId];
    });
  };

  const selected = comparableEvents.filter(e => selectedEvents.includes(e.id));
  const count = selected.length;

  // Radar chart data
  const radarData = [
    { metric: 'Fluidité', fullMark: 100, ...Object.fromEntries(selected.map((e, i) => [`event${i}`, e.globalFluidityScore])) },
    { metric: 'Capacité', fullMark: 100, ...Object.fromEntries(selected.map((e, i) => [`event${i}`, Math.round((e.currentAttendance / e.totalCapacity) * 100)])) },
    { metric: 'Rapidité', fullMark: 100, ...Object.fromEntries(selected.map((e, i) => [`event${i}`, Math.max(0, 100 - e.avgWaitTime * 5)])) },
    { metric: 'Densité', fullMark: 100, ...Object.fromEntries(selected.map((e, i) => [`event${i}`, 100 - e.avgDensity])) },
    { metric: 'Efficacité', fullMark: 100, ...Object.fromEntries(selected.map((e, i) => [`event${i}`, Math.max(0, 100 - e.avgSaturation)])) },
  ];

  // Bar chart data for metrics comparison
  const metricsBarData = [
    { name: 'Fluidité', ...Object.fromEntries(selected.map((e, i) => [`event${i}`, e.globalFluidityScore])), unit: '%' },
    { name: 'Attente', ...Object.fromEntries(selected.map((e, i) => [`event${i}`, e.avgWaitTime])), unit: 'min' },
    { name: 'Densité', ...Object.fromEntries(selected.map((e, i) => [`event${i}`, e.avgDensity])), unit: '%' },
    { name: 'Saturation', ...Object.fromEntries(selected.map((e, i) => [`event${i}`, e.avgSaturation])), unit: '%' },
  ];

  // Attendance comparison data
  const attendanceData = selected.map((e, i) => ({
    name: e.name.substring(0, 12),
    attendance: e.currentAttendance,
    capacity: e.totalCapacity,
    fill: eventColors[i].main,
  }));

  // Performance scores
  const getPerformanceScore = (event: Event) => {
    return Math.round(
      (event.globalFluidityScore * 0.4) +
      ((100 - event.avgSaturation) * 0.3) +
      ((100 - Math.min(event.avgWaitTime * 5, 100)) * 0.3)
    );
  };

  // Grid layout based on selection count
  const getGridCols = () => {
    if (count <= 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-2 lg:grid-cols-5';
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Comparaison</h1>
          <p className="text-sm text-gray-500 mt-1">Analysez les performances entre événements</p>
        </div>

        {/* Event Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowEventSelector(!showEventSelector)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
          >
            <div className="flex -space-x-2">
              {selected.length > 0 ? (
                selected.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: eventColors[i].main }}
                  />
                ))
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200" />
              )}
              {selected.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] font-medium text-gray-600">+{selected.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {selected.length === 0 ? 'Sélectionner' : `${selected.length} événement${selected.length > 1 ? 's' : ''}`}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showEventSelector ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showEventSelector && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEventSelector(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Sélectionnez 2 à 5 événements</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {comparableEvents.map((event) => {
                      const isSelected = selectedEvents.includes(event.id);
                      const colorIdx = selectedEvents.indexOf(event.id);
                      return (
                        <button
                          key={event.id}
                          onClick={() => toggleEvent(event.id)}
                          className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                            isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? '' : 'border-2 border-gray-300'
                            }`}
                            style={isSelected ? { backgroundColor: eventColors[colorIdx].main } : {}}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                            <p className="text-xs text-gray-500">
                              {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <Badge variant={event.status === 'live' ? 'danger' : 'success'} size="sm">
                            {event.status === 'live' ? 'Live' : 'Terminé'}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                  {selectedEvents.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedEvents([])}>
                        Réinitialiser
                      </Button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {count < 2 ? (
        <Card className="p-8 lg:p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Comparez vos événements</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Sélectionnez entre 2 et 5 événements pour analyser et comparer leurs performances en détail.
          </p>
          <Button onClick={() => setShowEventSelector(true)}>
            Sélectionner des événements
          </Button>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Event Cards - Adaptive grid */}
          <div className={`grid ${getGridCols()} gap-3 lg:gap-4`}>
            {selected.map((event, idx) => {
              const score = getPerformanceScore(event);
              const color = eventColors[idx];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 lg:p-5 relative overflow-hidden h-full border-t-4" style={{ borderTopColor: color.main }}>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.main }} />
                            <p className="text-sm font-semibold text-gray-900 truncate">{event.name}</p>
                          </div>
                          <p className="text-xs text-gray-500 ml-4">
                            {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: color.main }}
                        >
                          <span className="text-sm font-bold text-white">{score}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-600 uppercase font-medium">Fluidité</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{event.globalFluidityScore}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-600 uppercase font-medium">Visiteurs</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{(event.currentAttendance / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-600 uppercase font-medium">Attente</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{event.avgWaitTime} min</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-600 uppercase font-medium">Saturation</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{event.avgSaturation}%</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Grid - Performance left, Metrics + Attendance stacked right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Performance Metrics - Visual Cards (full height left) */}
            <Card className="p-4 lg:p-6 lg:row-span-2">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Performance globale</h3>
                <p className="text-xs text-gray-500 mt-1">Comparaison multi-critères sur 5 axes (score 0-100)</p>
              </div>

              {/* Legend at top */}
              <div className="flex flex-wrap gap-4 mb-5 pb-4 border-b border-gray-100">
                {selected.map((event, idx) => (
                  <div key={event.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: eventColors[idx].main }} />
                    <span className="text-sm text-gray-700 font-medium">{event.name.substring(0, 15)}</span>
                  </div>
                ))}
              </div>

              {/* Metric bars */}
              <div className="space-y-5">
                {radarData.map((metric) => {
                  const metricData = metric as Record<string, string | number>;
                  const maxValue = Math.max(...selected.map((_, idx) => (metricData[`event${idx}`] as number) || 0));
                  return (
                    <div key={metric.metric}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{metric.metric}</span>
                          <p className="text-xs text-gray-500">{metricDescriptions[metric.metric]}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selected.map((event, idx) => {
                          const value = (metricData[`event${idx}`] as number) || 0;
                          const isMax = value === maxValue;
                          return (
                            <div key={event.id} className="flex items-center gap-3">
                              <div className="w-20 lg:w-28 flex-shrink-0">
                                <span className="text-xs text-gray-600 truncate block">{event.name.substring(0, 12)}</span>
                              </div>
                              <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  className="h-full rounded-lg"
                                  style={{ backgroundColor: eventColors[idx].main }}
                                />
                              </div>
                              <div className={`w-12 text-right ${isMax ? 'text-emerald-600 font-bold' : 'text-gray-700 font-semibold'}`}>
                                <span className="text-sm">{value}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right column: Métriques + Fréquentation stacked */}
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* Metrics Bar Chart */}
              <Card className="p-4 lg:p-6 flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Métriques clés</h3>
                  <p className="text-xs text-gray-500 mt-1">Indicateurs opérationnels comparés par événement</p>
                </div>
                <div className="h-44 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsBarData} layout="vertical" barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        padding: '12px',
                      }}
                      itemStyle={{ color: '#f9fafb' }}
                      labelStyle={{ color: '#f9fafb', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(value, name, props) => {
                        const numValue = Number(value) || 0;
                        const eventIdx = parseInt(String(name).replace('event', ''));
                        return [
                          `${numValue}${(props?.payload as any)?.unit || ''}`,
                          selected[eventIdx]?.name.substring(0, 12) || ''
                        ];
                      }}
                      labelFormatter={(label) => `${label} : ${metricDescriptions[label] || ''}`}
                    />
                    {selected.map((_, idx) => (
                      <Bar
                        key={idx}
                        dataKey={`event${idx}`}
                        fill={eventColors[idx].main}
                        radius={[0, 4, 4, 0]}
                        barSize={count <= 3 ? 16 : 10}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  {selected.map((event, idx) => (
                    <div key={event.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: eventColors[idx].main }} />
                      <span className="text-xs text-gray-700 font-medium">{event.name.substring(0, 12)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Attendance Chart */}
              <Card className="p-4 lg:p-6 flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Fréquentation</h3>
                  <p className="text-xs text-gray-500 mt-1">Nombre total de visiteurs par événement</p>
                </div>
                <div className="h-44 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#374151', fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        padding: '12px',
                      }}
                      formatter={(value) => [`${(Number(value) / 1000).toFixed(1)}k visiteurs`, 'Fréquentation']}
                      labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f9fafb' }}
                    />
                    <Bar dataKey="attendance" radius={[4, 4, 0, 0]} barSize={count <= 3 ? 40 : 24}>
                      {attendanceData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              </Card>
            </div>
          </div>

          {/* Comparison Table */}
          <Card className="p-4 lg:p-6 overflow-hidden">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Comparatif détaillé</h3>
              <p className="text-xs text-gray-500 mt-1">Tableau récapitulatif de tous les indicateurs (meilleur score en vert)</p>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4">
                      Métrique
                    </th>
                    {selected.map((event, idx) => (
                      <th key={event.id} className="text-center py-3 px-3">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: eventColors[idx].main }}
                          >
                            <span className="text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                          </div>
                          <span className="text-xs text-gray-700 font-medium truncate max-w-[80px]">
                            {event.name.substring(0, 12)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Score fluidité', key: 'globalFluidityScore', unit: '%', best: 'max', desc: 'Qualité de circulation' },
                    { label: 'Fréquentation', key: 'currentAttendance', format: (v: number) => `${(v/1000).toFixed(0)}k`, best: 'max', desc: 'Visiteurs totaux' },
                    { label: 'Attente moyenne', key: 'avgWaitTime', unit: ' min', best: 'min', desc: 'Temps aux entrées' },
                    { label: 'Densité moyenne', key: 'avgDensity', unit: '%', best: 'min', desc: 'Taux d\'occupation' },
                    { label: 'Saturation', key: 'avgSaturation', unit: '%', best: 'min', desc: 'Charge des zones' },
                    { label: 'Pic fréquentation', key: 'peakAttendance', format: (v: number) => `${(v/1000).toFixed(0)}k`, best: 'max', desc: 'Maximum atteint' },
                    { label: 'Nombre de zones', key: 'zones', format: (v: any) => v.length, best: 'none', desc: 'Zones surveillées' },
                  ].map((row, rowIdx) => {
                    const numValues = selected.map(e => {
                      const raw = (e as any)[row.key];
                      return typeof raw === 'number' ? raw : row.format ? row.format(raw) : 0;
                    });
                    const bestIdx = row.best === 'max'
                      ? numValues.indexOf(Math.max(...numValues.map(Number)))
                      : row.best === 'min'
                        ? numValues.indexOf(Math.min(...numValues.map(Number)))
                        : -1;

                    return (
                      <tr key={row.key} className={`border-b border-gray-100 ${rowIdx % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{row.label}</span>
                            <p className="text-xs text-gray-500">{row.desc}</p>
                          </div>
                        </td>
                        {selected.map((event, idx) => {
                          const raw = (event as any)[row.key];
                          const value = row.format ? row.format(raw) : raw;
                          const isBest = idx === bestIdx;
                          return (
                            <td key={event.id} className="py-3 px-3 text-center">
                              <span className={`text-sm font-semibold ${
                                isBest ? 'text-emerald-600' : 'text-gray-900'
                              }`}>
                                {value}{row.unit || ''}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Zone Comparison */}
          <Card className="p-4 lg:p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Comparaison par zone</h3>
              <p className="text-xs text-gray-500 mt-1">Saturation et temps d'attente par zone pour chaque événement</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selected[0]?.zones.slice(0, 6).map((zone, zoneIdx) => (
                <div key={zone.id} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{zone.shortName}</p>
                  <div className="space-y-3">
                    {selected.map((event, eventIdx) => {
                      const z = event.zones[zoneIdx];
                      if (!z) return null;
                      return (
                        <div key={event.id} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: eventColors[eventIdx].main }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700 font-medium truncate">{event.name.substring(0, 15)}</span>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-gray-600 font-medium">{z.saturation}% sat.</span>
                                <span className="text-gray-500">{z.waitTime} min</span>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${z.saturation}%`,
                                  backgroundColor: eventColors[eventIdx].main
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
