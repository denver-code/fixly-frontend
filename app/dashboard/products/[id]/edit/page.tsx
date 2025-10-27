"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [target_price, setTargetPrice] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/signin")
      return
    }

    loadProduct()
  }, [isAuthenticated, authLoading, productId, router])

  const loadProduct = async () => {
    try {
      setIsFetching(true)
      const data = await api.getProduct(productId)
      setProduct(data)
      setName(data.title)
      setDescription(data.description)
      setPrice(data.bought_price.toString())
      setTargetPrice(data.target_price.toString())
    } catch (err) {
      setError("Failed to load product")
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await api.updateProduct(productId, {
        title: name,
        description,
        bought_price: Number.parseFloat(price),
        target_price: Number.parseInt(target_price, 10),
      })
      router.push("/dashboard")
    } catch (err) {
      setError("Failed to update product")
    } finally {
      setIsLoading(false)
    }
  }

   if (authLoading || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground">Product not found</p>
          <Link href="/dashboard">
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground">FIXLY</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h2>
            <p className="mt-1 text-muted-foreground">Update product information</p>
          </div>

          <div className="border border-border bg-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">
                  Product Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-card-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="bg-background text-foreground"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-card-foreground">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_price" className="text-card-foreground">
                    Target Price
                  </Label>
                  <Input
                    id="target_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={target_price}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {error && (
                <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Product"}
                </Button>
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
