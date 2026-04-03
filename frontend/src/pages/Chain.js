import { useState, useMemo } from 'react';

const BASE_URL = 'http://localhost:8000';

const C = {
  bg:       '#2D0A0B',
  bgAlt:    '#3D1518',
  surface:  '#4D1F22',
  crimson:  '#B22234',
  ivory:    '#F0E6C8',
  gold:     '#C9AD6E',
  taupe:    '#9A8564',
  text:     '#F0E6C8',
  muted:    '#7A6A50',
  border:   '#4D1F22',
  inputBg:  '#1E0607',
  error:    '#B22234',
  callBg:   'rgba(201, 173, 110, 0.07)',
  putBg:    'rgba(178, 34, 52, 0.07)',
  strikeBg: '#3D1518',
};

const font = {
  display: "'EB Garamond', Garamond, serif",
  mono: "'IBM Plex Mono', monospace",
};

// Columns ordered inside-out from strike
// Call side: intrinsic, extrinsic, theta, gamma, delta, IV, mid | STRIKE | mid, IV, delta, gamma, theta, extrinsic, intrinsic
const callCols = [
  { key: 'intrinsic', label: 'Intrinsic', fmt: 'price' },
  { key: 'extrinsic', label: 'Extrinsic', fmt: 'price' },
  { key: 'theta',     label: 'Theta',     fmt: 'greek' },
  { key: 'gamma',     label: 'Gamma',     fmt: 'greek' },
  { key: 'delta',     label: 'Delta',     fmt: 'greek' },
  { key: 'iv',        label: 'IV',        fmt: 'iv' },
  { key: 'mid',       label: 'Mid',       fmt: 'price' },
];

const putCols = [
  { key: 'mid',       label: 'Mid',       fmt: 'price' },
  { key: 'iv',        label: 'IV',        fmt: 'iv' },
  { key: 'delta',     label: 'Delta',     fmt: 'greek' },
  { key: 'gamma',     label: 'Gamma',     fmt: 'greek' },
  { key: 'theta',     label: 'Theta',     fmt: 'greek' },
  { key: 'extrinsic', label: 'Extrinsic', fmt: 'price' },
  { key: 'intrinsic', label: 'Intrinsic', fmt: 'price' },
];

