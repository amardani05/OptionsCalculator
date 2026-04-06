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

export default function Surface() {
  const [ticker, setTicker] = useState('SPY');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSurface = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/surface?ticker=${ticker}`);
      const json = await res.json();
      setData(json);
    } catch {
      setError('Failed to reach backend.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>Volatility Surface</div>
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
        <button style={styles.button} onClick={fetchSurface} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Surface'}
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {data && (
        <div style={styles.card}>
        <Plot
            data={[
                {
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    type: 'surface',
                    opacity: 0.85,
                    colorscale: [
                        [0, C.bg],
                        [0.5, C.crimson],
                        [1, C.gold],
                    ],
                },
                {
                    x: data.scatter.x,
                    y: data.scatter.y,
                    z: data.scatter.z,
                    type: 'scatter3d',
                    mode: 'markers',
                    marker: { size: 2, color: 'white' },
                    name: 'Market Data',
                },
            ]}
            layout={{
                title: { text: `${ticker} IV Surface`, font: { color: C.ivory, family: font.display } },
                paper_bgcolor: C.bg,
                plot_bgcolor: C.bg,
                scene: {
                    xaxis: {
                        title: { text: 'Time to Expiry (Years)', font: { color: C.taupe } },
                        color: C.taupe,
                        gridcolor: C.border,
                        dtick: 0.05,
                    },
                    yaxis: {
                        title: { text: 'Moneyness (K/S)', font: { color: C.taupe } },
                        color: C.taupe,
                        gridcolor: C.border,
                        dtick: 0.02,
                    },
                    zaxis: {
                        title: { text: 'Implied Volatility', font: { color: C.taupe } },
                        color: C.taupe,
                        gridcolor: C.border,
                        tickformat: '.0%',
                    },
                    bgcolor: C.bg,
                    aspectratio: { x: 2, y: 1, z: 0.8 },
                },
                font: { color: C.ivory, family: font.mono },
                margin: { l: 0, r: 0, t: 40, b: 0 },
                autosize: true,
                height: 700,
            }}
            useResizeHandler
            style={{ width: '100%' }}
        />
        </div>
    )}
    </div>
  );
}
