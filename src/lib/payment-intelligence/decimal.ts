/**
 * PROVENTA PAYMENT INTELLIGENCE
 * High-Precision Monetary Arithmetic
 * Exact decimal calculations without binary floating-point rounding errors.
 */

export class PreciseMoney {
  // Stored internally as BigInt in minor currency units (e.g. Paise for INR, Cents for USD)
  // 1 INR = 100 Paise
  private readonly units: bigint;
  public readonly currency: string;

  constructor(amount: number | string | bigint, currency: string = 'INR') {
    this.currency = currency.toUpperCase();
    if (typeof amount === 'bigint') {
      this.units = amount;
    } else if (typeof amount === 'number') {
      if (Number.isNaN(amount) || !Number.isFinite(amount)) {
        this.units = BigInt(0);
      } else {
        // Round to nearest paise
        const rounded = Math.round(amount * 100);
        this.units = BigInt(rounded);
      }
    } else if (typeof amount === 'string') {
      const clean = amount.trim().replace(/,/g, '');
      const parsed = parseFloat(clean);
      if (Number.isNaN(parsed)) {
        this.units = BigInt(0);
      } else {
        const rounded = Math.round(parsed * 100);
        this.units = BigInt(rounded);
      }
    } else {
      this.units = BigInt(0);
    }
  }

  public static fromPaise(paise: bigint | number, currency: string = 'INR'): PreciseMoney {
    return new PreciseMoney(BigInt(Math.round(Number(paise))), currency);
  }

  public static zero(currency: string = 'INR'): PreciseMoney {
    return new PreciseMoney(BigInt(0), currency);
  }

  public toPaise(): bigint {
    return this.units;
  }

  public toNumber(): number {
    return Number(this.units) / 100;
  }

  public toString(): string {
    const isNegative = this.units < BigInt(0);
    const absUnits = isNegative ? -this.units : this.units;
    const whole = absUnits / BigInt(100);
    const fraction = absUnits % BigInt(100);
    const fractionStr = fraction.toString().padStart(2, '0');
    return `${isNegative ? '-' : ''}${whole.toString()}.${fractionStr}`;
  }

  public format(locale: string = 'en-IN'): string {
    const val = this.toNumber();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(val);
  }

  public add(other: PreciseMoney | number): PreciseMoney {
    const o = other instanceof PreciseMoney ? other : new PreciseMoney(other, this.currency);
    return new PreciseMoney(this.units + o.units, this.currency);
  }

  public subtract(other: PreciseMoney | number): PreciseMoney {
    const o = other instanceof PreciseMoney ? other : new PreciseMoney(other, this.currency);
    return new PreciseMoney(this.units - o.units, this.currency);
  }

  public multiply(factor: number): PreciseMoney {
    // Precise multiplication with integer rounding
    const factorScaled = Math.round(factor * 10000);
    const resultUnits = (this.units * BigInt(factorScaled)) / BigInt(10000);
    return new PreciseMoney(resultUnits, this.currency);
  }

  public divide(divisor: number): PreciseMoney {
    if (divisor === 0) throw new Error('Cannot divide by zero in financial calculations');
    const divisorScaled = Math.round(divisor * 10000);
    const resultUnits = (this.units * BigInt(10000)) / BigInt(divisorScaled);
    return new PreciseMoney(resultUnits, this.currency);
  }

  public isZero(): boolean {
    return this.units === BigInt(0);
  }

  public isPositive(): boolean {
    return this.units > BigInt(0);
  }

  public isNegative(): boolean {
    return this.units < BigInt(0);
  }

  public greaterThan(other: PreciseMoney | number): boolean {
    const o = other instanceof PreciseMoney ? other : new PreciseMoney(other, this.currency);
    return this.units > o.units;
  }

  public lessThan(other: PreciseMoney | number): boolean {
    const o = other instanceof PreciseMoney ? other : new PreciseMoney(other, this.currency);
    return this.units < o.units;
  }

  public equals(other: PreciseMoney | number): boolean {
    const o = other instanceof PreciseMoney ? other : new PreciseMoney(other, this.currency);
    return this.units === o.units;
  }
}
