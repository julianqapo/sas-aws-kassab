"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View detailed analytics and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Views</CardTitle>
              <CardDescription>Monthly page view statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">125,847</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Total revenue this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold dark:text-white">$45,231</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
