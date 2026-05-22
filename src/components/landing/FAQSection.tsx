import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from 'framer-motion'

export function FAQSection() {
  const faqs = [
    {
      q: "Apakah EtalaseKu berbayar?",
      a: "Anda bisa memulai secara gratis dengan batasan tertentu. Untuk fitur lanjutan seperti unlimited AI generation, kami menyediakan paket premium yang sangat terjangkau untuk UMKM."
    },
    {
      q: "Apakah caption AI-nya terdengar seperti robot?",
      a: "Tentu tidak! AI kami telah dilatih dengan jutaan data copywriting promosi yang natural. Anda bahkan bisa memilih gaya bahasa yang diinginkan (santai, formal, pantun, dll)."
    },
    {
      q: "Apakah bisa langsung posting ke Instagram?",
      a: "Saat ini, EtalaseKu menyediakan fitur salin (copy) cepat. Integrasi auto-posting langsung ke Instagram sedang dalam tahap pengembangan."
    },
    {
      q: "Bisa dipakai di HP?",
      a: "Sangat bisa. Tampilan EtalaseKu sudah sangat responsif dan nyaman digunakan baik di Laptop maupun Smartphone Anda."
    }
  ]

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-1 lg:sticky lg:top-32"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Pertanyaan <br className="hidden lg:block" /> <em className="font-serif italic font-medium">Umum</em>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Temukan jawaban untuk pertanyaan yang sering diajukan seputar layanan EtalaseKu.
            </p>
            <p className="text-sm text-muted-foreground">
              Masih punya pertanyaan? <a href="#" className="underline font-medium text-foreground hover:text-primary transition-colors">Hubungi Tim Kami</a>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-semibold text-base hover:no-underline hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
