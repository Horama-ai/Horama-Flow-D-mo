import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Zones } from './pages/Zones';
import { Alerts } from './pages/Alerts';
import { History } from './pages/History';
import { Compare } from './pages/Compare';
import { Report } from './pages/Report';
import { eventsDatabase, accounts, getEventsByAccount } from './data/events';
import type { PageId, AccountId } from './types';
import type { Event } from './data/events';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [currentAccountId, setCurrentAccountId] = useState<AccountId>('stade-france');
  const [events, setEvents] = useState<Event[]>(eventsDatabase);

  // Get events for current account
  const accountEvents = useMemo(() => {
    return events.filter(e => e.accountId === currentAccountId);
  }, [events, currentAccountId]);

  // Get live event or first event for current account
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const accountEvts = getEventsByAccount('stade-france');
    const liveEvent = accountEvts.find(e => e.status === 'live');
    return liveEvent?.id || accountEvts[0]?.id || '';
  });

  // Update selected event when account changes
  const handleAccountChange = useCallback((accountId: AccountId) => {
    setCurrentAccountId(accountId);
    const accountEvts = getEventsByAccount(accountId);
    const liveEvent = accountEvts.find(e => e.status === 'live');
    setSelectedEventId(liveEvent?.id || accountEvts[0]?.id || '');
  }, []);

  const handleUpdateAlert = useCallback((alertId: string, acknowledged: boolean) => {
    setEvents(prevEvents =>
      prevEvents.map(event => ({
        ...event,
        alerts: event.alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged } : alert
        )
      }))
    );
  }, []);

  const selectedEvent = useMemo(() => {
    return accountEvents.find(e => e.id === selectedEventId) || accountEvents[0];
  }, [accountEvents, selectedEventId]);

  const currentAccount = accounts.find(a => a.id === currentAccountId)!;

  const renderPage = () => {
    if (!selectedEvent) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-slate-500">Aucun événement disponible</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard event={selectedEvent} />;
      case 'zones':
        return <Zones event={selectedEvent} />;
      case 'alerts':
        return <Alerts event={selectedEvent} onUpdateAlert={handleUpdateAlert} />;
      case 'history':
        return <History events={accountEvents} selectedEventId={selectedEventId} onSelectEvent={setSelectedEventId} />;
      case 'compare':
        return <Compare events={accountEvents} />;
      case 'report':
        return <Report event={selectedEvent} />;
      default:
        return <Dashboard event={selectedEvent} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        events={accountEvents}
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
        currentAccount={currentAccount}
        accounts={accounts}
        onAccountChange={handleAccountChange}
        alertCount={selectedEvent?.alerts.filter(a => !a.acknowledged).length || 0}
      />

      <div className="flex-1 ml-64">
        <main className="min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${selectedEventId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
