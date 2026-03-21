
export function Notification({ type = 'success', message, onClose }: any) {
  const configs = {
    success: { icon: CheckCircle, color: 'green', bg: 'from-green-500/20', border: 'border-green-500/30' },
    error: { icon: AlertCircle, color: 'red', bg: 'from-red-500/20', border: 'border-red-500/30' },
    warning: { icon: AlertCircle, color: 'orange', bg: 'from-orange-500/20', border: 'border-orange-500/30' },
    info: { icon: Mail, color: 'blue', bg: 'from-blue-500/20', border: 'border-blue-500/30' },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 bg-gradient-to-br ${config.bg} backdrop-blur-md border ${config.border} rounded-xl p-4 shadow-xl animate-slide-in-right max-w-md`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 text-${config.color}-400 flex-shrink-0 mt-0.5`} />
        <p className="text-white text-sm flex-1">{message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
