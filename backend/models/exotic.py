import numpy as np
from scipy.stats import norm
from scipy.stats import multivariate_normal
from scipy.optimize import brentq

def asian_option(S, K, T, r, sigma, option_type, div = 0, n_sims = 100000, n_steps = 252):
    dt = T/n_steps

    Z = np.random.standard_normal((n_sims, n_steps))
    drift = (r - div - 0.5 * sigma**2)*dt
    diffusion = sigma * np.sqrt(dt) * Z

    log_returns = drift + diffusion
    log_paths = np.cumsum(log_returns, axis = 1)
    paths = S * np.exp(log_paths)

    avg_price = np.mean(paths, axis=1)
    
    if option_type == 'call':
        payoff = np.maximum(avg_price - K, 0)
    elif option_type == 'put':
        payoff = np.maximum(K - avg_price, 0)
    else:
        raise ValueError(f"Invalid option type: {option_type}")
    
    price = np.exp(-r * T) * np.mean(payoff)
    std_error = np.exp(-r * T) * np.std(payoff) / np.sqrt(n_sims)
    
    return {"price": float(price), "std_error": float(std_error)}

def compound_option(S, K1, K2, T1, T2, r, sigma, div=0):
    """
    Call on Call: right to buy (at T1 for price K1) a call option 
    that expires at T2 with strike K2.
    T1 = expiry of the compound option
    T2 = expiry of the underlying option (T2 > T1)
    K1 = strike of compound option
    K2 = strike of underlying option
    """

    tau = T2 - T1
    
    def underlying_call_value(S_star):
        from .bsm import BSM
        model = BSM(S_star, K2, tau, r, sigma, 'call', div)
        return model.price() - K1
    
    try:
        S_star = brentq(underlying_call_value, 0.01, S * 10)
    except ValueError:
        return {"price": 0.0, "error": "Could not find critical price"}
    
    sqrt_T1 = np.sqrt(T1)
    sqrt_T2 = np.sqrt(T2)
    
    a1 = (np.log(S / S_star) + (r - div + 0.5 * sigma**2) * T1) / (sigma * sqrt_T1)
    a2 = a1 - sigma * sqrt_T1
    
    b1 = (np.log(S / K2) + (r - div + 0.5 * sigma**2) * T2) / (sigma * sqrt_T2)
    b2 = b1 - sigma * sqrt_T2
    
    rho = np.sqrt(T1 / T2)
   
    def bvn_cdf(x, y, rho):
        mean = [0, 0]
        cov = [[1, rho], [rho, 1]]
        return multivariate_normal.cdf([x, y], mean=mean, cov=cov)
    
    price = (S * np.exp(-div * T2) * bvn_cdf(a1, b1, rho)
             - K2 * np.exp(-r * T2) * bvn_cdf(a2, b2, rho)
             - K1 * np.exp(-r * T1) * norm.cdf(a2))
    
    return {"price": float(price)}