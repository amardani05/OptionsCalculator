from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from models.bsm import BSM
from models.iv_solver import solve_iv
from models.market_data import market_iv
from models.iv_analysis import historical_iv
from models.vol_surface import build_surface
from models.exotic import asian_option
from models.exotic import compound_option

import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/price")
def get_price(S: float, K: float, T: float, r: float, sigma: float, option_type: str, div: float = 0):
    model = BSM(S, K, T, r, sigma, option_type, div)
    return {
        "price": model.price(),
        "delta": model.delta(),
        "gamma": model.gamma(),
        "vega": model.vega(),
        "theta": model.theta(),
        "rho": model.rho()
    }

@app.get("/iv")
def get_iv(S: float, K: float, T: float, r: float, div: float, market_price: float, option_type: str):
    iv = solve_iv(S, K, T, r, div, market_price, option_type)
    if iv is None:
        return {"error": "Could not converge"}
    return {"iv": iv}

@app.get("/chain")
def get_chain(ticker: str):
    df, spot = market_iv(ticker)
    return {
        "contracts": df.to_dict(orient="records"),
        "spot": spot
    }

@app.get("/surface")
def get_surface(ticker: str):
    X, Y, Z, calls = build_surface(ticker)
    return {
        "x": X.tolist(),
        "y": Y.tolist(),
        "z": np.where(np.isnan(Z), None, Z).tolist(),
        "scatter": {
            "x": calls['T'].tolist(),
            "y": calls['moneyness'].tolist(),
            "z": calls['iv'].tolist(),
        }
    }

@app.get("/iv_analysis")
def get_iv_analysis(ticker: str):
    result = historical_iv(ticker)
    if result is None:
        return {"error": "Could not compute"}
    
    hv20 = result["hv_20"].dropna()
    hv60 = result["hv_60"].dropna()
    
    current_hv20 = float(hv20.iloc[-1])
    hv_percentile = float((hv20 < current_hv20).mean())
    
    return {
        "hv_20": {d.strftime("%Y-%m-%d"): float(v) for d, v in hv20.items()},
        "hv_60": {d.strftime("%Y-%m-%d"): float(v) for d, v in hv60.items()},
        "atm_iv_call": float(result["atm_iv_call"]),
        "atm_iv_put": float(result["atm_iv_put"]),
        "call_iv_rank": float(result["call_iv_rank"]),
        "put_iv_rank": float(result["put_iv_rank"]),
        "iv_hv_spread": float(result["iv_hv_spread"]),
        "hv_percentile": hv_percentile,
        "current_hv20": current_hv20,
    }

@app.get("/vol_regime")
def get_vol_regime(ticker: str):
    tick = yf.Ticker(ticker)
    spot = tick.history(period="1y")['Close']
    log_returns = np.log(spot / spot.shift(1))
    
    hv_20 = log_returns.rolling(20).std() * np.sqrt(252)
    hv_60 = log_returns.rolling(60).std() * np.sqrt(252)
    
    current_hv20 = float(hv_20.iloc[-1])
    current_hv60 = float(hv_60.iloc[-1])
    
    # Percentile of current HV20 over past year
    hv_percentile = float((hv_20.dropna() < current_hv20).mean())
    
    # Vol regime
    if current_hv20 > current_hv60 * 1.1:
        regime = "expanding"
    elif current_hv20 < current_hv60 * 0.9:
        regime = "contracting"
    else:
        regime = "stable"
    
    return {
        "hv_20": current_hv20,
        "hv_60": current_hv60,
        "hv_percentile": hv_percentile,
        "regime": regime,
        "hv_20_series": {str(k): v for k, v in hv_20.dropna().to_dict().items()},
        "hv_60_series": {str(k): v for k, v in hv_60.dropna().to_dict().items()},
    }

@app.get("/skew")
def get_skew(ticker: str, expiration: str):
    df, spot = market_iv(ticker)
    exp_data = df[df['expiration'] == expiration]
    calls = exp_data[exp_data['type'] == 'call'].sort_values('strike')
    puts = exp_data[exp_data['type'] == 'put'].sort_values('strike')
    return {
        "spot": spot,
        "calls": {"strikes": calls['strike'].tolist(), "iv": calls['iv'].tolist()},
        "puts": {"strikes": puts['strike'].tolist(), "iv": puts['iv'].tolist()},
    }

@app.get("/term_structure")
def get_term_structure(ticker: str):
    df, spot = market_iv(ticker)
    results = []
    for exp in df['expiration'].unique():
        exp_data = df[df['expiration'] == exp]
        calls = exp_data[exp_data['type'] == 'call']
        if calls.empty:
            continue
        atm = calls.loc[(calls['strike'] - spot).abs().idxmin()]
        results.append({
            "expiration": exp,
            "T": float(atm['T']),
            "atm_iv": float(atm['iv']),
        })
    return {"spot": spot, "term_structure": results}

@app.get("/asian")
def get_asian(S: float, K: float, T: float, r: float, sigma: float, option_type: str, div: float = 0, n_sims: int = 100000, n_steps: int = 252):
    result = asian_option(S, K, T, r, sigma, option_type, div, n_sims, n_steps)
    return result

@app.get("/compound")
def get_compound(S: float, K1: float, K2: float, T1: float, T2: float, r: float, sigma: float, div: float = 0):
    return compound_option(S, K1, K2, T1, T2, r, sigma, div)