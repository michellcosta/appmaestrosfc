import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            {/* Gradiente animado de fundo */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 dark:from-emerald-900/30 dark:via-blue-900/30 dark:to-purple-900/30"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '400% 400%',
                }}
            />

            {/* Círculos flutuantes animados */}
            <motion.div
                className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />

            <motion.div
                className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"
                animate={{
                    x: [-100, 100, -100],
                    y: [-50, 50, -50],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 4,
                }}
            />

            {/* Grid pattern sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
        </div>
    );
}