function fmtVal(v, fmt) {
  if (v == null) return '\u2014';
  switch (fmt) {
    case 'iv':    return `${(v * 100).toFixed(2)}%`;
    case 'greek': return v.toFixed(4);
    case 'price': return v.toFixed(2);
    default:      return String(v);
  }
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: font.display,
    padding: '32px 40px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${C.border}`,
  },
  title: {
    fontSize: '32px',
    fontWeight: 600,
    color: C.ivory,
    margin: 0,
    fontFamily: font.display,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  label: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: C.taupe,
    letterSpacing: '1px',
    fontFamily: font.display,
  },
  input: {
    backgroundColor: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    color: C.ivory,
    padding: '8px 12px',
    fontSize: '15px',
    fontFamily: font.mono,
    outline: 'none',
    width: '90px',
  },
  button: {
    backgroundColor: C.crimson,
    color: C.ivory,
    border: 'none',
    borderRadius: '4px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    fontFamily: font.display,
  },
  buttonDisabled: {
    backgroundColor: C.surface,
    color: C.muted,
    border: 'none',
    borderRadius: '4px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'not-allowed',
    letterSpacing: '0.5px',
    fontFamily: font.display,
  },
  error: {
    color: C.crimson,
    fontSize: '13px',
    marginTop: '8px',
    fontFamily: font.display,
  },
  expirationBar: {
    display: 'flex',
    gap: '0',
    overflowX: 'auto',
    marginBottom: '16px',
    borderBottom: `1px solid ${C.border}`,
  },
  expTab: (active) => ({
    padding: '8px 16px',
    fontSize: '13px',
    color: active ? C.ivory : C.taupe,
    backgroundColor: active ? C.bgAlt : 'transparent',
    border: 'none',
    borderBottom: active ? `2px solid ${C.crimson}` : '2px solid transparent',
    cursor: 'pointer',
    fontFamily: font.display,
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  }),
  tableWrap: {
    overflowX: 'auto',
    maxHeight: '72vh',
    overflowY: 'auto',
    borderRadius: '6px',
    border: `1px solid ${C.border}`,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
  },
  thGroup: {
    textAlign: 'center',
    padding: '8px 0',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '1px',
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.bgAlt,
    fontFamily: font.display,
  },
  th: {
    textAlign: 'right',
    padding: '5px 8px',
    borderBottom: `1px solid ${C.border}`,
    color: C.taupe,
    textTransform: 'uppercase',
    fontSize: '9px',
    letterSpacing: '1px',
    position: 'sticky',
    top: 0,
    backgroundColor: C.bgAlt,
    fontWeight: 600,
    fontFamily: font.display,
    whiteSpace: 'nowrap',
  },
  thStrike: {
    textAlign: 'center',
    padding: '5px 8px',
    borderBottom: `1px solid ${C.border}`,
    color: C.taupe,
    textTransform: 'uppercase',
    fontSize: '9px',
    letterSpacing: '1px',
    position: 'sticky',
    top: 0,
    backgroundColor: C.bgAlt,
    fontWeight: 600,
    fontFamily: font.display,
  },
  td: {
    textAlign: 'right',
    padding: '4px 8px',
    borderBottom: `1px solid ${C.bgAlt}`,
    color: C.ivory,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: font.mono,
    whiteSpace: 'nowrap',
  },
  tdStrike: {
    textAlign: 'center',
    padding: '4px 8px',
    borderBottom: `1px solid ${C.bgAlt}`,
    color: C.gold,
    fontWeight: 700,
    backgroundColor: C.strikeBg,
    borderLeft: `1px solid ${C.border}`,
    borderRight: `1px solid ${C.border}`,
    fontFamily: font.mono,
  },
  loadingContainer: {
    marginTop: '32px',
    padding: '32px',
    backgroundColor: C.bgAlt,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: '17px',
    color: C.ivory,
    marginBottom: '8px',
    fontFamily: font.display,
  },
  loadingSubtext: {
    fontSize: '13px',
    color: C.taupe,
    fontFamily: font.display,
  },
  progressBar: {
    height: '4px',
    backgroundColor: C.surface,
    borderRadius: '2px',
    marginTop: '20px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.crimson,
    borderRadius: '2px',
    animation: 'pulse 2s ease-in-out infinite',
    width: '40%',
  },
  count: {
    fontSize: '12px',
    color: C.taupe,
    marginTop: '10px',
    fontFamily: font.mono,
  },
  daysLabel: {
    fontSize: '13px',
    color: C.gold,
    marginBottom: '12px',
    fontFamily: font.display,
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { margin-left: 0%; opacity: 0.6; }
    50% { margin-left: 60%; opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default function Chain() {
  const [ticker, setTicker] = useState('SPY');
  const [contracts, setContracts] = useState(null);
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedExp, setSelectedExp] = useState(null);

  const fetchChain = async () => {
    setLoading(true);
    setError(null);
    setContracts(null);
    setSpot(null);
    setSelectedExp(null);
    setElapsed(0);

    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);

    try {
      const res = await fetch(`${BASE_URL}/chain?ticker=${encodeURIComponent(ticker)}`);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setContracts(json.contracts);
        setSpot(json.spot);
        const exps = [...new Set(json.contracts.map((r) => r.expiration))];
        if (exps.length > 0) setSelectedExp(exps[0]);
      }
    } catch {
      setError('Failed to reach backend.');
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const expirations = useMemo(() => {
    if (!contracts) return [];
    return [...new Set(contracts.map((r) => r.expiration))].sort();
  }, [contracts]);

  const chainRows = useMemo(() => {
    if (!contracts || !selectedExp) return [];
    const filtered = contracts.filter((r) => r.expiration === selectedExp);
    const byStrike = {};
    for (const row of filtered) {
      if (!byStrike[row.strike]) byStrike[row.strike] = {};
      byStrike[row.strike][row.type] = row;
    }
    return Object.keys(byStrike)
      .map(Number)
      .sort((a, b) => a - b)
      .map((strike) => ({
        strike,
        call: byStrike[strike].call || null,
        put: byStrike[strike].put || null,
      }));
  }, [contracts, selectedExp]);

  const daysToExp = useMemo(() => {
    if (!selectedExp) return null;
    const row = contracts?.find((r) => r.expiration === selectedExp);
    if (!row) return null;
    return Math.round(row.T * 365.25);
  }, [contracts, selectedExp]);

  // ITM: call is ITM when strike < spot, put is ITM when strike > spot
  // ITM = lighter burgundy (surface), OTM = dark burgundy (bg)
  const callRowBg = (strike) => (spot && strike < spot) ? C.surface : C.bg;
  const putRowBg = (strike) => (spot && strike > spot) ? C.surface : C.bg;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>IV Chain</div>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Ticker</span>
          <input
            style={styles.input}
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && !loading && fetchChain()}
          />
        </div>
        <button
          style={loading ? styles.buttonDisabled : styles.button}
          onClick={fetchChain}
          disabled={loading}
        >
          {loading ? 'Computing...' : 'Fetch'}
        </button>
        {contracts && (
          <span style={styles.count}>{contracts.length} contracts</span>
        )}
        {spot && (
          <span style={{ ...styles.count, color: C.gold }}>Spot: {spot.toFixed(2)}</span>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>
            Computing IV for every contract on {ticker}...
          </div>
          <div style={styles.loadingSubtext}>
            Newton-Raphson per contract — expect 30-60s on liquid names
          </div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
          <div style={styles.count}>{elapsed}s elapsed</div>
        </div>
      )}

      {expirations.length > 0 && (
        <div style={styles.expirationBar}>
          {expirations.map((exp) => (
            <button
              key={exp}
              style={styles.expTab(exp === selectedExp)}
              onClick={() => setSelectedExp(exp)}
            >
              {exp}
            </button>
          ))}
        </div>
      )}

      {selectedExp && daysToExp != null && (
        <div style={styles.daysLabel}>
          {selectedExp} ({daysToExp} days to expiry)
        </div>
      )}

      {chainRows.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th colSpan={callCols.length} style={{ ...styles.thGroup, color: C.gold }}>Call</th>
                <th style={{ ...styles.thGroup, color: C.taupe, backgroundColor: C.strikeBg }}>Strikes</th>
                <th colSpan={putCols.length} style={{ ...styles.thGroup, color: C.crimson }}>Put</th>
              </tr>
              <tr>
                {callCols.map((col) => (
                  <th key={`c-${col.key}`} style={styles.th}>{col.label}</th>
                ))}
                <th style={styles.thStrike}>Strike</th>
                {putCols.map((col) => (
                  <th key={`p-${col.key}`} style={styles.th}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chainRows.map(({ strike, call, put }) => (
                <tr key={strike}>
                  {callCols.map((col) => (
                    <td key={`c-${col.key}`} style={{ ...styles.td, backgroundColor: callRowBg(strike) }}>
                      {fmtVal(call?.[col.key], col.fmt)}
                    </td>
                  ))}
                  <td style={styles.tdStrike}>{strike}</td>
                  {putCols.map((col) => (
                    <td key={`p-${col.key}`} style={{ ...styles.td, backgroundColor: putRowBg(strike) }}>
                      {fmtVal(put?.[col.key], col.fmt)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
