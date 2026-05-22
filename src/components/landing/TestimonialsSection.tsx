import { motion } from 'framer-motion'

export function TestimonialsSection() {
  const testimonials = [
    {
      author: "Nabila, Kopi Senja",
      handle: "@kopisenja.id",
      content: "Semenjak pakai EtalaseKu, manajemen produk jadi sangat mudah. AI-nya benar-benar tahu apa yang dimau audiens saya!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      author: "Dian, HijabQu",
      handle: "@hijabqu.official",
      content: "Tidak perlu lagi pusing mikirin caption setiap hari. Cukup satu klik, semuanya beres. Penjualan kami meningkat pesat.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      author: "Rudi, CraftIndo",
      handle: "@craftindo",
      content: "Desainnya sangat bersih dan modern. Saya bisa mengelola katalog dari mana saja.",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      author: "Ayu, Kue Mama",
      handle: "@kuemama.id",
      content: "Fitur multi-platformnya juara! Sekali upload, langsung tersebar ke semua media sosial toko kami.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      author: "Budi, Sinar Makmur",
      handle: "@sinarmakmur.id",
      content: "Sejak pakai AI dari EtalaseKu, engagement di Instagram naik drastis. Bahasanya natural banget!",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      author: "Siti, Hijab Style",
      handle: "@hijabstyle_jkt",
      content: "Sangat membantu buat saya yang sering kehabisan ide nulis caption. Tinggal klik, langsung jadi.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150"
    }
  ]

  return (
    <section id="testimonials" className="py-24 bg-zinc-50 dark:bg-zinc-900/20 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Dicintai oleh <em className="font-serif italic font-medium">ribuan</em> UMKM
          </h2>
          <p className="text-muted-foreground text-lg mb-16">
            Bergabunglah dengan pengusaha lokal yang telah membuktikan kehebatan EtalaseKu.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative flex flex-col gap-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4"
        >

          {/* Row 1 */}
          <div className="flex w-max animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex gap-6 pr-6 shrink-0">
                {testimonials.slice(0, 3).map((t, i) => (
                  <div key={`${j}-${i}`} className="w-[320px] shrink-0 bg-background rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col gap-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden shrink-0">
                        <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{t.author}</h4>
                        <p className="text-xs text-muted-foreground">{t.handle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{t.content}"
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex w-max animate-[marquee_50s_linear_infinite] hover:[animation-play-state:paused]" style={{ animationDirection: 'reverse' }}>
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex gap-6 pr-6 shrink-0">
                {testimonials.slice(3, 6).map((t, i) => (
                  <div key={`${j}-${i}`} className="w-[320px] shrink-0 bg-background rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col gap-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden shrink-0">
                        <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{t.author}</h4>
                        <p className="text-xs text-muted-foreground">{t.handle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{t.content}"
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  )
}
