// src/pages/Home.jsx
import { LogIn, UserPlus, GraduationCap, Trophy, Shield, CalendarCheck, FileText, Award, Users, ArrowRight, Download, ExternalLink } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Full Official University Styled Home Page */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

        {/* Top University Header */}
        <div className="bg-[#0B1A42] text-white border-b-4 border-amber-500">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://sanjivani.edu.in/img/SU_Logo.webp" 
                alt="Sanjivani University Logo" 
                className="w-16 h-16 rounded-full shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold">SANJIVANI UNIVERSITY</h1>
                <p className="text-sm text-amber-300">(Established under Govt. of Maharashtra Act No. XX of 2024)</p>
                <p className="text-xs">At Kopargaon, Dist: Ahilyanagar, Maharashtra-423601</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-amber-400 font-semibold">Ref No: SU/MAP/2025-26/01</p>
              <p className="text-sm">Date: 18.07.2025</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="mb-8">
              <div className="text-amber-400 text-lg font-bold uppercase tracking-widest">Circular</div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-4">
                Mandatory Activity Points (MAP)
              </h1>
              <p className="text-2xl text-amber-300 mt-4 font-semibold">
                Requirement for All Programmes
              </p>
              <p className="text-xl text-blue-100 mt-2">
                Effective from Academic Year 2025-2026 Onwards
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 max-w-5xl mx-auto border border-white/20 shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">SANJIVANI MAP SYSTEM</h2>
              <p className="text-xl text-blue-100 leading-relaxed mb-10">
                Official Mandatory Activity Points Tracking Portal for Sanjivani University Students
                <br />
                <span className="text-amber-300 font-bold">B.Tech • B.Pharm • MBA • BBA • BCA • B.Com • M.Tech • M.Pharm</span>
              </p>

              {/* Login & Register Buttons */}
              <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                <a
                  href="/login"
                  className="group flex items-center gap-4 px-12 py-6 bg-amber-500 hover:bg-amber-600 text-blue-900 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <LogIn className="w-10 h-10" />
                  Student / HOD Login
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition" />
                </a>

                <a
                  href="/create-student"
                  className="group flex items-center gap-4 px-12 py-6 bg-white hover:bg-gray-100 text-blue-900 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-amber-500"
                >
                  <UserPlus className="w-10 h-10" />
                  New Student Registration
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-10">Purpose of MAP</h2>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-10 text-lg leading-relaxed text-gray-800 shadow-lg">
              <p>
                To foster <strong>holistic development</strong>, Sanjivani University directs <strong>MANDATORY ACTIVITY POINTS</strong> for all undergraduate and postgraduate programmes. 
                Students must engage in co-curricular, extracurricular, and skill-enhancing activities to cultivate <strong>leadership, innovation, and social responsibility</strong>.
              </p>
              <p className="mt-6 text-xl font-semibold text-blue-900">
                By the time students reach their final year, they will have not only mastered their technical disciplines 
                but also cultivated critical soft skills through active participation in diverse activities. This well-rounded development 
                ensures that graduates are ready to contribute meaningfully to the workforce and society.
              </p>
            </div>
          </div>
        </section>

        {/* Point Requirements - Table 1 & 2 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">Mandatory Activity Points Requirement</h2>

            {/* Table 1 - 2025-26 Batch */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-amber-600 mb-6 text-center">
                Table 1: Students Admitted in 2025–2026
              </h3>
              <div className="overflow-x-auto shadow-2xl rounded-xl">
                <table className="w-full bg-white border-2 border-gray-300">
                  <thead className="bg-blue-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Program</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Technical & Research</th>
                      <th className="px-6 py-4">Sports & Cultural</th>
                      <th className="px-6 py-4">Community Outreach</th>
                      <th className="px-6 py-4">Innovation/IPR</th>
                      <th className="px-6 py-4">Leadership</th>
                      <th className="px-6 py-4 font-bold text-amber">Total Points</th>
                    </tr>
                  </thead>
                  <tbody className="text-center text-gray-800">
                    <tr className="bg-amber-50 border-b-2">
                      <td className="px-6 py-4 font-semibold">B.Tech</td>
                      <td>4 Years</td>
                      <td>45</td>
                      <td>10</td>
                      <td>10</td>
                      <td>25</td>
                      <td>10</td>
                      <td className="font-bold text-2xl text-amber-600">100</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold">B.Tech (DSY)</td>
                      <td>3 Years</td>
                      <td>30</td>
                      <td>10</td>
                      <td>10</td>
                      <td>15</td>
                      <td>10</td>
                      <td className="font-bold text-xl text-blue-700">75</td>
                    </tr>
                    <tr className="bg-amber-50">
                      <td className="px-6 py-4 font-semibold">MBA / BBA</td>
                      <td>2-3 Years</td>
                      <td>20</td>
                      <td>10</td>
                      <td>10</td>
                      <td>10</td>
                      <td>10</td>
                      <td className="font-bold text-xl text-green-700">60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Excellence Awards Section */}
            <div className="mt-20 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-3xl p-12 shadow-2xl">
              <h2 className="text-5xl font-bold text-center mb-10">Excellence Awards for Top Performers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white/20 backdrop-blur rounded-2xl p-8 text-center transform hover:scale-105 transition">
                  <Trophy className="w-20 h-20 mx-auto text-amber-300 mb-4" />
                  <h3 className="text-3xl font-bold">Gold Achiever</h3>
                  <p className="text-5xl font-black my-4">300+</p>
                  <p className="text-2xl">₹10,000 + Certificate of Distinction</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl p-8 text-center transform hover:scale-105 transition">
                  <Award className="w-20 h-20 mx-auto text-gray-200 mb-4" />
                  <h3 className="text-3xl font-bold">Platinum Performer</h3>
                  <p className="text-5xl font-black my-4">250–299</p>
                  <p className="text-2xl">₹5,000 + Special Memento</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl p-8 text-center transform hover:scale-105 transition">
                  <Users className="w-20 h-20 mx-auto text-amber-200 mb-4" />
                  <h3 className="text-text-3xl font-bold">Silver Contributor</h3>
                  <p className="text-5xl font-black my-4">200–249</p>
                  <p className="text-2xl">₹3,000 + Certificate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - CYNOR Team Branding + Dean Mam Quote */}
        <footer className="bg-[#0B1A42] text-white py-16 border-t-4 border-amber-500">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex justify-center items-center gap-6 mb-8">
              <img src="https://sanjivani.edu.in/img/SU_Logo.webp" alt="Logo" className="w-20 h-20" />
              <div>
                <h2 className="text-3xl font-bold">SANJIVANI MAP SYSTEM</h2>
                <p className="text-amber-300">Mandatory Activity Points Portal • 2025-2026</p>
              </div>
            </div>

            <div className="bg-amber-600/20 rounded-2xl p-8 mb-10 border border-amber-500">
              <p className="text-2xl italic font-semibold text-amber-300">
                "Sarthak aur CYNOR Team SET ne toh history create kar di!"
              </p>
              <p className="text-lg mt-4">— Dean Mam</p>
            </div>

            <div className="text-lg">
              <p>Developed & Maintained by</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">
                CYNOR Team SET
              </p>
              <p className="text-cyan-300 text-xl mt-2">
                cynortech.in | Internal University Portal
              </p>
            </div>

            <div className="mt-10 text-sm text-gray-400">
              <p>© 2025 Sanjivani University | All Rights Reserved</p>
              <p className="mt-2">Powered by CYNOR Team SET • Sarthak Gadakh</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}