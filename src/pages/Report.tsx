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
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Rapport</h1>
          <p className="text-sm text-gray-500 mt-1">Synthèse et recommandations</p>
        </div>
        <div className="flex gap-2 lg:gap-3">
          <Button variant="secondary" className="flex-1 lg:flex-none text-sm">Partager</Button>
          <Button variant="primary" className="flex-1 lg:flex-none text-sm">Exporter PDF</Button>
        </div>
      </div>

      {/* Event Info Card */}
      <Card className="p-4 lg:p-8 mb-4 lg:mb-6 border-l-4 border-l-gray-900">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 lg:mb-2">Rapport de synthèse</p>
            <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 mb-1">{event.name}</h2>
            <p className="text-sm text-gray-500">{event.subtitle}</p>
          </div>
          <Badge variant={event.status === 'live' ? 'blue' : event.status === 'upcoming' ? 'yellow' : 'default'}>
            {event.status === 'live' ? 'En cours' : event.status === 'upcoming' ? 'À venir' : 'Terminé'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-8 mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-100">
          <div>
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider">Date</p>
            <p className="text-sm lg:text-base text-gray-900 mt-1 font-medium">
              {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider">Durée</p>
            <p className="text-sm lg:text-base text-gray-900 mt-1 font-medium">{event.duration}</p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider">Zones</p>
            <p className="text-sm lg:text-base text-gray-900 mt-1 font-medium">{event.zones.length} instrumentées</p>
          </div>
          <div>
            <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider">Caméras</p>
            <p className="text-sm lg:text-base text-gray-900 mt-1 font-medium">{event.zones.reduce((acc, z) => acc + z.cameras, 0)} actives</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid - Seamless Tile */}
      <div className="rounded-2xl overflow-hidden mb-4 lg:mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
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
                className="bg-white p-4 lg:p-6 relative"
              >
                {idx === 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 lg:h-16 bg-gray-900 rounded-r" />
                )}
                <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1 lg:mb-2 pl-2 lg:pl-0">{metric.label}</p>
                <div className="flex items-baseline gap-1 pl-2 lg:pl-0">
                  <span className="text-2xl lg:text-4xl font-extralight text-gray-900 tabular-nums">{metric.value}</span>
                  <span className="text-sm lg:text-lg text-gray-400">{metric.unit}</span>
                </div>
                <div className="mt-2 lg:mt-3 pl-2 lg:pl-0">
                  <div className="flex items-center justify-between text-[10px] lg:text-xs text-gray-500 mb-1">
                    <span className="hidden lg:inline">Objectif: {metric.target}{metric.unit}</span>
                    <span className="lg:hidden">{metric.target}{metric.unit}</span>
                    <span className={isGood ? 'text-emerald-500' : 'text-amber-500'}>
                      {isGood ? '✓' : '○'}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <Card className="lg:col-span-2 p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Synthèse</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3 lg:mb-4">
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
          <div className="rounded-xl overflow-hidden mt-4 lg:mt-6">
            <div className="grid grid-cols-2 gap-px bg-gray-200">
              <div className="p-3 lg:p-4 bg-gray-50">
                <p className="text-xs lg:text-sm font-medium text-gray-900 mb-1">Fréquentation</p>
                <p className="text-xl lg:text-2xl font-extralight text-gray-900">{event.currentAttendance.toLocaleString()}</p>
                <p className="text-[10px] lg:text-xs text-gray-500 mt-1">Pic: {event.peakAttendance.toLocaleString()}</p>
              </div>
              <div className="p-3 lg:p-4 bg-gray-50">
                <p className="text-xs lg:text-sm font-medium text-gray-900 mb-1">Alertes</p>
                <p className="text-xl lg:text-2xl font-extralight text-gray-900">{resolvedAlerts}/{totalAlerts}</p>
                <p className="text-[10px] lg:text-xs text-gray-500 mt-1">
                  {totalAlerts > 0 ? `${Math.round((resolvedAlerts / totalAlerts) * 100)}% résolues` : 'Aucune alerte'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Zones critiques</h3>
          {criticalZones.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {criticalZones.slice(0, 5).map((zone, idx) => (
                <div key={zone.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 lg:gap-3">
                    {/* PRISM accent bar for first item */}
                    {idx === 0 && (
                      <div className="w-1 h-8 lg:h-10 bg-gray-900 rounded-r -ml-4 lg:-ml-6 mr-1 lg:mr-2" />
                    )}
                    <span className="w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-semibold bg-gray-100 text-gray-700">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs lg:text-sm font-medium text-gray-900">{zone.shortName}</span>
                      <p className="text-[10px] lg:text-xs text-gray-500">{zone.waitTime} min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base lg:text-lg font-extralight text-gray-900">{zone.saturation}%</span>
                    <p className="text-[10px] lg:text-xs text-gray-500">sat.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 lg:py-8 text-center">
              <p className="text-sm text-gray-500">Aucune zone critique identifiée</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-4 lg:p-6 border-gray-200 bg-gray-50">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Recommandations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 lg:p-4 bg-white rounded-xl"
            >
              <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gray-900 text-white text-xs lg:text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</p>
                <p className="text-xs lg:text-sm text-gray-600">{rec.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 hidden lg:flex items-center justify-between">
        <p className="text-xs text-gray-400">Rapport généré par HORAMA Flow</p>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
