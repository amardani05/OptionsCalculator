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

export default function Dashboard() {
  const [ticker, setTicker] = useState('SPY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Surface state
  const [surfaceData, setSurfaceData] = useState(null);

  // IV Analysis state
  const [ivData, setIvData] = useState(null);

  // Skew & Term state
  const [expirations, setExpirations] = useState([]);
  const [selectedExp, setSelectedExp] = useState('');
  const [skewData, setSkewData] = useState(null);
  const [termData, setTermData] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    setSurfaceData(null);
    setIvData(null);
    setSkewData(null);
    setTermData(null);
    setSelectedExp('');

    try {
      const [surfaceRes, ivRes, chainRes, termRes] = await Promise.all([
        fetch(`http://localhost:8000/surface?ticker=${ticker}`),
        fetch(`http://localhost:8000/iv_analysis?ticker=${ticker}`),
        fetch(`http://localhost:8000/chain?ticker=${ticker}`),
        fetch(`http://localhost:8000/term_structure?ticker=${ticker}`),
      ]);

      const [surfaceJson, ivJson, chainJson, termJson] = await Promise.all([
        surfaceRes.json(),
        ivRes.json(),
        chainRes.json(),
        termRes.json(),
      ]);

      setSurfaceData(surfaceJson);
      setIvData(ivJson.error ? null : ivJson);
      setTermData(termJson);

      const exps = [...new Set(chainJson.contracts.map((c) => c.expiration))].sort();
      setExpirations(exps);

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

  const handleExpChange = async (e) => {
    const exp = e.target.value;
    setSelectedExp(exp);
    if (exp) {
      try {
        const res = await fetch(`http://localhost:8000/skew?ticker=${ticker}&expiration=${exp}`);
        const json = await res.json();
        setSkewData(json);
      } catch {
        setError('Failed to fetch skew data.');
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>Option Dashboard</div>

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
        <button style={styles.button} onClick={fetchAll} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch All'}
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

      {/* IV Analysis Section */}
      {ivData && (
        <>
          <div style={{ ...styles.sectionTitle, marginTop: '32px' }}>Vol Regime</div>
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

          <div style={styles.sectionTitle}>Historical Volatility vs ATM IV</div>
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

      {/* Surface Section */}
      {surfaceData && (
        <>
          <div style={{ ...styles.sectionTitle, marginTop: '48px' }}>Volatility Surface</div>
          <Plot
            data={[
              {
                x: surfaceData.x,
                y: surfaceData.y,
                z: surfaceData.z,
                type: 'surface',
                opacity: 0.85,
                colorscale: [
                  [0, C.bg],
                  [0.5, C.crimson],
                  [1, C.gold],
                ],
              },
              {
                x: surfaceData.scatter.x,
                y: surfaceData.scatter.y,
                z: surfaceData.scatter.z,
                type: 'scatter3d',
                mode: 'markers',
                marker: { size: 2, color: 'white' },
                name: 'Market Data',
              },
            ]}
            layout={{
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
              margin: { l: 0, r: 0, t: 20, b: 0 },
              autosize: true,
              height: 600,
            }}
            useResizeHandler
            style={{ width: '100%' }}
          />
        </>
      )}

      {/* Skew Section */}
      {skewData && (
        <>
          <div style={{ ...styles.sectionTitle, marginTop: '48px' }}>
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
        </>
      )}

      {/* Term Structure Section */}
      {termData && (
        <>
          <div style={{ ...styles.sectionTitle, marginTop: '48px' }}>ATM Term Structure</div>
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
        </>
      )}
    </div>
  );
}
