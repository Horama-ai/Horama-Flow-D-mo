import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event } from '../data/events';
import { Card, Tabs, Button, EmptyState, Badge } from '../components/ui';

interface AlertsProps {
  event: Event;
  onUpdateAlert: (alertId: string, acknowledged: boolean) => void;
}

export function Alerts({ event, onUpdateAlert }: AlertsProps) {
  const [filter, setFilter] = useState('active');

  const filteredAlerts = event.alerts.filter(alert => {
    if (filter === 'active') return !alert.acknowledged;
    if (filter === 'resolved') return alert.acknowledged;
    return true;
  });

  const activeCount = event.alerts.filter(a => !a.acknowledged).length;
  const criticalCount = event.alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityStyles = (severity: string, acknowledged: boolean) => {
    if (acknowledged) return 'border-l-gray-300 bg-white';
    switch (severity) {
      case 'critical': return 'border-l-rose-400 bg-white';
      case 'warning': return 'border-l-amber-400 bg-white';
      default: return 'border-l-gray-400 bg-white';
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Alertes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} alerte{activeCount !== 1 ? 's' : ''} en attente
            {criticalCount > 0 && <span className="text-gray-900 font-medium"> • {criticalCount} critique{criticalCount !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <Tabs
            tabs={[
              { id: 'active', label: 'Actives', count: activeCount },
              { id: 'resolved', label: 'Résolues' },
              { id: 'all', label: 'Toutes' }
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
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 lg:h-12 bg-rose-400 rounded-r" />
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2 pl-3 lg:pl-4">Critiques</p>
            <p className="text-2xl lg:text-4xl font-extralight text-rose-500 tabular-nums pl-3 lg:pl-4">
              {event.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6">
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2">Attention</p>
            <p className="text-2xl lg:text-4xl font-extralight text-amber-500 tabular-nums">
              {event.alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6">
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2">Info</p>
            <p className="text-2xl lg:text-4xl font-extralight text-gray-500 tabular-nums">
              {event.alerts.filter(a => a.severity === 'info' && !a.acknowledged).length}
            </p>
          </div>
          <div className="bg-white p-4 lg:p-6">
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2">Résolues</p>
            <p className="text-2xl lg:text-4xl font-extralight text-emerald-500 tabular-nums">
              {event.alerts.filter(a => a.acknowledged).length}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <Card className="p-6 lg:p-8">
              <EmptyState
                title="Aucune alerte"
                description={filter === 'active' ? 'Toutes les alertes ont été traitées' : 'Aucune alerte dans cette catégorie'}
              />
            </Card>
          ) : (
            filteredAlerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`p-4 lg:p-5 border-l-4 ${getSeverityStyles(alert.severity, alert.acknowledged)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 lg:gap-3 mb-2">
                        <Badge
                          variant={
                            alert.acknowledged ? 'default' :
                            alert.severity === 'critical' ? 'red' :
                            alert.severity === 'warning' ? 'yellow' : 'default'
                          }
                          size="sm"
                        >
                          {alert.severity === 'critical' ? 'Critique' :
                           alert.severity === 'warning' ? 'Attention' : 'Info'}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="default" size="sm">Résolue</Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {alert.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs text-gray-500">
                        <span>{alert.zoneName}</span>
                        <span className="hidden lg:inline">•</span>
                        <span>{formatTime(alert.timestamp)}</span>
                        {alert.type && (
                          <>
                            <span className="hidden lg:inline">•</span>
                            <span className="font-medium">
                              {alert.value}{alert.type === 'waitTime' ? ' min' : '%'} (seuil: {alert.threshold}{alert.type === 'waitTime' ? ' min' : '%'})
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateAlert(alert.id, true)}
                        className="self-start lg:self-auto"
                      >
                        Acquitter
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
