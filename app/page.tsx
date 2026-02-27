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
  { name: "BLOG", url: "/blog", icon: "📝" },
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
      title: "CUNNINGTYPE",
      subtitle: "Typing Training Application",
      year: "2025",
      description: "An intelligent typing trainer that uses AI to identify and target your weakest patterns.",
      fullDescription:
        "A comprehensive typing skills development platform that goes beyond traditional typing tests. Cunningtype intelligently analyzes your typing patterns to identify specific weaknesses, then leverages AI to generate custom training content that targets those exact areas. The result is a highly personalized training experience that accelerates improvement where you need it most.",
      technologies: ["React", "Next.js", "OpenAI API", "TypeScript", "Tailwind CSS"],
      images: ["/projects/cunningtype.png"],
      liveUrl: "https://cunningtype.com",
      githubUrl: "https://github.com/nickolu/typing-trainer",
    },
    {
      id: 2,
      title: "AIBRARIAN",
      subtitle: "AI-Powered Book Recommendations",
      year: "2024",
      description: "Find the perfect book to solve your specific problems with AI-guided recommendations.",
      fullDescription:
        "AIbrarian revolutionizes how we discover books by matching specific problems or questions with relevant book recommendations. Instead of browsing by genre or popularity, users can describe a challenge they're facing, and the AI will recommend books that address that exact issue, complete with specific insights and passages from those books that provide solutions.",
      technologies: ["Next.js", "OpenAI API", "React", "TypeScript"],
      images: ["/projects/aibrarian.png"],
      liveUrl: "https://aibrarian.com",
      githubUrl: "https://github.com/nickolu/aibrarian.com",
    },
    {
      id: 3,
      title: "COMETCAVE",
      subtitle: "Experimental AI Playground",
      year: "2025",
      description: "A creative sandbox for AI-powered experiments and entertaining digital experiences.",
      fullDescription:
        "CometCave serves as a personal laboratory for exploring the creative possibilities of AI. This collection of experimental projects showcases various AI capabilities through entertaining and sometimes whimsical applications. Each project pushes the boundaries of what's possible when combining artificial intelligence with creative web development.",
      technologies: ["Next.js", "OpenAI API", "React", "TypeScript", "Tailwind CSS"],
      images: ["/projects/cometcave.png"],
      liveUrl: "https://cometcave.com",
      githubUrl: "https://github.com/nickolu/CometCave",
    },
    {
      id: 4,
      title: "WHOWOULDWIN-INATOR",
      subtitle: "AI Battle Scenario Generator",
      year: "2025",
      description: "Generate epic battle scenarios and artwork between any two characters using multi-step AI workflows.",
      fullDescription:
        "An sophisticated agentic workflow that orchestrates multiple AI models to create entertaining battle scenarios complete with custom artwork. The system features 'progressive safety retries' - a novel approach that enables the generation of images featuring copyrighted characters while respecting content policies. Users can pit any two characters against each other and receive detailed battle narratives alongside unique artwork depicting the confrontation.",
      technologies: ["Next.js", "OpenAI API", "DALL-E", "React", "Agentic Workflows"],
      images: ["/projects/whowouldwininator.png"],
      liveUrl: "https://www.cometcave.com/whowouldwininator",
      githubUrl: "https://github.com/nickolu/CometCave/tree/main/src/app/whowouldwininator",
    },
    {
      id: 5,
      title: "THEOSIS",
      subtitle: "Band Website Design",
      year: "2025",
      description: "A visually stunning website created for the band Theosis over a weekend creative sprint.",
      fullDescription:
        "A passion project born from a desire to give back to the music community through exceptional web design. Challenging myself to create the best possible website over a single weekend, this project combines artistic expression with modern web capabilities. The site features custom artwork and interactive elements that capture the band's aesthetic and energy.",
      technologies: ["Next.js", "React", "Framer Motion", "Tailwind CSS"],
      images: ["/projects/theosis.png"],
      liveUrl: "https://theosis-website.vercel.app/",
      githubUrl: "https://github.com/nickolu/theosis-website",
    },
    {
      id: 6,
      title: "INFINITE PERSONAS",
      subtitle: "Educational AI Chat Platform",
      year: "2023",
      description: "Chat with historical figures and anyone else through AI, built with pioneering safety features.",
      fullDescription:
        "Created for my children to safely explore conversations with historical figures and other personas. This project implemented primitive but effective agent-based safety measures before they became widely understood - including faithfulness monitoring, content safety checks, and prompt injection protection, all built using the GPT-3.5 API. The system ensures conversations remain educational and appropriate while maintaining engaging character interactions.",
      technologies: ["Next.js", "OpenAI API", "React", "Safety Agents", "TypeScript"],
      images: ["/projects/infinitepersonas.png"],
      liveUrl: "https://www.infinitepersonas.com/",
      githubUrl: "https://github.com/nickolu/InfinitePersonas",
    },
    {
      id: 7,
      title: "CUNNINGJAMS ALBUMS",
      subtitle: "Photo Gallery Web Application",
      year: "2025",
      description: "A feature-rich photo gallery powered by Cloudinary with multi-album support.",
      fullDescription:
        "A sophisticated photo gallery application built with the Cloudinary API, featuring password-protected albums, image optimization, and a sleek viewing experience. The system supports multiple configurable albums, each with its own settings and access controls. Perfect for sharing photo collections with family and friends while maintaining privacy and organization.",
      technologies: ["Next.js", "Cloudinary API", "React", "TypeScript", "Tailwind CSS"],
      images: ["/projects/cunningjams-albums.png"],
      liveUrl: "https://www.cunningjams.com/albums/whowouldwininator-portraits",
      githubUrl: "https://github.com/nickolu/cunningjams.com",
    },
    {
      id: 8,
      title: "CUNNINGBOT",
      subtitle: "Multi-Purpose Discord Bot",
      year: "2025",
      description: "A feature-rich Discord bot running on Raspberry Pi with LLM and image generation capabilities.",
      fullDescription:
        "A comprehensive Discord bot hosted on a Raspberry Pi, providing server members with access to multiple LLM APIs, image generation capabilities, and custom features including a baseball statistics MCP built with public baseball data. The bot serves as a personal assistant and entertainment hub for Discord communities, demonstrating how consumer hardware can power sophisticated AI applications.",
      technologies: ["Python", "Discord.js", "OpenAI API", "MCP", "Raspberry Pi"],
      images: ["/projects/cunningbot.png"],
      liveUrl: "https://discord.gg/3rdjDvxFEe",
      githubUrl: "https://github.com/nickolu/cunningbot",
    },
    {
      id: 9,
      title: "TREEMIND",
      subtitle: "AI-Enhanced Mind Mapping",
      year: "2024",
      description: "A mind mapping tool that uses AI to generate subtrees and supercharge brainstorming sessions.",
      fullDescription:
        "TreeMind transforms traditional mind mapping by integrating AI-powered subtree generation. As you build your mind map, the AI can suggest and generate entire branches of related ideas, helping overcome creative blocks and explore concepts more deeply. While still in development, it demonstrates the potential of AI to enhance human creativity rather than replace it.",
      technologies: ["React", "OpenAI API", "TypeScript", "D3.js"],
      images: ["/projects/treemind-renamed.png"],
      liveUrl: "https://treemind.cunningjams.com/",
      githubUrl: "https://github.com/nickolu/treemind",
    },
    {
      id: 10,
      title: "GPT FILE RENAMER",
      subtitle: "Intelligent Batch File Renaming",
      year: "2023",
      description: "Leverage AI to rename thousands of files when traditional regex and string matching fall short.",
      fullDescription:
        "Born from the practical need to rename thousands of ROM files with inconsistent naming patterns, this tool harnesses GPT's natural language understanding to intelligently rename files in ways that traditional programming approaches cannot. When dealing with messy, inconsistent filenames that defy regex patterns, GPT File Renamer can understand context and make intelligent renaming decisions at scale.",
      technologies: ["Python", "OpenAI API", "CLI"],
      images: ["/projects/gpt-file-renamer.png"],
      liveUrl: "",
      githubUrl: "https://github.com/nickolu/gpt-file-renamer",
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

  const navigateToProject = (direction: 'next' | 'prev') => {
    if (!selectedProject) return
    const currentIndex = projects.findIndex(p => p.id === selectedProject.id)
    let newIndex
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % projects.length
    } else {
      newIndex = (currentIndex - 1 + projects.length) % projects.length
    }
    setSelectedProject(projects[newIndex])
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
          {["HOME", "WORK", "ABOUT", "BLOG", "CONTACT"].map((item, index) => (
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
                href={item === "BLOG" ? "/blog" : `#${item.toLowerCase()}`}
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
      <AnimatePresence>
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
                        {selectedProject.liveUrl && (
                          <a
                            href={selectedProject.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-white/20 px-4 py-2 hover:bg-white/5 transition-colors"
                          >
                            LIVE SITE
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
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
                      <div key={index} className="w-full bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-4">
                        <img
                          src={image}
                          alt={`${selectedProject.title} screenshot ${index + 1}`}
                          className="max-w-full h-auto object-contain rounded"
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

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-between items-center mt-16 pt-8 border-t border-white/10"
                >
                  <button
                    onClick={() => navigateToProject('prev')}
                    className="group flex items-center gap-2 text-xl hover:text-gray-400 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    PREVIOUS PROJECT
                  </button>
                  <button
                    onClick={() => navigateToProject('next')}
                    className="group flex items-center gap-2 text-xl hover:text-gray-400 transition-colors"
                  >
                    NEXT PROJECT
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                className="text-[12vw] sm:text-[12vw] md:text-[8vw] lg:text-[8vw] xl:text-[8rem] font-black leading-[0.9] tracking-tighter mb-12"
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

                <Link
                  href="#work"
                  className="group flex items-center gap-2 text-xl border border-white/20 px-6 py-3 hover:bg-white/5 transition-colors w-fit"
                >
                  VIEW WORK
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
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
      <section id="work" className="min-h-screen py-32 relative">
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
                        <div className="flex items-baseline gap-4 flex-1 min-w-0">
                          <span className="text-gray-600 text-xl flex-shrink-0">{String(index + 1).padStart(2, "0")}</span>
                          <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black break-words">{project.title}</h3>
                        </div>
                        <span className="text-xl text-gray-500 flex-shrink-0">{project.year}</span>
                      </div>

                      <div
                        className="h-[50vh] bg-white/5 relative overflow-hidden group-hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => openProjectDetail(project)}
                      >
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                          <button className="flex items-center gap-2 text-xl border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors backdrop-blur-sm bg-black/30">
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
      </section>

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
            {["Home", "Work", "About", "Blog", "Contact"].map((item) => (
              <Link
                key={item}
                href={item === "Blog" ? "/blog" : `#${item.toLowerCase()}`}
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
