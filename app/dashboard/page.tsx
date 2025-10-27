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
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({})
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // 🧠 Load view mode from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem("fixly_view_mode")
    if (savedView === "table" || savedView === "cards") {
      setViewMode(savedView)
    }
  }, [])

  // 💾 Persist view mode when changed
  useEffect(() => {
    localStorage.setItem("fixly_view_mode", viewMode)
  }, [viewMode])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/signin")
      return
    }

    loadProducts()
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const loadImages = async () => {
      const newUrls: Record<string, string | null> = {}
      for (const product of products) {
        const mainImage =
          product.images?.find((img) => img.is_main)?.url || product.images?.[0]?.url
        if (mainImage) {
          newUrls[product.id] = await api.getImageUrl(mainImage)
        } else {
          newUrls[product.id] = null
        }
      }
      setImageUrls(newUrls)
    }

    if (products.length > 0) loadImages()
  }, [products])

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
        <div className="h-8 w-8 animate-spin border-2 border-foreground border-t-transparent rounded-full" />
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
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
            <p className="mt-1 text-muted-foreground">Manage your product inventory</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
              className="flex items-center gap-2"
            >
              {viewMode === "table" ? "📦 Card View" : "📋 Table View"}
            </Button>

            <Link href="/dashboard/products/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No products yet. Create your first product to get started.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* --- TABLE VIEW --- */
          <div className="border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                      IMAGE
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                      TITLE
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                      DESCRIPTION
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                      BOUGHT PRICE
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                      TARGET PRICE
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                      SOLD PRICE
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-accent/50">
                      <td className="px-6 py-4">
                        {imageUrls[product.id] ? (
                          <img
                            src={imageUrls[product.id]!}
                            alt={product.title}
                            className="max-h-24 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center bg-muted text-sm text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">
                        {product.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {product.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        £{product.bought_price}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        £{product.target_price}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {product.sold_price !== null ? `£${product.sold_price}` : "—"}
                        {product.sold_price !== null &&
                          product.target_price !== null &&
                          (product.sold_price < product.target_price ? (
                            <span className="text-red-500">▼</span>
                          ) : (
                            <span className="text-green-500">▲</span>
                          ))}
                      </td>
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
        ) : (
          /* --- CARD VIEW --- */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-border bg-card p-4 shadow hover:shadow-lg transition"
              >
                {imageUrls[product.id] ? (
                  <img
                    src={imageUrls[product.id]!}
                    alt={product.title}
                    className="h-40 w-full object-cover mb-4"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground mb-4">
                    No Image
                  </div>
                )}

                <h3 className="text-lg font-semibold text-card-foreground mb-1">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {product.description}
                </p>

                <div className="space-y-1 text-sm">
                  <p>💰 <strong>Bought:</strong> £{product.bought_price}</p>
                  <p>🎯 <strong>Target:</strong> £{product.target_price}</p>
                  <p>
                    🏷️ <strong>Sold:</strong>{" "}
                    {product.sold_price !== null ? (
                      <>
                        £{product.sold_price}
                        {product.sold_price < product.target_price ? (
                          <span className="text-red-500 ml-1">▼</span>
                        ) : (
                          <span className="text-green-500 ml-1">▲</span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
