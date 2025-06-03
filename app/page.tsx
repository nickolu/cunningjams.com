"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowUpRight, Menu, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"

interface Project {
  id: number
  title: string
  subtitle: string
  year: string
  description: string
  fullDescription: string
  technologies: string[]
  liveUrl: string
  githubUrl: string
  images: string[]
}

const socialLinks = [
  { name: "LINKEDIN", url: "https://linkedin.com/in/nickoluscunningham", icon: "💼" },
  { name: "GITHUB", url: "https://github.com/nickolu", icon: "⚡" },
  { name: "INSTAGRAM", url: "https://instagram.com/cunning.aim", icon: "📸" },
  { name: "TIKTOK", url: "https://tiktok.com/@cunning.jams", icon: "🎵" },
]

export default function AvantGardePortfolio() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState(0)
  const [showProjectDetail, setShowProjectDetail] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Enhanced background transformations
  const bgY1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const bgY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
  const bgY3 = useTransform(scrollYProgress, [0, 1], ["0%", "80%"])

  // Vertical text movement - much more pronounced
  const leftTextY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const rightTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"])

  // Color transformations
  const bgOpacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0.8, 0.4, 0.2, 0.1, 0.05, 0])
  const bgOpacity2 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.1, 0.7, 0.5, 0.3, 0.1])
  const bgOpacity3 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0, 0.1, 0.3, 0.6, 0.8])

  // Rotation for floating elements
  const rotation1 = useTransform(scrollYProgress, [0, 1], [0, 45])
  const rotation2 = useTransform(scrollYProgress, [0, 1], [0, -30])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8])

  const projects = [
    {
      id: 1,
      title: "BRUTALIST",
      subtitle: "Web Design",
      year: "2023",
      description: "Experimental e-commerce platform with unconventional navigation and typography-focused design.",
      fullDescription:
        "A groundbreaking e-commerce platform that challenges traditional web design conventions. Built with React and Three.js, this project features unconventional navigation patterns, experimental typography, and immersive 3D elements that create a unique shopping experience.",
      technologies: ["React", "Three.js", "WebGL", "Node.js", "MongoDB"],
      images: ["/placeholder.svg?height=600&width=800", "/placeholder.svg?height=400&width=600"],
      liveUrl: "https://brutalist-demo.com",
      githubUrl: "https://github.com/alexdev/brutalist",
    },
    {
      id: 2,
      title: "MONOCHROME",
      subtitle: "Brand Identity",
      year: "2022",
      description:
        "Minimalist brand identity system for a contemporary art gallery focused on black and white photography.",
      fullDescription:
        "A comprehensive brand identity system for a contemporary art gallery specializing in black and white photography. The project includes logo design, typography system, exhibition materials, and a custom website that reflects the gallery's minimalist aesthetic.",
      technologies: ["Next.js", "Framer Motion", "Tailwind CSS", "Figma"],
      images: ["/placeholder.svg?height=600&width=800", "/placeholder.svg?height=400&width=600"],
      liveUrl: "https://monochrome-gallery.com",
      githubUrl: "https://github.com/alexdev/monochrome",
    },
    {
      id: 3,
      title: "FRAGMENT",
      subtitle: "Interactive Experience",
      year: "2023",
      description: "WebGL-based interactive experience exploring the concept of digital fragmentation.",
      fullDescription:
        "An experimental WebGL-based interactive experience that explores themes of digital fragmentation and data visualization. Users can manipulate 3D fragments in real-time, creating unique compositions while exploring the relationship between digital and physical space.",
      technologies: ["WebGL", "GLSL", "JavaScript", "Canvas API"],
      images: ["/placeholder.svg?height=600&width=800", "/placeholder.svg?height=400&width=600"],
      liveUrl: "https://fragment-experience.com",
      githubUrl: "https://github.com/alexdev/fragment",
    },
    {
      id: 4,
      title: "NEURAL",
      subtitle: "AI Interface",
      year: "2024",
      description: "Machine learning interface for creative AI applications with real-time visualization.",
      fullDescription:
        "A sophisticated interface for creative AI applications featuring real-time neural network visualization, interactive parameter controls, and seamless integration with various machine learning models. The project bridges the gap between complex AI systems and intuitive user interaction.",
      technologies: ["Python", "TensorFlow", "React", "D3.js", "WebSockets"],
      images: ["/placeholder.svg?height=600&width=800", "/placeholder.svg?height=400&width=600"],
      liveUrl: "https://neural-interface.com",
      githubUrl: "https://github.com/alexdev/neural",
    },
  ]

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const nextProject = () => {
    setCurrentProject((prev) => (prev + 1) % projects.length)
  }

  const prevProject = () => {
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setShowProjectDetail(true)
  }

  const closeProjectDetail = () => {
    setShowProjectDetail(false)
    setSelectedProject(null)
  }

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen font-light relative overflow-hidden">
      {/* Background layers with enhanced movement */}
      <motion.div
        className="fixed inset-0 -z-30"
        style={{
          y: bgY1,
          opacity: bgOpacity1,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-indigo-900/30 to-blue-900/30" />
      </motion.div>

      <motion.div
        className="fixed inset-0 -z-20"
        style={{
          y: bgY2,
          opacity: bgOpacity2,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/40 via-fuchsia-900/40 to-transparent" />
      </motion.div>

      <motion.div
        className="fixed inset-0 -z-10"
        style={{
          y: bgY3,
          opacity: bgOpacity3,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-900/30 to-cyan-900/30" />
      </motion.div>

      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none"></div>

      {/* Floating elements */}
      <motion.div
        className="fixed top-[20%] left-[10%] w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl mix-blend-screen pointer-events-none"
        style={{
          y: bgY1,
          rotate: rotation1,
          scale,
        }}
      />

      <motion.div
        className="fixed bottom-[30%] right-[15%] w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl mix-blend-screen pointer-events-none"
        style={{
          y: bgY2,
          rotate: rotation2,
          scale,
        }}
      />

      {/* Fixed vertical text - LEFT SIDE - NOW WITH MOVEMENT */}
      <motion.div
        className="fixed right-0 bottom-0 h-full flex items-center z-10 pointer-events-none"
        style={{ y: leftTextY }}
      >
        <h2 className="text-[8vw] font-extralight text-white/10 rotate-90 whitespace-nowrap origin-top">
          CUNNINGHAM CUNNINGHAM CUNNINGHAM
        </h2>
      </motion.div>

      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-8 right-8 z-50 w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-full"
      >
        {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Navigation Menu */}
      <motion.nav
        initial={false}
        animate={{ x: menuOpen ? "0%" : "100%" }}
        className="fixed inset-0 bg-black z-40 flex items-center justify-center"
      >
        <ul className="space-y-8 text-center">
          {["HOME", /*"WORK",*/ "ABOUT", "CONTACT"].map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: menuOpen ? 1 : 0,
                y: menuOpen ? 0 : 20,
                transition: { delay: menuOpen ? index * 0.1 : 0 },
              }}
            >
              <Link
                href={`#${item.toLowerCase()}`}
                className="text-5xl md:text-7xl font-extralight hover:text-gray-400 transition-colors"
                onClick={toggleMenu}
              >
                {item}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      {/* Project Detail Modal */}
      {/* <AnimatePresence>
        {showProjectDetail && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-6 md:px-16 py-16">
              <div className="max-w-screen-xl mx-auto">
                
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={closeProjectDetail}
                  className="flex items-center gap-2 text-xl mb-12 hover:text-gray-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  BACK TO WORK
                </motion.button>

                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-16"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                    <div>
                      <h1 className="text-[8vw] md:text-[6vw] font-black leading-none mb-4">{selectedProject.title}</h1>
                      <p className="text-2xl text-gray-400">{selectedProject.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl text-gray-500 mb-4">{selectedProject.year}</p>
                      <div className="flex gap-4">
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors"
                        >
                          LIVE SITE
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                        <a
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors"
                        >
                          GITHUB
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-16"
                >
                  <div className="grid gap-8">
                    {selectedProject.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-white/5 rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${selectedProject.title} screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>

                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid md:grid-cols-2 gap-16"
                >
                  <div>
                    <h3 className="text-3xl font-bold mb-6">OVERVIEW</h3>
                    <p className="text-xl text-gray-300 leading-relaxed">{selectedProject.fullDescription}</p>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold mb-6">TECHNOLOGIES</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProject.technologies.map((tech, index) => (
                        <div
                          key={index}
                          className="border border-white/20 p-3 text-center hover:bg-white/5 transition-colors"
                        >
                          {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
*/}
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex flex-col justify-center relative px-6 md:px-16">
        <motion.div
          style={{ rotate: rotation2 }}
          className="absolute top-[20vh] right-[10vw] md:right-[15vw] pointer-events-none"
        >
          
        </motion.div>

        <div className="max-w-screen-xl mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            {/* Main content - left side */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mb-8"
              >
                <span className="text-gray-500 text-xl tracking-widest">PORTFOLIO</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
f                className="text-[12vw] sm:text-[12vw] md:text-[8vw] lg:text-[8vw] xl:text-[8rem] font-black leading-[0.9] tracking-tighter mb-12"
              >
                Nickolus
                <br />
                Cunningham
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="space-y-8"
              >
                <p className="text-xl md:text-2xl text-gray-400 max-w-md">
                  I'm a creative full-stack product developer specializing in building LLM-powered and agentic web applications.
                </p>

                {/* <Link
                  href="#work"
                  className="group flex items-center gap-2 text-xl border border-white/20 px-6 py-3 hover:bg-white/5 transition-colors w-fit"
                >
                  VIEW WORK
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link> */}
              </motion.div>
            </div>

            {/* Social Links - right column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="space-y-6 md:pt-16"
            >
              <h3 className="text-xl font-light text-white/80 tracking-widest">CONNECT</h3>

              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    className="group relative overflow-hidden border border-white/20 p-4 hover:border-white/40 transition-all duration-300 hover:bg-white/5 block w-full"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{social.icon}</span>
                      <span className="text-lg font-light tracking-wider group-hover:text-white transition-colors">
                        {social.name}
                      </span>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Work Section - Now a Carousel */}
     {/*} <section id="work" className="min-h-screen py-32 relative">
        <div className="absolute -right-20 top-0 opacity-10 pointer-events-none">
          <h2 className="text-[30vw] font-black">W</h2>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 md:px-16">
          <div className="mb-24">
            <h2 className="text-[15vw] md:text-[10vw] font-black leading-none">WORK</h2>
            <p className="text-xl text-gray-400 max-w-xl mt-6">
              Selected projects that showcase my approach to design and development.
            </p>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-4">
                <button
                  onClick={prevProject}
                  className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextProject}
                  className="w-12 h-12 border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="text-gray-500">
                {String(currentProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </div>
            </div>

            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${currentProject * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {projects.map((project, index) => (
                  <div key={project.id} className="w-full flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0, y: 100 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="group pr-8"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex items-baseline gap-4">
                          <span className="text-gray-600 text-xl">{String(index + 1).padStart(2, "0")}</span>
                          <h3 className="text-6xl md:text-8xl font-black">{project.title}</h3>
                        </div>
                        <span className="text-xl text-gray-500">{project.year}</span>
                      </div>

                      <div
                        className="h-[50vh] bg-white/5 relative overflow-hidden group-hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => openProjectDetail(project)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <button className="flex items-center gap-2 text-xl border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors">
                            VIEW PROJECT
                            <ArrowUpRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mt-6">
                        <span className="text-xl text-gray-400">{project.subtitle}</span>
                        <p className="text-xl text-gray-400 max-w-md">{project.description}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="flex justify-center gap-2 mt-12">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProject(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentProject ? "bg-white" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* About Section */}
      <section id="about" className="min-h-screen py-32 relative">
        <div className="absolute -left-40 top-20 opacity-5 pointer-events-none">
          <h2 className="text-[40vw] font-black">A</h2>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 md:px-16 relative z-10">
          <div className="mb-24">
            <h2 className="text-[15vw] md:text-[10vw] font-black leading-none">ABOUT</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed">
                I'm a software engineer and creative focused on creating digital experiences that leverage the power of AI for extreme personalization and ease-of-use for end users.  
              </p>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                With a background in both graphic design and front-end development, I bring a unique perspective to
                every project, blending visual aesthetics with technical execution.
              </p>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                My work explores the intersection of typography, motion, and interaction to create memorable digital
                experiences.
              </p>

              <p className="text-xl text-gray-400 leading-relaxed">
                I am currently working on a number of projects that leverage the power of AI to create personalized and engaging experiences for users.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">EXPERTISE</h3>

              <div className="space-y-12">
                {[
                  {
                    category: "Frontend",
                    skills: ["React", "TypeScript", "Material UI", "D3.js", "Tailwind CSS", "Figma", "Next.js", "HTML/CSS"],
                  },
                  {
                    category: "Backend",
                    skills: ["Node.js", "Python", "PostgreSQL", "MongoDB"],
                  },
                  {
                    category: "LLM",
                    skills: ["OpenAi", "Claude", "LangChain", "Agentic Workflows"],
                  },
                ].map((category, index) => (
                  <div key={index}>
                    <h4 className="text-xl text-gray-500 mb-4">{category.category}</h4>
                    <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {category.skills.map((skill, i) => (
                        <li key={i} className="text-xl border-b border-white/10 pb-2">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen py-32 relative">
        <div className="absolute right-0 top-0 -rotate-90 origin-top-right mr-8 mt-8 hidden md:block">
          <span className="text-xl tracking-widest text-gray-600">GET IN TOUCH</span>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 md:px-16">
          <div className="mb-24">
            <h2 className="text-[15vw] md:text-[10vw] font-black leading-none">CONTACT</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
                Interested in working together? Let's create something extraordinary.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl text-gray-500 mb-2">EMAIL</h3>
                  <a href="mailto:nick@cunningjams.com" className="text-2xl hover:text-gray-400 transition-colors">
                    nick@cunningjams.com
                  </a>
                </div>

                <div>
                  <h3 className="text-xl text-gray-500 mb-2">LOCATION</h3>
                  <p className="text-2xl">San Diego, CA</p>
                </div>

                <div>
                  <h3 className="text-xl text-gray-500 mb-2">SOCIAL</h3>
                  <div className="flex gap-6">
                    {socialLinks.map((social) => (
                      <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-lg hover:text-gray-400 transition-colors">
                        {social.name.toLowerCase()}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* <form className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xl text-gray-500">
                  NAME
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xl text-gray-500">
                  EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xl text-gray-500">
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xl focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center gap-2 text-xl border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-colors"
              >
                SEND MESSAGE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl">NICKOLUS CUNNINGHAM © {new Date().getFullYear()}</div>

          <div className="flex gap-8">
            {["Home", /*"Work",*/ "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {item.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Fixed vertical text on right - NOW WITH MOVEMENT */}
      <motion.div
        className="fixed -right-5 bottom-0 h-full flex items-center z-10 pointer-events-none"
        style={{ y: rightTextY }}
      >
        <h2 className="text-[8vw] font-extralight text-white/10 -rotate-90 whitespace-nowrap origin-center">
          PORTFOLIO
        </h2>
      </motion.div>
    </div>
  )
}
