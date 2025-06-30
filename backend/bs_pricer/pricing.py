import numpy as np
from scipy.stats import norm
import math
from .utils import validate_parameters

class BlackScholes:
    def __init__(self, S, K, T, r, sigma):
        validate_parameters(S, K, T, sigma, r)
        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma

    @staticmethod
    def price(S, K, T, r, sigma):
        S     = np.asarray(S,     dtype=float)
        sigma = np.asarray(sigma, dtype=float)

        d1 = (np.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)

        N1 = norm.cdf(d1)
        N2 = norm.cdf(d2)

        call = S * N1 - K * np.exp(-r*T) * N2
        put  = K * np.exp(-r*T) * norm.cdf(-d2) - S * norm.cdf(-d1)

        intrinsic_call = np.maximum(S - K, 0)
        intrinsic_put  = np.maximum(K - S, 0)

        mask = (T == 0) | (sigma == 0)

        call = np.where(mask, intrinsic_call, call)
        put  = np.where(mask, intrinsic_put,  put)

        return call, put

    @staticmethod
    def greeks(S, K, T, r, sigma):
        """
        implement later
        """
        pass
