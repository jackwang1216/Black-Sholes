import React, { useState, useCallback } from 'react';

interface InputSliderProps {
  label: string;
  description: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

const InputSlider: React.FC<InputSliderProps> = ({ label, description, value, setValue, min, max, step }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="flex items-center mt-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-24 bg-gray-700 text-white border border-gray-600 rounded-md p-2 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ml-4"
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

interface PriceCardProps {
  title: string;
  price: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, price }) => (
  <div className="bg-gray-800 rounded-xl p-6 text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
    <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
    <p className="text-4xl font-bold text-white mt-2">{price}</p>
    <p className="text-sm text-cyan-400 mt-1">Black-Scholes</p>
  </div>
);

function App() {
  const [underlyingPrice, setUnderlyingPrice] = useState(100);
  const [strikePrice, setStrikePrice] = useState(100);
  const [expiry, setExpiry] = useState(0.5);
  const [volatility, setVolatility] = useState(0.2);
  const [riskFreeRate, setRiskFreeRate] = useState(0.05);
  const [callPrice, setCallPrice] = useState('$0.00');
  const [putPrice, setPutPrice] = useState('$0.00');

  const handleCalculate = useCallback(async () => {
    // NOTE: This is a placeholder. Replace with actual API call.
    // Mocking the API call for now.
    const call = 5.25;
    const put = 3.85;
    setCallPrice(`$${call.toFixed(2)}`);
    setPutPrice(`$${put.toFixed(2)}`);
  }, [underlyingPrice, strikePrice, expiry, volatility, riskFreeRate]);

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-5xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">Black-Scholes Pricer</h1>
          <p className="text-lg text-gray-400 mt-2">Instant call & put quotes</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
            <InputSlider 
              label="Underlying Price (S)" 
              description="Current price of the underlying asset" 
              value={underlyingPrice} 
              setValue={setUnderlyingPrice} 
              min={0} 
              max={200} 
              step={1} 
            />
            <InputSlider 
              label="Strike Price (K)" 
              description="Agreed exercise price at expiry" 
              value={strikePrice} 
              setValue={setStrikePrice} 
              min={0} 
              max={200} 
              step={1} 
            />
            <InputSlider 
              label="Time to Expiry (years)" 
              description="Years until option expiration" 
              value={expiry} 
              setValue={setExpiry} 
              min={0} 
              max={2} 
              step={0.01} 
            />
            <InputSlider 
              label="Volatility (σ)" 
              description="Annualized standard deviation of returns" 
              value={volatility} 
              setValue={setVolatility} 
              min={0.01} 
              max={1.0} 
              step={0.01} 
            />
            <InputSlider 
              label="Risk-free Rate (r)" 
              description="Interest rate of a risk-free asset" 
              value={riskFreeRate} 
              setValue={setRiskFreeRate} 
              min={0} 
              max={0.1} 
              step={0.001} 
            />
            <button 
              onClick={handleCalculate} 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Calculate
            </button>
          </div>

          <div className="space-y-8">
            <PriceCard title="Call" price={callPrice} />
            <PriceCard title="Put" price={putPrice} />
          </div>
        </div>

        <footer className="text-center mt-10 text-xs text-gray-500">
          <p>Arsiliath v2.1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
