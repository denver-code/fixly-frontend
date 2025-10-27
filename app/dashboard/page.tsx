"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/signin")
      return
    }

    loadProducts()
  }, [isAuthenticated, authLoading, router])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await api.listProducts()
      setProducts(data)
    } catch (err) {
      setError("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await api.deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
    } catch (err) {
      alert("Failed to delete product")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground">FIXLY</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
            <p className="mt-1 text-muted-foreground">Manage your product inventory</p>
          </div>
          <Link href="/dashboard/products/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {error && <div className="mb-6 border border-destructive bg-destructive/10 p-4 text-destructive">{error}</div>}

        {products.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No products yet. Create your first product to get started.</p>
          </div>
        ) : (
          <div className="border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">TITLE</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">DESCRIPTION</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">BOUGHT PRICE</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">TARGET PRICE</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-accent/50">
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">{product.title}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{product.description}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">£{product.bought_price}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">£{product.target_price}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
