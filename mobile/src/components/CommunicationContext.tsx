import { createContext, useContext } from 'react';
import type { Notice } from '@/lib/messaging';

export const CommunicationContext = createContext<{
  unread?: number;
  notifications?: number;
  notice?: Notice;
  dismiss: () => void;
  open: () => void;
}>({ dismiss: () => {}, open: () => {} });
export const useCommunication = () => useContext(CommunicationContext);
