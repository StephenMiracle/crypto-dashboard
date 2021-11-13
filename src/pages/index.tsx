import {useEffect, useMemo, useState} from "react"
import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import Seo from "../components/seo"
import Layout from "../components/layout"
import { useQuery, gql } from "@apollo/client"
import { Line } from "react-chartjs-2"
import { format } from "date-fns"

export default function page () {
  const {data, loading, error} = useQuery(gql`
    query {
      dailyAverages(limit: 40) {
        amount
        date
      }
      hourlyAverages(limit: 48)  {
        amount
        date
      }
      weeklyAverages(limit: 40)  {
        amount
        date
      }
    }
  `)

  const dailyAverages: any[] = data ? data.dailyAverages : []
  const weeklyAverages: any[] = data ? data.weeklyAverages : []
  const hourlyAverages: any[] = data ? data.hourlyAverages : []



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
      }
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

  return (
    <Layout>
      <Seo title="Home" />
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
