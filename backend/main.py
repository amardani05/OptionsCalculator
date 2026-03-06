from fastapi import FastAPI # type: ignore
from models.bsm import BSM
from models.iv_solver import solve_iv
from models.market_data import market_iv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
'''

Add that to `main.py` right after you create the app, before your endpoints. Install it if needed: `pip install fastapi[all]`.

Once that's in place, you're ready for React. Here's the plan:

**Step 1:** From your project root, create the frontend:
```
cd /Users/amardani/OptionsCalculator
npx create-react-app frontend
cd frontend
npm start
'''
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
def get_chain(ticker):
    df = market_iv(ticker)
    return df.to_dict(orient='records')


'''
**Step 2:** From your `backend/` folder, run:

uvicorn main:app --reload


**Step 3:** Open your browser and go to:

http://localhost:8000/docs
'''
