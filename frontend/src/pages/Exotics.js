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
      marginBottom: '40px',
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
    error: {
      color: C.crimson,
      fontSize: '13px',
      marginTop: '8px',
      fontFamily: font.display,
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
      borderBottom: `1px solid ${C.border}`,
      color: C.gold,
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '1px',
      fontFamily: font.display,
      fontWeight: 600,
    },
    td: {
      padding: '8px 12px',
      borderBottom: `1px solid ${C.bgAlt}`,
      color: C.ivory,
      fontFamily: font.mono,
      fontSize: '13px',
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

  function AsianPriceSection() {
    const [inputs, setInputs] = useState({
      S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, option_type: 'call', div: 0,  n_sims: 100000, n_steps: 252
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
        const res = await fetch(`${BASE_URL}/asian?${params}`);
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
          <Field label="Number of Simulations" name="n_sims" value={inputs.n_sims} onChange={handleChange} />
          <Field label="Number of Steps" name="n_steps" value={inputs.n_steps} onChange={handleChange} />
        </div>
        <button style={styles.button} onClick={calculate}>Calculate</button>
        {error && <div style={styles.error}>{error}</div>}
        {result && (
          <div style={styles.resultsGrid}>
            <ResultCard label="Price" value={result.price} />
            <ResultCard label="Std Error" value={result.std_error} />
          </div>
        )}
      </div>
    );
  }

  function CompoundPriceSection() {
    const [inputs, setInputs] = useState({
        S: 100, K1: 100, K2: 10, T1: 0.5, T2: 1, r: 0.05, sigma: 0.2, div: 0
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
        const res = await fetch(`${BASE_URL}/compound?${params}`);
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
          <Field label="Strike on Base Option" name="K1" value={inputs.K} onChange={handleChange} />
          <Field label="Time to Expiry (yrs) on Base" name="T1" value={inputs.T1} onChange={handleChange} />
          <Field label="Strike on Compound Option" name="K2" value={inputs.K2} onChange={handleChange} />
          <Field label="Time to Expiry (yrs) on Compound" name="T2" value={inputs.T2} onChange={handleChange} />
          <Field label="Risk-Free Rate" name="r" value={inputs.r} onChange={handleChange} />
          <Field label="Volatility" name="sigma" value={inputs.sigma} onChange={handleChange} />
          <Field label="Dividend Yield" name="div" value={inputs.div} onChange={handleChange} />
        </div>
        <button style={styles.button} onClick={calculate}>Calculate</button>
        {error && <div style={styles.error}>{error}</div>}
        {result && (
          <div style={styles.resultsGrid}>
            <ResultCard label="Price" value={result.price} />
          </div>
        )}
      </div>
    );
  }

  export default function Exotics() {
    return (
      <div style={styles.page}>
        <div style={styles.title}>Exotic Options Pricer</div>
        <AsianPriceSection />
        <CompoundPriceSection />
      </div>
    );
  }
