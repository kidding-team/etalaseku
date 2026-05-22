import { MoreVertical, Eye, Trash2, Package } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number | null
    category: string | null
    description: string | null
    image_url: string | null
  }
  onDetail: () => void
  onDelete: () => void
}

export function ProductCard({ product, onDetail, onDelete }: ProductCardProps) {
  return (
    <Card className="gap-4 border-none bg-background p-0 shadow-none group">
      <CardContent className="relative p-0">
        <AspectRatio ratio={1 / 1} className="overflow-hidden rounded">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
        <div className="absolute top-2 right-2 z-10">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDetail}>
                  <Eye className="mr-2 h-4 w-4" /> Detail
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Hapus
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                <AlertDialogDescription>
                  Produk &quot;{product.name}&quot; akan dihapus permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
      <CardHeader className="gap-1 p-0">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {product.price ? `Rp ${product.price.toLocaleString('id-ID')}` : '-'}
        </p>
      </CardHeader>
    </Card>
  )
}
