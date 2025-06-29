def validate_parameters(S: float, K: float, T: float, sigma: float) -> None:
    if not isinstance(S, (int, float)) or S <= 0:
        raise ValueError(f"Spot price S must be positive number; got {S}")
    if not isinstance(K, (int, float)) or K <= 0:
        raise ValueError(f"Strike price K must be positive number; got {K}")
    if not isinstance(T, (int, float)) or T < 0:
        raise ValueError(f"Time to expiry T must be non-negative; got {T}")
    if not isinstance(sigma, (int, float)) or sigma < 0:
        raise ValueError(f"Volatility σ must be non-negative; got {sigma}")
