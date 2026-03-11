import { useState } from 'react';

const BASE_URL = 'http://localhost:8000';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    fontFamily: "'IBM Plex Mono', monospace",
    padding: '40px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '32px',
    borderBottom: '1px solid #333',
    paddingBottom: '16px',
  },
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontSize: '13px',
    textTransform: 'uppercase',
    color: '#555',
    letterSpacing: '2px',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: '#888',
    letterSpacing: '1px',
  },
  input: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    padding: '10px 12px',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '32px',
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '16px',
  },
  resultLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  resultValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    marginTop: '4px',
  },
  resultSubtext: {
    fontSize: '11px',
    color: '#555',
    marginTop: '4px',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    marginTop: '8px',
  },
  ivBar: {
    height: '6px',
    backgroundColor: '#333',
    borderRadius: '3px',
    marginTop: '10px',
    overflow: 'hidden',
  },
  ivBarFill: (pct) => ({
    height: '100%',
    width: `${Math.min(Math.max(pct * 100, 0), 100)}%`,
    backgroundColor: pct > 0.7 ? '#ef4444' : pct > 0.4 ? '#f59e0b' : '#22c55e',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  }),
};

function Field({ label, name, value, onChange }) {
  return (
    <div style={styles.fieldGroup}>
      <span style={styles.label}>{label}</span>
      <input
        style={styles.input}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function ResultCard({ label, value, subtext, rank }) {
  return (
    <div style={styles.resultCard}>
      <div style={styles.resultLabel}>{label}</div>
      <div style={styles.resultValue}>
        {typeof value === 'number' ? value.toFixed(4) : value}
      </div>
      {subtext && <div style={styles.resultSubtext}>{subtext}</div>}
      {rank !== undefined && (
        <div style={styles.ivBar}>
          <div style={styles.ivBarFill(rank)} />
        </div>
      )}
    </div>
  );
}

// --- Manual IV Solver ---
function ManualSolver() {
  const [inputs, setInputs] = useState({
    S: 100, K: 100, T: 1, r: 0.05, div: 0, market_price: 10, option_type: 'call',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const solve = async () => {
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams(inputs).toString();
      const res = await fetch(`${BASE_URL}/iv?${params}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.iv);
      }
    } catch {
      setError('Failed to reach backend.');
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Manual IV Solver</div>
      <div style={styles.grid}>
        <Field label="Spot Price" name="S" value={inputs.S} onChange={handleChange} />
        <Field label="Strike" name="K" value={inputs.K} onChange={handleChange} />
        <Field label="Time to Expiry (yrs)" name="T" value={inputs.T} onChange={handleChange} />
        <Field label="Risk-Free Rate" name="r" value={inputs.r} onChange={handleChange} />
        <Field label="Dividend Yield" name="div" value={inputs.div} onChange={handleChange} />
        <Field label="Market Price" name="market_price" value={inputs.market_price} onChange={handleChange} />
        <Field label="Option Type (call/put)" name="option_type" value={inputs.option_type} onChange={handleChange} />
      </div>
      <button style={styles.button} onClick={solve}>Solve IV</button>
      {error && <div style={styles.error}>{error}</div>}
      {result !== null && (
        <div style={{ ...styles.resultsGrid, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <ResultCard label="Implied Volatility" value={result} subtext={`${(result * 100).toFixed(2)}%`} />
          <ResultCard label="Annualised IV" value={result} subtext="Newton-Raphson, up to 1000 iterations" />
        </div>
      )}
    </div>
  );
}

// --- IV Analysis (ticker-based) ---
function IVAnalysis() {
  const [ticker, setTicker] = useState('SPY');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyse = async () => {
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/iv_analysis?ticker=${encodeURIComponent(ticker)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to reach backend.');
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>IV Analysis</div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Ticker</span>
          <input
            style={styles.input}
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />
        </div>
        <button style={styles.button} onClick={analyse}>Analyse</button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {result && (
        <div style={styles.resultsGrid}>
          <ResultCard
            label="ATM IV — Call"
            value={result.atm_iv_call}
            subtext={`${(result.atm_iv_call * 100).toFixed(2)}%`}
          />
          <ResultCard
            label="ATM IV — Put"
            value={result.atm_iv_put}
            subtext={`${(result.atm_iv_put * 100).toFixed(2)}%`}
          />
          <ResultCard
            label="IV–HV Spread"
            value={result.iv_hv_spread}
            subtext="ATM call IV minus 20-day HV"
          />
          <ResultCard
            label="20-Day HV"
            value={result.hv_20}
            subtext={`${(result.hv_20 * 100).toFixed(2)}%`}
          />
          <ResultCard
            label="60-Day HV"
            value={result.hv_60}
            subtext={`${(result.hv_60 * 100).toFixed(2)}%`}
          />
          <ResultCard
            label="Call IV Rank"
            value={result.call_iv_rank}
            subtext={`${(result.call_iv_rank * 100).toFixed(1)}th percentile`}
            rank={result.call_iv_rank}
          />
          <ResultCard
            label="Put IV Rank"
            value={result.put_iv_rank}
            subtext={`${(result.put_iv_rank * 100).toFixed(1)}th percentile`}
            rank={result.put_iv_rank}
          />
        </div>
      )}
    </div>
  );
}

export default function IVSolver() {
  return (
    <div style={styles.page}>
      <div style={styles.title}>IV Solver</div>
      <ManualSolver />
      <IVAnalysis />
    </div>
  );
}
