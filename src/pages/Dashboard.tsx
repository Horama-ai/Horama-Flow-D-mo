import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Event } from '../data/events';
import { Card, Badge, Button, LiveIndicator, StatusDot, Progress, AlertItem } from '../components/ui';

interface DashboardProps {
  event: Event;
}

export function Dashboard({ event }: DashboardProps) {
  const criticalZones = event.zones.filter(z => z.status === 'saturé');
  const warningZones = event.zones.filter(z => z.status === 'dense');
  const activeAlerts = event.alerts.filter(a => !a.acknowledged);

  // Get trend for metrics
  const getTrend = (history: { value: number }[]) => {
    if (history.length < 2) return undefined;
    const recent = history.slice(-4);
    const older = history.slice(-8, -4);
    if (older.length === 0) return undefined;
    const recentAvg = recent.reduce((a, b) => a + b.value, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.value, 0) / older.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    return {
      value: Math.abs(Math.round(change)),
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable' as 'up' | 'down' | 'stable'
    };
  };

  const waitTimeTrend = getTrend(event.waitTimeHistory);
  const densityTrend = getTrend(event.densityHistory);
  const saturationTrend = getTrend(event.saturationHistory);

  // Chart component for consistent styling
  const MetricChart = ({
    data,
    title,
    unit,
    gradientId
  }: {
    data: { time: string; value: number }[];
    title: string;
    unit: string;
    gradientId: string;
  }) => (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{unit}</p>
      </div>
      <div className="p-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c7ff2" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#0c7ff2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                width={35}
                tickMargin={4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '11px',
                  padding: '8px 12px'
                }}
                formatter={(value) => [`${value} ${unit}`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0c7ff2"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: '#0c7ff2', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-4 py-6 lg:px-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8 lg:mb-16 pb-6 lg:pb-8 border-b border-gray-200"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl lg:text-5xl font-light text-gray-900 tracking-tight">{event.name}</h1>
              {event.status === 'live' && <LiveIndicator />}
            </div>
            <p className="text-sm text-prism-600 font-medium uppercase tracking-wide">{event.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Durée</p>
            <p className="text-2xl font-light text-gray-900">{event.duration}</p>
          </div>
        </motion.div>

        {/* Stats Grid - PRISM seamless tile pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 rounded-2xl overflow-hidden mb-8"
        >
          <div className="bg-white p-4 lg:p-8 border-l-4 border-prism-500">
            <div className="text-xs font-semibold text-prism-600 uppercase tracking-wide mb-4">Fréquentation</div>
            <div className="text-3xl lg:text-5xl font-extralight text-gray-900 tabular-nums">
              {event.currentAttendance.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {Math.round((event.currentAttendance / event.totalCapacity) * 100)}% capacité
            </div>
          </div>
          <div className="bg-white p-4 lg:p-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Temps d'attente</div>
            <div className="text-3xl lg:text-5xl font-extralight text-gray-900 tabular-nums">
              {event.avgWaitTime}<span className="text-lg text-gray-400 ml-1">min</span>
            </div>
            {waitTimeTrend && (
              <div className={`text-sm font-medium mt-2 ${
                waitTimeTrend.direction === 'down' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {waitTimeTrend.direction === 'up' ? '↑' : '↓'} {waitTimeTrend.value}%
              </div>
            )}
          </div>
          <div className="bg-white p-4 lg:p-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Temps de passage</div>
            <div className="text-3xl lg:text-5xl font-extralight text-gray-900 tabular-nums">
              {event.avgPassageTime}<span className="text-lg text-gray-400 ml-1">min</span>
            </div>
          </div>
          <div className="bg-white p-4 lg:p-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Densité moyenne</div>
            <div className="text-3xl lg:text-5xl font-extralight text-gray-900 tabular-nums">
              {event.avgDensity}<span className="text-lg text-gray-400 ml-1">%</span>
            </div>
            {densityTrend && (
              <div className={`text-sm font-medium mt-2 ${
                densityTrend.direction === 'down' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {densityTrend.direction === 'up' ? '↑' : '↓'} {densityTrend.value}%
              </div>
            )}
          </div>
          <div className="bg-white p-4 lg:p-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Saturation</div>
            <div className="text-3xl lg:text-5xl font-extralight text-gray-900 tabular-nums">
              {event.avgSaturation}<span className="text-lg text-gray-400 ml-1">%</span>
            </div>
            {saturationTrend && (
              <div className={`text-sm font-medium mt-2 ${
                saturationTrend.direction === 'down' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {saturationTrend.direction === 'up' ? '↑' : '↓'} {saturationTrend.value}%
              </div>
            )}
          </div>
        </motion.div>

        {/* 4 Main KPI Charts - 2x2 Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"
        >
          <MetricChart
            data={event.waitTimeHistory}
            title="Temps d'attente estimé"
            unit="min"
            gradientId="waitTimeGradient"
          />
          <MetricChart
            data={event.flowHistory.map(p => ({ time: p.time, value: Math.round(p.value / 100) }))}
            title="Temps de passage"
            unit="min"
            gradientId="passageTimeGradient"
          />
          <MetricChart
            data={event.densityHistory}
            title="Densité"
            unit="%"
            gradientId="densityGradient"
          />
          <MetricChart
            data={event.saturationHistory}
            title="Saturation / Congestion"
            unit="%"
            gradientId="saturationGradient"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flow Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Évolution du flux</h2>
                <p className="text-sm text-gray-500">Flux de visiteurs sur la période</p>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={event.flowHistory}>
                      <defs>
                        <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0c7ff2" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#0c7ff2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0c7ff2"
                        strokeWidth={2}
                        fill="url(#flowGradient)"
                        name="Flux"
                        dot={false}
                        activeDot={{ r: 4, fill: '#0c7ff2', strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Zones List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Zones surveillées</h2>
                <Badge variant={criticalZones.length > 0 ? 'danger' : 'default'}>
                  {event.zones.length} zones
                </Badge>
              </div>
              <div className="divide-y divide-gray-100">
                {event.zones.slice(0, 6).map((zone, idx) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.03 }}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-prism-50/50 transition-colors"
                  >
                    <div className="w-1 h-8 bg-prism-500 rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusDot status={zone.status} />
                        <span className="text-sm font-medium text-gray-900">{zone.shortName}</span>
                      </div>
                      <div className="text-xs text-gray-500">{zone.waitTime} min • {zone.cameras} cam</div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 tabular-nums">{zone.density}%</span>
                  </motion.div>
                ))}
              </div>
              {event.zones.length > 6 && (
                <div className="px-6 py-3 border-t border-gray-100">
                  <button className="text-sm text-prism-600 hover:text-prism-700 font-medium">
                    Voir les {event.zones.length - 6} autres zones →
                  </button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Alerts Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Alertes actives</h2>
                {activeAlerts.length > 0 && (
                  <Badge variant="danger">{activeAlerts.length} alerte{activeAlerts.length > 1 ? 's' : ''}</Badge>
                )}
              </div>
              {activeAlerts.length === 0 ? (
                <div className="px-4 lg:px-8 py-16 text-center">
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Aucune alerte active</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activeAlerts.slice(0, 4).map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                    >
                      <AlertItem
                        message={alert.message}
                        severity={alert.severity}
                        zone={alert.zoneName}
                        time={alert.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        acknowledged={alert.acknowledged}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Résumé</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Score de fluidité</span>
                  <span className="text-lg font-semibold text-gray-900">{event.globalFluidityScore}%</span>
                </div>
                <Progress value={event.globalFluidityScore} />
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Pic enregistré</span>
                  <span className="text-lg font-semibold text-gray-900">{event.peakAttendance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zones critiques</span>
                  <span className="text-lg font-semibold text-red-600">{criticalZones.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zones denses</span>
                  <span className="text-lg font-semibold text-amber-600">{warningZones.length}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dernière MAJ</span>
              <p className="font-medium text-gray-900">Il y a 5 sec</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Caméras</span>
              <p className="font-medium text-gray-900">{event.zones.reduce((acc, z) => acc + z.cameras, 0)} actives</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Zones</span>
              <p className="font-medium text-gray-900">{event.zones.length} instrumentées</p>
            </div>
          </div>
          <Button variant="primary">Exporter les données</Button>
        </motion.div>
      </div>
    </div>
  );
}
