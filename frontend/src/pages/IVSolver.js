import { useState } from 'react';

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
};

const font = {
  display: "'EB Garamond', Garamond, serif",
  mono: "'IBM Plex Mono', monospace",
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: font.display,
    padding: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 600,
    color: C.ivory,
    marginBottom: '32px',
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: '16px',
    fontFamily: font.display,
  },
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontSize: '14px',
    textTransform: 'uppercase',
    color: C.gold,
    letterSpacing: '2px',
    marginBottom: '16px',
    fontFamily: font.display,
    fontWeight: 600,
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
    fontSize: '12px',
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
    padding: '10px 12px',
    fontSize: '15px',
    fontFamily: font.mono,
    outline: 'none',
  },
  button: {
    backgroundColor: C.crimson,
    color: C.ivory,
    border: 'none',
    borderRadius: '4px',
    padding: '12px 32px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    fontFamily: font.display,
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '32px',
  },
  resultCard: {
    backgroundColor: C.bgAlt,
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    padding: '16px',
  },
  resultLabel: {
    fontSize: '12px',
    color: C.gold,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: font.display,
  },
  resultValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: C.ivory,
    marginTop: '4px',
    fontFamily: font.mono,
  },
  resultSubtext: {
    fontSize: '11px',
    color: C.taupe,
    marginTop: '4px',
    fontFamily: font.display,
  },
  error: {
    color: C.crimson,
    fontSize: '13px',
    marginTop: '8px',
    fontFamily: font.display,
  },
  ivBar: {
    height: '6px',
    backgroundColor: C.surface,
    borderRadius: '3px',
    marginTop: '10px',
    overflow: 'hidden',
  },
  ivBarFill: (pct) => ({
    height: '100%',
    width: `${Math.min(Math.max(pct * 100, 0), 100)}%`,
    backgroundColor: pct > 0.7 ? C.crimson : pct > 0.4 ? C.gold : C.taupe,
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

export default function IVSolver() {
  return (
    <div style={styles.page}>
      <div style={styles.title}>IV Solver</div>
      <ManualSolver />
    </div>
  );
}
