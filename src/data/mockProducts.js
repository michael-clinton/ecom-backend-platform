export const mockProducts = Array.from({ length: 100 }, (_, index) => {
    const id = index + 1;
    const imgIndex = (index % 10) + 1;  // cycle 1–10
    return {
      id,
      name: `Product ${id}`,
      images: Array.from({ length: 4 }, (_, i) =>
        `images/gallery-${((imgIndex + i - 1) % 4) + 1}.jpg`
      ),
      listingImage: `images/product-${imgIndex}.jpg`,
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
      description: `This is a description for product ${id}.`,
      sizes: ['Small', 'Medium', 'Large', 'XL', 'XXL'],
    };
  });
  