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
      current(limit: 24) {
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
        data: hourlyAverages.map((a, i) => {
          return weeklyAverages[weeklyAverages.length - 1].amount
        }),
        backgroundColor: 'rgba(50, 200, 500, .3)',
        borderColor: 'rgba(200, 50, 50, .3)',
      },
      {
        label: '24 hour average',
        data: hourlyAverages.map(a => twentyFourHourAverage.amount),
        borderColor: 'rgba(50, 50, 200, .3)'
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
  const percentChange = (current[0].amount - dailyAverages[dailyAverages.length - 1].amount) / twentyFourHourAverage.amount * 100
  const percentChangeString = percentChange.toFixed(2) + "%"



  return (
    <Layout>
      <Seo title="Home" />
      <h3>Eth Stats</h3> 
      <ul>
        <li style={{fontWeight: 'bold'}}>Current Price: ${current[0].amount}</li>
        <li style={{fontWeight: 'bold'}}>Percentage high / low of 24 hour average: {percentChangeString}</li>
        <li style={{fontWeight: 'bold'}}>24 hour high: { data.hourlyHigh }</li>
        <li style={{fontWeight: 'bold'}}>24 hour low: { data.hourlyLow }</li>
      </ul>
      <h3>Current</h3>
      {
        current && (
          <>
          <Line data={currentData} options={todayOptions} />
          <Bar data={curVolume} options={options} />
          </>
        )
      }
      <h3>48 Hour Data</h3> 
      {
        hourlyAverages && (
          <Line data={todayData} options={todayOptions} />
        )
      }

      <h3>Historical Data</h3>
      {
        dailyAverages && (
            <Line data={visualData} options={options} />
        )
      }
    </Layout>
  )
}
