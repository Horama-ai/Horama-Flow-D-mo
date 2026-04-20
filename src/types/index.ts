export type {
  Account,
  AccountId,
  Event,
  EventStatus,
  Zone,
  ZoneStatus,
  Alert,
  AlertSeverity,
  TimeSeriesPoint
} from '../data/events';

export type PageId =
  | 'dashboard'
  | 'zones'
  | 'alerts'
  | 'history'
  | 'compare'
  | 'report';
