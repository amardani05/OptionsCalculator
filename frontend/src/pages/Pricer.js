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
    marginBottom: '40px',
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
  error: {
    color: '#ef4444',
    fontSize: '13px',
    marginTop: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '1px solid #333',
    color: '#888',
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '1px',
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #1e1e1e',
    color: '#e0e0e0',
  },
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

function ResultCard({ label, value }) {
  return (
    <div style={styles.resultCard}>
      <div style={styles.resultLabel}>{label}</div>
      <div style={styles.resultValue}>
        {typeof value === 'number' ? value.toFixed(4) : value}
      </div>
    </div>
  );
}

// --- /price section ---
function PriceSection() {
  const [inputs, setInputs] = useState({
    S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, option_type: 'call', div: 0,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    setError(null);
    try {
      const params = new URLSearchParams(inputs).toString();
      const res = await fetch(`${BASE_URL}/price?${params}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to reach backend.');
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>BSM Pricer</div>
      <div style={styles.grid}>
        <Field label="Spot Price" name="S" value={inputs.S} onChange={handleChange} />
        <Field label="Strike" name="K" value={inputs.K} onChange={handleChange} />
        <Field label="Time to Expiry (yrs)" name="T" value={inputs.T} onChange={handleChange} />
        <Field label="Risk-Free Rate" name="r" value={inputs.r} onChange={handleChange} />
        <Field label="Volatility" name="sigma" value={inputs.sigma} onChange={handleChange} />
        <Field label="Dividend Yield" name="div" value={inputs.div} onChange={handleChange} />
        <Field label="Option Type (call/put)" name="option_type" value={inputs.option_type} onChange={handleChange} />
      </div>
      <button style={styles.button} onClick={calculate}>Calculate</button>
      {error && <div style={styles.error}>{error}</div>}
      {result && (
        <div style={styles.resultsGrid}>
          <ResultCard label="Price" value={result.price} />
          <ResultCard label="Delta" value={result.delta} />
          <ResultCard label="Gamma" value={result.gamma} />
          <ResultCard label="Vega" value={result.vega} />
          <ResultCard label="Theta" value={result.theta} />
          <ResultCard label="Rho" value={result.rho} />
        </div>
      )}
    </div>
  );
}

// --- /iv section ---
function IVSection() {
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
    try {
      const params = new URLSearchParams(inputs).toString();
      const res = await fetch(`${BASE_URL}/iv?${params}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data.iv);
      }
    } catch {
      setError('Failed to reach backend.');
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Implied Volatility Solver</div>
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
        <div style={{ ...styles.resultsGrid, gridTemplateColumns: '1fr' }}>
          <ResultCard label="Implied Volatility" value={result} />
        </div>
      )}
    </div>
  );
}

// --- /chain section ---
function ChainSection() {
  const [ticker, setTicker] = useState('SPY');
  const [chain, setChain] = useState(null);
  const [error, setError] = useState(null);

  const fetchChain = async () => {
    setError(null);
    setChain(null);
    try {
      const res = await fetch(`${BASE_URL}/chain?ticker=${encodeURIComponent(ticker)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setChain(data);
      }
    } catch {
      setError('Failed to reach backend.');
    }
  };

  const columns = chain && chain.length > 0 ? Object.keys(chain[0]) : [];

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Option Chain</div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Ticker</span>
          <input
            style={styles.input}
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />
        </div>
        <button style={styles.button} onClick={fetchChain}>Load Chain</button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {chain && (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={styles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chain.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col} style={styles.td}>
                      {typeof row[col] === 'number' ? row[col].toFixed(4) : String(row[col])}
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

export default function Pricer() {
  return (
    <div style={styles.page}>
      <div style={styles.title}>Options Calculator</div>
      <PriceSection />
      <IVSection />
      <ChainSection />
    </div>
  );
}
