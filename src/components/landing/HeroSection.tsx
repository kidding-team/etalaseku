import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuthStatus } from '@/hooks/use-auth-status'

export function HeroSection() {
  const { status } = useAuthStatus()
  const isAuth = status === 'authenticated'
  const ctaTo = isAuth ? '/dashboard' : '/login'
  const ctaLabel = isAuth ? 'Buka Dashboard' : 'Mulai Coba Sekarang'

  return (
    <section className="relative overflow-hidden pb-16 md:pt-32 md:pb-24 bg-background min-h-[90vh] flex flex-col justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 pointer-events-none hidden md:block overflow-hidden"
      >
        <div className="absolute top-[20%] left-[10%] xl:left-[15%] animate-[float_6s_ease-in-out_infinite]">
          <div className="bg-white dark:bg-zinc-800 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 rotate-[-12deg]">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="url(#ig-grad)">
              <defs>
                <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
        </div>


        <div className="absolute top-[65%] left-[5%] xl:left-[10%] animate-[float_8s_ease-in-out_infinite_1s]">
          <div className="bg-white dark:bg-zinc-800 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 rotate-[15deg]">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1877F2]" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        </div>


        <div className="absolute top-[25%] right-[10%] xl:right-[15%] animate-[float_7s_ease-in-out_infinite_2s]">
          <div className="bg-white dark:bg-zinc-800 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 rotate-[8deg]">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#25D366]" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </div>


        <div className="absolute top-[70%] right-[8%] xl:right-[12%] animate-[float_6s_ease-in-out_infinite_1.5s]">
          <div className="bg-white dark:bg-zinc-800 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 rotate-[-10deg]">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#EE4D2D]" fill="currentColor">
              <path d="M16 8V5c0-2.2-1.8-4-4-4S8 2.8 8 5v3H3v11c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V8h-5zm-6-3c0-1.1.9-2 2-2s2 .9 2 2v3h-4V5zm9 14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V10h14v9zM9 12c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm6 0c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z" />
            </svg>
          </div>
        </div>


        <div className="absolute top-[45%] left-[2%] xl:left-[5%] animate-[float_5s_ease-in-out_infinite_0.5s] scale-75">
          <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-black/5 dark:border-white/5 rotate-[5deg]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-black dark:text-white" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.66a6.34 6.34 0 0010.86 4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.08z" />
            </svg>
          </div>
        </div>


        <div className="absolute top-[50%] right-[2%] xl:right-[5%] animate-[float_9s_ease-in-out_infinite_0.2s] scale-75">
          <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-black/5 dark:border-white/5 rotate-[-5deg]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-black dark:text-white" fill="currentColor">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl relative z-10">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-foreground mb-6 leading-[1.1] md:leading-[1.05]"
        >
          Kelola <em className="font-serif italic font-medium">Katalog</em> Bisnis <br className="hidden md:block" />
          Anda dengan Efisien
        </motion.h1>


        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium"
        >
          Maksimalkan potensi penjualan Anda dengan AI untuk pemasaran yang lebih efisien dan efektif.
        </motion.p>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-semibold w-full sm:w-auto shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
            <Link to={ctaTo}>{ctaLabel}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
