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

    if (current[current.length - 1].amount > data.weeklyLow) {
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
      sellSignals.push("current price is less than the 7 day low")
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
      <h3>Ethereum Stats</h3> 
      <ul>
        <li style={{fontWeight: 'bold'}}>Most Recent Price: ${current[current.length - 1].amount.toFixed(2)}</li>
        <li style={{fontWeight: 'bold'}}>24 Hour Average: ${twentyFourHourAverage.amount.toFixed(2)}</li>
        <li style={{fontWeight: 'bold'}}>7 day Average: ${weeklyAverages[weeklyAverages.length - 1].amount.toFixed(2)}</li>
        <li style={{fontWeight: 'bold'}}>24 hour average percent change: {percentChangeString}</li>
        <li style={{fontWeight: 'bold'}}>7 day average percent change: {percentChangeWeek.toFixed(3)}%</li>
        <li style={{fontWeight: 'bold'}}>24 hour high: { data.hourlyHigh.toFixed(2) }</li>
        <li style={{fontWeight: 'bold'}}>24 hour low: { data.hourlyLow.toFixed(2) }</li>
        <li style={{fontWeight: 'bold'}}>7 day high: { data.weeklyHigh.toFixed(2) }</li>
        <li style={{fontWeight: 'bold'}}>7 day low: { data.weeklyLow.toFixed(2) }</li>
      </ul>
      <h4>Volume Data</h4>
      <ul>
        <li style={{fontWeight: 'bold'}}>Current Volume: { data?.volumeData?.current }</li>
        <li style={{fontWeight: 'bold'}}>24 Hour Volume: { data?.volumeData?.day }</li>
        <li style={{fontWeight: 'bold'}}>7 day Volume: { data?.volumeData?.week }</li>
      </ul>
      <h4>Buy Signals</h4>
      <ul>
        {
          buySignals?.map(signal => {
            return <li>{signal}</li>
          })
        }
      </ul>
      <h4>Sell Signals</h4>
      <ul>
        {
          sellSignals?.map(signal => {
            return <li>{signal}</li>
          })
        }
      </ul>
      <h3>6 Hour Real-time</h3>
      {
        current && (
          <>
          <Line data={currentData} options={todayOptions} />
          <Bar data={curVolume} options={options} />
          </>
        )
      }
      <h3>48 Hourly Averages</h3> 
      {
        hourlyAverages && (
          <Line data={todayData} options={todayOptions} />
        )
      }

      <h3>40 Day Averages</h3>
      {
        dailyAverages && (
            <Line data={visualData} options={options} />
        )
      }
    </Layout>
  )
}
