import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Layout } from 'plotly.js';

const InputGroup: React.FC<{ label: string; value: number; setValue: React.Dispatch<React.SetStateAction<number>>; step?: number }> = ({ label, value, setValue, step = 1 }) => (
  <div className="flex items-center justify-between mb-3">
    <label className="text-gray-400 text-sm">{label}</label>
    <div className="flex items-center bg-gray-700 rounded-md">
      <button onClick={() => setValue(prev => parseFloat((prev - step).toFixed(10)))} className="px-3 py-1 text-white font-bold rounded-l-md hover:bg-gray-600">-</button>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.valueAsNumber || 0)}
        className="w-24 bg-gray-800 text-white text-center appearance-none focus:outline-none"
      />
      <button onClick={() => setValue(prev => parseFloat((prev + step).toFixed(10)))} className="px-3 py-1 text-white font-bold rounded-r-md hover:bg-gray-600">+</button>
    </div>
  </div>
);

const HeatmapSlider: React.FC<{ label: string; value: number; setValue: React.Dispatch<React.SetStateAction<number>>; min: number; max: number; step: number }> = ({ label, value, setValue, min, max, step }) => (
    <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400">
            <span>{label}</span>
            <span>{value.toFixed(2)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
        />
    </div>
);

const linspace = (start: number, stop: number, num: number) => {
    const arr = []
    const step = (stop-start)/(num-1)
    for (let i = 0; i < num; i++){
        arr.push(start + i*step)
    }
    return arr
}

function App() {
  // State for pricing
  const [underlyingPrice, setUnderlyingPrice] = useState(105.00);
  const [strikePrice, setStrikePrice] = useState(100.00);
  const [expiry, setExpiry] = useState(1.00);
  const [volatility, setVolatility] = useState(0.20);
  const [riskFreeRate, setRiskFreeRate] = useState(0.05);
  const [callPrice, setCallPrice] = useState(13.86);
  const [putPrice, setPutPrice] = useState(3.98);

  // State for heatmap
  const [minSpot, setMinSpot] = useState(84.05);
  const [maxSpot, setMaxSpot] = useState(126.00);
  const [minVol, setMinVol] = useState(0.10);
  const [maxVol, setMaxVol] = useState(0.30);
  const [callGrid, setCallGrid] = useState<number[][]>([]);
  const [putGrid, setPutGrid] = useState<number[][]>([]);
  const [spotAxis, setSpotAxis] = useState<number[]>([]);
  const [volAxis, setVolAxis] = useState<number[]>([]);
  const n_shocks = 10;

  //State for profit loss
  const [activeTab, setActiveTab] = useState("price")
  const [actualCallPrice, setActualCallPrice] = useState(13.86)
  const [actualPutPrice, setActualPutPrice] = useState(3.98)
  const [callNetGrid, setCallNetGrid] = useState<number[][]>([])
  const [putNetGrid, setPutNetGrid] = useState<number[][]>([])

  const handleCalculate = useCallback(async () => {
    try {
      const payload = {
        S: underlyingPrice,
        K: strikePrice,
        T: expiry,
        r: riskFreeRate,
        sigma: volatility,
      };
      const response = await axios.post('http://localhost:8000/price', payload);
      const data = response.data;
      setCallPrice(data.call);
      setPutPrice(data.put);
    } catch (error) {
      console.error('There was a problem with your axios operation:', error);
      setCallPrice(NaN); // Use NaN to indicate error
      setPutPrice(NaN);
    }
  }, [underlyingPrice, strikePrice, expiry, volatility, riskFreeRate]);

  const handleGenerateHeatmap = useCallback(async () => {
    try {
      const payload = {
        base_S: underlyingPrice,
        base_sigma: volatility,
        S_shock_min: minSpot,
        S_shock_max: maxSpot,
        sigma_shock_min: minVol,
        sigma_shock_max: maxVol,
        n_shocks: n_shocks,
        K: strikePrice,
        T: expiry,
        r: riskFreeRate,
      };
      const response = await axios.post(
        "http://localhost:8000/heatmap",
        payload
      );
      const data = response.data;
      setCallGrid(data.call);
      setPutGrid(data.put);
      setSpotAxis(linspace(minSpot, maxSpot, n_shocks));
      setVolAxis(linspace(minVol, maxVol, n_shocks));
    } catch (error) {
      console.error("There was a problem with your axios operation:", error);
    }
  }, [
    underlyingPrice,
    volatility,
    minSpot,
    maxSpot,
    minVol,
    maxVol,
    strikePrice,
    expiry,
    riskFreeRate,
  ]);

  const handleGeneratePLHeatmap = useCallback(async () => {
    try {
      const payload = {
        base_S: underlyingPrice,
        base_sigma: volatility,
        S_shock_min: minSpot,
        S_shock_max: maxSpot,
        sigma_shock_min: minVol,
        sigma_shock_max: maxVol,
        n_shocks: n_shocks,
        K: strikePrice,
        T: expiry,
        r: riskFreeRate,
        C_actual: actualCallPrice,
        P_actual: actualPutPrice,
      };
      const response = await axios.post(
        "http://localhost:8000/pl_heatmap",
        payload
      );
      const data = response.data;
      setCallNetGrid(data.call_net_grid);
      setPutNetGrid(data.put_net_grid);
    } catch (error) {
      console.error("There was a problem with your axios operation:", error);
    }
  }, [
    underlyingPrice,
    volatility,
    minSpot,
    maxSpot,
    minVol,
    maxVol,
    strikePrice,
    expiry,
    riskFreeRate,
    actualCallPrice,
    actualPutPrice,
  ]);


  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  useEffect(() =>{
    handleGenerateHeatmap();
    handleGeneratePLHeatmap();
  }, [handleGenerateHeatmap, handleGeneratePLHeatmap]);

  const plotLayout: Partial<Layout> = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: "#a0aec0" },
    xaxis: { title: { text: "Spot Price" }, gridcolor: "#4a5568" },
    yaxis: { title: { text: "Volatility" }, gridcolor: "#4a5568" },
    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
  };

  return (
    <>
      <style>{`
        /* Hide spinner buttons on number inputs */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="bg-gray-900 text-white min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-96 bg-gray-800 p-6 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4 text-white">Parameters</h2>

        <div className="p-4 bg-gray-900/50 rounded-lg mb-6">
            <InputGroup label="Current Asset Price" value={underlyingPrice} setValue={setUnderlyingPrice} step={0.01} />
            <InputGroup label="Strike Price" value={strikePrice} setValue={setStrikePrice} step={0.01} />
            <InputGroup label="Time to Maturity (Years)" value={expiry} setValue={setExpiry} step={0.01} />
            <InputGroup label="Volatility (σ)" value={volatility} setValue={setVolatility} step={0.01} />
            <InputGroup label="Risk-Free Interest Rate" value={riskFreeRate} setValue={setRiskFreeRate} step={0.01} />
        </div>

        <div className="border-t border-gray-700 my-6"></div>

        <h2 className="text-xl font-semibold mb-4 text-white">Heatmap Parameters</h2>
        <div className="bg-gray-900/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Heatmap Parameters</h2>
          <InputGroup label="Min Spot Price" value={minSpot} setValue={setMinSpot} step={0.01} />
          <InputGroup label="Max Spot Price" value={maxSpot} setValue={setMaxSpot} step={0.01} />
          <InputGroup label="Min Volatility" value={minVol} setValue={setMinVol} step={0.01} />
          <InputGroup label="Max Volatility" value={maxVol} setValue={setMaxVol} step={0.01} />
          <hr className="my-4 border-gray-700" />
          <h2 className="text-xl font-semibold mb-4">P/L Parameters</h2>
          <InputGroup label="Actual Call Price" value={actualCallPrice} setValue={setActualCallPrice} step={0.01} />
          <InputGroup label="Actual Put Price" value={actualPutPrice} setValue={setActualPutPrice} step={0.01} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-6">Black-Scholes Pricing Model</h1>

        <div className="grid grid-cols-5 gap-4 mb-12 items-center bg-gray-800 p-4 rounded-lg">
            <div className="col-span-2 grid grid-cols-2 gap-4">
                <div><span className="text-gray-400">Current Asset Price:</span> {underlyingPrice.toFixed(4)}</div>
                <div><span className="text-gray-400">Strike Price:</span> {strikePrice.toFixed(4)}</div>
                <div><span className="text-gray-400">Time to Maturity (Years):</span> {expiry.toFixed(4)}</div>
                <div><span className="text-gray-400">Volatility (σ):</span> {volatility.toFixed(4)}</div>
            </div>
             <div><span className="text-gray-400">Risk-Free Interest Rate:</span> {riskFreeRate.toFixed(4)}</div>
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
                <h3 className="text-green-300">CALL Value</h3>
                <p className="text-3xl font-bold mt-1">${isNaN(callPrice) ? 'Error' : callPrice.toFixed(2)}</p>
            </div>
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
                <h3 className="text-red-300">PUT Value</h3>
                <p className="text-3xl font-bold mt-1">${isNaN(putPrice) ? 'Error' : putPrice.toFixed(2)}</p>
            </div>
        </div>

        <h2 className="text-3xl font-bold">Options Price - Interactive Heatmap</h2>
        <p className="text-gray-400 mt-2 mb-6">
            Explore how option prices fluctuate with varying 'Spot Prices' and 'Volatility' levels while maintaining a constant 'Strike Price'.
        </p>

        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => setActiveTab('price')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'price' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}>
            Price Heatmaps
          </button>
          <button 
            onClick={() => setActiveTab('pl')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'pl' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}>
            P/L Heatmaps
          </button>
        </div>

        {activeTab === 'price' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Call Price Heatmap</h3>
              <Plot
                data={[
                  {
                    z: callGrid,
                    x: spotAxis,
                    y: volAxis,
                    type: "heatmap",
                    colorscale: "Viridis",
                    showscale: true,
                    text: callGrid.map((row) =>
                      row.map((val) => val.toFixed(2))
                    ) as any,
                    texttemplate: "%{text}",
                    textfont: { size: 12, color: "white" },
                  },
                ]}
                layout={plotLayout}
                className="w-full h-96"
              />
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Put Price Heatmap</h3>
              <Plot
                data={[
                  {
                    z: putGrid,
                    x: spotAxis,
                    y: volAxis,
                    type: "heatmap",
                    colorscale: "Cividis",
                    showscale: true,
                    text: putGrid.map((row) =>
                      row.map((val) => val.toFixed(2))
                    ) as any,
                    texttemplate: "%{text}",
                    textfont: { size: 12, color: "white" },
                  },
                ]}
                layout={plotLayout}
                className="w-full h-96"
              />
            </div>
          </div>
        )}

        {activeTab === 'pl' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Call P/L Heatmap</h3>
              <Plot
                data={[
                  {
                    z: callNetGrid,
                    x: spotAxis,
                    y: volAxis,
                    type: "heatmap",
                    colorscale: "RdBu",
                    showscale: true,
                    text: callNetGrid.map((row) =>
                      row.map((val) => val.toFixed(2))
                    ) as any,
                    texttemplate: "%{text}",
                    textfont: { size: 12, color: "white" },
                  },
                ]}
                layout={plotLayout}
                className="w-full h-96"
              />
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Put P/L Heatmap</h3>
              <Plot
                data={[
                  {
                    z: putNetGrid,
                    x: spotAxis,
                    y: volAxis,
                    type: "heatmap",
                    colorscale: "RdBu",
                    showscale: true,
                    text: putNetGrid.map((row) =>
                      row.map((val) => val.toFixed(2))
                    ) as any,
                    texttemplate: "%{text}",
                    textfont: { size: 12, color: "white" },
                  },
                ]}
                layout={plotLayout}
                className="w-full h-96"
              />
            </div>
          </div>
        )}
      </main>
    </div>
    </>
  );
}

export default App;
