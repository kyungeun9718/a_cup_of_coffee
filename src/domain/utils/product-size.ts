export enum ProductSize {
    SMALL = 0,
    MEDIUM = 1,
    LARGE = 2,
  }
  
  /**
   * totalPrice에 따라 사이즈 계산
   * @param totalPrice 
   * @returns ProductSize
   */
  export function calculateProductSize(totalPrice: number): ProductSize {
    if (totalPrice < 100000) return ProductSize.SMALL;
    if (totalPrice < 1000000) return ProductSize.MEDIUM;
    return ProductSize.LARGE;
  }
  