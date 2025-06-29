import numpy as np
from scipy.stats import norm
import math
from .utils import validate_parameters

class BlackScholes:
    def __init__(self, S, K, T, r, sigma):
        validate_parameters(S, K, T, sigma)
        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma

    def price(self):
        if self.T == 0 or self.sigma == 0:
            return max(self.S-self.K, 0), max(self.K-self.S, 0)

        d1 = (np.log(self.S/self.K)+(self.r+(self.sigma**2)/2)*self.T)/(self.sigma*np.sqrt(self.T))
        d2 = d1-self.sigma*np.sqrt(self.T)

        N_d1 = norm.cdf(d1)
        N_d2 = norm.cdf(d2)

        call = self.S*N_d1-self.K*math.exp(-self.r*self.T)*N_d2

        N_d1_inv = norm.cdf(-d1)
        N_d2_inv = norm.cdf(-d2)

        put = self.K*math.exp(-self.r*self.T)*N_d2_inv-self.S*N_d1_inv

        return call, put

    def greeks(self):
        """
        implement later
        """
        pass
