/**
 * Shopify Storefront API helpers for Laaa Tienda.
 * Create a Headless / Custom storefront channel app in Shopify Admin → Apps → Develop apps,
 * enable Storefront API, and create a Storefront API access token (public, for browser use).
 *
 * @see https://shopify.dev/docs/api/storefront
 */

const STOREFRONT_API_VERSION = "2024-10";

export type ShopifyMoney = { amount: string; currencyCode: string };

export type ShopifyProductCard = {
  id: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  /** First variant GID for cartLinesAdd */
  firstVariantId: string | null;
  price: ShopifyMoney | null;
};

export function isShopifyConfigured(): boolean {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN as
    | string
    | undefined;
  return Boolean(
    domain?.trim() && token?.trim(),
  );
}

function endpoint(): string | null {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
  if (!domain) return null;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}/api/${STOREFRONT_API_VERSION}/graphql.json`;
}

async function storefrontFetch<T>(params: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ data?: T; errors?: { message: string }[] } | null> {
  const url = endpoint();
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();
  if (!url || !token) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({
      query: params.query,
      variables: params.variables ?? {},
    }),
  });

  if (!res.ok) return null;
  return res.json() as Promise<{ data?: T; errors?: { message: string }[] }>;
}

const PRODUCTS_QUERY = `
  query TiendaProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function fetchStorefrontProducts(
  first = 24,
): Promise<ShopifyProductCard[]> {
  type Data = {
    products: {
      edges: {
        node: {
          id: string;
          title: string;
          featuredImage: { url: string; altText: string | null } | null;
          variants: { edges: { node: { id: string } }[] };
          priceRange: { minVariantPrice: ShopifyMoney };
        };
      }[];
    };
  };

  const json = await storefrontFetch<Data>({
    query: PRODUCTS_QUERY,
    variables: { first },
  });

  if (!json?.data?.products?.edges) return [];

  return json.data.products.edges.map(({ node: n }) => ({
    id: n.id,
    title: n.title,
    imageUrl: n.featuredImage?.url ?? null,
    imageAlt: n.featuredImage?.altText ?? null,
    firstVariantId: n.variants.edges[0]?.node.id ?? null,
    price: n.priceRange?.minVariantPrice ?? null,
  }));
}

const CART_QUERY = `
  query TiendaCart($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
    }
  }
`;

export async function fetchCartTotalQuantity(
  cartId: string,
): Promise<number | null> {
  type Data = { cart: { totalQuantity: number } | null };
  const json = await storefrontFetch<Data>({
    query: CART_QUERY,
    variables: { id: cartId },
  });
  const qty = json?.data?.cart?.totalQuantity;
  return typeof qty === "number" ? qty : null;
}

const CART_CREATE = `
  mutation TiendaCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD = `
  mutation TiendaCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createCartWithLine(
  merchandiseId: string,
  quantity: number,
): Promise<{ cartId: string; totalQuantity: number } | null> {
  type CreateData = {
    cartCreate: {
      cart: { id: string; totalQuantity: number } | null;
      userErrors: { message: string }[];
    };
  };

  const json = await storefrontFetch<CreateData>({
    query: CART_CREATE,
    variables: {
      input: {
        lines: [{ merchandiseId, quantity }],
      },
    },
  });

  const cart = json?.data?.cartCreate?.cart;
  if (!cart?.id) return null;
  return { cartId: cart.id, totalQuantity: cart.totalQuantity };
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<{ totalQuantity: number } | null> {
  type AddData = {
    cartLinesAdd: {
      cart: { totalQuantity: number } | null;
      userErrors: { message: string }[];
    };
  };

  const json = await storefrontFetch<AddData>({
    query: CART_LINES_ADD,
    variables: { cartId, lines },
  });

  const cart = json?.data?.cartLinesAdd?.cart;
  if (!cart) return null;
  return { totalQuantity: cart.totalQuantity };
}
