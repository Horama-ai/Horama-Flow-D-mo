import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Event } from '../data/events';
import { Card, Badge, Button } from '../components/ui';

interface HistoryProps {
  events: Event[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
}

export function History({ events, selectedEventId, onSelectEvent }: HistoryProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Get current month's calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start

    const days: Array<{ date: Date | null; events: Event[] }> = [];

    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, events: [] });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getDate() === day &&
               eventDate.getMonth() === month &&
               eventDate.getFullYear() === year;
      });
      days.push({ date, events: dayEvents });
    }

    return days;
  }, [currentDate, events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const completedEvents = events.filter(e => e.status === 'completed');
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Calendrier</h1>
          <p className="text-sm text-gray-500 mt-1">{completedEvents.length} événements passés</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-full transition-colors ${
              viewMode === 'calendar' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Calendrier
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-full transition-colors ${
              viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Liste
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Calendar / List View */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {viewMode === 'calendar' ? (
            <Card className="p-3 lg:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <h2 className="text-base lg:text-xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Auj.
                  </button>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-1 lg:mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-[10px] lg:text-xs font-medium text-gray-500 uppercase tracking-wide py-1 lg:py-2">
                    {day.charAt(0)}
                    <span className="hidden lg:inline">{day.slice(1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0.5 lg:gap-1">
                {calendarData.map((day, idx) => {
                  const hasSelectedEvent = day.events.some(e => e.id === selectedEventId);
                  return (
                    <div
                      key={idx}
                      className={`
                        min-h-[48px] lg:min-h-[100px] p-1 lg:p-2 rounded-lg lg:rounded-xl border transition-colors
                        ${day.date ? 'bg-white border-gray-200 hover:border-gray-400' : 'bg-gray-50 border-transparent'}
                        ${isToday(day.date) ? 'border-gray-900 border-2' : ''}
                        ${hasSelectedEvent ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      `}
                    >
                      {day.date && (
                        <>
                          <span className={`text-xs lg:text-sm font-medium ${isToday(day.date) ? 'text-gray-900' : 'text-gray-900'}`}>
                            {day.date.getDate()}
                          </span>
                          <div className="mt-0.5 lg:mt-1 space-y-0.5 lg:space-y-1">
                            {day.events.slice(0, 2).map(event => {
                              const isSelected = event.id === selectedEventId;
                              return (
                                <button
                                  key={event.id}
                                  onClick={() => onSelectEvent(event.id)}
                                  className={`
                                    w-full text-left px-1 lg:px-1.5 py-0.5 lg:py-1 text-[9px] lg:text-xs rounded-md truncate transition-all
                                    ${isSelected
                                      ? 'bg-gray-900 text-white font-medium'
                                      : event.status === 'live'
                                        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                  `}
                                >
                                  <span className="hidden lg:inline">{event.status === 'live' && '● '}{event.name}</span>
                                  <span className="lg:hidden">{event.status === 'live' ? '●' : '•'}</span>
                                </button>
                              );
                            })}
                            {day.events.length > 2 && (
                              <span className="text-[9px] lg:text-xs text-gray-400 hidden lg:block">+{day.events.length - 2}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="hidden lg:flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-700" />
                  <span className="text-xs text-gray-500">En direct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gray-200" />
                  <span className="text-xs text-gray-500">Événement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gray-900" />
                  <span className="text-xs text-gray-500">Sélectionné</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {completedEvents.map((event, idx) => {
                  const isSelected = event.id === selectedEventId;
                  return (
                    <motion.button
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => onSelectEvent(event.id)}
                      className={`w-full p-3 lg:p-4 text-left hover:bg-gray-50 transition-colors flex items-center ${
                        isSelected ? 'bg-gray-100 border-l-4 border-l-gray-900' : ''
                      }`}
                    >
                      <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 lg:gap-0">
                        <div>
                          <p className={`text-sm lg:text-base font-medium ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                            {event.name}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">{event.subtitle}</p>
                        </div>
                        <div className="lg:text-right">
                          <p className="text-xs lg:text-sm font-medium text-gray-900">
                            {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500 mt-0.5">Score: {event.globalFluidityScore}%</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Event Details Panel */}
        <div className="space-y-3 lg:space-y-4 order-1 lg:order-2">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-3 lg:space-y-4"
              >
                <Card className="p-4 lg:p-5">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                      {selectedEvent.status === 'live' && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-gray-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-900" />
                        </span>
                      )}
                      <Badge variant={selectedEvent.status === 'live' ? 'blue' : selectedEvent.status === 'upcoming' ? 'yellow' : 'default'}>
                        {selectedEvent.status === 'live' ? 'En direct' : selectedEvent.status === 'upcoming' ? 'À venir' : 'Terminé'}
                      </Badge>
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">{selectedEvent.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-500 mb-3 lg:mb-4">{selectedEvent.subtitle}</p>

                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-900">
                          {selectedEvent.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-500">Durée</span>
                        <span className="font-medium text-gray-900">{selectedEvent.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-500">Fréquentation</span>
                        <span className="font-medium text-gray-900">{selectedEvent.currentAttendance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-gray-500">Zones</span>
                        <span className="font-medium text-gray-900">{selectedEvent.zones.length}</span>
                      </div>
                    </div>
                  </motion.div>
                </Card>

                {selectedEvent.status !== 'upcoming' && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Card className="p-4 lg:p-5">
                        <h4 className="text-xs lg:text-sm font-semibold text-gray-900 mb-3 lg:mb-4">Métriques clés</h4>
                        {/* Seamless tile for metrics */}
                        <div className="rounded-xl overflow-hidden">
                          <div className="grid grid-cols-2 gap-px bg-gray-200">
                            <motion.div
                              className="p-2 lg:p-3 bg-gray-50"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Fluidité</p>
                              <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedEvent.globalFluidityScore}%</p>
                            </motion.div>
                            <motion.div
                              className="p-2 lg:p-3 bg-gray-50"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.25 }}
                            >
                              <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Attente</p>
                              <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedEvent.avgWaitTime} min</p>
                            </motion.div>
                            <motion.div
                              className="p-2 lg:p-3 bg-gray-50"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Densité</p>
                              <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedEvent.avgDensity}%</p>
                            </motion.div>
                            <motion.div
                              className="p-2 lg:p-3 bg-gray-50"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 }}
                            >
                              <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide mb-1">Saturation</p>
                              <p className="text-xl lg:text-2xl font-extralight text-gray-900">{selectedEvent.avgSaturation}%</p>
                            </motion.div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    {selectedEvent.flowHistory.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card className="p-4 lg:p-5 hidden lg:block">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Évolution du flux</h4>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={selectedEvent.flowHistory}>
                                <defs>
                                  <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#111827',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '11px'
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  fill="url(#historyGradient)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button variant="primary" className="w-full text-sm">
                    Voir le rapport complet
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="p-6 lg:p-8">
                  <div className="text-center">
                    <p className="text-xs lg:text-sm text-gray-500">Sélectionnez un événement</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
