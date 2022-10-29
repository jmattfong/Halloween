export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}
