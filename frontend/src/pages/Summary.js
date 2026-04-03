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

export default function Summary() {
  const [ticker, setTicker] = useState('SPY');
  const [ivData, setIvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIvAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/iv_analysis?ticker=${ticker}`);
      const json = await res.json();
      setIvData(json.error ? null : json);
    } catch {
      setError('Failed to reach backend.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>IV Analysis</div>
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
        <button style={styles.button} onClick={fetchIvAnalysis} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch IV Analysis'}
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {ivData && (
        <>
          <div style={{ ...styles.sectionTitle, marginTop: '48px' }}>Vol Regime</div>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: C.taupe, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>HV20</span>
              <div style={{ color: C.ivory, fontSize: '20px', fontFamily: font.mono }}>{(ivData.current_hv20 * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span style={{ color: C.taupe, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>ATM IV</span>
              <div style={{ color: C.ivory, fontSize: '20px', fontFamily: font.mono }}>{(ivData.atm_iv_call * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span style={{ color: C.taupe, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>IV-HV Spread</span>
              <div style={{ color: ivData.iv_hv_spread > 0 ? C.crimson : '#4CAF50', fontSize: '20px', fontFamily: font.mono }}>
                {ivData.iv_hv_spread > 0 ? '+' : ''}{(ivData.iv_hv_spread * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span style={{ color: C.taupe, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>HV Percentile</span>
              <div style={{ color: C.gold, fontSize: '20px', fontFamily: font.mono }}>{(ivData.hv_percentile * 100).toFixed(0)}th</div>
            </div>
            <div>
              <span style={{ color: C.taupe, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>IV Rank</span>
              <div style={{ color: C.gold, fontSize: '20px', fontFamily: font.mono }}>{(ivData.call_iv_rank * 100).toFixed(0)}th</div>
            </div>
          </div>

          <div style={{ ...styles.sectionTitle }}>Historical Volatility vs ATM IV</div>
          <Plot
            data={[
              {
                x: Object.keys(ivData.hv_20),
                y: Object.values(ivData.hv_20),
                type: 'scatter',
                mode: 'lines',
                name: 'HV20',
                line: { color: C.crimson, width: 2 },
              },
              {
                x: Object.keys(ivData.hv_60),
                y: Object.values(ivData.hv_60),
                type: 'scatter',
                mode: 'lines',
                name: 'HV60',
                line: { color: C.gold, width: 2 },
              },
              {
                x: [Object.keys(ivData.hv_20)[0], Object.keys(ivData.hv_20).slice(-1)[0]],
                y: [ivData.atm_iv_call, ivData.atm_iv_call],
                type: 'scatter',
                mode: 'lines',
                name: 'ATM IV',
                line: { color: C.ivory, width: 2, dash: 'dash' },
              },
            ]}
            layout={{
              paper_bgcolor: C.bg,
              plot_bgcolor: C.bg,
              font: { color: C.ivory, family: font.mono },
              xaxis: { color: C.taupe, gridcolor: C.border },
              yaxis: { title: 'Volatility', color: C.taupe, gridcolor: C.border },
              legend: { font: { color: C.ivory } },
              margin: { l: 60, r: 20, t: 20, b: 40 },
              autosize: true,
              height: 400,
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />
        </>
      )}
    </div>
  );
}
