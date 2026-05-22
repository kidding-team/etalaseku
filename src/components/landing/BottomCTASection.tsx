import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuthStatus } from '@/hooks/use-auth-status'

export function BottomCTASection() {
  const { status } = useAuthStatus()
  const isAuth = status === 'authenticated'
  const ctaTo = isAuth ? '/dashboard' : '/login'
  const ctaLabel = isAuth ? 'Buka Dashboard' : 'Daftar Sekarang'

  return (
    <section className="py-24 md:py-32 bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
          Siap Mememaksimalkan Potensi Penjualan Anda?
        </h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
          Mari mulai perjalanan bisnis yang lebih baik bersama EtalaseKu
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full px-8 bg-white text-zinc-950 hover:bg-zinc-200">
            <Link to={ctaTo}>{ctaLabel}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
