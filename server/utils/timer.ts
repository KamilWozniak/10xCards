/**
 * Simple timer utility for measuring execution duration
 */
export class Timer {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Get elapsed time in milliseconds since timer creation
   * @returns Duration in milliseconds
   */
  elapsed(): number {
    return Date.now() - this.startTime
  }

  /**
   * Reset the timer to current time
   */
  reset(): void {
    this.startTime = Date.now()
  }
}

/**
 * Factory function to create and start a new timer
 */
export function createTimer(): Timer {
  return new Timer()
}
