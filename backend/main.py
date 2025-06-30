from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bs_pricer.pricing import BlackScholes, profit_loss
import numpy as np
from bs_pricer.heatmap import generate_heatmap_grid

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PriceRequest(BaseModel):
    S: float
    K: float
    T: float
    r: float
    sigma: float


@app.post("/price")
async def price_option(params: PriceRequest):
    call, put = BlackScholes.price(params.S, params.K, params.T, params.r, params.sigma)
    call_val = call.item() if hasattr(call, "item") else call
    put_val  = put.item()  if hasattr(put,  "item") else put
    return {"call": call_val, "put": put_val}

class HeatmapRequest(BaseModel):
    base_S: float
    base_sigma: float
    S_shock_min: float
    S_shock_max: float
    sigma_shock_min: float
    sigma_shock_max: float
    n_shocks: int
    K: float
    T: float
    r: float

@app.post("/heatmap")
async def generate_heatmap(params: HeatmapRequest):
    S_shock = np.linspace(params.S_shock_min, params.S_shock_max, params.n_shocks)
    sigma_shock = np.linspace(params.sigma_shock_min, params.sigma_shock_max, params.n_shocks)

    call_grid, put_grid = generate_heatmap_grid(base_S=params.base_S, K=params.K, T=params.T, r=params.r, base_sigma=params.base_sigma, S_shock=S_shock, sigma_shock=sigma_shock)

    return {
        "call": call_grid.tolist(),
        "put": put_grid.tolist()
    }

class PLHeatmapRequest(HeatmapRequest):
    C_actual: float
    P_actual: float

@app.post("/pl_heatmap")
async def get_pl_heatmap(params: PLHeatmapRequest):
    S_shocks = np.linspace(params.S_shock_min, params.S_shock_max, params.n_shocks)
    sigma_shocks = np.linspace(params.sigma_shock_min, params.sigma_shock_max, params.n_shocks)
    S_grid, sigma_grid = np.meshgrid(S_shocks, sigma_shocks, indexing="xy")

    pl_data = profit_loss(S=S_grid, K=params.K, T=params.T, r=params.r, sigma=sigma_grid, C_actual=params.C_actual, P_actual=params.P_actual)
    return {
        "call_net_grid": pl_data["call_net"].tolist(),
        "put_net_grid": pl_data["put_net"].tolist()
    }
