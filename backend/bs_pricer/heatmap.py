import numpy as np
from .pricing import BlackScholes

def generate_heatmap_grid(
    base_S: float,
    K: float,
    T: float,
    r: float,
    base_sigma: float,
    S_shock: np.ndarray,
    sigma_shock: np.ndarray
):
    S_grid, sigma_grid = np.meshgrid(S_shock, sigma_shock, indexing="xy")
    call_grid, put_grid = BlackScholes.price(
        S_grid,
        K,
        T,
        r,
        sigma_grid
    )
    return call_grid, put_grid
