import { Sparkles, Layers, Share2, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

export function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles className="w-30 h-30 rotate-40 opacity-10" />,
      title: "Auto-Caption AI",
      desc: "Buat deskripsi produk yang menarik secara instan tanpa perlu memutar otak setiap hari."
    },
    {
      icon: <Layers className="w-30 h-30 rotate-40 opacity-10" />,
      title: "Manajemen Terpusat",
      desc: "Atur semua foto, harga, dan varian produk Anda dengan sangat terorganisir dalam satu dasbor."
    },
    {
      icon: <Share2 className="w-30 h-30 rotate-40 opacity-10" />,
      title: "Distribusi Cepat",
      desc: "Bagikan katalog produk Anda langsung ke media sosial seperti Instagram, TikTok, atau WhatsApp."
    },
    {
      icon: <BarChart3 className="w-30 h-30 rotate-40 opacity-10" />,
      title: "Analitik Ringkas",
      desc: "Pantau performa konten dan produk mana yang paling banyak dilihat oleh calon pembeli."
    }
  ]

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start">

          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-1 lg:sticky lg:top-32"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Fitur <em className="font-serif italic font-medium">Lengkap</em> <br />
              Untuk Bisnis Anda
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Segala yang Anda butuhkan untuk mengembangkan UMKM Anda. Lebih cerdas, lebih cepat, tanpa ribet.
            </p>
          </motion.div>

          {/* Right Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                className="bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl p-8 border border-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative overflow-hidden group"
              >
                <div className="absolute -bottom-5 -right-5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
