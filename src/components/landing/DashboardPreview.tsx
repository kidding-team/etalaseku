import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function DashboardPreview() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=2000"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section className="relative -mt-16 md:-mt-24 pb-24 z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
        className="relative mx-auto bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl md:rounded-[2rem] p-3 sm:p-6 md:p-8 lg:p-12 border border-border/50"
      >
        <div className="relative aspect-video w-full bg-white dark:bg-zinc-950 rounded-xl md:rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          {images.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay z-10"></div>
              <img
                src={src}
                alt={`Dashboard Preview ${index + 1}`}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ))}

          {/* Progress indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/30 hover:bg-primary/50'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
