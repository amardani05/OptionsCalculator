import math
from scipy.stats import norm  # type: ignore

class BSM:
    def __init__(self, S, K, T, r, sigma, option_type, div = 0):
        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.div = div
        self.sigma = sigma
        self.option_type = option_type

    def price(self):
        if self.option_type == 'call':
            price = self.S * math.exp(-self.div * self.T) * norm.cdf(self.d1()) - self.K * math.exp(-self.r * self.T) * norm.cdf(self.d2())
        elif self.option_type == 'put':
            price =  self.K * math.exp(-self.r * self.T) * norm.cdf(-1 * self.d2()) - self.S * math.exp(-self.div * self.T) * norm.cdf(-1 * self.d1())
        else:
            raise ValueError(f"Invalid option type: {self.option_type}")
        return price  

    def d1(self):
        return (math.log(self.S/self.K) + (self.r - self.div + (self.sigma**2)/2) * self.T)/(self.sigma * math.sqrt(self.T))
    
    def d2(self):
        return self.d1() - self.sigma * math.sqrt(self.T)
    
    def delta(self):
        if self.option_type == 'call':
            delta = math.exp(-self.div * self.T) * norm.cdf(self.d1())
        elif self.option_type == 'put':
            delta = math.exp(-self.div * self.T) * norm.cdf(self.d1()) - 1
        else:
            raise ValueError(f"Invalid option type: {self.option_type}")
        return delta  
    
    def gamma(self):
        return math.exp(-self.div * self.T) * norm.pdf(self.d1())/(self.S * self.sigma * math.sqrt(self.T))
    
    def vega(self):
        return self.S * math.exp(-self.div * self.T) * math.sqrt(self.T) * norm.pdf(self.d1())
    
    def theta(self): 
        if self.option_type == 'call':
            theta = -1 * (self.S * math.exp(-self.div * self.T) * norm.pdf(self.d1()) * self.sigma)/(2 * math.sqrt(self.T)) - self.r * self.K * math.exp(-self.r * self.T) * norm.cdf(self.d2()) + self.div * self.S * math.exp(-self.div * self.T) * norm.cdf(self.d1())
        elif self.option_type == 'put':
            theta = -1 * (self.S * math.exp(-self.div * self.T) * norm.pdf(self.d1()) * self.sigma)/(2 * math.sqrt(self.T)) + self.r * self.K * math.exp(-self.r * self.T) * norm.cdf(-self.d2()) - self.div * self.S * math.exp(-self.div * self.T) * norm.cdf(-self.d1())
        else:
            raise ValueError(f"Invalid option type: {self.option_type}")
        return theta 
    
    def rho(self):
        if self.option_type == 'call':
            rho = self.K * self.T * math.exp(-1 * self.r * self.T) * norm.cdf(self.d2())
        elif self.option_type == 'put':
            rho = -1 * self.K * self.T * math.exp(-1 * self.r * self.T) * norm.cdf(-self.d2())
        else:
            raise ValueError(f"Invalid option type: {self.option_type}")
        return rho 
    
if __name__ == "__main__":
    model = BSM(S=100, K=100, T=1.0, r=0.05, sigma=0.20, option_type='put')
    print(f"Price: {model.price():.4f}")
    print(f"Delta: {model.delta():.4f}")
    print(f"Gamma: {model.gamma():.4f}")
    print(f"Vega: {model.vega():.4f}")
    print(f"Theta: {model.theta():.4f}")
    print(f"Rho: {model.rho():.4f}")
        



