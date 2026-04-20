import { motion } from 'framer-motion';
import type { Event } from '../data/events';
import { Card, Button, Badge, Progress } from '../components/ui';

interface ReportProps {
  event: Event;
}

export function Report({ event }: ReportProps) {
  const criticalZones = event.zones.filter(z => z.status === 'saturé' || z.status === 'dense');
  const resolvedAlerts = event.alerts.filter(a => a.acknowledged).length;
  const totalAlerts = event.alerts.length;

  const recommendations = [
    {
      title: 'Optimiser les accès',
      description: 'Anticiper l\'ouverture des accès secondaires 20 minutes avant le pic prévu'
    },
    {
      title: 'Renforcer les équipes',
      description: 'Augmenter l\'effectif de filtrage aux zones identifiées comme critiques'
    },
    {
      title: 'Améliorer la signalétique',
      description: 'Déployer une signalétique directionnelle pour une meilleure répartition du flux'
    },
    {
      title: 'Information mobile',
      description: 'Prévoir des points d\'information mobiles aux heures de pointe'
    }
  ];

  const metrics = [
    { label: 'Fluidité globale', value: event.globalFluidityScore, unit: '%', target: 75 },
    { label: 'Temps d\'attente moy.', value: event.avgWaitTime, unit: 'min', target: 10 },
    { label: 'Densité moyenne', value: event.avgDensity, unit: '%', target: 60 },
    { label: 'Saturation moyenne', value: event.avgSaturation, unit: '%', target: 65 }
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rapport</h1>
          <p className="text-gray-500 mt-1">Synthèse et recommandations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Partager</Button>
          <Button variant="primary">Exporter PDF</Button>
        </div>
      </div>

      {/* Event Info Card */}
      <Card className="p-8 mb-6 border-l-4 border-l-prism-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-prism-600 uppercase tracking-wider mb-2">Rapport de synthèse</p>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">{event.name}</h2>
            <p className="text-gray-500">{event.subtitle}</p>
          </div>
          <Badge variant={event.status === 'live' ? 'blue' : event.status === 'upcoming' ? 'yellow' : 'default'}>
            {event.status === 'live' ? 'En cours' : event.status === 'upcoming' ? 'À venir' : 'Terminé'}
          </Badge>
        </div>
        <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
            <p className="text-gray-900 mt-1 font-medium">
              {event.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Durée</p>
            <p className="text-gray-900 mt-1 font-medium">{event.duration}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Zones</p>
            <p className="text-gray-900 mt-1 font-medium">{event.zones.length} instrumentées</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Caméras</p>
            <p className="text-gray-900 mt-1 font-medium">{event.zones.reduce((acc, z) => acc + z.cameras, 0)} actives</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid - Seamless Tile */}
      <div className="rounded-2xl overflow-hidden mb-6">
        <div className="grid grid-cols-4 gap-px bg-gray-200">
          {metrics.map((metric, idx) => {
            const isGood = metric.label.includes('Fluidité')
              ? metric.value >= metric.target
              : metric.value <= metric.target;

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 relative"
              >
                {idx === 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-prism-500 rounded-r" />
                )}
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{metric.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extralight text-gray-900 tabular-nums">{metric.value}</span>
                  <span className="text-lg text-gray-400">{metric.unit}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Objectif: {metric.target}{metric.unit}</span>
                    <span className={isGood ? 'text-prism-600' : 'text-yellow-600'}>
                      {isGood ? '✓ Atteint' : '⚠ À améliorer'}
                    </span>
                  </div>
                  <Progress value={metric.value} max={100} color={isGood ? 'blue' : 'auto'} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary & Critical Zones */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Synthèse</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            L'événement présente une fluidité globale {event.globalFluidityScore >= 70 ? 'satisfaisante' : 'perfectible'} avec
            un score de <span className="font-semibold">{event.globalFluidityScore}%</span>.
            {criticalZones.length > 0 ? (
              <> Des points de congestion ont été identifiés sur <span className="font-semibold">{criticalZones.length} zone{criticalZones.length > 1 ? 's' : ''}</span>,
              dont <span className="font-semibold">{criticalZones[0]?.shortName}</span> avec un taux de saturation atteignant{' '}
              <span className="font-semibold">{criticalZones[0]?.saturation}%</span>. </>
            ) : (
              <> Aucune zone critique n'a été identifiée pendant la durée de l'événement. </>
            )}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Le temps d'attente moyen de <span className="font-semibold">{event.avgWaitTime} minutes</span>{' '}
            {event.avgWaitTime <= 10 ? 'reste dans les standards acceptables' : 'dépasse les objectifs fixés'}.
            La fréquentation a atteint <span className="font-semibold">{event.currentAttendance.toLocaleString()}</span> personnes,
            soit <span className="font-semibold">{Math.round((event.currentAttendance / event.totalCapacity) * 100)}%</span> de la capacité totale.
          </p>

          {/* Seamless tile for summary stats */}
          <div className="rounded-xl overflow-hidden mt-6">
            <div className="grid grid-cols-2 gap-px bg-gray-200">
              <div className="p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-1">Fréquentation</p>
                <p className="text-2xl font-extralight text-gray-900">{event.currentAttendance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Pic: {event.peakAttendance.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-1">Alertes</p>
                <p className="text-2xl font-extralight text-gray-900">{resolvedAlerts}/{totalAlerts}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalAlerts > 0 ? `${Math.round((resolvedAlerts / totalAlerts) * 100)}% résolues` : 'Aucune alerte'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zones critiques</h3>
          {criticalZones.length > 0 ? (
            <div className="space-y-3">
              {criticalZones.slice(0, 5).map((zone, idx) => (
                <div key={zone.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    {/* PRISM accent bar for first item */}
                    {idx === 0 && (
                      <div className="w-1 h-10 bg-prism-500 rounded-r -ml-6 mr-2" />
                    )}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      zone.status === 'saturé' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{zone.shortName}</span>
                      <p className="text-xs text-gray-500">{zone.waitTime} min d'attente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extralight text-gray-900">{zone.saturation}%</span>
                    <p className="text-xs text-gray-500">saturation</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">Aucune zone critique identifiée</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 border-prism-200 bg-prism-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
        <div className="grid grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-4 bg-white rounded-xl"
            >
              <span className="w-8 h-8 rounded-lg bg-prism-600 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</p>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
        <p className="text-xs text-gray-400">Rapport généré par HORAMA Flow</p>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
