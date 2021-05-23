import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [statItems, setStatItem] = useState([])
  const [statsIsReady, setStatsIsReady] = useState(false)
  const stat = useRef({})
  const ws = useRef(null)

  function start() {
    if (!ws.current) {
      ws.current = new WebSocket('wss://trade.trademux.net:8800/?password=1234')

      ws.current.onmessage = (quote) => {
        if (!statsIsReady) {
          setStatsIsReady(true)
        }
        stat.current.count++

        stat.current.sum += JSON.parse(quote.data).value

        if (!stat.current.valuesCount[JSON.parse(quote.data).value]) {
          stat.current.valuesCount[JSON.parse(quote.data).value] = 0
        }
        stat.current.valuesCount[JSON.parse(quote.data).value]++

        if (stat.current.mode === null) {
          stat.current.mode = JSON.parse(quote.data).value
        }
        if (
          stat.current.valuesCount[JSON.parse(quote.data).value] >
          stat.current.valuesCount[stat.current.mode]
        ) {
          stat.current.mode = JSON.parse(quote.data).value
        }
      }
    }

    stat.current = {
      count: 0,
      sum: 0,
      valuesCount: {},
      mode: null,
      startTime: new Date().toLocaleString(),
    }
  }

  function statistic() {
    const values = Object.keys(stat.current.valuesCount)

    const average = stat.current.sum / stat.current.count

    const meanDeviation = Math.sqrt(
      values.reduce(
        (acc, value) =>
          acc + Math.pow(value - average, 2) * stat.current.valuesCount[value],
        0
      ) /
      (stat.current.count - 1)
    )

    const median =
      values.length % 2
        ? values[(values.length - 1) / 2]
        : (+values[values.length / 2] + +values[values.length / 2 + 1]) / 2

    setStatItem((statItems) =>
      [
        {
          id: Math.random(),
          average,
          meanDeviation,
          median,
          mode: stat.current.mode,
          startTime: stat.current.startTime,
          endTime: new Date().toLocaleString(),
        },
      ].concat(statItems)
    )
  }

  return (
    <div className="App">
      <div className='content'>
        <div className='controls'>
          <button onClick={start}>Старт</button>
          <button disabled={!statsIsReady} onClick={statistic}>Статистика</button>
        </div>
        {statsIsReady ?
          <div className='stats'>
            {statItems.length ?
              statItems.map((stat) => (
                <div className="stat" key={stat.id}>
                  <div className='stat__data'>
                    <div className='stat__item stat-item'>
                      <div className='stat-item__name'>Среднее</div>
                      <div className='stat-item__value'>{stat.average.toFixed(3)}</div>
                    </div>
                    <div className='stat__item stat-item'>
                      <div className='stat-item__name'>Cтандартное отклонение</div>
                      <div className='stat-item__value'>{stat.meanDeviation.toFixed(3)}</div>
                    </div>
                    <div className='stat__item stat-item'>
                      <div className='stat-item__name'>Мода</div>
                      <div className='stat-item__value'>{stat.mode}</div>
                    </div>
                    <div className='stat__item stat-item'>
                      <div className='stat-item__name'>Медиана</div>
                      <div className='stat-item__value'>{stat.median}</div>
                    </div>
                  </div>
                  <div className='stat__time'>{stat.startTime} — {stat.endTime}</div>
                </div>
              )) :
              <p>Список статистик пока пуст</p>}
          </div> :
          <p>Начните загрузку данных</p>
        }
      </div>
    </div>
  )
}

export default App
