// src/pages/Home.jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { LogIn, UserPlus, Shield, ExternalLink, Users, Building } from "lucide-react";

export default function Home() {
  const { scrollY } = useScroll();
  const background = useTransform(
    scrollY,
    [0, 500, 1500, 2500],
    [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    ]
  );

  return (
    <>
      {/* Full White Official + Scroll Gradient Background */}
      <motion.div 
        style={{ background }}
        className="min-h-screen transition-all duration-1000"
      >
        {/* Favicon + Fixed Header */}
        <head>
          <link rel="icon" href="https://sanjivani.edu.in/images/SU%20LOGO.png" />
        </head>

        <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg border-b-4 border-amber-500 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <img 
                src="https://sanjivani.edu.in/images/SU%20LOGO.png" 
                alt="Sanjivani University" 
                className="w-20 h-20"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SANJIVANI UNIVERSITY</h1>
                <p className="text-sm text-gray-600">(Established under Govt. of Maharashtra Act No. XX of 2024)</p>
                <p className="text-xs text-gray-500">At Kopargaon, Dist: Ahilyanagar, Maharashtra-423601</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-600 font-bold text-lg">Ref No: SU/MAP/2025-26/01</p>
              <p className="text-gray-600">Date: 18.07.2025</p>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-4 bg-amber-100 border-2 border-amber-500 px-10 py-5 rounded-full mb-10">
              <Shield className="w-8 h-8 text-amber-600" />
              <span className="text-xl font-bold text-amber-800">CIRCULAR • EFFECTIVE FROM 2025-2026 ONWARDS</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-tight drop-shadow-lg">
              MANDATORY ACTIVITY POINTS
              <br />
              <span className="text-amber-300">(MAP)</span>
            </h1>
            <p className="text-2xl text-white mt-6 font-medium drop-shadow">
              Requirement for All Undergraduate & Postgraduate Programmes
            </p>

            {/* Enhanced Auto Color Changing Buttons with Multiple Effects */}
            <div className="flex flex-col md:flex-row gap-10 justify-center mt-20">
              <motion.a
                href="/login"
                animate={{
                  background: [
                    "linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0)",
                    "linear-gradient(90deg, #40e0d0, #ff0080, #ff8c00)",
                    "linear-gradient(90deg, #ff8c00, #40e0d0, #ff0080)"
                  ],
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 20px 40px rgba(255, 0, 128, 0.4)",
                    "0 20px 40px rgba(64, 224, 208, 0.4)",
                    "0 20px 40px rgba(255, 140, 0, 0.4)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-8 text-white text-3xl font-bold rounded-3xl flex items-center justify-center gap-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-orange-500 to-teal-500 animate-pulse"></div>
                <LogIn className="w-12 h-12 relative z-10" />
                <span className="relative z-10">Login Portal</span>
              </motion.a>

              <motion.a
                href="/create-student"
                animate={{
                  background: [
                    "linear-gradient(90deg, #00c6ff, #0072ff, #00d2ff)",
                    "linear-gradient(90deg, #00d2ff, #00c6ff, #0072ff)",
                    "linear-gradient(90deg, #0072ff, #00d2ff, #00c6ff)"
                  ],
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 20px 40px rgba(0, 198, 255, 0.4)",
                    "0 20px 40px rgba(0, 114, 255, 0.4)",
                    "0 20px 40px rgba(0, 210, 255, 0.4)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-8 text-white text-3xl font-bold rounded-3xl flex items-center justify-center gap-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 animate-pulse"></div>
                <UserPlus className="w-12 h-12 relative z-10" />
                <span className="relative z-10">Student Registration</span>
              </motion.a>
            </div>
          </motion.div>
        </section>

        {/* Purpose */}
        <section className="py-20 px-6 bg-white/10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-12 drop-shadow">PURPOSE</h2>
            <div className="bg-white/90 border-2 border-gray-300 rounded-3xl p-12 shadow-xl">
              <p className="text-xl leading-relaxed text-gray-700">
                To foster <strong className="text-amber-600">holistic development</strong>, Sanjivani University directs <strong className="text-amber-600">MANDATORY ACTIVITY POINTS</strong> for all undergraduate and postgraduate programmes. Students must engage in co-curricular, extracurricular, and skill-enhancing activities to cultivate <strong className="text-amber-600">leadership, innovation, and social responsibility</strong>.
              </p>
              <p className="text-xl text-gray-700 mt-8 font-medium">
                By the time students reach their final year, they will have not only mastered their technical disciplines but also cultivated critical soft skills through active participation in diverse activities. This well-rounded development ensures that graduates are ready to contribute meaningfully to the workforce and society, helping build a better future for the nation.
              </p>
            </div>
          </div>
        </section>

        {/* University Building Photo */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8 flex items-center justify-center gap-4">
              <Building className="w-10 h-10" />
              SANJIVANI UNIVERSITY CAMPUS
            </h2>
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30">
              <img 
                src="https://cynortech.in/sanjivani/images/building.jpg" 
                alt="Sanjivani University Building"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80";
                }}
              />
            </div>
          </div>
        </section>

        {/* Full Table 1 */}
        <section className="py-20 px-6 bg-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-12 drop-shadow">
              Table 1: Students Admitted in Academic Year 2025-2026
            </h2>
            <div className="overflow-x-auto bg-white/95 rounded-2xl shadow-2xl border border-white/30">
              <table className="w-full">
                <thead className="bg-amber-600 text-white">
                  <tr>
                    <th className="px-6 py-5 text-left">Programmes</th>
                    <th className="px-6 py-5">Duration</th>
                    <th className="px-6 py-5">A. Technical & Research</th>
                    <th className="px-6 py-5">B. Sports & Cultural</th>
                    <th className="px-6 py-5">C. Community Outreach</th>
                    <th className="px-6 py-5">D. Innovation/IPR</th>
                    <th className="px-6 py-5">E. Leadership</th>
                    <th className="px-6 py-5">Total Points</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="border-b"><td className="px-6 py-5 font-bold">B.Tech</td><td>4 Years</td><td>45</td><td>10</td><td>10</td><td>25</td><td>10</td><td className="text-3xl font-bold text-amber-600">100</td></tr>
                  <tr className="border-b"><td className="px-6 py-5 font-bold">B.Tech (DSY)</td><td>3 Years</td><td>30</td><td>10</td><td>10</td><td>15</td><td>10</td><td className="text-3xl font-bold text-blue-600">75</td></tr>
                  <tr className="border-b"><td className="px-6 py-5 font-bold">Integrated B.Tech</td><td>6 Years</td><td>50</td><td>10</td><td>15</td><td>25</td><td>15</td><td className="text-3xl font-bold text-purple-600">120</td></tr>
                  <tr><td className="px-6 py-5 font-bold">B.Pharm / BCA / BBA / MBA</td><td>2-4 Years</td><td>20-45</td><td>10</td><td>10-15</td><td>10-20</td><td>10</td><td className="text-3xl font-bold text-green-600">60-100</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Steering Committees */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-16 flex items-center justify-center gap-4">
              <Users className="w-12 h-12" />
              STEERING COMMITTEES
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white/90 rounded-3xl p-12 shadow-2xl border-4 border-amber-500">
                <h3 className="text-4xl font-bold text-amber-600 mb-8">CENTRAL MAP COMMITTEE</h3>
                <ul className="text-xl text-gray-700 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <strong>Dr. R. G. Pardeshi</strong> - Chairperson
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <strong>Dr. S. S. Pethakar</strong> - Coordinator
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <strong>Dr. M. S. Ranaware</strong> - Member
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <strong>Dr. P. P. Shinde</strong> - Member
                  </li>
                </ul>
              </div>
              <div className="bg-white/90 rounded-3xl p-12 shadow-2xl border-4 border-blue-500">
                <h3 className="text-4xl font-bold text-blue-600 mb-8">TECHNICAL ADVISORY GROUP</h3>
                <ul className="text-xl text-gray-700 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <strong>CYNORTECH Team</strong> - System Development
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <strong>IT Department</strong> - Infrastructure Support
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <strong>Academic Heads</strong> - Policy Implementation
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <strong>Student Council</strong> - Feedback & Suggestions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cynortech Info Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-12">SYSTEM DEVELOPER</h2>
            <div className="bg-white/90 rounded-3xl p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                <div className="md:w-1/3">
                  <img 
                    src="https://cynortech.in/sanjivani/images/cynortech-logo.png" 
                    alt="Cynortech Logo"
                    className="w-64 h-64 object-contain mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/256x256/0891b2/ffffff?text=CYNORTECH";
                    }}
                  />
                </div>
                <div className="md:w-2/3 text-left">
                  <h3 className="text-4xl font-bold text-cyan-700 mb-6">CYNORTECH SOLUTIONS</h3>
                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                    Official technology partner for Sanjivani University's MAP System. Providing cutting-edge 
                    digital solutions for academic management, student engagement, and institutional development.
                  </p>
                  <div className="space-y-4">
                    <p className="text-lg text-gray-600">
                      <strong className="text-cyan-600">Services:</strong> Web Development, Mobile Apps, Cloud Solutions, ERP Systems
                    </p>
                    <p className="text-lg text-gray-600">
                      <strong className="text-cyan-600">Expertise:</strong> React, Node.js, MongoDB, AWS, AI/ML Integration
                    </p>
                  </div>
                  <motion.a
                    href="https://cynortech.in/sanjivani"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 mt-8 px-8 py-4 bg-cyan-600 text-white text-xl font-bold rounded-full hover:bg-cyan-700 transition-colors"
                  >
                    <ExternalLink className="w-6 h-6" />
                    Visit Cynortech Portal
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - CYNORTECH Included */}
        <footer className="bg-gray-900/90 text-white py-16 px-6 border-t-8 border-amber-500">
          <div className="max-w-7xl mx-auto text-center">
            <img src="https://sanjivani.edu.in/images/SU%20LOGO.png" alt="Logo" className="w-24 h-24 mx-auto mb-6" />
            <h2 className="text-4xl font-bold">SANJIVANI MAP SYSTEM</h2>
            <p className="text-xl text-gray-400 mt-4">Official Mandatory Activity Points Portal</p>
            <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-8">
              <div className="text-center">
                <p className="text-lg text-gray-300">Developed & Maintained by</p>
                <p className="text-2xl font-bold text-cyan-400">CYNORTECH SOLUTIONS</p>
              </div>
              <div className="h-12 w-px bg-gray-600 hidden md:block"></div>
              <div className="text-center">
                <p className="text-lg text-gray-300">Powered by</p>
                <p className="text-2xl font-bold text-amber-400">SANJIVANI UNIVERSITY</p>
              </div>
            </div>
            <p className="text-lg text-gray-500 mt-12">
              © 2025 Sanjivani University | All Rights Reserved | Ref: SU/MAP/2025-26/01
            </p>
          </div>
        </footer>
      </motion.div>
    </>
  );
}