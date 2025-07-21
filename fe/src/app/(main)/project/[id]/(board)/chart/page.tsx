"use client";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useGetIssues, useViewSprint } from "@/hooks/sprintMutations";
import { useParams } from "next/navigation";
import { AlertTriangle, BarChart3, CheckCircle2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BurndownChart() {
  const params = useParams<{ id: string }>();
  const { data: activeSprint } = useViewSprint(
    Number(params.id),
    null,
    "ACTIVE"
  );
  const { data: issues } = useGetIssues(Number(params.id), null, "ACTIVE");

  if (!activeSprint || !issues) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Sprint
          </h3>
          <p className="text-gray-600">
            Start a sprint to view the burndown chart and track progress.
          </p>
        </div>
      </div>
    );
  }

  const startDate = new Date(activeSprint.startDate);
  const endDate = new Date(activeSprint.endDate);
  const today = new Date();
  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  // Create array of dates from start to end
  const days: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Calculate remaining points each day
  const remaining = days.map((day) => {
    return issues
      .filter((i) => !i.closedAt || new Date(i.closedAt) > day)
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  });

  // Ideal burndown line (straight)
  const ideal = days.map(
    (_, idx) => totalPoints - (totalPoints / (days.length - 1)) * idx
  );

  // Calculate current progress
  const todayIndex = days.findIndex(
    (day) => day.toDateString() === today.toDateString()
  );
  const currentRemaining =
    todayIndex >= 0 ? remaining[todayIndex] : remaining[remaining.length - 1];
  const completedPoints = totalPoints - currentRemaining;
  const progressPercentage =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Calculate if we're on track
  const expectedRemaining =
    todayIndex >= 0 ? ideal[todayIndex] : ideal[ideal.length - 1];
  const isOnTrack = currentRemaining <= expectedRemaining;
  const variance = currentRemaining - expectedRemaining;

  const data = {
    labels: days.map((d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Actual Burndown",
        data: remaining,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Ideal Burndown",
        data: ideal,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderDash: [8, 4],
        tension: 0,
        fill: false,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y} story points`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Sprint Days",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Story Points Remaining",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart Header with Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sprint Burndown Chart
              </h1>
              <p className="text-gray-600">
                Track your team's progress throughout the active sprint
              </p>
            </div>
          </div>

          {/* Sprint Progress Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                {totalPoints}
              </div>
              <div className="text-xs text-blue-600 font-medium">
                Total Points
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="text-lg font-bold text-emerald-600">
                {completedPoints}
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                Completed
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="text-lg font-bold text-amber-600">
                {currentRemaining}
              </div>
              <div className="text-xs text-amber-600 font-medium">
                Remaining
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-lg font-bold text-purple-600">
                {progressPercentage}%
              </div>
              <div className="text-xs text-purple-600 font-medium">
                Complete
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isOnTrack ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <span
                className={`font-semibold ${
                  isOnTrack ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {isOnTrack ? "On Track" : "Behind Schedule"}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {Math.abs(variance).toFixed(1)} points{" "}
              {variance > 0 ? "behind" : "ahead"} of ideal
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isOnTrack
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-r from-amber-500 to-amber-600"
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-96">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
