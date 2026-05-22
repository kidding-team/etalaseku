import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function ShowcaseSection() {
  return (
    <section id="showcase" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Buat Caption dalam <em className="font-serif italic font-medium">Hitungan Detik</em>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Pilih gaya bahasa yang Anda inginkan, masukkan detail produk, dan biarkan AI kami menghasilkan caption yang siap mendatangkan pembeli.
            </p>
            <div className="flex gap-4 mb-8">
              <Button size="lg" className="rounded-full px-8">
                Coba Sekarang
              </Button>
            </div>
          </motion.div>

          {/* Right Interactive Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
            className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-4 md:p-8 relative"
          >
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-border p-6 relative z-10 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-muted rounded-xl"></div>
                <div>
                  <div className="h-4 w-32 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-20 bg-muted/50 rounded"></div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 mb-4 border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> Buat Caption
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed">Capek kerja seharian? Waktunya mampir dan nikmatin segarnya Kopi Susu Aren kita! Manisnya pas, kopinya nendang banget. Yuk, recharge energimu sebelum pulang! ☕#KopiSusuAren #TemanNongkrong</p>
              </div>


              <div className="border-t border-border pt-4">
                <div className="h-2 w-full bg-muted rounded mb-2"></div>
                <div className="h-2 w-5/6 bg-muted rounded mb-2"></div>
                <div className="h-2 w-4/6 bg-muted rounded"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
