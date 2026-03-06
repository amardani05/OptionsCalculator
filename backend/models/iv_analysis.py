from .market_data import market_iv
import yfinance as yf # type: ignore 
import numpy as np # type: ignore
import math

def historical_iv(ticker):
    tick = yf.Ticker(ticker)
    spot = tick.history(period="1y")['Close']

    log_returns = np.log(spot/spot.shift(1))

    hv_20 = log_returns.rolling(window=20).std() * math.sqrt(252)
    hv_60 = log_returns.rolling(window=60).std() * math.sqrt(252)
    hv_52wk_high = hv_20.max()
    hv_52wk_low = hv_20.min()

    current_iv = market_iv(ticker)
    expirations = tick.options

    current_spot = spot.iloc[-1]

    near_term = current_iv[current_iv['T'] >= 30/365]
    if near_term.empty:
        near_term = current_iv  # fallback
    first_exp = near_term['expiration'].iloc[0]
    exp_data = near_term[near_term['expiration'] == first_exp]

    # print(f"Spot: {current_spot}")
    # print(f"Expiration: {first_exp}")
    # print(exp_data[['strike', 'type', 'iv']].to_string())
    
    call_data = exp_data[exp_data['type'] == 'call']
    put_data = exp_data[exp_data['type'] == 'put']

    atm_call_strike = call_data.loc[(call_data['strike'] - current_spot).abs().idxmin(), 'strike']
    atm_put_strike = put_data.loc[(put_data['strike'] - current_spot).abs().idxmin(), 'strike']

    atm_iv_call = call_data[call_data['strike'] == atm_call_strike]['iv'].iloc[0]
    atm_iv_put = put_data[put_data['strike'] == atm_put_strike]['iv'].iloc[0]

    atm_calls = exp_data[(exp_data['strike'] == atm_call_strike) & (exp_data['type'] == 'call')]
    atm_puts = exp_data[(exp_data['strike'] == atm_put_strike) & (exp_data['type'] == 'put')]

    # print(f"ATM strike: {atm_strike}")

    if atm_calls.empty or atm_puts.empty:
        return None

    atm_iv_call = call_data[call_data['strike'] == atm_call_strike]['iv'].iloc[0]
    atm_iv_put = put_data[put_data['strike'] == atm_put_strike]['iv'].iloc[0]

    call_iv_rank = (atm_iv_call - hv_52wk_low) / (hv_52wk_high - hv_52wk_low)
    put_iv_rank = (atm_iv_put - hv_52wk_low) / (hv_52wk_high - hv_52wk_low)

    return {
        'hv_20': hv_20,
        'hv_60': hv_60,
        'atm_iv_call': atm_iv_call,
        'atm_iv_put': atm_iv_put,
        'call_iv_rank': call_iv_rank,
        'put_iv_rank': put_iv_rank,
        'iv_hv_spread': atm_iv_call - hv_20.iloc[-1]
    }

if __name__ == "__main__":
    print(historical_iv("SLV")['call_iv_rank'], historical_iv("SLV")['put_iv_rank'], historical_iv("SLV")['iv_hv_spread'])






