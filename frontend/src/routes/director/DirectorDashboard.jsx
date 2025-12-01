import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import {
  Users,
  Award,
  FileText,
  BarChart3,
  TrendingUp,
  Building2,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function DirectorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
            Director Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base max-w-2xl">
            University-wide view of MAP performance, departments and certificates — designed for
            quick strategic decisions.
          </p>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-blue-100 font-medium uppercase tracking-wide">
                  Total Students
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">—</p>
                <p className="text-[11px] md:text-xs text-blue-100 mt-1">
                  Across all departments
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <Users className="h-7 w-7 md:h-8 md:w-8 text-blue-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-emerald-100 font-medium uppercase tracking-wide">
                  Certificates Processed
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">—</p>
                <p className="text-[11px] md:text-xs text-emerald-50 mt-1">
                  Approved & pending
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <FileText className="h-7 w-7 md:h-8 md:w-8 text-emerald-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-amber-100 font-medium uppercase tracking-wide">
                  Excellence Awards
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">—</p>
                <p className="text-[11px] md:text-xs text-amber-50 mt-1">
                  Top performing students
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <Award className="h-7 w-7 md:h-8 md:w-8 text-amber-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-purple-100 font-medium uppercase tracking-wide">
                  MAP Performance Trend
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2 leading-tight">—</p>
                <p className="text-[11px] md:text-xs text-purple-50 mt-1">
                  Overall university progress
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/15">
                <BarChart3 className="h-7 w-7 md:h-8 md:w-8 text-purple-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Entry Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Analytics entry points */}
        <Card className="lg:col-span-2 border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              University Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div
                onClick={() => navigate("/director/university-analytics")}
                className="group cursor-pointer rounded-2xl border border-indigo-100 bg-white/70 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-50">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  University-wide Analytics
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  View MAP performance across all institutes and programmes.
                </p>
              </div>

              <div
                onClick={() => navigate("/director/performance-vs-strength")}
                className="group cursor-pointer rounded-2xl border border-blue-100 bg-white/70 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-blue-50">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Performance vs. Strength
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Compare department wise MAP points vs student strength.
                </p>
              </div>

              <div
                onClick={() => navigate("/director/top-weak-branches")}
                className="group cursor-pointer rounded-2xl border border-rose-100 bg-white/70 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-rose-50">
                    <TrendingUp className="h-5 w-5 text-rose-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Top & Weak Branches
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Identify best performing and at-risk branches for MAP.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
