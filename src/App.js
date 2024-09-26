import { useEffect, useState } from "react";
import Chart from "./Chart";
import { getCandles } from "./DataService";
import useWebSocket from "react-use-websocket";
import Candle from "./Candle";

function App() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1m');
  const [data, setData] = useState([]);

  useEffect(() => {
    getCandles(symbol, interval)
      .then(data => setData(data))
      .catch(err => err.response ? err.response.data : err.message)
  }, [symbol, interval]);

  const { lastJsonMessage } = useWebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`, {
    onOpen: () => console.log('Connected to Binance'),
    onError: (err) => console.log(err),
    shouldReconnect: () => true,
    onMessage: () => {
      if (lastJsonMessage) {
        const newCandle = new Candle(lastJsonMessage.k.t, lastJsonMessage.k.o, lastJsonMessage.k.h, lastJsonMessage.k.l, lastJsonMessage.k.c);
        const newData = [...data];
        if (lastJsonMessage.k.x === false) {
          newData[newData.length - 1] = newCandle;
        } else {
          newData.splice(0, 1);
          newData.push(newCandle);
        }
        setData(newData);
      }
    }
  })

  function onSymbolChange(event) {
    setSymbol(event.target.value);
  }

  function onIntervalChange(event) {
    setInterval(event.target.value);
  }

  return (
    <div>
      <select onChange={onSymbolChange}>
        <option>BTCUSDT</option>
        <option>ETHUSDT</option>
        <option>ADAUSDT</option>
      </select>
      <select onChange={onIntervalChange}>
        <option>1m</option>
        <option>1d</option>
        <option>1w</option>
      </select>
      <Chart data={data}/>
    </div>
  );
}

export default App;
