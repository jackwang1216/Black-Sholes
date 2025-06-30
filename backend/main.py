from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bs_pricer.pricing import BlackScholes

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

class OptionParams(BaseModel):
    S: float
    K: float
    T: float
    r: float
    sigma: float

@app.post("/price")
def price_option(params: OptionParams):
    pricer = BlackScholes(params.S, params.K, params.T, params.r, params.sigma)
    call, put = pricer.price()
    return {"call": call, "put": put}
