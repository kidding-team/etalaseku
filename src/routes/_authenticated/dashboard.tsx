import { createFileRoute } from '@tanstack/react-router'
import { Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produk Kamu</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <div className="mb-6 flex gap-3">
        <Input placeholder="Cari produk..." className="flex-1" />
        <Select>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="food">Makanan</SelectItem>
            <SelectItem value="drink">Minuman</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Harga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Termurah</SelectItem>
            <SelectItem value="desc">Termahal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="mb-6" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <div className="flex h-48 items-center justify-center bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium">Nasi Tumpeng</h3>
              <p className="text-lg font-bold">Rp 550.000</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Nasi tumpeng Gurih siang siang gini, maknyoss....
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
