import * as React from 'react'
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Package, Type, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Field, FieldError } from '@/components/ui/field'
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/constants'
import { ProductCard } from '@/components/shared/product-card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/server/modules/products/products-controller'
import { uploadImage } from '@/server/modules/products/upload'
import { productFormSchema } from '@/server/modules/products/products-schema'
import type { ProductFormValues } from '@/server/modules/products/products-schema'

export const Route = createFileRoute('/_authenticated/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const { data: products = [], isPending } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts(),
  })

  const [open, setOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<any>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil dihapus')
    },
  })

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produk</h2>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty className="border py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>Belum ada produk</EmptyTitle>
            <EmptyDescription>Mulai tambahkan produk pertamamu</EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => { setEditingProduct(null); setOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onDetail={() => {
                setEditingProduct(product)
                setOpen(true)
              }}
              onDelete={() => deleteMutation.mutate(product.id)}
            />
          ))}
        </div>
      )}

      <ProductFormDrawer
        key={editingProduct?.id ?? 'new'}
        open={open}
        onOpenChange={setOpen}
        product={editingProduct}
      />
    </div>
  )
}

function ProductFormDrawer({
  open,
  onOpenChange,
  product,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
}) {
  const queryClient = useQueryClient()
  const [imagePreview, setImagePreview] = React.useState(
    product?.image_url || '',
  )
  const [uploading, setUploading] = React.useState(false)
  const imageUrlRef = React.useRef(product?.image_url || '')

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const {
        data: { user },
      } = await (await import('@/lib/supabase')).supabase.auth.getUser()
      const payload = {
        name: values.name,
        description: values.description || null,
        price: values.price ? Number(values.price.replace(/\./g, '')) : null,
        category: values.category || null,
        image_url: imageUrlRef.current || null,
        user_id: user?.id || null,
      }
      if (product) {
        return updateProduct({ data: { id: product.id, ...payload } })
      }
      return createProduct({ data: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(
        product ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan',
      )
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const [form, fields] = useForm<ProductFormValues>({
    id: 'product-form',
    defaultValue: {
      name: product?.name ?? '',
      price: product?.price?.toString() ?? '',
      category: product?.category ?? '',
      description: product?.description ?? '',
      image_url: product?.image_url ?? '',
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productFormSchema })
    },
    onSubmit(e, { submission }) {
      e.preventDefault()
      if (submission?.status !== 'success') return submission?.reply()
      mutate(submission.value)
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      const result = await uploadImage({
        data: { filename: file.name, base64 },
      })
      imageUrlRef.current = result.url
      setImagePreview(result.url)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {product ? 'Detail Produk' : 'Tambah Produk'}
          </DrawerTitle>
        </DrawerHeader>
        <form {...getFormProps(form)} className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <Label>Gambar</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/40 opacity-0 transition hover:opacity-100">
                  <span className="text-sm font-medium text-white">
                    Ganti Gambar
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ImagePlus />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">Upload Gambar</EmptyTitle>
                    <EmptyDescription>
                      Klik untuk memilih gambar produk
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
            {uploading && (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            )}
          </div>
          <Field>
            <Label htmlFor={fields.name.id}>Nama Produk</Label>
            <InputGroup>
              <InputGroupAddon>
                <Type />
              </InputGroupAddon>
              <InputGroupInput
                {...getInputProps(fields.name, { type: 'text' })}
                placeholder="Masukan nama produk"
              />
            </InputGroup>
            <FieldError>{fields.name.errors}</FieldError>
          </Field>
          <Field>
            <Label htmlFor={fields.price.id}>Harga</Label>
            <InputGroup>
              <InputGroupAddon>Rp</InputGroupAddon>
              <InputGroupInput
                id={fields.price.id}
                name={fields.price.name}
                defaultValue={
                  fields.price.value
                    ? Number(fields.price.value).toLocaleString('id-ID')
                    : ''
                }
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  e.target.value = raw
                    ? Number(raw).toLocaleString('id-ID')
                    : ''
                }}
                onBeforeInput={() => {}}
              />
            </InputGroup>
            <FieldError>{fields.price.errors}</FieldError>
          </Field>
          <Field>
            <Label htmlFor={fields.category.id}>Kategori</Label>
            <Select
              name={fields.category.name}
              defaultValue={fields.category.value ?? ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{fields.category.errors}</FieldError>
          </Field>
          <Field>
            <Label htmlFor={fields.description.id}>Deskripsi</Label>
            <Textarea
              {...getTextareaProps(fields.description)}
              placeholder="Deskripsi produk kamu..."
            />
            <FieldError>{fields.description.errors}</FieldError>
          </Field>
          <input
            type="hidden"
            name={fields.image_url.name}
            value={imagePreview}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || uploading}
          >
            {isPending
              ? 'Menyimpan...'
              : product
                ? 'Simpan Perubahan'
                : 'Tambah Produk'}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
