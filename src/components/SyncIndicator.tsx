import { useSyncStore } from '../syncStore';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

export default function SyncIndicator() {
  const { status, lastSync } = useSyncStore();

  const getStatusInfo = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <Cloud size={14} />,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          text: 'Tersinkron',
        };
      case 'syncing':
        return {
          icon: <RefreshCw size={14} className="animate-spin" />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          text: 'Menyimpan...',
        };
      case 'offline':
        return {
          icon: <CloudOff size={14} />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          text: 'Offline',
        };
      case 'error':
        return {
          icon: <CloudOff size={14} />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          text: 'Error',
        };
      default:
        return {
          icon: <Cloud size={14} />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          text: 'Unknown',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${statusInfo.bgColor}`}>
      <div className={statusInfo.color}>
        {statusInfo.icon}
      </div>
      <span className={`text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {lastSync && status === 'synced' && (
        <span className="text-xs text-gray-400 hidden sm:inline">
          {lastSync.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  );
}
