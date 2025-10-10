/**
 * Gerador de números pseudo-aleatórios com seed
 * Permite reproduzir o mesmo sorteio com a mesma seed
 */
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    /**
     * Gera próximo número aleatório entre 0 e 1
     */
    next(): number {
        // Linear Congruential Generator
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

/**
 * Embaralha array usando Fisher-Yates com seed
 * @param array Array a ser embaralhado
 * @param seed Seed para reprodutibilidade (opcional)
 * @returns Novo array embaralhado + seed utilizada
 */
export function shuffleWithSeed<T>(
    array: T[],
    seed?: number
): { shuffled: T[]; seed: number } {
    const usedSeed = seed ?? Date.now() + Math.random() * 1000;
    const random = new SeededRandom(usedSeed);
    const shuffled = [...array];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random.next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return { shuffled, seed: usedSeed };
}

/**
 * Embaralha array in-place (sem seed)
 * @param array Array a ser embaralhado
 */
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

