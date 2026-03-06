import yfinance as yf # type: ignore
import math
import pandas as pd # type: ignore
from datetime import datetime
from .bsm import BSM
from .iv_solver import solve_iv


def market_iv(ticker):
    tick = yf.Ticker(ticker)
    spot = tick.history(period="1d")['Close'].iloc[-1]
    q = tick.info.get('dividendYield', 0) or 0
    q_continuous = math.log(1 + q)
    expirations = tick.options
    
    results = []
    
    for i in range(len(expirations)):
        chain = tick.option_chain(expirations[i])
        T = (datetime.strptime(expirations[i], "%Y-%m-%d") - datetime.now()).total_seconds() / (365.25 * 24 * 3600)
        if T < 7/365:
            continue
        
        for option_type, df in [('call', chain.calls), ('put', chain.puts)]:
            for row in df.itertuples():
                if row.bid == 0 or row.ask == 0:
                    continue
                if row.strike / spot < 0.9 or row.strike / spot > 1.1:
                    continue
                
                market_price = (row.bid + row.ask) / 2
                iv = solve_iv(spot, row.strike, T, 0.04073, q_continuous, market_price, option_type) # Hardcoded to the 10yr yield
                if iv is None:
                    continue
                
                results.append({
                    'expiration': expirations[i],
                    'strike': row.strike,
                    'type': option_type,
                    'T': T,
                    'mid': market_price,
                    'iv': iv
                })
    return pd.DataFrame(results)


if __name__ == "__main__":
    print(market_iv("SLV").head(50))
