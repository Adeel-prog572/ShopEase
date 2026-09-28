const API_URL = "https://dummyjson.com/products?limit=0";

export async function getProducts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    return data.products.map((product) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      image: product.thumbnail || product.images?.[0],
      category: product.category,
      rating: {
        rate: product.rating ?? 0,
        count: product.reviews?.length ?? 0,
      },
    }));
  } catch (error) {
    console.error("Product API Error:", error);
    throw new Error("Unable to load products.");
  }
}