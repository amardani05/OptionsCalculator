from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from models.bsm import BSM
from models.iv_solver import solve_iv
from models.market_data import market_iv
from models.iv_analysis import historical_iv

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

@app.get("/iv_analysis")
def get_iv_analysis(ticker: str):
    result = historical_iv(ticker)
    if result is None:
        return {"error": "Could not compute IV analysis"}
    return {
        "hv_20": float(result["hv_20"].iloc[-1]),
        "hv_60": float(result["hv_60"].iloc[-1]),
        "atm_iv_call": float(result["atm_iv_call"]),
        "atm_iv_put": float(result["atm_iv_put"]),
        "call_iv_rank": float(result["call_iv_rank"]),
        "put_iv_rank": float(result["put_iv_rank"]),
        "iv_hv_spread": float(result["iv_hv_spread"]),
    }

@app.get("/chain")
def get_chain(ticker: str):
    df = market_iv(ticker)
    return df.to_dict(orient="records")
