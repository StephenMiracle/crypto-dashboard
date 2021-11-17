import {useEffect, useMemo, useState} from "react"
import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import Seo from "../components/seo"
import Layout from "../components/layout"
import { useQuery, gql } from "@apollo/client"
import { Bar, Line } from "react-chartjs-2"
import { format } from "date-fns"

export default function page () {
  const [display, setDisplay] = useState<'price'|'volume'|'market'>('price')
  const [timeFrame, setTimeFrame] = useState<'recent'|'small'|'medium'>('recent')
  const [viewType, setViewType] = useState<'stats'|'graph'>('stats')
  const {data, loading, error} = useQuery(gql`
    query {
      twentyFourHourAverage {
        amount
      }
      hourlyHigh
      hourlyLow
      weeklyHigh
      weeklyLow
      volumeData {
        current
        day
        week
      }
      marketCapData {
        current
        day
        week
      }
      current(limit: 6) {
        amount
        eth_dominance
        btc_dominance
        market_cap
        volume
        date
      }
      dailyAverages(limit: 40) {
        amount
        date
        high
        low
      }
      hourlyAverages(limit: 48)  {
        amount
        date
        volume
      }
      weeklyAverages(limit: 40)  {
        amount
        date
        high
        low
      }
    }
  `)

  const dailyAverages: any[] = data ? data.dailyAverages : []
  const weeklyAverages: any[] = data ? data.weeklyAverages : []
  const hourlyAverages: any[] = data ? data.hourlyAverages : []
  const twentyFourHourAverage: any = data ? data.twentyFourHourAverage : {}
  const current: any[] = data ? data.current : []


  const buySignals: any[] = []
  const sellSignals: any[] = []

  // need to get the total amount of buy signals and list what they are
  // current price is lower than the average of the last 24 hours
  // current price is lower than the average of the last 7 days
  // current price is higher than the 7 day low.
  // volume is lower than the average of the last 7 days
  if (current.length > 0) {
    if (current[current.length - 1].amount < data.twentyFourHourAverage.amount) {
      buySignals.push("current price is lower than the average of the last 24 hours")
    }

    if (current[current.length - 1].amount < data.weeklyAverages[data.weeklyAverages.length - 1].amount) {
      buySignals.push("current price is lower than the average of the last 7 days")
    }

    if (current[current.length - 1].amount > data.weeklyLow && current[current.length - 1].amount < data.twentyFourHourAverage.amount) {
      buySignals.push("current price is greater than the 7 day low")
    }

    if (data.volumeData.current < data.volumeData.week) {
      buySignals.push("volume is lower than the average of the last 7 days")
    }

    // Sell signals
    if (current[current.length - 1].amount > data.weeklyAverages[data.weeklyAverages.length - 1].amount) {
      sellSignals.push("current price is greater than the 7 day average")
    }

    if (current[current.length - 1].amount > data.twentyFourHourAverage.amount) {
      sellSignals.push("current price is greater than the daily average")
    }

    if (current[current.length - 1].amount < data.weeklyHigh && current[current.length - 1].amount > data.twentyFourHourAverage.amount) {
      sellSignals.push("current price is less than the 7 day high")
    }

    if (current[current.length - 1].amount < data.hourlyHigh && current[current.length - 1].amount > data.twentyFourHourAverage.amount) {
      sellSignals.push("current price is less than the daily high")
    }
  }
  




const visualData = {
  labels: dailyAverages.map(d => {
    return format(new Date(d.date), "MM/dd/yyyy")
  }),
  datasets: [
    {
      label: 'Weekly Averages',
      data: weeklyAverages.map(d => d.amount),
      fill: true,
      backgroundColor: 'rgba(50, 200, 500, .3)',
      borderColor: '#080',
    },
    {
      label: 'Daily Averages',
      data: dailyAverages.map(d => d.amount),
      fill: true,
      backgroundColor: 'rgba(200, 500, 500, .3)',
      borderColor: '#800',
    },
    {
      label: 'Weekly Highs',
      data: weeklyAverages.map(d => d.high),
      fill: false,
      borderColor: 'rgba(25, 25, 25, .4)'
    },
    {
      label: 'Weekly Lows',
      data: weeklyAverages.map(d => d.low),
      fill: false,
      borderColor: 'rgba(105, 105, 105, .4)'
    }
  ]
}

const hourlyVolumeData = {
  labels: hourlyAverages.map(d => {
    return format(new Date(d.date), "h:m:s aaa")
  }),
  datasets: [
    {
      label: 'Hourly Volume',
      data: hourlyAverages.map(d => d.volume),
      fill: true,
      backgroundColor: 'rgba(50, 200, 500, .3)',
      borderColor: '#080',
    },
    {
      label: 'Weekly average',
      data: current.map((a, i) => {
        return data.volumeData.week
      }),
      fill: false,
      backgroundColor: 'rgba(200, 50, 50, .3)',
      borderColor: 'rgba(200, 50, 50, 1)',
    },
    {
      label: '24 hour average',
      data: current.map(a => data.volumeData.day),
      fill: false,
      borderColor: 'rgba(50, 50, 200, 1)'
    }
  ]
}


const hourlyMarketCapData = {
  labels: hourlyAverages.map(d => {
    return format(new Date(d.date), "h:m:s aaa")
  }),
  datasets: [
    {
      label: 'Hourly Market Cap',
      data: hourlyAverages.map(d => d.market_cap),
      fill: true,
      backgroundColor: 'rgba(50, 200, 500, .3)',
      borderColor: '#080',
    },
    {
      label: 'Weekly average',
      data: current.map((a, i) => {
        return data.marketCapData.week
      }),
      fill: false,
      backgroundColor: 'rgba(200, 50, 50, .3)',
      borderColor: 'rgba(200, 50, 50, 1)',
    },
    {
      label: '24 hour average',
      data: current.map(a => data.marketCapData.day),
      fill: false,
      borderColor: 'rgba(50, 50, 200, 1)'
    }
  ]
}



  const options = {
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const todayData = {
    labels: hourlyAverages.map(d => {
      return format(new Date(d.date), "h:m:s aaa")
    }),
    datasets: [
      {
        label: 'Hourly Averages',
        data: hourlyAverages.map(d => d.amount),
        fill: true,
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: '#080',
      },
      {
        label: 'Weekly average',
        data: hourlyAverages.map((a, i) => {
          return weeklyAverages[weeklyAverages.length - 1].amount
        }),
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: 'rgba(200, 50, 50, .3)',
      },
      {
        label: 'Weekly high',
        data: hourlyAverages.map((a, i) => {  return weeklyAverages[weeklyAverages.length - 1].high }),
        borderColor: 'rgba(25, 25, 25, .4)'
      },
      {
        label: 'Weekly low',
        data: hourlyAverages.map((a, i) => {  return weeklyAverages[weeklyAverages.length - 1].low }),
        borderColor: 'rgba(105, 105, 105, .4)'
      },
      {
        label: '24 hour average',
        data: hourlyAverages.map(a => twentyFourHourAverage.amount),
        borderColor: 'rgba(50, 50, 200, .3)'
      }
    ]
  }

  const currentData = {
    labels: current.map(d => {  return format(new Date(d.date), "h:m:s aaa") }),
    datasets: [
      {
        label: 'Current',
        data: current.map(d => d.amount),
        fill: true,
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: '#080',
      },
      {
        label: 'Weekly average',
        data: current.map((a, i) => {
          return weeklyAverages[weeklyAverages.length - 1].amount
        }),
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: 'rgba(200, 50, 50, .3)',
      },
      {
        label: '24 hour average',
        data: current.map(a => twentyFourHourAverage.amount),
        borderColor: 'rgba(50, 50, 200, .3)'
      },
      {
        label: 'Weekly high',
        data: current.map((a, i) => {  return weeklyAverages[weeklyAverages.length - 1].high }),
        borderColor: 'rgba(25, 25, 25, .4)'
      },
      {
        label: 'Weekly low',
        data: current.map((a, i) => {  return weeklyAverages[weeklyAverages.length - 1].low }),
        borderColor: 'rgba(105, 105, 105, .4)'
      },
    ],
  }

  const curVolume = {
    labels: current.map(d => { return format(new Date(d.date), "h:m:s aaa") }),
    datasets: [
      {
        label: 'Current',
        data: current.map(d => d.volume),
        fill: true,
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: '#080',
      },
      {
        label: 'Weekly average',
        data: current.map((a, i) => {
          return data.volumeData.week
        }),
        fill: false,
        backgroundColor: 'rgba(200, 50, 50, .3)',
        borderColor: 'rgba(200, 50, 50, .3)',
      },
      {
        label: '24 hour average',
        data: current.map(a => data.volumeData.day),
        fill: false,
        borderColor: 'rgba(50, 50, 200, 1)'
      }
    ]
  }

  const marketCapVolume = {
    labels: current.map(d => { return format(new Date(d.date), "h:m:s aaa") }),
    datasets: [
      {
        label: 'Current',
        data: current.map(d => d.market_cap),
        fill: true,
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: '#080',
      },
      {
        label: 'Weekly average',
        data: current.map((a, i) => {
          return data.marketCapData.week
        }),
        fill: false,
        backgroundColor: 'rgba(200, 50, 50, .3)',
        borderColor: 'rgba(200, 50, 50, .3)',
      },
    ]
  }

  const todayOptions = {
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  if (loading) return <p>Loading...</p>

  // get the percentage change between the most current amount and the average of the last 24 hours
  const percentChange = (current[ current.length -1].amount - twentyFourHourAverage.amount) / twentyFourHourAverage.amount * 100
  const percentChangeString = percentChange.toFixed(2) + "%"

  // get the percentage change between the most current amount and the average of the last 7 days
  const percentChangeWeek = (current[ current.length -1].amount - weeklyAverages[weeklyAverages.length - 1].amount) / weeklyAverages[weeklyAverages.length - 1].amount * 100



  return (
    <Layout>
      <Seo title="Home" />
      <ul className="ml-0 border-b border-color-gray-800">
        <li 
          onClick={() => {setViewType('stats')}}
          className="text-lg cursor-pointer mx-2 font-bold text-sm inline-block">Stats</li>
        <li 
          onClick={() => {setViewType('graph')}}
          className="text-lg cursor-pointer mx-2 font-bold text-sm inline-block">Graph</li>
      </ul>
      {viewType === 'stats' && (
        <div>
        <h4 className="text-md">Price Info</h4>
        <div className="flex mb-4">
          <ul className="ml-0 w-1/3">
            <li><span className="font-bold">Recent:</span> ${current[current.length - 1].amount.toFixed(2)}</li>
            <li><span className="font-bold">1 day avg:</span> ${twentyFourHourAverage.amount.toFixed(2)}</li>
            <li><span className="font-bold">7 day avg:</span> ${weeklyAverages[weeklyAverages.length - 1].amount.toFixed(2)}</li>
          </ul>
          <ul className="ml-0 w-1/3">
            <li><span className="font-bold">1 day high:</span> ${ data.hourlyHigh.toFixed(2) }</li>
            <li><span className="font-bold">1 day low:</span> ${ data.hourlyLow.toFixed(2) }</li>
            <li><span className="font-bold">7 day high:</span> ${ data.weeklyHigh.toFixed(2) }</li>
            <li><span className="font-bold">7 day low:</span> ${ data.weeklyLow.toFixed(2) }</li>
          </ul>
          <ul className="ml-0 w-1/3">
            <li><span className="font-bold">1 day % change:</span> {percentChangeString}</li>
            <li><span className="font-bold">7 day % change:</span> {percentChangeWeek.toFixed(3)}%</li>
          </ul>
        </div>
      <div className="flex mb-4">
        <div className="md:w-1/2">
          <h4>Volume Data</h4>
          <ul className="ml-0">
            <li><span className="font-bold">Recent:</span> ${ (data?.volumeData?.current / 1000000000).toFixed(2) }B</li>
            <li><span className="font-bold">1 day:</span> ${ (data?.volumeData?.day / 1000000000).toFixed(2) }B</li>
            <li><span className="font-bold">7 day:</span> ${ (data?.volumeData?.week / 1000000000).toFixed(2) }B</li>
          </ul>
        </div>
        <div className="md:w-1/2">
          <h4>Market Cap Data</h4>
          <ul className="ml-0">
            <li><span className="font-bold">Recent:</span> ${ (data?.marketCapData?.current / 1000000000).toFixed(2) }B</li>
            <li><span className="font-bold">24 Hour:</span> ${ (data?.marketCapData?.day / 1000000000).toFixed(2) }B</li>
            <li><span className="font-bold">7 Day:</span> ${ (data?.marketCapData?.week / 1000000000).toFixed(2) }B</li>
          </ul>
        </div>
      </div>
      <div className="md:flex mb-4">
        <div className="md:w-1/2">
          <h4>Buy Signals</h4>
          <ul className="ml-0">
            {
              buySignals?.map(signal => {
                return <li>{signal}</li>
              })
            }
          </ul>
        </div>
        <div className="md:w-1/2">
          <h4>Sell Signals</h4>
          <ul>
            {
              sellSignals?.map(signal => {
                return <li>{signal}</li>
              })
            }
          </ul>
        </div>
      </div>
      </div>
      )}

      {viewType === 'graph' && (
        <div>
          <ul className="ml-0 border-b border-color-gray-800">
            <li 
              onClick={() => {setTimeFrame('recent')}}
              className="text-md cursor-pointer mx-2 font-bold text-sm inline-block">6 Hours</li>
            <li 
              onClick={() => {setTimeFrame('small')}}
              className="text-md cursor-pointer mx-2 font-bold text-sm inline-block">48 Hours</li>
            <li 
              onClick={() => {setTimeFrame('medium')}}
              className="text-md cursor-pointer mx-2 font-bold text-sm inline-block">40 Days</li>
          </ul>
      <div className="mb-6">
        {
          timeFrame === 'recent' && current && (
            <>
            <ul className='ml-0 border-t border-b border-color-gray-500'>
              <li 
                onClick={() => {setDisplay('price')}} 
                className="text-sm inline-block cursor-pointer font-bold mx-2">Price</li>
              <li 
                onClick={() => {setDisplay('volume')}} 
                className="text-sm inline-block cursor-pointer font-bold mx-2">Volume</li>
              <li 
                onClick={() => {setDisplay('market')}} 
                className="text-sm inline-block cursor-pointer font-bold mx-2">Market Cap</li>
            </ul>
            {
              display === 'price' && (
                <>
                < Line data={currentData} options={todayOptions} />
                </>
              )
            }
            {
              display === 'volume' && (
                <>
                <Line data={curVolume} options={options} />
                </>
              )
            }
            {
              display === 'market' && (
                <>
                <Line data={marketCapVolume} options={options} />
                </>
              )
            }
            </>
          )
        }
      </div>
      {
        timeFrame === 'small' && hourlyAverages && (
          <>
            <ul className='ml-0 border-t border-b border-color-gray-500'>
              <li 
                onClick={() => {setDisplay('price')}} 
                className="text-sm inline-block cursor-pointer font-bold mx-2">Price</li>
              <li 
                onClick={() => {setDisplay('volume')}} 
                className="text-sm inline-block cursor-pointer font-bold mx-2">Volume</li>
              <li 
                onClick={() => {setDisplay('market')}} 
                className="text-sm inline-block cursor-pointer font-bold mx-2">Market Cap</li>
            </ul>
            {
              display === 'price' && <Line data={todayData} options={todayOptions} />
            }
            {
              display === 'volume' &&  <Line data={hourlyVolumeData} options={options} />
            }
            {
              display === 'market' && <Line data={hourlyMarketCapData} options={options} />
            }
          </>
        )
      }
      {
        timeFrame === 'medium' && dailyAverages && (
            <Line data={visualData} options={options} />
        )
      }
      </div>
      )}
    </Layout>
  )
}
