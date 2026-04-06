import { useState } from 'react';
import Plot from 'react-plotly.js';

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
    backgroundColor: '#000000',
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
  card: {
    backgroundColor: C.bg,
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    padding: '28px',
    marginBottom: '24px',
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
  select: {
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
  error: {
    color: C.crimson,
    fontSize: '13px',
    marginTop: '8px',
    fontFamily: font.display,
  },
};

export default function Analysis() {
  const [ticker, setTicker] = useState('SPY');
  const [expirations, setExpirations] = useState([]);
  const [selectedExp, setSelectedExp] = useState('');
  const [skewData, setSkewData] = useState(null);
  const [termData, setTermData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChain = async () => {
    setLoading(true);
    setError(null);
    setSkewData(null);
    setTermData(null);
    setSelectedExp('');
    try {
      const [chainRes, termRes] = await Promise.all([
        fetch(`http://localhost:8000/chain?ticker=${ticker}`),
        fetch(`http://localhost:8000/term_structure?ticker=${ticker}`),
      ]);
      const chainJson = await chainRes.json();
      const termJson = await termRes.json();

      const exps = [...new Set(chainJson.contracts.map((c) => c.expiration))].sort();
      setExpirations(exps);
      if (exps.length > 0) setSelectedExp(exps[0]);
      setTermData(termJson);
    } catch {
      setError('Failed to reach backend.');
    }
    setLoading(false);
  };

  const fetchSkew = async (exp) => {
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/skew?ticker=${ticker}&expiration=${exp}`);
      const json = await res.json();
      setSkewData(json);
    } catch {
      setError('Failed to fetch skew data.');
    }
  };

  const handleExpChange = (e) => {
    const exp = e.target.value;
    setSelectedExp(exp);
    if (exp) fetchSkew(exp);
  };

  const handleFetch = async () => {
    await fetchChain();
  };

  // Fetch skew for the first expiration once expirations load
  const handleFetchAndSkew = async () => {
    setLoading(true);
    setError(null);
    setSkewData(null);
    setTermData(null);
    setSelectedExp('');
    try {
      const [chainRes, termRes] = await Promise.all([
        fetch(`http://localhost:8000/chain?ticker=${ticker}`),
        fetch(`http://localhost:8000/term_structure?ticker=${ticker}`),
      ]);
      const chainJson = await chainRes.json();
      const termJson = await termRes.json();

      const exps = [...new Set(chainJson.contracts.map((c) => c.expiration))].sort();
      setExpirations(exps);
      setTermData(termJson);

      if (exps.length > 0) {
        setSelectedExp(exps[0]);
        const skewRes = await fetch(`http://localhost:8000/skew?ticker=${ticker}&expiration=${exps[0]}`);
        const skewJson = await skewRes.json();
        setSkewData(skewJson);
      }
    } catch {
      setError('Failed to reach backend.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>Skew & Term Structure</div>
      <div style={styles.sectionTitle}>Configuration</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Ticker</span>
          <input
            style={styles.input}
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
          />
        </div>
        <button style={styles.button} onClick={handleFetchAndSkew} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        {expirations.length > 0 && (
          <div style={styles.fieldGroup}>
            <span style={styles.label}>Expiration (Skew)</span>
            <select style={styles.select} value={selectedExp} onChange={handleExpChange}>
              {expirations.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {error && <div style={styles.error}>{error}</div>}

      {skewData && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            Volatility Skew — {selectedExp}
          </div>
          <Plot
            data={[
              {
                x: skewData.calls.strikes,
                y: skewData.calls.iv,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Calls',
                line: { color: C.crimson, width: 2 },
                marker: { size: 4 },
              },
              {
                x: skewData.puts.strikes,
                y: skewData.puts.iv,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Puts',
                line: { color: C.gold, width: 2 },
                marker: { size: 4 },
              },
              {
                x: [skewData.spot, skewData.spot],
                y: [0, Math.max(...skewData.calls.iv, ...skewData.puts.iv) * 1.05],
                type: 'scatter',
                mode: 'lines',
                name: 'Spot',
                line: { color: C.ivory, width: 1, dash: 'dash' },
              },
            ]}
            layout={{
              paper_bgcolor: C.bg,
              plot_bgcolor: C.bg,
              font: { color: C.ivory, family: font.mono },
              xaxis: { title: { text: 'Strike', font: { color: C.taupe } }, color: C.taupe, gridcolor: C.border },
              yaxis: { title: { text: 'Implied Volatility', font: { color: C.taupe } }, color: C.taupe, gridcolor: C.border, tickformat: '.0%' },
              legend: { font: { color: C.ivory } },
              margin: { l: 60, r: 20, t: 20, b: 50 },
              autosize: true,
              height: 450,
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />
        </div>
      )}

      {termData && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>ATM Term Structure</div>
          <Plot
            data={[
              {
                x: termData.term_structure.map((d) => d.expiration),
                y: termData.term_structure.map((d) => d.atm_iv),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'ATM IV',
                line: { color: C.crimson, width: 2 },
                marker: { size: 6, color: C.gold },
              },
            ]}
            layout={{
              paper_bgcolor: C.bg,
              plot_bgcolor: C.bg,
              font: { color: C.ivory, family: font.mono },
              xaxis: { title: { text: 'Expiration', font: { color: C.taupe } }, color: C.taupe, gridcolor: C.border },
              yaxis: { title: { text: 'Implied Volatility', font: { color: C.taupe } }, color: C.taupe, gridcolor: C.border, tickformat: '.0%' },
              legend: { font: { color: C.ivory } },
              margin: { l: 60, r: 20, t: 20, b: 50 },
              autosize: true,
              height: 450,
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
