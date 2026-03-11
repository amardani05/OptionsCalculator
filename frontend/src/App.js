import { useState } from 'react';

function App() {
  const [inputs, setInputs] = useState({
    S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, option_type: 'call', div: 0
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    const params = new URLSearchParams(inputs).toString();
    const response = await fetch(`http://localhost:8000/price?${params}`);
    const data = await response.json();
    setResult(data);
  };

  // Style objects — keeps styling in one place
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
  };

  // Helper to render one input field
  const field = (label, name) => (
    <div style={styles.fieldGroup}>
      <span style={styles.label}>{label}</span>
      <input
        style={styles.input}
        name={name}
        value={inputs[name]}
        onChange={handleChange}
      />
    </div>
  );

  // Helper to render one result card
  const card = (label, value) => (
    <div style={styles.resultCard}>
      <div style={styles.resultLabel}>{label}</div>
      <div style={styles.resultValue}>{value?.toFixed(4)}</div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* YOU: add this font import to public/index.html in the <head>: 
          <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet"> 
      */}
      <div style={styles.title}>Options Pricer</div>

      <div style={styles.grid}>
        {field('Spot Price', 'S')}
        {field('Strike', 'K')}
        {field('Time to Expiry', 'T')}
        {field('Risk-Free Rate', 'r')}
        {field('Volatility', 'sigma')}
        {field('Dividend Yield', 'div')}
        {field('Option Type', 'option_type')}
      </div>

      <button style={styles.button} onClick={calculate}>Calculate</button>

      {result && (
        <div style={styles.resultsGrid}>
          {card('Price', result.price)}
          {card('Delta', result.delta)}
          {card('Gamma', result.gamma)}
          {card('Vega', result.vega)}
          {card('Theta', result.theta)}
          {card('Rho', result.rho)}
        </div>
      )}
    </div>
  );
}

export default App;