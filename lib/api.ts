const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface UserAuth {
  username: string
  password: string
}

export interface Product {
  id: string
  title: string
  description: string
  bought_price: number
  target_price: number
  sold_price: number
  images: { is_main: boolean; url: string }[] | null
}

export interface ProductCreate {
  title: string
  description: string
  price: number
  target_price: number
}

export interface ProductUpdate {
  title?: string
  description?: string
  bought_price?: number
  target_price?: number
  sold_price?: number
}

class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("auth_token")
    return token ? { Authorization: `${token}` } : {}
  }

  async signup(data: UserAuth) {
    const response = await fetch(`${API_BASE_URL}/api/public/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Signup failed")
    return response.json()
  }

  async signin(data: UserAuth) {
    const response = await fetch(`${API_BASE_URL}/api/public/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Invalid credentials")
    const result = await response.json()
    if (result.token) {
      localStorage.setItem("auth_token", result.token)
      console.log("Token stored:", result.token)
      console.log("LocalStorage token:", localStorage.getItem("auth_token"))
    }
    return result
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/api/private/profile/`, {
      headers: this.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch profile")
    return response.json()
  }

  async listProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/private/products/`, {
      headers: this.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch products")
    return response.json()
  }

  async createProduct(data: ProductCreate): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/private/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create product")
    return response.json()
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/private/products/${id}`, {
      headers: this.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch product")
    return response.json()
  }

  async updateProduct(id: string, data: ProductUpdate): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/private/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update product")
    return response.json()
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/private/products/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to delete product")
  }

  async getImageUrl(imageUrl: string): Promise<string | null> {
    try {
      const response = await fetch(imageUrl, {
        headers: this.getAuthHeader(),
      })
      if (!response.ok) throw new Error("Failed to fetch image")
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (err) {
      console.error("Image fetch error:", err)
      return null
    }
  }
}

export const api = new ApiClient()
