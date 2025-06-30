import numpy as np

def validate_parameters(S, K, T, sigma, r) -> None:
    if np.any(np.asarray(S) <= 0):
        raise ValueError("All spot prices must be positive.")
    if K <= 0:
        raise ValueError("Strike price K must be a positive number.")
    if T < 0:
        raise ValueError("Time to expiry T must be non-negative.")
    if np.any(np.asarray(sigma) < 0):
        raise ValueError("Volatility sigma must be non-negative.")
    if not isinstance(r, (float, int)):
        raise ValueError("Interest rate r must be a number.")
