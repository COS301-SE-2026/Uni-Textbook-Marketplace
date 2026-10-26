export interface BundleModule {
  id: string;
  code: string;
  name: string;
}

export interface BundleListing {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
}

export interface BundleSellerGroup {
  sellerId: string;
  sellerName: string;
  listings: BundleListing[];
  booksCovered: number;
  subtotal: number;
}

export interface BundleResult {
  recommended: {
    sellerGroups: BundleSellerGroup[];
    totalPrice: number;
    sellerCount: number;
    meetupCount: number;
  };

  naive: {
    totalPrice: number;
    sellerCount: number;
  };
}