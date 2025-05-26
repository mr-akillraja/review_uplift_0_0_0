"use client"

import { useState } from "react"
import { BarChart3, Star, LinkIcon, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from "../../sidebar"

export default function BusinessDashboard() {
  const [period, setPeriod] = useState("week")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={false} />

      <div className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back</p>
            </div>
            <Tabs defaultValue="week" className="w-[300px]" onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+8 from last {period}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">+0.3 from last {period}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+32 from last {period}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">+5% from last {period}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Vishnu Vardhan S", rating: 1, date: "May 14, 2025", message: "Bad Taste" },
                    { name: "Aravind", rating: 5, date: "May 8, 2025", message: "Amazing food!" },
                    { name: "Chandran K", rating: 5, date: "Mar 20, 2025", message: "Loved it!" },
                    { name: "John D.", rating: 4, date: "Mar 15, 2025", message: "Great service, will come back!" },
                    {
                      name: "Sarah M.",
                      rating: 3,
                      date: "Mar 10, 2025",
                      message: "Food was okay, service could be better.",
                    },
                  ].map((review, i) => (
                    <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{review.name}</div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex mb-1">
                        {Array(review.rating)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        {Array(5 - review.rating)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-gray-300" />
                          ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of your ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stars: 5, count: 24, percentage: 57 },
                    { stars: 4, count: 10, percentage: 24 },
                    { stars: 3, count: 5, percentage: 12 },
                    { stars: 2, count: 2, percentage: 5 },
                    { stars: 1, count: 1, percentage: 2 },
                  ].map((item) => (
                    <div key={item.stars} className="flex items-center">
                      <div className="w-12 flex items-center">
                        <span className="font-medium">{item.stars}</span>
                        <Star className="h-4 w-4 ml-1 text-yellow-400" />
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-yellow-400 h-2.5 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-muted-foreground">{item.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
