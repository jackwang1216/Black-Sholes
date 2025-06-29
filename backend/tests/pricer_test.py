import pytest
from bs_pricer.pricing import BlackScholes

def test_class_pricer_atm_zero_time():
    bs = BlackScholes(S=100, K=100, T=0.0, r=0.05, sigma=0.2)
    call, put = bs.price()
    assert call == pytest.approx(0.0, abs=1e-9)
    assert put  == pytest.approx(0.0, abs=1e-9)

def test_class_pricer_negative_rates():
    bs = BlackScholes(S=100, K=100, T=1.0, r=-0.01, sigma=0.2)
    call, put = bs.price()
    # for negative r, put should be > call
    assert put > call
