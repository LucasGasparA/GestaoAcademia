import { useEffect, useRef, useState } from 'react';
import api from '../api/api';
import { IconTerminal, IconChevronDown } from './Icons';

const OP_CLASS = {
  CREATE: 'is-create',
  UPDATE: 'is-update',
  DELETE: 'is-delete',
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function LogConsole() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pulse, setPulse] = useState(false);
  const lastIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      api.get('/logs', { params: { limit: 30 } }).then(r => {
        if (cancelled) return;
        const data = r.data;
        if (data.length && data[0].id !== lastIdRef.current) {
          if (lastIdRef.current !== 0) {
            setPulse(true);
            setTimeout(() => setPulse(false), 900);
          }
          lastIdRef.current = data[0].id;
        }
        setLogs(data);
      }).catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="log-console">
      {open && (
        <div className="log-console-panel">
          <div className="log-console-header">
            <div className="log-console-title">
              <IconTerminal width={14} height={14} />
              LOG DE ATIVIDADE
            </div>
            <button className="log-console-collapse" onClick={() => setOpen(false)}>
              <IconChevronDown width={14} height={14} />
            </button>
          </div>
          <div className="log-console-body">
            {logs.length === 0 ? (
              <div className="log-console-empty">Nenhuma operação registrada ainda.</div>
            ) : (
              logs.map(l => (
                <div className="log-entry" key={l.id}>
                  <span className={`log-entry-op ${OP_CLASS[l.operacao] || ''}`}>{l.operacao}</span>
                  <span className="log-entry-desc">{l.descricao}</span>
                  <span className="log-entry-time">{formatTime(l.criado_em)}</span>
                </div>
              ))
            )}
          </div>
          <div className="log-console-footer">registro em memória · atualiza a cada 3s</div>
        </div>
      )}

      <button className={`log-console-toggle ${pulse ? 'is-pulse' : ''}`} onClick={() => setOpen(o => !o)}>
        <IconTerminal width={16} height={16} />
        LOGS
        {logs.length > 0 && <span className="log-console-count">{logs.length}</span>}
      </button>
    </div>
  );
}
