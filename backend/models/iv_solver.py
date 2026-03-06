from .bsm import BSM

def solve_iv(S, K, T, r, div, market_price, option_type):
    sig = 0.3
    for i in range (1000):
        if (sig < 0):
            return None
        bsm = BSM(S, K, T, r, sig, option_type, div)
        if (abs(bsm.price() - market_price) < 0.0001 * max(market_price, 0.01)):
            return sig
        else:
            if (bsm.vega() < 0.00001):
                return None
            sig = sig - (bsm.price() - market_price)/bsm.vega()
    return None

if __name__ == "__main__":
    print(solve_iv(100, 130, 1.0, 0.05, 10.57, "call"))

